from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.database import get_db
from api.dependencies import get_current_user, require_vendor
from api.schemas.vendor import VendorRegister, VendorProfileUpdate
from shared.models import Vendor, Business, Listing, Booking, Payment, User, UserRole, VendorStatus, BookingStatus, ListingStatus

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.post("/register", status_code=201)
def register_vendor(
    body: VendorRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(Vendor).filter(Vendor.user_id == current_user.id).first():
        raise HTTPException(status_code=400, detail="Already registered as vendor")

    vendor = Vendor(user_id=current_user.id, status=VendorStatus.PENDING)
    db.add(vendor)
    db.flush()

    business = Business(
        vendor_id=vendor.id,
        name=body.business_name,
        description=body.description,
        website=body.website,
        phone=body.phone,
        address=body.address,
        city=body.city,
    )
    db.add(business)

    current_user.role = UserRole.VENDOR
    db.commit()
    db.refresh(vendor)

    return {
        "success": True,
        "data": {
            "id": vendor.id,
            "status": vendor.status,
            "business_name": vendor.business.name,
            "message": "Application submitted. Pending admin approval.",
        }
    }


@router.get("/profile")
def get_vendor_profile(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    return {
        "success": True,
        "data": {
            "id": vendor.id,
            "status": vendor.status,
            "created_at": vendor.created_at.isoformat(),
            "approved_at": vendor.approved_at.isoformat() if vendor.approved_at else None,
            "business": {
                "name": vendor.business.name if vendor.business else None,
                "description": vendor.business.description if vendor.business else None,
                "website": vendor.business.website if vendor.business else None,
                "phone": vendor.business.phone if vendor.business else None,
                "address": vendor.business.address if vendor.business else None,
                "city": vendor.business.city if vendor.business else None,
                "logo_url": vendor.business.logo_url if vendor.business else None,
            } if vendor.business else None,
        }
    }


@router.patch("/profile")
def update_vendor_profile(
    body: VendorProfileUpdate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor or not vendor.business:
        raise HTTPException(status_code=404, detail="Vendor not found")

    update = body.model_dump(exclude_none=True)
    b = vendor.business
    if "business_name" in update:
        b.name = update["business_name"]
    for field in ("description", "website", "phone", "address", "city", "logo_url"):
        if field in update:
            setattr(b, field, update[field])

    db.commit()
    return {"success": True, "message": "Profile updated"}


@router.get("/analytics")
def vendor_analytics(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    listings = db.query(Listing).filter(
        Listing.vendor_id == vendor.id,
        Listing.status != ListingStatus.ARCHIVED,
    ).all()
    listing_ids = [l.id for l in listings]

    bookings = db.query(Booking).filter(Booking.listing_id.in_(listing_ids)).all() if listing_ids else []

    confirmed = [b for b in bookings if b.status in (BookingStatus.CONFIRMED, BookingStatus.COMPLETED)]
    revenue = sum(b.total_amount * 0.90 for b in confirmed)

    top_listings = sorted(listings, key=lambda l: l.booking_count, reverse=True)[:5]

    return {
        "success": True,
        "data": {
            "total_revenue": round(revenue, 2),
            "total_bookings": len(bookings),
            "confirmed_bookings": len(confirmed),
            "pending_bookings": sum(1 for b in bookings if b.status == BookingStatus.PENDING),
            "total_listings": len(listings),
            "active_listings": sum(1 for l in listings if l.status == ListingStatus.ACTIVE),
            "avg_rating": round(sum(l.avg_rating for l in listings) / len(listings), 2) if listings else 0,
            "top_listings": [
                {"id": l.id, "title": l.title, "booking_count": l.booking_count, "avg_rating": l.avg_rating}
                for l in top_listings
            ],
        }
    }
