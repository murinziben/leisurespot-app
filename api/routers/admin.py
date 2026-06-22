from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc

from api.database import get_db
from api.dependencies import require_admin
from shared.models import (
    User, Vendor, Business, Listing, Booking, Payment, Review,
    Category, Notification,
    VendorStatus, BookingStatus, ListingStatus, UserRole, PaymentStatus,
)

router = APIRouter(prefix="/admin", tags=["admin"])


# ─── Dashboard ────────────────────────────────────────────────────────
@router.get("/dashboard")
def admin_dashboard(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    total_vendors = db.query(func.count(Vendor.id)).scalar()
    pending_vendors = db.query(func.count(Vendor.id)).filter(Vendor.status == VendorStatus.PENDING).scalar()
    approved_vendors = db.query(func.count(Vendor.id)).filter(Vendor.status == VendorStatus.APPROVED).scalar()
    total_listings = db.query(func.count(Listing.id)).filter(Listing.status != ListingStatus.ARCHIVED).scalar()
    active_listings = db.query(func.count(Listing.id)).filter(Listing.status == ListingStatus.ACTIVE).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    confirmed_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).scalar()
    pending_bookings = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatus.PENDING).scalar()

    revenue_result = db.query(func.sum(Payment.commission)).filter(Payment.status == PaymentStatus.PAID).scalar()
    total_revenue = float(revenue_result or 0)

    gross_result = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.PAID).scalar()
    gross_revenue = float(gross_result or 0)

    total_reviews = db.query(func.count(Review.id)).scalar()
    unpublished_reviews = db.query(func.count(Review.id)).filter(Review.is_published == False).scalar()

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "pending_vendors": pending_vendors,
            "approved_vendors": approved_vendors,
            "total_listings": total_listings,
            "active_listings": active_listings,
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "pending_bookings": pending_bookings,
            "total_revenue": round(total_revenue, 2),
            "gross_revenue": round(gross_revenue, 2),
            "total_reviews": total_reviews,
            "unpublished_reviews": unpublished_reviews,
        }
    }


# ─── Users ────────────────────────────────────────────────────────────
@router.get("/users")
def list_users(
    role: str = Query(None),
    is_active: bool = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if is_active is not None:
        q = q.filter(User.is_active == is_active)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))

    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def user_dict(u):
        return {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "created_at": u.created_at.isoformat(),
            "name": f"{u.profile.first_name or ''} {u.profile.last_name or ''}".strip() if u.profile else "",
        }

    return {"success": True, "data": {"items": [user_dict(u) for u in users], "total": total, "page": page, "per_page": per_page}}


