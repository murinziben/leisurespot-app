from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.database import get_db
from api.dependencies import get_current_user, require_vendor
from api.schemas.booking import BookingCreate, BookingStatusUpdate
from shared.models import Booking, Listing, Payment, Vendor, User, BookingStatus, BookingType, PaymentStatus, UserRole, ListingStatus

router = APIRouter(prefix="/bookings", tags=["bookings"])


def payment_to_dict(p):
    if not p:
        return None
    return {
        "id": p.id,
        "amount": p.amount,
        "commission": p.commission,
        "vendor_payout": p.vendor_payout,
        "status": p.status,
        "payment_method": p.payment_method,
        "paid_at": p.paid_at.isoformat() if p.paid_at else None,
    }


def booking_to_dict(b):
    primary_image = None
    if b.listing and b.listing.images:
        img = next((i for i in b.listing.images if i.is_primary), b.listing.images[0])
        primary_image = img.url

    customer_name = None
    if b.customer and b.customer.profile:
        p = b.customer.profile
        customer_name = f"{p.first_name or ''} {p.last_name or ''}".strip() or b.customer.email

    return {
        "id": b.id,
        "listing_id": b.listing_id,
        "customer_id": b.customer_id,
        "status": b.status,
        "booking_date": b.booking_date,
        "start_time": b.start_time,
        "guests": b.guests,
        "total_amount": b.total_amount,
        "special_requests": b.special_requests,
        "cancellation_reason": b.cancellation_reason,
        "confirmed_at": b.confirmed_at.isoformat() if b.confirmed_at else None,
        "completed_at": b.completed_at.isoformat() if b.completed_at else None,
        "cancelled_at": b.cancelled_at.isoformat() if b.cancelled_at else None,
        "created_at": b.created_at.isoformat(),
        "listing_title": b.listing.title if b.listing else None,
        "listing_image": primary_image,
        "customer_name": customer_name,
        "customer_email": b.customer.email if b.customer else None,
        "payment": payment_to_dict(b.payment),
    }


@router.post("/", status_code=201)
def create_booking(
    body: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == body.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != ListingStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="This listing is not available for booking")

    total = listing.price * body.guests

    booking = Booking(
        customer_id=current_user.id,
        listing_id=listing.id,
        booking_date=body.booking_date,
        start_time=body.start_time,
        guests=body.guests,
        total_amount=total,
        special_requests=body.special_requests,
        status=BookingStatus.PENDING,
    )

    if listing.booking_type == BookingType.INSTANT:
        booking.status = BookingStatus.CONFIRMED
        booking.confirmed_at = datetime.utcnow()

    db.add(booking)
    db.flush()

    commission = round(total * 0.10, 2)
    payment = Payment(
        booking_id=booking.id,
        amount=total,
        commission=commission,
        vendor_payout=round(total - commission, 2),
        status=PaymentStatus.PAID if listing.booking_type == BookingType.INSTANT else PaymentStatus.PENDING,
        paid_at=datetime.utcnow() if listing.booking_type == BookingType.INSTANT else None,
    )
    db.add(payment)

    listing.booking_count = (listing.booking_count or 0) + 1
    db.commit()
    db.refresh(booking)
    return {"success": True, "data": booking_to_dict(booking)}


@router.get("/my")
def my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.customer_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    return {"success": True, "data": [booking_to_dict(b) for b in bookings]}


@router.get("/vendor")
def vendor_bookings(current_user: User = Depends(require_vendor), db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    bookings = (
        db.query(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .filter(Listing.vendor_id == vendor.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return {"success": True, "data": [booking_to_dict(b) for b in bookings]}


@router.get("/{booking_id}")
def get_booking(booking_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == UserRole.CUSTOMER and booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    return {"success": True, "data": booking_to_dict(booking)}


@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: str,
    body: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role != UserRole.ADMIN and booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your booking")

    if booking.status in (BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.REJECTED):
        raise HTTPException(status_code=400, detail="Booking cannot be cancelled")

    booking.status = BookingStatus.CANCELLED
    booking.cancellation_reason = body.reason
    booking.cancelled_at = datetime.utcnow()
    db.commit()
    return {"success": True, "data": booking_to_dict(booking)}


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: str,
    body: BookingStatusUpdate,
    current_user: User = Depends(require_vendor),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    vendor = db.query(Vendor).filter(Vendor.user_id == current_user.id).first()
    if not vendor and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    if vendor and booking.listing.vendor_id != vendor.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not your booking")

    allowed = {"CONFIRMED": BookingStatus.CONFIRMED, "COMPLETED": BookingStatus.COMPLETED, "REJECTED": BookingStatus.REJECTED}
    new_status = allowed.get(body.status)
    if not new_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    booking.status = new_status
    if new_status == BookingStatus.CONFIRMED:
        booking.confirmed_at = datetime.utcnow()
        if booking.payment:
            booking.payment.status = PaymentStatus.PAID
            booking.payment.paid_at = datetime.utcnow()
    elif new_status == BookingStatus.COMPLETED:
        booking.completed_at = datetime.utcnow()
    elif new_status == BookingStatus.REJECTED:
        booking.cancellation_reason = body.reason

    db.commit()
    return {"success": True, "data": booking_to_dict(booking)}
