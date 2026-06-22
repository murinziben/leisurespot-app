import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from api.database import get_db
from api.dependencies import get_current_user, require_vendor, optional_user
from api.schemas.listing import ListingCreate, ListingUpdate
from shared.models import Listing, Image, Category, Vendor, User, Favorite, Review, Booking, ListingStatus, BookingType, BookingStatus, UserRole, VendorStatus

router = APIRouter(prefix="/listings", tags=["listings"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


def listing_to_dict(listing, detail=False):
    primary_image = next((img for img in listing.images if img.is_primary), None)
    if not primary_image and listing.images:
        primary_image = listing.images[0]

    data = {
        "id": listing.id,
        "title": listing.title,
        "slug": listing.slug,
        "short_description": listing.short_description,
        "price": listing.price,
        "price_unit": listing.price_unit,
        "city": listing.city,
        "booking_type": listing.booking_type,
        "status": listing.status,
        "is_featured": listing.is_featured,
        "featured_requested": listing.featured_requested,
        "featured_request_note": listing.featured_request_note,
        "featured_expires_at": listing.featured_expires_at.isoformat() if listing.featured_expires_at else None,
        "avg_rating": listing.avg_rating,
        "review_count": listing.review_count,
        "booking_count": listing.booking_count,
        "duration_minutes": listing.duration_minutes,
        "created_at": listing.created_at.isoformat(),
        "images": [{"id": img.id, "url": img.url, "alt_text": img.alt_text, "is_primary": img.is_primary, "sort_order": img.sort_order} for img in listing.images],
        "primary_image": primary_image.url if primary_image else None,
        "category": {"id": listing.category.id, "name": listing.category.name, "slug": listing.category.slug, "icon": listing.category.icon} if listing.category else None,
    }

    if detail:
        data.update({
            "description": listing.description,
            "address": listing.address,
            "max_guests": listing.max_guests,
            "min_guests": listing.min_guests,
            "cancellation_policy": listing.cancellation_policy,
            "includes": listing.includes,
            "excludes": listing.excludes,
            "tags": listing.tags,
            "vendor_name": listing.vendor.business.name if listing.vendor and listing.vendor.business else None,
            "reviews": [
                {
                    "id": r.id,
                    "rating": r.rating,
                    "comment": r.comment,
                    "created_at": r.created_at.isoformat(),
                    "author_name": f"{r.author.profile.first_name or ''} {r.author.profile.last_name or ''}".strip() if r.author and r.author.profile else "Guest",
                }
                for r in listing.reviews if r.is_published
            ],
        })

    return data


@router.get("/")
def list_listings(
    search: str = Query(None),
    category: str = Query(None),
    city: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    min_guests: int = Query(None),
    featured: bool = Query(None),
    instant: bool = Query(None),
    sort_by: str = Query("newest"),
    sort_dir: str = Query("asc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    q = db.query(Listing).filter(Listing.status == ListingStatus.ACTIVE)

    if search:
        q = q.filter(or_(
            Listing.title.ilike(f"%{search}%"),
            Listing.description.ilike(f"%{search}%"),
            Listing.city.ilike(f"%{search}%"),
        ))
    if category:
        cat = db.query(Category).filter(
            or_(Category.slug == category, Category.id == category)
        ).first()
        if cat:
            q = q.filter(Listing.category_id == cat.id)
    if city:
        q = q.filter(Listing.city.ilike(f"%{city}%"))
    if min_price is not None:
        q = q.filter(Listing.price >= min_price)
    if max_price is not None:
        q = q.filter(Listing.price <= max_price)
    if featured is not None:
        q = q.filter(Listing.is_featured == featured)
    if min_guests is not None:
        q = q.filter(Listing.max_guests >= min_guests)
    if instant is not None:
        q = q.filter(Listing.booking_type == (BookingType.INSTANT if instant else BookingType.REQUEST))

    if sort_by == "rating":
        q = q.order_by(Listing.avg_rating.desc())
    elif sort_by == "popular":
        q = q.order_by(Listing.booking_count.desc())
    elif sort_by == "price":
        if sort_dir == "desc":
            q = q.order_by(Listing.price.desc())
        else:
            q = q.order_by(Listing.price.asc())
    else:
        q = q.order_by(Listing.created_at.desc())

    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "data": {
            "items": [listing_to_dict(l) for l in items],
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }
    }


@router.get("/suggest")
def suggest(q: str = Query(""), db: Session = Depends(get_db)):
    """Typeahead: returns matching listing titles, categories, and cities."""
    if len(q.strip()) < 2:
        return {"success": True, "data": {"listings": [], "categories": [], "cities": []}}
    pattern = f"%{q.strip()}%"
    listings = db.query(Listing.id, Listing.title, Listing.city, Listing.price).filter(
        Listing.status == ListingStatus.ACTIVE,
        Listing.title.ilike(pattern),
    ).limit(6).all()
    categories = db.query(Category).filter(Category.name.ilike(pattern)).limit(4).all()
    all_cities = ["Gaborone","Francistown","Maun","Kasane","Palapye","Lobatse","Selebi-Phikwe"]
    cities = [c for c in all_cities if q.strip().lower() in c.lower()]
    return {"success": True, "data": {
        "listings": [{"id": l.id, "title": l.title, "city": l.city, "price": float(l.price)} for l in listings],
        "categories": [{"slug": c.slug, "name": c.name, "icon": c.icon, "listing_count": db.query(Listing).filter(Listing.category_id == c.id, Listing.status == ListingStatus.ACTIVE).count()} for c in categories],
        "cities": cities,
    }}


@router.post("/{listing_id}/request-feature")
def request_feature(listing_id: str, body: dict = {}, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    listing = db.query(Listing).filter(Listing.id == listing_id, Listing.vendor_id == vendor.id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.is_featured:
        raise HTTPException(status_code=400, detail="Listing is already featured")
    if listing.featured_requested:
        raise HTTPException(status_code=400, detail="Feature request already pending")
    listing.featured_requested = True
    listing.featured_request_note = body.get("note", "")
    db.commit()
    return {"success": True, "message": "Feature request submitted. Our team will review within 48 hours."}


@router.delete("/{listing_id}/request-feature")
def cancel_feature_request(listing_id: str, current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    listing = db.query(Listing).filter(Listing.id == listing_id, Listing.vendor_id == vendor.id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.featured_requested = False
    listing.featured_request_note = None
    db.commit()
    return {"success": True, "message": "Feature request cancelled."}


@router.get("/featured")
def featured_listings(db: Session = Depends(get_db)):
    listings = db.query(Listing).filter(
        Listing.status == ListingStatus.ACTIVE,
        Listing.is_featured == True,
    ).order_by(Listing.avg_rating.desc()).limit(8).all()
    return {"success": True, "data": [listing_to_dict(l) for l in listings]}


@router.get("/my")
def my_listings(
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    listings = db.query(Listing).filter(
        Listing.vendor_id == vendor.id,
        Listing.status != ListingStatus.ARCHIVED,
    ).order_by(Listing.created_at.desc()).all()
    return {"success": True, "data": [listing_to_dict(l) for l in listings]}


@router.get("/{listing_id}")
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(
        or_(Listing.id == listing_id, Listing.slug == listing_id),
        Listing.status != ListingStatus.ARCHIVED,
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"success": True, "data": listing_to_dict(listing, detail=True)}


@router.post("/", status_code=201)
def create_listing(
    body: ListingCreate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor.status != VendorStatus.APPROVED and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Vendor account not approved")

    base_slug = slugify(body.title)
    slug = base_slug
    counter = 1
    while db.query(Listing).filter(Listing.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    listing = Listing(
        vendor_id=vendor.id,
        slug=slug,
        **body.model_dump(exclude_none=True),
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return {"success": True, "data": listing_to_dict(listing, detail=True)}


@router.patch("/{listing_id}")
def update_listing(
    listing_id: str,
    body: ListingUpdate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if listing.vendor_id != vendor.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your listing")

    update_data = body.model_dump(exclude_none=True)
    image_urls = update_data.pop("image_urls", None)

    for key, value in update_data.items():
        setattr(listing, key, value)

    if image_urls is not None:
        db.query(Image).filter(Image.listing_id == listing.id).delete()
        for i, url in enumerate(image_urls):
            db.add(Image(listing_id=listing.id, url=url, is_primary=(i == 0), sort_order=i))

    db.commit()
    db.refresh(listing)
    return {"success": True, "data": listing_to_dict(listing, detail=True)}


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: str,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if listing.vendor_id != vendor.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your listing")

    listing.status = ListingStatus.ARCHIVED
    db.commit()
    return {"success": True, "message": "Listing archived"}


# ─── Favorites ──────────────────────────────────────────────────────────

@router.get("/favorites/ids")
def favorite_ids(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ids = [f.listing_id for f in db.query(Favorite.listing_id).filter(Favorite.user_id == current_user.id).all()]
    return {"success": True, "data": ids}


@router.post("/{listing_id}/favorite")
def toggle_favorite(listing_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"success": True, "saved": False}
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.add(Favorite(user_id=current_user.id, listing_id=listing_id))
    db.commit()
    return {"success": True, "saved": True}


# ─── Reviews ─────────────────────────────────────────────────────────────

@router.post("/{listing_id}/reviews", status_code=201)
def create_review(listing_id: str, body: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rating = body.get("rating")
    comment = body.get("comment", "")
    booking_id = body.get("booking_id")

    if not rating or not (1 <= int(rating) <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1–5")

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Verify completed booking
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.customer_id == current_user.id,
        Booking.listing_id == listing_id,
        Booking.status == BookingStatus.COMPLETED,
    ).first() if booking_id else None

    if not booking:
        # Check any completed booking for this listing by this user
        booking = db.query(Booking).filter(
            Booking.customer_id == current_user.id,
            Booking.listing_id == listing_id,
            Booking.status == BookingStatus.COMPLETED,
        ).first()

    if not booking:
        raise HTTPException(status_code=403, detail="You must have a completed booking to leave a review")

    # Prevent duplicate review per booking
    if booking and db.query(Review).filter(Review.booking_id == booking.id).first():
        raise HTTPException(status_code=400, detail="You have already reviewed this booking")

    review = Review(
        listing_id=listing_id,
        author_id=current_user.id,
        booking_id=booking.id if booking else None,
        rating=int(rating),
        comment=comment,
        is_published=True,
    )
    db.add(review)
    db.flush()

    # Update listing aggregate rating
    all_ratings = [r.rating for r in listing.reviews if r.is_published]
    listing.avg_rating = round(sum(all_ratings) / len(all_ratings), 2) if all_ratings else 0
    listing.review_count = len(all_ratings)

    db.commit()
    return {"success": True, "message": "Review submitted. Thank you!"}
