from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BookingCreate(BaseModel):
    listing_id: str
    booking_date: str  # YYYY-MM-DD
    start_time: Optional[str] = None
    guests: int = 1
    special_requests: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None


class PaymentOut(BaseModel):
    id: str
    amount: float
    commission: float
    vendor_payout: float
    status: str
    payment_method: str
    paid_at: Optional[datetime]

    model_config = {"from_attributes": True}


class BookingOut(BaseModel):
    id: str
    listing_id: str
    customer_id: str
    status: str
    booking_date: str
    start_time: Optional[str]
    guests: int
    total_amount: float
    special_requests: Optional[str]
    cancellation_reason: Optional[str]
    confirmed_at: Optional[datetime]
    completed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    created_at: datetime
    listing_title: Optional[str] = None
    listing_image: Optional[str] = None
    customer_name: Optional[str] = None
    payment: Optional[PaymentOut] = None

    model_config = {"from_attributes": True}
