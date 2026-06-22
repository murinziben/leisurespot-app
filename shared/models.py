from datetime import datetime
from uuid import uuid4
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime,
    ForeignKey, Enum, JSON
)
from sqlalchemy.orm import declarative_base, relationship
import enum

Base = declarative_base()


def new_uuid():
    return str(uuid4())


class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    VENDOR = "VENDOR"
    ADMIN = "ADMIN"


class VendorStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class BookingType(str, enum.Enum):
    INSTANT = "INSTANT"
    REQUEST = "REQUEST"


class ListingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    ARCHIVED = "ARCHIVED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    vendor = relationship("Vendor", back_populates="user", uselist=False)
    bookings = relationship("Booking", back_populates="customer", foreign_keys="Booking.customer_id")
    reviews = relationship("Review", back_populates="author")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String(500), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    status = Column(Enum(VendorStatus), default=VendorStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="vendor")
    business = relationship("Business", back_populates="vendor", uselist=False, cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="vendor")


class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True, default=new_uuid)
    vendor_id = Column(String, ForeignKey("vendors.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="business")
    images = relationship("Image", back_populates="business", foreign_keys="Image.business_id")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    parent_id = Column(String, ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")
    listings = relationship("Listing", back_populates="category")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, default=new_uuid)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    price = Column(Float, nullable=False)
    price_unit = Column(String(50), default="per person")
    city = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    booking_type = Column(Enum(BookingType), default=BookingType.INSTANT, nullable=False)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False)
    is_featured = Column(Boolean, default=False)
    featured_requested = Column(Boolean, default=False)
    featured_request_note = Column(Text, nullable=True)
    featured_expires_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    max_guests = Column(Integer, default=10)
    min_guests = Column(Integer, default=1)
    cancellation_policy = Column(Text, nullable=True)
    includes = Column(JSON, nullable=True)
    excludes = Column(JSON, nullable=True)
    tags = Column(JSON, nullable=True)
    avg_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    booking_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="listings")
    category = relationship("Category", back_populates="listings")
    images = relationship("Image", back_populates="listing", foreign_keys="Image.listing_id")
    bookings = relationship("Booking", back_populates="listing")
    reviews = relationship("Review", back_populates="listing")
    availability = relationship("Availability", back_populates="listing", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(String, primary_key=True, default=new_uuid)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    date = Column(String(10), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(5), nullable=True)  # HH:MM
    end_time = Column(String(5), nullable=True)
    slots = Column(Integer, default=1)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="availability")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=new_uuid)
    customer_id = Column(String, ForeignKey("users.id"), nullable=False)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False)
    booking_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    start_time = Column(String(5), nullable=True)
    guests = Column(Integer, default=1)
    total_amount = Column(Float, nullable=False)
    special_requests = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", back_populates="bookings", foreign_keys=[customer_id])
    listing = relationship("Listing", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=new_uuid)
    booking_id = Column(String, ForeignKey("bookings.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    commission = Column(Float, default=0.0)
    vendor_payout = Column(Float, default=0.0)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(String(50), default="card")
    transaction_ref = Column(String(255), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=new_uuid)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    author = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")
    images = relationship("Image", back_populates="review", foreign_keys="Image.review_id")


class Image(Base):
    __tablename__ = "images"

    id = Column(String, primary_key=True, default=new_uuid)
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    # Separate nullable FKs to avoid polymorphic FK conflicts
    listing_id = Column(String, ForeignKey("listings.id"), nullable=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=True)
    review_id = Column(String, ForeignKey("reviews.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="images", foreign_keys=[listing_id])
    business = relationship("Business", back_populates="images", foreign_keys=[business_id])
    review = relationship("Review", back_populates="images", foreign_keys=[review_id])


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    listing_id = Column(String, ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorites")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=True)
    entity_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
