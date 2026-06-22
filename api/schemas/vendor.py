from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class VendorRegister(BaseModel):
    business_name: str
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


class VendorProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    logo_url: Optional[str] = None


class VendorOut(BaseModel):
    id: str
    status: str
    created_at: datetime
    approved_at: Optional[datetime]
    business_name: Optional[str] = None
    business_city: Optional[str] = None

    model_config = {"from_attributes": True}


class AnalyticsOut(BaseModel):
    total_revenue: float
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    total_listings: int
    active_listings: int
    avg_rating: float
    top_listings: list
