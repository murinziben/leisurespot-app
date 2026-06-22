from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ImageOut(BaseModel):
    id: str
    url: str
    alt_text: Optional[str]
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: str
    name: str
    slug: str
    icon: Optional[str]

    model_config = {"from_attributes": True}


class ReviewOut(BaseModel):
    id: str
    rating: int
    comment: Optional[str]
    created_at: datetime
    author_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    price_unit: Optional[str] = "per person"
    city: Optional[str] = None
    address: Optional[str] = None
    booking_type: Optional[str] = "INSTANT"
    duration_minutes: Optional[int] = None
    max_guests: Optional[int] = 10
    min_guests: Optional[int] = 1
    cancellation_policy: Optional[str] = None
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    category_id: Optional[str] = None


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: Optional[float] = None
    price_unit: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    booking_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    max_guests: Optional[int] = None
    min_guests: Optional[int] = None
    cancellation_policy: Optional[str] = None
    includes: Optional[List[str]] = None
    excludes: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    category_id: Optional[str] = None
    status: Optional[str] = None
    image_urls: Optional[List[str]] = None


class ListingOut(BaseModel):
    id: str
    title: str
    slug: str
    short_description: Optional[str]
    price: float
    price_unit: Optional[str]
    city: Optional[str]
    booking_type: str
    status: str
    is_featured: bool
    avg_rating: float
    review_count: int
    booking_count: int
    duration_minutes: Optional[int]
    created_at: datetime
    images: List[ImageOut] = []
    category: Optional[CategoryOut] = None

    model_config = {"from_attributes": True}


class ListingDetail(ListingOut):
    description: Optional[str]
    address: Optional[str]
    max_guests: int
    min_guests: int
    cancellation_policy: Optional[str]
    includes: Optional[List[str]]
    excludes: Optional[List[str]]
    tags: Optional[List[str]]
    reviews: List[ReviewOut] = []
    vendor_name: Optional[str] = None

    model_config = {"from_attributes": True}


class PaginatedListings(BaseModel):
    items: List[ListingOut]
    total: int
    page: int
    per_page: int
    pages: int