@router.patch("/users/{user_id}/status")
def update_user_status(user_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = body.get("is_active", user.is_active)
    db.commit()
    return {"success": True, "message": "User status updated"}


@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_role = body.get("role")
    if new_role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = new_role
    db.commit()
    return {"success": True, "message": "User role updated"}


# ─── Vendors ──────────────────────────────────────────────────────────
@router.get("/vendors")
def list_all_vendors(
    status: str = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Vendor)
    if status:
        q = q.filter(Vendor.status == status)
    if search:
        q = q.join(Business, Vendor.id == Business.vendor_id, isouter=True).join(User, Vendor.user_id == User.id).filter(
            or_(Business.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%"))
        )

    total = q.count()
    vendors = q.order_by(Vendor.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def v_dict(v):
        listing_count = db.query(func.count(Listing.id)).filter(
            Listing.vendor_id == v.id, Listing.status != ListingStatus.ARCHIVED
        ).scalar()
        revenue = db.query(func.sum(Payment.commission)).join(
            Booking, Payment.booking_id == Booking.id
        ).join(Listing, Booking.listing_id == Listing.id).filter(
            Listing.vendor_id == v.id, Payment.status == PaymentStatus.PAID
        ).scalar()
        return {
            "id": v.id,
            "status": v.status,
            "rejection_reason": v.rejection_reason,
            "approved_at": v.approved_at.isoformat() if v.approved_at else None,
            "created_at": v.created_at.isoformat(),
            "user_email": v.user.email if v.user else None,
            "user_id": v.user_id,
            "business_name": v.business.name if v.business else None,
            "business_city": v.business.city if v.business else None,
            "business_phone": v.business.phone if v.business else None,
            "listing_count": listing_count,
            "revenue": round(float(revenue or 0), 2),
        }

    return {"success": True, "data": {"items": [v_dict(v) for v in vendors], "total": total, "page": page, "per_page": per_page}}


@router.get("/vendors/pending")
def pending_vendors(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    vendors = db.query(Vendor).filter(Vendor.status == VendorStatus.PENDING).all()

    def v_dict(v):
        return {
            "id": v.id,
            "status": v.status,
            "created_at": v.created_at.isoformat(),
            "user_email": v.user.email if v.user else None,
            "business_name": v.business.name if v.business else None,
            "business_city": v.business.city if v.business else None,
            "business_phone": v.business.phone if v.business else None,
        }

    return {"success": True, "data": [v_dict(v) for v in vendors]}


@router.patch("/vendors/{vendor_id}/approve")
def approve_vendor(vendor_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    approved = body.get("approved", True)
    vendor.status = VendorStatus.APPROVED if approved else VendorStatus.REJECTED
    vendor.rejection_reason = body.get("reason") if not approved else None
    if approved:
        vendor.approved_at = datetime.utcnow()

    db.commit()
    return {"success": True, "message": f"Vendor {'approved' if approved else 'rejected'}"}


@router.patch("/vendors/{vendor_id}/suspend")
def suspend_vendor(vendor_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.status = VendorStatus.REJECTED
    vendor.rejection_reason = "Suspended by admin"
    db.commit()
    return {"success": True, "message": "Vendor suspended"}


# ─── Listings ─────────────────────────────────────────────────────────
@router.get("/listings")
def list_all_listings(
    status: str = Query(None),
    category: str = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Listing)
    if status:
        q = q.filter(Listing.status == status)
    if category:
        q = q.join(Category, Listing.category_id == Category.id).filter(Category.slug == category)
    if search:
        q = q.filter(or_(Listing.title.ilike(f"%{search}%"), Listing.city.ilike(f"%{search}%")))

    total = q.count()
    listings = q.order_by(Listing.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def l_dict(l):
        return {
            "id": l.id,
            "title": l.title,
            "status": l.status,
            "price": l.price,
            "city": l.city,
            "is_featured": l.is_featured,
            "avg_rating": l.avg_rating,
            "booking_count": l.booking_count,
            "review_count": l.review_count,
            "created_at": l.created_at.isoformat(),
            "category_name": l.category.name if l.category else None,
            "vendor_email": l.vendor.user.email if l.vendor and l.vendor.user else None,
            "vendor_business": l.vendor.business.name if l.vendor and l.vendor.business else None,
            "primary_image": next((img.url for img in l.images if img.is_primary), l.images[0].url if l.images else None),
        }

    return {"success": True, "data": {"items": [l_dict(l) for l in listings], "total": total, "page": page, "per_page": per_page}}


@router.get("/feature-requests")
def feature_requests(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    listings = db.query(Listing).filter(Listing.featured_requested == True).order_by(Listing.updated_at.desc()).all()
    return {"success": True, "data": [
        {
            "id": l.id, "title": l.title, "city": l.city, "price": l.price,
            "vendor_name": l.vendor.business.name if l.vendor and l.vendor.business else "Unknown",
            "note": l.featured_request_note,
            "is_featured": l.is_featured,
            "updated_at": l.updated_at.isoformat(),
        } for l in listings
    ]}


@router.patch("/listings/{listing_id}/featured")
def toggle_featured(listing_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    from datetime import timedelta
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    approve = body.get("is_featured", not listing.is_featured)
    listing.is_featured = approve
    listing.featured_requested = False  # clear request regardless of decision
    if approve:
        days = body.get("days", 30)
        listing.featured_expires_at = datetime.utcnow() + timedelta(days=days)
    else:
        listing.featured_expires_at = None
    db.commit()
    return {"success": True, "message": "Featured status updated", "is_featured": listing.is_featured}


@router.patch("/listings/{listing_id}/status")
def update_listing_status(listing_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    new_status = body.get("status")
    if new_status not in [s.value for s in ListingStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    listing.status = new_status
    db.commit()
    return {"success": True, "message": "Listing status updated"}


# ─── Bookings ─────────────────────────────────────────────────────────
@router.get("/bookings")
def all_bookings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    status: str = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Booking)
    if status:
        q = q.filter(Booking.status == status)

    total = q.count()
    bookings = q.order_by(Booking.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def b_dict(b):
        return {
            "id": b.id,
            "status": b.status,
            "booking_date": b.booking_date,
            "guests": b.guests,
            "total_amount": b.total_amount,
            "created_at": b.created_at.isoformat(),
            "listing_title": b.listing.title if b.listing else None,
            "listing_id": b.listing_id,
            "customer_email": b.customer.email if b.customer else None,
            "customer_name": f"{b.customer.profile.first_name or ''} {b.customer.profile.last_name or ''}".strip() if b.customer and b.customer.profile else None,
        }

    return {"success": True, "data": {"items": [b_dict(b) for b in bookings], "total": total, "page": page, "per_page": per_page}}


# ─── Reviews ──────────────────────────────────────────────────────────
@router.get("/reviews")
def list_all_reviews(
    is_published: bool = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    q = db.query(Review)
    if is_published is not None:
        q = q.filter(Review.is_published == is_published)
    if search:
        q = q.filter(Review.comment.ilike(f"%{search}%"))

    total = q.count()
    reviews = q.order_by(Review.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    def r_dict(r):
        return {
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment,
            "is_published": r.is_published,
            "created_at": r.created_at.isoformat(),
            "listing_title": r.listing.title if r.listing else None,
            "listing_id": r.listing_id,
            "author_email": r.author.email if r.author else None,
            "author_name": f"{r.author.profile.first_name or ''} {r.author.profile.last_name or ''}".strip() if r.author and r.author.profile else (r.author.email if r.author else None),
        }

    return {"success": True, "data": {"items": [r_dict(r) for r in reviews], "total": total, "page": page, "per_page": per_page}}


@router.patch("/reviews/{review_id}/publish")
def toggle_review_publish(review_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_published = body.get("is_published", not review.is_published)
    db.commit()
    return {"success": True, "message": "Review updated", "is_published": review.is_published}


@router.delete("/reviews/{review_id}")
def delete_review(review_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"success": True, "message": "Review deleted"}


# ─── Categories ───────────────────────────────────────────────────────
@router.get("/categories")
def admin_list_categories(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cats = db.query(Category).order_by(Category.sort_order, Category.name).all()

    def c_dict(c):
        listing_count = db.query(func.count(Listing.id)).filter(Listing.category_id == c.id).scalar()
        return {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "icon": c.icon,
            "description": c.description,
            "parent_id": c.parent_id,
            "sort_order": c.sort_order,
            "is_active": c.is_active,
            "listing_count": listing_count,
        }

    return {"success": True, "data": [c_dict(c) for c in cats]}


@router.post("/categories", status_code=201)
def create_category(body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    import re
    name = body.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    slug = body.get("slug") or re.sub(r'[^\w]+', '-', name.lower()).strip('-')
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    cat = Category(
        name=name,
        slug=slug,
        icon=body.get("icon"),
        description=body.get("description"),
        parent_id=body.get("parent_id"),
        sort_order=body.get("sort_order", 0),
        is_active=body.get("is_active", True),
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"success": True, "data": {"id": cat.id, "name": cat.name, "slug": cat.slug}}


@router.patch("/categories/{cat_id}")
def update_category(cat_id: str, body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field in ["name", "icon", "description", "sort_order", "is_active"]:
        if field in body:
            setattr(cat, field, body[field])
    db.commit()
    return {"success": True, "message": "Category updated"}


@router.delete("/categories/{cat_id}")
def delete_category(cat_id: str, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    listing_count = db.query(func.count(Listing.id)).filter(Listing.category_id == cat_id).scalar()
    if listing_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete: {listing_count} listings use this category")
    db.delete(cat)
    db.commit()
    return {"success": True, "message": "Category deleted"}


# ─── Revenue ──────────────────────────────────────────────────────────
@router.get("/revenue")
def revenue_report(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    top_vendors = db.query(
        Business.name,
        User.email,
        func.sum(Payment.commission).label("revenue"),
        func.count(Booking.id).label("bookings"),
    ).join(Vendor, Business.vendor_id == Vendor.id)\
     .join(User, Vendor.user_id == User.id)\
     .join(Listing, Listing.vendor_id == Vendor.id)\
     .join(Booking, Booking.listing_id == Listing.id)\
     .join(Payment, Payment.booking_id == Booking.id)\
     .filter(Payment.status == PaymentStatus.PAID)\
     .group_by(Business.name, User.email)\
     .order_by(desc("revenue"))\
     .limit(10).all()

    by_category = db.query(
        Category.name,
        func.sum(Payment.commission).label("revenue"),
        func.count(Booking.id).label("bookings"),
    ).join(Listing, Listing.category_id == Category.id)\
     .join(Booking, Booking.listing_id == Listing.id)\
     .join(Payment, Payment.booking_id == Booking.id)\
     .filter(Payment.status == PaymentStatus.PAID)\
     .group_by(Category.name)\
     .order_by(desc("revenue"))\
     .all()

    total_commission = db.query(func.sum(Payment.commission)).filter(Payment.status == PaymentStatus.PAID).scalar() or 0
    total_gross = db.query(func.sum(Payment.amount)).filter(Payment.status == PaymentStatus.PAID).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.COMPLETED])
    ).scalar()

    return {
        "success": True,
        "data": {
            "total_commission": round(float(total_commission), 2),
            "total_gross": round(float(total_gross), 2),
            "total_paid_bookings": total_bookings,
            "top_vendors": [{"name": r.name, "email": r.email, "revenue": round(float(r.revenue), 2), "bookings": r.bookings} for r in top_vendors],
            "by_category": [{"name": r.name, "revenue": round(float(r.revenue), 2), "bookings": r.bookings} for r in by_category],
        }
    }


# ─── Broadcast Notification ───────────────────────────────────────────
@router.post("/notifications/broadcast")
def broadcast_notification(body: dict, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    title = body.get("title", "").strip()
    message = body.get("message", "").strip()
    role = body.get("role")
    if not title or not message:
        raise HTTPException(status_code=400, detail="Title and message are required")

    q = db.query(User).filter(User.is_active == True)
    if role:
        q = q.filter(User.role == role)
    users = q.all()

    notifications = [
        Notification(user_id=u.id, title=title, message=message, type=body.get("type", "info"))
        for u in users
    ]
    db.add_all(notifications)
    db.commit()
    return {"success": True, "message": f"Sent to {len(notifications)} users"}
