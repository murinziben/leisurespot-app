"""Seed the database with demo data."""
import os
import sys
import re
from datetime import datetime, timedelta
from uuid import uuid4

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

from shared.models import (
    Base, User, Profile, Vendor, Business, Category, Listing, Image,
    Booking, Payment, Review, Favorite, Notification,
    UserRole, VendorStatus, BookingStatus, BookingType, ListingStatus, PaymentStatus
)
from api.utils.password import hash_password

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://leisurespot:strongpassword@127.0.0.1:5433/leisurespot_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


def seed():
    db = SessionLocal()
    print("Seeding database...")

    # ─── Categories ────────────────────────────────────────────────────────────
    categories_data = [
        {"name": "Safaris & Wildlife",       "slug": "safaris",  "icon": "paw-print",     "sort_order": 1},
        {"name": "Restaurants & Dining",     "slug": "dining",   "icon": "utensils",      "sort_order": 2},
        {"name": "Wellness & Spa",           "slug": "wellness", "icon": "sparkles",      "sort_order": 3},
        {"name": "Sports & Adventure",       "slug": "sports",   "icon": "zap",           "sort_order": 4},
        {"name": "Events & Entertainment",   "slug": "events",   "icon": "calendar-days", "sort_order": 5},
        {"name": "Lodges & Accommodation",   "slug": "lodges",   "icon": "tent",          "sort_order": 6},
        {"name": "Family Activities",        "slug": "family",   "icon": "users",         "sort_order": 7},
        {"name": "Cultural Experiences",     "slug": "culture",  "icon": "landmark",      "sort_order": 8},
    ]
    cats = {}
    for c in categories_data:
        existing = db.query(Category).filter(Category.slug == c["slug"]).first()
        if not existing:
            cat = Category(**c, description=f"Explore {c['name']} in Botswana")
            db.add(cat)
            db.flush()
            cats[c["slug"]] = cat
        else:
            cats[c["slug"]] = existing
    db.commit()
    print(f"  ✔ {len(cats)} categories")

    # ─── Users ─────────────────────────────────────────────────────────────────
    def create_user(email, password, role, first_name, last_name, phone=None):
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return existing
        user = User(email=email, password_hash=hash_password(password), role=role, is_active=True, is_verified=True)
        db.add(user)
        db.flush()
        profile = Profile(user_id=user.id, first_name=first_name, last_name=last_name, phone=phone)
        db.add(profile)
        db.flush()
        return user

    # Admin
    admin_user = create_user("admin@leisurespot.co.bw", "Admin@LeisureSpot2024!", UserRole.ADMIN, "Admin", "LeisureSpot")

    # Original customer
    customer = create_user("demo.customer@leisurespot.co.bw", "Customer@Demo2024!", UserRole.CUSTOMER, "Demo", "Customer", "+267 71 234 567")

    # 10 additional customers
    c1  = create_user("thabo.moeng@gmail.com",        "Customer@Demo2024!", UserRole.CUSTOMER, "Thabo",      "Moeng",      "+267 71 100 001")
    c2  = create_user("kefilwe.ramotswe@gmail.com",   "Customer@Demo2024!", UserRole.CUSTOMER, "Kefilwe",    "Ramotswe",   "+267 71 100 002")
    c3  = create_user("goitseone.kgosi@gmail.com",    "Customer@Demo2024!", UserRole.CUSTOMER, "Goitseone",  "Kgosi",      "+267 71 100 003")
    c4  = create_user("onalenna.seetso@gmail.com",    "Customer@Demo2024!", UserRole.CUSTOMER, "Onalenna",   "Seetso",     "+267 71 100 004")
    c5  = create_user("neo.moseki@gmail.com",         "Customer@Demo2024!", UserRole.CUSTOMER, "Neo",        "Moseki",     "+267 71 100 005")
    c6  = create_user("mpho.gabaake@gmail.com",       "Customer@Demo2024!", UserRole.CUSTOMER, "Mpho",       "Gabaake",    "+267 71 100 006")
    c7  = create_user("boitumelo.segaetsho@gmail.com","Customer@Demo2024!", UserRole.CUSTOMER, "Boitumelo",  "Segaetsho",  "+267 71 100 007")
    c8  = create_user("tlotlo.mphathi@gmail.com",     "Customer@Demo2024!", UserRole.CUSTOMER, "Tlotlo",     "Mphathi",    "+267 71 100 008")
    c9  = create_user("kelebogile.setshogo@gmail.com","Customer@Demo2024!", UserRole.CUSTOMER, "Kelebogile", "Setshogo",   "+267 71 100 009")
    c10 = create_user("agang.ditlhase@gmail.com",     "Customer@Demo2024!", UserRole.CUSTOMER, "Agang",      "Ditlhase",   "+267 71 100 010")

    # Original 5 vendor users
    v1_user  = create_user("okavango@leisurespot.co.bw",       "Vendor@Demo2024!", UserRole.VENDOR, "Okavango",   "Safaris",    "+267 72 111 222")
    v2_user  = create_user("gaborone.eats@leisurespot.co.bw",  "Vendor@Demo2024!", UserRole.VENDOR, "Gaborone",   "Eats",       "+267 73 333 444")
    v3_user  = create_user("wellness.bw@leisurespot.co.bw",    "Vendor@Demo2024!", UserRole.VENDOR, "Wellness",   "BW",         "+267 74 555 666")
    v4_user  = create_user("adventure.bw@leisurespot.co.bw",   "Vendor@Demo2024!", UserRole.VENDOR, "Adventure",  "Botswana",   "+267 75 777 888")
    v5_user  = create_user("culture.bw@leisurespot.co.bw",     "Vendor@Demo2024!", UserRole.VENDOR, "Culture",    "Hub",        "+267 76 999 000")

    # 5 new vendor users
    v6_user  = create_user("northern.trails@leisurespot.co.bw","Vendor@Demo2024!", UserRole.VENDOR, "Northern",   "Trails",     "+267 77 111 222")
    v7_user  = create_user("southern.star@leisurespot.co.bw",  "Vendor@Demo2024!", UserRole.VENDOR, "Southern",   "Star",       "+267 77 333 444")
    v8_user  = create_user("selebi.eco@leisurespot.co.bw",     "Vendor@Demo2024!", UserRole.VENDOR, "Selebi",     "EcoTours",   "+267 77 555 666")
    v9_user  = create_user("palapye.heritage@leisurespot.co.bw","Vendor@Demo2024!", UserRole.VENDOR, "Palapye",   "Heritage",   "+267 77 777 888")
    v10_user = create_user("delta.luxury@leisurespot.co.bw",   "Vendor@Demo2024!", UserRole.VENDOR, "Delta",      "Luxury",     "+267 77 999 000")

    db.commit()
    print("  ✔ Users created (1 admin + 11 customers + 10 vendors)")

    # ─── Vendors & Businesses ──────────────────────────────────────────────────
    def create_vendor(user, biz_name, desc, city, phone, website=None):
        existing = db.query(Vendor).filter(Vendor.user_id == user.id).first()
        if existing:
            return existing
        vendor = Vendor(user_id=user.id, status=VendorStatus.APPROVED, approved_at=datetime.utcnow())
        db.add(vendor)
        db.flush()
        biz = Business(vendor_id=vendor.id, name=biz_name, description=desc, city=city, phone=phone, website=website)
        db.add(biz)
        db.flush()
        return vendor

    # Original vendors
    v1  = create_vendor(v1_user,  "Okavango Delta Safaris",   "Premier safari experiences in the Okavango Delta",             "Maun",          "+267 72 111 222", "https://okavangosafaris.co.bw")
    v2  = create_vendor(v2_user,  "Gaborone Eats",            "Fine dining and casual restaurants in Gaborone",               "Gaborone",      "+267 73 333 444")
    v3  = create_vendor(v3_user,  "Wellness Botswana",        "Holistic wellness and spa experiences",                        "Gaborone",      "+267 74 555 666")
    v4  = create_vendor(v4_user,  "Adventure Botswana",       "Adrenaline-pumping outdoor adventures",                       "Kasane",        "+267 75 777 888")
    v5  = create_vendor(v5_user,  "Culture Hub BW",           "Authentic Botswana cultural experiences",                     "Gaborone",      "+267 76 999 000")

    # New vendors
    v6  = create_vendor(v6_user,  "Northern Trails Botswana", "Adventure tours and cultural experiences in northern Botswana","Francistown",   "+267 77 111 222", "https://northerntrails.co.bw")
    v7  = create_vendor(v7_user,  "Southern Star Experiences","Unique leisure and heritage activities in southern Botswana",  "Lobatse",       "+267 77 333 444")
    v8  = create_vendor(v8_user,  "Selebi Eco Tours",         "Eco-tourism and community experiences in eastern Botswana",   "Selebi-Phikwe", "+267 77 555 666")
    v9  = create_vendor(v9_user,  "Palapye Heritage Tours",   "Historical, cultural and nature tours in central Botswana",   "Palapye",       "+267 77 777 888")
    v10 = create_vendor(v10_user, "Delta Luxury Camps",       "Exclusive luxury lodges and fly-in safaris in the Okavango",  "Maun",          "+267 77 999 000", "https://deltaluxury.co.bw")

    db.commit()
    print("  ✔ 10 vendors created")

    # ─── Image constants ──────────────────────────────────────────────────────
    IMG_SAFARI    = "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_FOOD      = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_SPA       = "https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_ADVENTURE = "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_CULTURE   = "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_LODGE     = "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_FAMILY    = "https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_EVENT     = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_BIRD      = "https://images.pexels.com/photos/326900/pexels-photo-326900.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_HIKE      = "https://images.pexels.com/photos/3608056/pexels-photo-3608056.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_BOAT      = "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_HORSE     = "https://images.pexels.com/photos/635499/pexels-photo-635499.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_YOGA      = "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_NIGHT     = "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_BALLOON   = "https://images.pexels.com/photos/1166359/pexels-photo-1166359.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_FISH      = "https://images.pexels.com/photos/1172764/pexels-photo-1172764.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_CRAFT     = "https://images.pexels.com/photos/3094208/pexels-photo-3094208.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_MUSEUM    = "https://images.pexels.com/photos/2034892/pexels-photo-2034892.jpeg?auto=compress&cs=tinysrgb&w=800"
    IMG_POOL      = "https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg?auto=compress&cs=tinysrgb&w=800"

    # ─── Listings ──────────────────────────────────────────────────────────────
    listings_data = [

        # ── MAUN / OKAVANGO (v1 + v10) ──────────────────────────────────────
        {
            "vendor": v1, "category": "safaris", "title": "3-Day Okavango Delta Mokoro Safari",
            "short_description": "Glide through pristine channels on a traditional dugout canoe",
            "description": "Experience the magic of the Okavango Delta on a 3-day mokoro (dugout canoe) safari. Guided by expert local polers, you'll navigate crystal-clear waterways surrounded by papyrus and wildlife. Spot hippos, crocodiles, and over 400 bird species. Includes bush camping and sunset sundowners.",
            "price": 2850, "price_unit": "per person", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 4320,
            "max_guests": 8, "is_featured": True, "avg_rating": 4.9, "review_count": 47, "booking_count": 89,
            "includes": ["Mokoro hire", "Expert guide", "Bush camping", "All meals", "Park fees"],
            "excludes": ["Flights to Maun", "Personal insurance", "Alcoholic beverages"],
            "tags": ["safari", "mokoro", "wildlife", "delta", "camping"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v1, "category": "safaris", "title": "Full-Day Game Drive — Moremi Game Reserve",
            "short_description": "Iconic wildlife encounters in one of Africa's finest reserves",
            "description": "A full day 4x4 game drive through Moremi Game Reserve — home to the Big Five and hundreds of bird species. Expert naturalist guides share their knowledge of the ecosystem. Packed lunch and refreshments included.",
            "price": 1200, "price_unit": "per person", "city": "Maun",
            "booking_type": "INSTANT", "duration_minutes": 480,
            "max_guests": 6, "is_featured": True, "avg_rating": 4.8, "review_count": 63, "booking_count": 134,
            "includes": ["4x4 vehicle", "Expert guide", "Packed lunch", "Park fees", "Refreshments"],
            "excludes": ["Hotel transfers", "Personal tips"],
            "tags": ["game drive", "moremi", "big five", "wildlife"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v1, "category": "safaris", "title": "Birdwatching Safari — Chobe Floodplains",
            "short_description": "Over 450 bird species in one of Africa's best birding spots",
            "description": "A specialist birdwatching safari on the Chobe floodplains led by an ornithologist guide. Target carmine bee-eaters, African fish eagles, wattled cranes, and hundreds more. Includes quality binoculars.",
            "price": 650, "price_unit": "per person", "city": "Kasane",
            "booking_type": "INSTANT", "duration_minutes": 360,
            "max_guests": 6, "is_featured": False, "avg_rating": 4.7, "review_count": 21, "booking_count": 39,
            "includes": ["Expert guide", "Binoculars", "Field guide book", "Refreshments"],
            "excludes": ["Park entry fees"],
            "tags": ["birdwatching", "chobe", "birding", "wildlife", "specialist"],
            "image": IMG_BIRD,
        },
        {
            "vendor": v1, "category": "safaris", "title": "Chobe National Park Boat Safari",
            "short_description": "Watch elephants, hippos & crocodiles from the Chobe River",
            "description": "Board our comfortable boat for a 3-hour safari along the Chobe River. Witness the world's largest elephant population coming to drink at sunset. Professional guide and canapés included.",
            "price": 750, "price_unit": "per person", "city": "Kasane",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.7, "review_count": 38, "booking_count": 72,
            "includes": ["Boat hire", "Guide", "Canapés", "Park fees"],
            "excludes": ["Alcoholic drinks", "Hotel transfers"],
            "tags": ["boat safari", "chobe", "elephants", "river"],
            "image": IMG_BOAT,
        },
        {
            "vendor": v1, "category": "lodges", "title": "Luxury Tented Camp — Okavango Delta",
            "short_description": "Sleep under the stars in a luxury canvas suite",
            "description": "Our exclusive tented camp sits on a private island in the Okavango Delta. Six luxury tents feature king beds, en-suite bathrooms, and private decks overlooking the floodplains. All meals, drinks, and twice-daily game activities included.",
            "price": 8500, "price_unit": "per person per night", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 1440,
            "max_guests": 12, "is_featured": True, "avg_rating": 4.9, "review_count": 28, "booking_count": 41,
            "includes": ["All meals", "All drinks", "Game drives", "Mokoro activities", "Laundry"],
            "excludes": ["Flights", "Personal shopping", "Spa treatments"],
            "tags": ["lodge", "luxury", "tented camp", "okavango", "all-inclusive"],
            "image": IMG_LODGE,
        },
        {
            "vendor": v1, "category": "safaris", "title": "Maun Town Heritage & Bush Walk",
            "short_description": "Explore Maun's vibrant streets and nearby delta channels on foot",
            "description": "A 4-hour guided experience combining a heritage walk through Maun town — the 'tourism capital of Botswana' — followed by a gentle bush walk along the edge of the Thamalakane River. Spot otters, monitor lizards, and kingfishers.",
            "price": 320, "price_unit": "per person", "city": "Maun",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.5, "review_count": 17, "booking_count": 31,
            "includes": ["Guide", "Water bottle", "Refreshments"],
            "excludes": ["Lunch"],
            "tags": ["heritage", "maun", "bush walk", "river", "wildlife"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v10, "category": "safaris", "title": "Hot Air Balloon Safari Over the Delta",
            "short_description": "A sunrise balloon flight over the Okavango's floodplains",
            "description": "Drift silently above the Okavango Delta at sunrise in a hot air balloon. Marvel at the patchwork of channels, islands, and wildlife below. Ends with a bush champagne breakfast in the wild. Unforgettable and unique.",
            "price": 4500, "price_unit": "per person", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 240,
            "max_guests": 8, "is_featured": True, "avg_rating": 5.0, "review_count": 22, "booking_count": 34,
            "includes": ["Balloon flight", "Bush breakfast", "Champagne", "Transfer from Maun"],
            "excludes": ["Travel insurance", "Personal items"],
            "tags": ["balloon", "aerial", "sunrise", "okavango", "luxury"],
            "image": IMG_BALLOON,
        },
        {
            "vendor": v10, "category": "safaris", "title": "Helicopter Scenic Flight — Delta & Moremi",
            "short_description": "See the delta from above on a private helicopter charter",
            "description": "A private helicopter flight over the Okavango Delta and Moremi Game Reserve. Your pilot provides expert commentary on the ecosystem below. Optional landing at a remote bush location for sundowners.",
            "price": 6200, "price_unit": "per helicopter (up to 3 pax)", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 90,
            "max_guests": 3, "is_featured": True, "avg_rating": 4.9, "review_count": 14, "booking_count": 19,
            "includes": ["Pilot", "Fuel", "Safety briefing", "Sundowners (optional add-on)"],
            "excludes": ["Airstrip transfers"],
            "tags": ["helicopter", "aerial", "scenic", "okavango", "exclusive"],
            "image": IMG_BALLOON,
        },
        {
            "vendor": v10, "category": "lodges", "title": "Delta Luxury Camp — All-Inclusive 3 Nights",
            "short_description": "Three nights at our award-winning fly-in delta camp",
            "description": "An all-inclusive 3-night stay at Delta Luxury Camp, accessible only by light aircraft. Exquisite en-suite tents, private plunge pools, gourmet dining, and unlimited game activities. Voted top 5 camps in Botswana.",
            "price": 28000, "price_unit": "per person", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 4320,
            "max_guests": 10, "is_featured": True, "avg_rating": 5.0, "review_count": 9, "booking_count": 12,
            "includes": ["All meals & premium drinks", "All game activities", "Laundry", "Scenic flights"],
            "excludes": ["Charter flights", "Visas", "Travel insurance"],
            "tags": ["luxury", "fly-in", "camp", "okavango", "all-inclusive"],
            "image": IMG_LODGE,
        },
        {
            "vendor": v10, "category": "safaris", "title": "Wild Dog Research Day Trip",
            "short_description": "Spend a day tracking endangered wild dogs with researchers",
            "description": "Join conservation researchers on a full-day tracking exercise to find and observe African wild dogs in the Moremi area. Learn about pack behaviour and the challenges facing this endangered species.",
            "price": 1800, "price_unit": "per person", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 540,
            "max_guests": 4, "is_featured": False, "avg_rating": 4.8, "review_count": 11, "booking_count": 16,
            "includes": ["Researcher guide", "4x4 vehicle", "All meals in field", "Conservation report"],
            "excludes": ["Park fees", "Personal insurance"],
            "tags": ["wild dogs", "conservation", "research", "moremi", "endangered"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v1, "category": "safaris", "title": "Night Game Drive — Moremi Reserve",
            "short_description": "Encounter Africa's nocturnal hunters after dark",
            "description": "A 3-hour spotlight game drive through Moremi after sunset. Spot leopard, honey badger, aardvark, porcupine, and hyena that are rarely seen by day. Led by a specialist night guide.",
            "price": 780, "price_unit": "per person", "city": "Maun",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 6, "is_featured": False, "avg_rating": 4.7, "review_count": 26, "booking_count": 47,
            "includes": ["4x4 vehicle", "Spotlight", "Guide", "Refreshments"],
            "excludes": ["Park fees"],
            "tags": ["night drive", "nocturnal", "moremi", "leopard", "safari"],
            "image": IMG_NIGHT,
        },
        {
            "vendor": v1, "category": "sports", "title": "Fishing Safari on the Okavango",
            "short_description": "Cast for tigerfish and bream in pristine waters",
            "description": "A guided fishing experience on the Okavango River. Target tigerfish, bream, and catfish from our custom fishing boat. All equipment provided. Expert guides share their knowledge of the delta's waterways.",
            "price": 850, "price_unit": "per person", "city": "Maun",
            "booking_type": "INSTANT", "duration_minutes": 480,
            "max_guests": 4, "is_featured": False, "avg_rating": 4.5, "review_count": 19, "booking_count": 38,
            "includes": ["Fishing gear", "Boat", "Guide", "Lunch"],
            "excludes": ["Fishing license (can be arranged)"],
            "tags": ["fishing", "okavango", "tigerfish", "angling"],
            "image": IMG_FISH,
        },

        # ── KASANE / CHOBE (v1 + v4) ──────────────────────────────────────────
        {
            "vendor": v4, "category": "safaris", "title": "Makgadikgadi Salt Pans Quad Bike Safari",
            "short_description": "Race across Africa's largest salt pans on a quad bike",
            "description": "Explore the otherworldly Makgadikgadi Salt Pans on a guided quad bike adventure. Witness flamingos, zebras, and spectacular sunsets over the white expanse. Suitable for beginners.",
            "price": 950, "price_unit": "per person", "city": "Gweta",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 10, "is_featured": True, "avg_rating": 4.6, "review_count": 29, "booking_count": 56,
            "includes": ["Quad bike", "Helmet", "Guide", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["quad bike", "salt pans", "makgadikgadi", "adventure"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v4, "category": "sports", "title": "White-Water Rafting on the Zambezi",
            "short_description": "Conquer the mighty Zambezi rapids near Victoria Falls",
            "description": "An adrenaline-charged half-day white-water rafting experience on the Zambezi River near Kasane. Navigate Grade 4-5 rapids with experienced guides. All safety equipment provided. Suitable for ages 16+.",
            "price": 1100, "price_unit": "per person", "city": "Kasane",
            "booking_type": "INSTANT", "duration_minutes": 360,
            "max_guests": 8, "is_featured": True, "avg_rating": 4.8, "review_count": 33, "booking_count": 59,
            "includes": ["Guide", "Safety equipment", "Lunch", "Transfer to river"],
            "excludes": ["Personal insurance", "Waterproof camera"],
            "tags": ["rafting", "adventure", "zambezi", "rapids", "adrenaline"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v4, "category": "lodges", "title": "Chobe Riverside Lodge Stay",
            "short_description": "Riverfront rooms with elephant views from your balcony",
            "description": "Nestled on the banks of the Chobe River, our lodge offers panoramic views of wildlife coming to drink. Spacious rooms with balconies, infinity pool, and two restaurants serving local and international cuisine.",
            "price": 3200, "price_unit": "per person per night", "city": "Kasane",
            "booking_type": "REQUEST", "duration_minutes": 1440,
            "max_guests": 40, "is_featured": False, "avg_rating": 4.6, "review_count": 44, "booking_count": 87,
            "includes": ["Breakfast", "Evening boat cruise", "Pool access"],
            "excludes": ["Lunch", "Dinner", "Transfers"],
            "tags": ["lodge", "chobe", "river", "accommodation", "wildlife views"],
            "image": IMG_LODGE,
        },
        {
            "vendor": v4, "category": "sports", "title": "Skydiving Over the Makgadikgadi",
            "short_description": "Freefall over one of the world's largest salt flats",
            "description": "Experience the ultimate thrill: a tandem skydive from 10,000 feet above the vast Makgadikgadi Salt Pans. The views are simply breathtaking. Certificate and video package available.",
            "price": 2800, "price_unit": "per person", "city": "Gweta",
            "booking_type": "REQUEST", "duration_minutes": 180,
            "max_guests": 4, "is_featured": True, "avg_rating": 5.0, "review_count": 9, "booking_count": 14,
            "includes": ["Tandem jump", "Instructor", "Certificate"],
            "excludes": ["Video package (BWP 800 extra)", "Transport to drop zone"],
            "tags": ["skydiving", "extreme", "makgadikgadi", "adventure", "adrenaline"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v2, "category": "dining", "title": "Sunset Sundowners Cruise — Chobe River",
            "short_description": "Cocktails and canapés on the Chobe as the sun sets",
            "description": "Drift along the Chobe River on our private sundowner cruise. As elephants wade into the shallows and hippos surface around you, sip craft cocktails and enjoy gourmet canapés prepared by our onboard chef.",
            "price": 890, "price_unit": "per person", "city": "Kasane",
            "booking_type": "INSTANT", "duration_minutes": 150,
            "max_guests": 12, "is_featured": True, "avg_rating": 4.9, "review_count": 44, "booking_count": 96,
            "includes": ["Open bar", "Gourmet canapés", "Boat", "Guide"],
            "excludes": [],
            "tags": ["sundowners", "chobe", "boat", "cocktails", "sunset"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v4, "category": "safaris", "title": "Chobe National Park Walking Safari",
            "short_description": "Explore Chobe on foot with an armed ranger guide",
            "description": "A thrilling walking safari inside Chobe National Park guided by an armed and certified ranger. Get up close with tracks, plants, and small wildlife that a vehicle safari misses. Max 6 guests for an intimate experience.",
            "price": 980, "price_unit": "per person", "city": "Kasane",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 6, "is_featured": False, "avg_rating": 4.7, "review_count": 18, "booking_count": 28,
            "includes": ["Armed ranger", "Park fees", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["walking safari", "chobe", "rangers", "wildlife", "nature"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v4, "category": "sports", "title": "Chobe River Fishing Experience",
            "short_description": "Fish for tigerfish and bream in the famous Chobe River",
            "description": "Half-day guided fishing trip on the Chobe River. Target tigerfish, bream, and catfish alongside resident hippos and crocodiles. All gear provided. Catch-and-release policy encourages sustainable fishing.",
            "price": 720, "price_unit": "per person", "city": "Kasane",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 4, "is_featured": False, "avg_rating": 4.6, "review_count": 24, "booking_count": 41,
            "includes": ["Fishing gear", "Boat", "Guide", "Refreshments"],
            "excludes": ["Fishing license"],
            "tags": ["fishing", "chobe river", "tigerfish", "angling"],
            "image": IMG_FISH,
        },

        # ── GABORONE (v2 + v3 + v5) ──────────────────────────────────────────
        {
            "vendor": v2, "category": "dining", "title": "Sunday Braai Buffet at The Grill House",
            "short_description": "Authentic Botswana braai with game meats and local sides",
            "description": "Join us every Sunday for our famous braai buffet. Featuring Botswana beef, game meats (kudu, ostrich, springbok), traditional setswana dishes, and live music. The ultimate local food experience.",
            "price": 350, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 40, "is_featured": True, "avg_rating": 4.7, "review_count": 82, "booking_count": 210,
            "includes": ["Unlimited buffet", "Soft drinks", "Live music"],
            "excludes": ["Alcoholic beverages", "Dessert extras"],
            "tags": ["braai", "buffet", "game meat", "setswana cuisine", "gaborone"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v2, "category": "dining", "title": "Private Chef's Table Experience",
            "short_description": "Exclusive 5-course meal with Botswana's top chef",
            "description": "An intimate dining experience for up to 8 guests. Chef Kolobetso crafts a 5-course tasting menu showcasing the finest local ingredients — from Kalahari truffles to Okavango bream. Wine pairing available.",
            "price": 1800, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 240,
            "max_guests": 8, "is_featured": True, "avg_rating": 4.9, "review_count": 24, "booking_count": 38,
            "includes": ["5-course menu", "Welcome cocktail", "Chef interaction"],
            "excludes": ["Wine pairing (BWP 500 extra)"],
            "tags": ["fine dining", "chef's table", "private", "gourmet"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v2, "category": "dining", "title": "Cooking Class: Traditional Setswana Cuisine",
            "short_description": "Learn to cook seswaa, morogo, and bogobe with local cooks",
            "description": "A hands-on cooking class where you'll prepare authentic Batswana dishes from scratch. Learn about local ingredients, cooking techniques, and food culture. Ends with a communal feast.",
            "price": 480, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 210,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.8, "review_count": 35, "booking_count": 67,
            "includes": ["All ingredients", "Recipe booklet", "Shared meal", "Beverages"],
            "excludes": ["Alcoholic drinks"],
            "tags": ["cooking class", "setswana", "culture", "food"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v2, "category": "dining", "title": "Gaborone Food Market Progressive Dinner",
            "short_description": "Taste your way through Gaborone's best food stalls and pop-ups",
            "description": "An evening progressive dinner tour visiting four of Gaborone's best food market vendors. Sample braai meats, local craft beers, fusion street food, and traditional desserts. Guided by a passionate local foodie.",
            "price": 290, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 16, "is_featured": False, "avg_rating": 4.6, "review_count": 29, "booking_count": 54,
            "includes": ["Food tastings at 4 vendors", "Craft beer pairing", "Guide"],
            "excludes": ["Additional food purchases", "Transport"],
            "tags": ["food market", "street food", "gaborone", "beer", "tour"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Signature African Massage & Spa Day",
            "short_description": "Full-body relaxation with African botanicals and oils",
            "description": "Indulge in our signature 3-hour spa package: African hot stone massage, morula oil body treatment, and a revitalising facial using local botanical extracts. Includes access to steam room and plunge pool.",
            "price": 680, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 1, "is_featured": True, "avg_rating": 4.8, "review_count": 56, "booking_count": 143,
            "includes": ["Hot stone massage", "Body treatment", "Facial", "Steam room access"],
            "excludes": ["Gratuities"],
            "tags": ["massage", "spa", "relaxation", "african botanicals"],
            "image": IMG_SPA,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Couples Wellness Escape",
            "short_description": "Romantic spa retreat for two with champagne",
            "description": "A luxurious couples' experience featuring side-by-side massages, a romantic bath ritual with rose petals and champagne, and a private dinner for two. Perfect for anniversaries and honeymoons.",
            "price": 1950, "price_unit": "per couple", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 2, "is_featured": False, "avg_rating": 4.9, "review_count": 18, "booking_count": 29,
            "includes": ["Couples massage", "Bath ritual", "Champagne", "Private dinner"],
            "excludes": [],
            "tags": ["couples", "romantic", "spa", "anniversary"],
            "image": IMG_SPA,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Sound Healing & Meditation Workshop",
            "short_description": "Restore balance with African drums and crystal singing bowls",
            "description": "A transformative 2-hour sound healing session using Zimbabwean mbira, djembe drums, and crystal singing bowls. Hosted in our purpose-built healing space. Suitable for all experience levels.",
            "price": 280, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.7, "review_count": 22, "booking_count": 41,
            "includes": ["Sound healing session", "Herbal tea", "Meditation guide"],
            "excludes": [],
            "tags": ["sound healing", "meditation", "wellness", "mindfulness"],
            "image": IMG_SPA,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Morula Detox & Cleanse Retreat (2 Days)",
            "short_description": "Two days of deep cleansing inspired by African traditions",
            "description": "A 2-day wellness retreat combining juice cleansing, digital detox, yoga, nature walks, and Ayurvedic treatments adapted with local Botswana botanicals. Limited to 8 participants for an intimate experience.",
            "price": 3200, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 2880,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.8, "review_count": 12, "booking_count": 18,
            "includes": ["Accommodation", "All meals & juices", "Yoga & meditation", "All treatments"],
            "excludes": ["Alcoholic beverages", "Flights"],
            "tags": ["detox", "retreat", "wellness", "yoga", "cleanse"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Sunrise Poolside Yoga — Riverwalk Hotel",
            "short_description": "Morning yoga class with a stunning Gaborone skyline backdrop",
            "description": "A refreshing 75-minute outdoor yoga session on the pool deck of Gaborone's Riverwalk Hotel. Suitable for all levels. Followed by a healthy acai breakfast bowl.",
            "price": 180, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.6, "review_count": 31, "booking_count": 75,
            "includes": ["Yoga mat", "Instructor", "Healthy breakfast"],
            "excludes": [],
            "tags": ["yoga", "sunrise", "pool", "wellness", "morning"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v5, "category": "family", "title": "Gaborone Game Reserve Family Safari",
            "short_description": "Kid-friendly wildlife experience 10 minutes from Gaborone CBD",
            "description": "A perfect introduction to African wildlife for families with children. The Gaborone Game Reserve is home to rhino, wildebeest, giraffe, and zebra. Guided open vehicle safari with educational wildlife talks. Picnic lunch included.",
            "price": 290, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 20, "is_featured": True, "avg_rating": 4.6, "review_count": 53, "booking_count": 167,
            "includes": ["Guide", "Game reserve entry", "Picnic lunch", "Binoculars"],
            "excludes": ["Transport to reserve"],
            "tags": ["family", "kids", "gaborone", "game reserve", "educational"],
            "image": IMG_FAMILY,
        },
        {
            "vendor": v5, "category": "family", "title": "Mokolodi Nature Reserve Bush Walk & Picnic",
            "short_description": "Walk with rhinos and enjoy a sunset picnic",
            "description": "Mokolodi Nature Reserve offers intimate bush walks with a certified guide. Encounter white rhinos, tortoises, and diverse birdlife on foot. Ends with a scenic sunset picnic overlooking the waterhole.",
            "price": 450, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.7, "review_count": 39, "booking_count": 91,
            "includes": ["Guide", "Reserve entry", "Sunset picnic", "Refreshments"],
            "excludes": ["Alcoholic beverages"],
            "tags": ["bush walk", "rhino", "family", "picnic", "mokolodi"],
            "image": IMG_FAMILY,
        },
        {
            "vendor": v5, "category": "culture", "title": "Gaborone Heritage Walking Tour",
            "short_description": "Discover the capital's history, art, and architecture",
            "description": "A 3-hour guided walking tour of Gaborone covering the National Museum, Three Dikgosi Monument, Government Enclave, and Old Naledi township. Expert local guides bring the city's history to life.",
            "price": 180, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.5, "review_count": 27, "booking_count": 63,
            "includes": ["Guide", "Museum entry", "Water bottle"],
            "excludes": ["Lunch", "Souvenirs"],
            "tags": ["walking tour", "gaborone", "heritage", "history", "culture"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v5, "category": "events", "title": "Maitisong Festival Gala Evening",
            "short_description": "Botswana's biggest arts & culture festival gala night",
            "description": "An electrifying gala evening at Maitisong Festival — Africa's longest-running performing arts festival. Featuring dance, theatre, music, and visual arts from across the continent. Dress code: smart casual.",
            "price": 450, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 200, "is_featured": True, "avg_rating": 4.7, "review_count": 91, "booking_count": 312,
            "includes": ["Festival entry", "Welcome drink", "Programme booklet"],
            "excludes": ["Additional drinks", "Dinner"],
            "tags": ["festival", "arts", "culture", "maitisong", "gaborone"],
            "image": IMG_EVENT,
        },
        {
            "vendor": v5, "category": "events", "title": "New Year's Eve Gala — The Grand Palm Hotel",
            "short_description": "Ring in the New Year in Gaborone's most iconic venue",
            "description": "An unforgettable New Year's Eve gala at The Grand Palm. 6-course dinner, live band, fireworks display, and champagne toast at midnight. Smart-formal dress code. Tables of 10 available.",
            "price": 1500, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 360,
            "max_guests": 300, "is_featured": False, "avg_rating": 4.6, "review_count": 38, "booking_count": 124,
            "includes": ["6-course dinner", "Welcome cocktail", "Live entertainment", "Champagne midnight toast"],
            "excludes": ["Additional bar tab", "Accommodation"],
            "tags": ["new year", "gala", "dinner", "gaborone", "events"],
            "image": IMG_EVENT,
        },
        {
            "vendor": v5, "category": "family", "title": "Rhino Conservation Experience",
            "short_description": "Behind-the-scenes with Botswana's rhino conservation team",
            "description": "A unique half-day experience working alongside conservationists monitoring rhino populations in and around Gaborone. Learn about anti-poaching efforts, tracking technology, and conservation challenges.",
            "price": 520, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.8, "review_count": 14, "booking_count": 23,
            "includes": ["Conservation guide", "Refreshments", "Conservation certificate"],
            "excludes": ["Transport"],
            "tags": ["conservation", "rhino", "education", "family", "wildlife"],
            "image": IMG_FAMILY,
        },
        {
            "vendor": v5, "category": "culture", "title": "Gaborone Sunset Photography Tour",
            "short_description": "Capture the golden hour across Gaborone's iconic landmarks",
            "description": "A 3-hour guided photography tour led by a professional photographer. Visit the Three Dikgosi Monument, the Kgale Hill viewpoint, and the Old Botswana National Assembly at golden hour. All skill levels welcome.",
            "price": 350, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.7, "review_count": 19, "booking_count": 36,
            "includes": ["Professional guide", "Photography tips booklet", "Edited highlight photos"],
            "excludes": ["Camera equipment", "Transport"],
            "tags": ["photography", "gaborone", "sunset", "landmarks", "culture"],
            "image": IMG_CULTURE,
        },

        # ── GHANZI / KALAHARI (v3 + v5) ──────────────────────────────────────
        {
            "vendor": v3, "category": "wellness", "title": "Kalahari Desert Sunrise Yoga Retreat",
            "short_description": "Greet the sun with yoga amid the red Kalahari dunes",
            "description": "Wake up with a sunrise yoga session in the iconic red Kalahari dunes. Led by certified instructors, this 90-minute session includes breathwork, sun salutations, and a guided meditation. Followed by a healthy breakfast.",
            "price": 380, "price_unit": "per person", "city": "Ghanzi",
            "booking_type": "INSTANT", "duration_minutes": 150,
            "max_guests": 15, "is_featured": True, "avg_rating": 4.9, "review_count": 41, "booking_count": 78,
            "includes": ["Yoga mat", "Instructor", "Healthy breakfast", "Transport from Ghanzi"],
            "excludes": ["Accommodation"],
            "tags": ["yoga", "wellness", "kalahari", "sunrise", "meditation"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v5, "category": "culture", "title": "San Bushmen Cultural Immersion Day",
            "short_description": "Spend a day with the Kalahari's indigenous San people",
            "description": "An authentic and respectful cultural exchange with a San community in the Central Kalahari. Learn traditional tracking skills, plant medicine, fire-making, and hear ancient oral histories. Includes traditional lunch prepared by community members.",
            "price": 680, "price_unit": "per person", "city": "Ghanzi",
            "booking_type": "REQUEST", "duration_minutes": 480,
            "max_guests": 12, "is_featured": True, "avg_rating": 4.9, "review_count": 31, "booking_count": 48,
            "includes": ["Community guide", "Traditional lunch", "Translation services", "Cultural activities"],
            "excludes": ["Transport to community", "Photography donations (suggested)"],
            "tags": ["san", "bushmen", "culture", "kalahari", "indigenous", "authentic"],
            "image": IMG_CULTURE,
        },
        {
            "vendor": v5, "category": "events", "title": "Kalahari Jazz Festival Weekend",
            "short_description": "World-class jazz under the Kalahari stars",
            "description": "A two-day jazz festival in the heart of the Kalahari. International and local artists perform on multiple stages. Festival camping available. Food vendors, craft markets, and children's activities.",
            "price": 780, "price_unit": "per person", "city": "Ghanzi",
            "booking_type": "INSTANT", "duration_minutes": 2880,
            "max_guests": 500, "is_featured": True, "avg_rating": 4.8, "review_count": 67, "booking_count": 189,
            "includes": ["2-day festival pass", "Shuttle from Gaborone"],
            "excludes": ["Camping fee", "Food and drinks"],
            "tags": ["jazz", "festival", "kalahari", "music", "outdoor"],
            "image": IMG_EVENT,
        },

        # ── TULI BLOCK (v4) ───────────────────────────────────────────────────
        {
            "vendor": v4, "category": "sports", "title": "Mountain Biking in the Tuli Block",
            "short_description": "Pedal through ancient rock formations and wildlife corridors",
            "description": "A guided mountain biking trail through the Tuli Block's dramatic landscape. 25km route through mopane woodland, rock formations, and along the Limpopo River. Suitable for intermediate riders.",
            "price": 620, "price_unit": "per person", "city": "Tuli Block",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.6, "review_count": 22, "booking_count": 44,
            "includes": ["Bike hire", "Helmet", "Guide", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["mountain biking", "tuli block", "adventure", "cycling"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v4, "category": "sports", "title": "Horse Safari in the Tuli Block",
            "short_description": "Explore ancient elephant trails on horseback",
            "description": "A 4-hour guided horse safari through the Tuli Block's dramatic landscape. Ride past baobab trees, rocky outcrops, and encounter wildlife from horseback. All fitness levels welcome.",
            "price": 950, "price_unit": "per person", "city": "Tuli Block",
            "booking_type": "REQUEST", "duration_minutes": 240,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.8, "review_count": 16, "booking_count": 27,
            "includes": ["Horse hire", "Guide", "Safety equipment", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["horse riding", "tuli block", "safari", "adventure"],
            "image": IMG_HORSE,
        },

        # ── FRANCISTOWN — v6 Northern Trails ─────────────────────────────────
        {
            "vendor": v6, "category": "culture", "title": "Francistown Heritage City Walking Tour",
            "short_description": "Discover Botswana's second city and its gold-rush history",
            "description": "A 3-hour guided tour through Francistown's historic CBD. Visit the Supa Ngwao Museum, the old Tati Concessions gold mines, and the original 1897 trading post. Learn about the city's fascinating colonial and mining heritage.",
            "price": 195, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 20, "is_featured": True, "avg_rating": 4.7, "review_count": 34, "booking_count": 67,
            "includes": ["Guide", "Museum entry", "Water bottle"],
            "excludes": ["Lunch", "Souvenirs"],
            "tags": ["heritage", "history", "francistown", "gold mining", "culture"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v6, "category": "safaris", "title": "Tachila Nature Reserve Game Drive",
            "short_description": "Wildlife close to Francistown at Botswana's northern reserve",
            "description": "A half-day game drive in Tachila Nature Reserve on the outskirts of Francistown. Spot giraffe, zebra, wildebeest, and a rich variety of birds on this accessible and family-friendly reserve.",
            "price": 340, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 10, "is_featured": True, "avg_rating": 4.5, "review_count": 28, "booking_count": 52,
            "includes": ["4x4 vehicle", "Guide", "Reserve entry", "Refreshments"],
            "excludes": ["Lunch"],
            "tags": ["game drive", "tachila", "francistown", "wildlife", "family"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v6, "category": "sports", "title": "Shashe Dam Kayaking & Picnic",
            "short_description": "Paddle across Shashe Dam surrounded by granite hills",
            "description": "A leisurely 3-hour kayaking session on the scenic Shashe Dam. Explore hidden coves and birdwatch from the water. Ends with a picnic lunch on the dam's grassy banks.",
            "price": 380, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.6, "review_count": 22, "booking_count": 43,
            "includes": ["Kayak", "Life jacket", "Guide", "Picnic lunch"],
            "excludes": ["Personal insurance"],
            "tags": ["kayaking", "shashe dam", "francistown", "water sports", "picnic"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v6, "category": "culture", "title": "Ngwato Cultural Village Experience",
            "short_description": "Immerse in the traditions of the Bangwato people of the North",
            "description": "A half-day immersive experience in a traditional Ngwato village outside Francistown. Participate in a kgotla meeting, watch traditional dancing, learn about cattle culture, and share a communal meal.",
            "price": 420, "price_unit": "per person", "city": "Francistown",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.8, "review_count": 19, "booking_count": 31,
            "includes": ["Village guide", "Traditional meal", "Cultural activities", "Translation"],
            "excludes": ["Transport to village"],
            "tags": ["village", "ngwato", "culture", "francistown", "traditional"],
            "image": IMG_CULTURE,
        },
        {
            "vendor": v6, "category": "sports", "title": "Motloutse River Canoe Trip",
            "short_description": "Paddle the Motloutse River through mopane and riverine forest",
            "description": "A guided half-day canoe trip along the Motloutse River east of Francistown. Encounter birds, crocodiles, and riverine vegetation. Suitable for beginners with safety kayaks available.",
            "price": 460, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 270,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.4, "review_count": 13, "booking_count": 24,
            "includes": ["Canoe", "Safety gear", "Guide", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["canoeing", "river", "francistown", "birdwatching", "nature"],
            "image": IMG_BOAT,
        },
        {
            "vendor": v6, "category": "safaris", "title": "Birdwatching at Nswazwi Dam",
            "short_description": "Over 200 waterbird species at Francistown's most productive birding hotspot",
            "description": "A 4-hour guided birdwatching session at the Nswazwi Dam complex near Francistown. Target African openbill, various herons, yellow-billed storks, and waders. Binoculars and field guide provided.",
            "price": 310, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.7, "review_count": 16, "booking_count": 29,
            "includes": ["Ornithologist guide", "Binoculars", "Field guide", "Refreshments"],
            "excludes": ["Transport"],
            "tags": ["birdwatching", "nswazwi dam", "francistown", "waterbirds"],
            "image": IMG_BIRD,
        },
        {
            "vendor": v6, "category": "dining", "title": "Northern Botswana Craft Beer & Braai Evening",
            "short_description": "Local craft beers paired with a traditional braai under the stars",
            "description": "An evening gathering in Francistown featuring six locally-crafted Botswana beers paired with a traditional braai. Hosted at an outdoor terrace with a local band. Meet the brewers and learn the craft.",
            "price": 320, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 30, "is_featured": False, "avg_rating": 4.6, "review_count": 24, "booking_count": 49,
            "includes": ["6 craft beer tastings", "Braai platter", "Live music"],
            "excludes": ["Additional drinks"],
            "tags": ["craft beer", "braai", "francistown", "evening", "local"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v6, "category": "culture", "title": "Francistown Arts & Craft Market Tour",
            "short_description": "Shop and meet artisans at Botswana's northern craft market",
            "description": "A guided 2-hour tour of Francistown's weekend craft market. Meet weavers, potters, and jewellery makers. Learn the stories behind Batswana traditional crafts. Includes a weaving demonstration and tasting of local snacks.",
            "price": 150, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.4, "review_count": 21, "booking_count": 47,
            "includes": ["Guide", "Weaving demo", "Local snack tasting"],
            "excludes": ["Purchases"],
            "tags": ["crafts", "market", "francistown", "art", "weaving"],
            "image": IMG_CRAFT,
        },
        {
            "vendor": v6, "category": "family", "title": "Francistown Family Adventure Park Day",
            "short_description": "Zip lines, rope courses, and outdoor fun for the whole family",
            "description": "A full day at the Francistown Adventure Park. Zip lines, rope bridges, obstacle courses, and a splash zone for kids. Suitable for ages 5+. Group packages available for birthday parties and corporate team building.",
            "price": 250, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 30, "is_featured": False, "avg_rating": 4.5, "review_count": 37, "booking_count": 83,
            "includes": ["Full day park access", "Safety equipment", "Picnic lunch"],
            "excludes": ["Transport"],
            "tags": ["adventure park", "family", "kids", "francistown", "zip line"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v6, "category": "culture", "title": "Night Sky Stargazing Safari — Francistown Outskirts",
            "short_description": "Experience Botswana's spectacular dark skies with a telescope",
            "description": "A 3-hour guided stargazing experience 30km outside Francistown. Use professional telescopes to observe the Milky Way, planets, and deep-sky objects. Expert astronomy guide explains African star mythology.",
            "price": 280, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.8, "review_count": 18, "booking_count": 34,
            "includes": ["Telescope access", "Astronomy guide", "Hot beverages", "Transport from Francistown"],
            "excludes": ["Own telescope or binoculars (optional)"],
            "tags": ["stargazing", "astronomy", "francistown", "night sky", "nature"],
            "image": IMG_NIGHT,
        },
        {
            "vendor": v6, "category": "sports", "title": "4x4 Off-Road Adventure — Northern Botswana",
            "short_description": "Drive off the beaten track through remote northern wilderness",
            "description": "A full-day guided 4x4 off-road adventure through remote tracks north of Francistown. Ford river crossings, navigate rocky terrain, and explore areas inaccessible to ordinary vehicles. Suitable for 4x4 enthusiasts of all levels.",
            "price": 1100, "price_unit": "per vehicle (up to 4 pax)", "city": "Francistown",
            "booking_type": "REQUEST", "duration_minutes": 480,
            "max_guests": 4, "is_featured": False, "avg_rating": 4.7, "review_count": 14, "booking_count": 22,
            "includes": ["4x4 vehicle", "Recovery gear", "Guide", "Packed lunch", "Recovery service"],
            "excludes": ["Personal insurance", "Fuel (BWP top-up charged)"],
            "tags": ["4x4", "off-road", "adventure", "francistown", "driving"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v6, "category": "events", "title": "Francistown International Trade Fair Experience",
            "short_description": "Explore Botswana's largest trade and commerce event",
            "description": "A guided tour of the Francistown International Trade Fair, showcasing Botswana businesses, innovation, and culture. Includes VIP access to selected pavilions, business networking sessions, and evening entertainment.",
            "price": 380, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 360,
            "max_guests": 50, "is_featured": False, "avg_rating": 4.3, "review_count": 29, "booking_count": 71,
            "includes": ["VIP entry pass", "Business networking session", "Evening show ticket"],
            "excludes": ["Food and drinks at fair", "Transport"],
            "tags": ["trade fair", "francistown", "business", "events", "culture"],
            "image": IMG_EVENT,
        },

        # ── LOBATSE — v7 Southern Star ────────────────────────────────────────
        {
            "vendor": v7, "category": "culture", "title": "Lobatse Heritage Town Walking Tour",
            "short_description": "Explore Botswana's oldest town and its colonial architecture",
            "description": "A 2.5-hour guided walk through Lobatse, one of Botswana's oldest urban centres. Visit the historic Court of Appeal building, the original BMC abattoir heritage site, and the town's charming colonial-era architecture.",
            "price": 160, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 150,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.4, "review_count": 17, "booking_count": 33,
            "includes": ["Guide", "Historical photo book", "Water bottle"],
            "excludes": ["Lunch"],
            "tags": ["heritage", "lobatse", "history", "colonial", "walking tour"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v7, "category": "sports", "title": "Lobatse Canyon Hike & Rockpool Swim",
            "short_description": "Discover hidden gorges and natural swimming pools near Lobatse",
            "description": "A guided 5-hour hike through the rocky canyon country south of Lobatse. Swim in natural rockpools fed by seasonal springs. Encounter wild figs, bushbuck, and a variety of raptors along the way.",
            "price": 350, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 10, "is_featured": True, "avg_rating": 4.7, "review_count": 23, "booking_count": 41,
            "includes": ["Guide", "Safety equipment", "Packed lunch", "Refreshments"],
            "excludes": ["Personal insurance", "Transport"],
            "tags": ["hiking", "canyon", "swimming", "nature", "lobatse"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v7, "category": "culture", "title": "Botswana Meat Commission Heritage Tour",
            "short_description": "Behind-the-scenes of Botswana's legendary beef industry",
            "description": "A guided tour of the Lobatse BMC complex with a focus on its historical significance to Botswana's economy. Learn about the beef-to-export pipeline, the ranching culture, and taste world-renowned Botswana beef at the facility's steakhouse.",
            "price": 290, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "REQUEST", "duration_minutes": 210,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.3, "review_count": 12, "booking_count": 22,
            "includes": ["Guided tour", "Beef tasting lunch", "Informational booklet"],
            "excludes": ["Transport"],
            "tags": ["beef", "bmc", "lobatse", "heritage", "industry"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v7, "category": "sports", "title": "Southern Botswana Horseback Trail",
            "short_description": "Ride through Lobatse's scenic valleys and hillside terrain",
            "description": "A 3-hour guided horseback ride through the gentle hills surrounding Lobatse. Suitable for beginners to intermediate riders. Encounter rocky kopjes, aloe forests, and panoramic views of the southern lowveld.",
            "price": 540, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.6, "review_count": 19, "booking_count": 36,
            "includes": ["Horse hire", "Helmet", "Guide", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["horse riding", "lobatse", "scenic", "adventure"],
            "image": IMG_HORSE,
        },
        {
            "vendor": v7, "category": "culture", "title": "Mmathethe Traditional Pottery Workshop",
            "short_description": "Learn ancient Batswana pottery-making techniques",
            "description": "Travel 40km from Lobatse to the village of Mmathethe for a hands-on pottery workshop with master artisans. Use traditional clay, natural pigments, and fire-hardening methods passed down through generations.",
            "price": 380, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.8, "review_count": 14, "booking_count": 21,
            "includes": ["Materials", "Artisan instructor", "Transport from Lobatse", "Take-home pot"],
            "excludes": ["Lunch"],
            "tags": ["pottery", "craft", "lobatse", "mmathethe", "traditional"],
            "image": IMG_CRAFT,
        },
        {
            "vendor": v7, "category": "dining", "title": "Southern Botswana Farm-to-Table Lunch",
            "short_description": "A relaxed lunch sourced entirely from local Lobatse farms",
            "description": "A leisurely 3-course farm-to-table lunch at a historic farmstead outside Lobatse. All ingredients — beef, vegetables, dairy, and honey — are sourced within 30km. Wine and craft cider pairings available.",
            "price": 450, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "REQUEST", "duration_minutes": 180,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.7, "review_count": 16, "booking_count": 28,
            "includes": ["3-course lunch", "Farm tour", "Welcome drink"],
            "excludes": ["Wine/cider pairing (BWP 200 extra)", "Transport"],
            "tags": ["farm to table", "lobatse", "local food", "lunch", "sustainable"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v7, "category": "wellness", "title": "Ntsweneng Hill Sunrise Hike & Meditation",
            "short_description": "Climb Lobatse's iconic hill for a sunrise meditation",
            "description": "A guided sunrise hike up Ntsweneng Hill overlooking Lobatse. At the summit, a 30-minute guided meditation session takes in panoramic views of the Limpopo valley. Ends with a hot breakfast at the trailhead.",
            "price": 220, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.6, "review_count": 20, "booking_count": 39,
            "includes": ["Guide", "Meditation session", "Breakfast"],
            "excludes": ["Transport"],
            "tags": ["hiking", "sunrise", "meditation", "lobatse", "wellness"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v7, "category": "family", "title": "Lobatse Family Nature Day",
            "short_description": "Bird ID, plant walks, and nature games for all the family",
            "description": "A full half-day outdoor nature experience designed for families with children. Activities include bird identification, a plant medicine walk with a traditional healer, and nature scavenger hunts. Age 5+.",
            "price": 195, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.5, "review_count": 25, "booking_count": 58,
            "includes": ["Guides", "Activity kit", "Refreshments", "Picnic snack"],
            "excludes": ["Transport"],
            "tags": ["family", "nature", "kids", "lobatse", "education"],
            "image": IMG_FAMILY,
        },

        # ── SELEBI-PHIKWE — v8 Selebi Eco Tours ──────────────────────────────
        {
            "vendor": v8, "category": "culture", "title": "Selebi-Phikwe Copper Mine Historical Tour",
            "short_description": "Learn about Botswana's mining history at a working copper mine",
            "description": "A guided historical and educational tour of the Selebi-Phikwe copper-nickel mining complex. Explore the underground tunnels, the smelting facilities, and the mining museum. Learn about the mine's role in Botswana's development.",
            "price": 280, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "REQUEST", "duration_minutes": 240,
            "max_guests": 15, "is_featured": True, "avg_rating": 4.5, "review_count": 26, "booking_count": 48,
            "includes": ["Mine guide", "Safety equipment", "Museum entry", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["mining", "copper", "selebi-phikwe", "history", "industrial"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v8, "category": "safaris", "title": "Limpopo River Bush Walk & Birding",
            "short_description": "Walk the Limpopo River banks in search of wildlife and birds",
            "description": "A guided bush walk along the Limpopo River near Selebi-Phikwe. The riparian forest hosts an exceptional variety of birds, including Pel's fishing owl and narina trogon. Keep an eye out for crocodiles, bushbuck, and kudu.",
            "price": 380, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 270,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.6, "review_count": 18, "booking_count": 33,
            "includes": ["Expert guide", "Binoculars", "Bird checklist", "Refreshments"],
            "excludes": ["Transport"],
            "tags": ["birdwatching", "limpopo", "selebi-phikwe", "bush walk", "wildlife"],
            "image": IMG_BIRD,
        },
        {
            "vendor": v8, "category": "sports", "title": "Eastern Botswana Cycling Challenge",
            "short_description": "60km road cycling route through eastern Botswana's landscapes",
            "description": "A guided road cycling challenge through the farmlands and vleis east of Selebi-Phikwe. Three difficulty routes (30/60/90km). Support vehicle provided. Ends with a cold beer and braai at the finishing point.",
            "price": 420, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "REQUEST", "duration_minutes": 360,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.4, "review_count": 16, "booking_count": 28,
            "includes": ["Guide", "Support vehicle", "Refreshments en route", "Post-ride braai"],
            "excludes": ["Bike hire (BWP 200 extra)", "Personal insurance"],
            "tags": ["cycling", "road biking", "selebi-phikwe", "challenge", "adventure"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v8, "category": "culture", "title": "African Village Homestay Experience",
            "short_description": "Overnight in a rural Batswana family home near Selebi-Phikwe",
            "description": "A fully immersive 2-day, 1-night homestay with a traditional Batswana family in a village near Selebi-Phikwe. Help with daily chores, cook together, attend a kgotla meeting, and sleep in a traditional rondavel.",
            "price": 860, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "REQUEST", "duration_minutes": 1440,
            "max_guests": 4, "is_featured": True, "avg_rating": 4.9, "review_count": 11, "booking_count": 15,
            "includes": ["Accommodation", "All meals", "Family guide", "Transport from Selebi-Phikwe"],
            "excludes": ["Personal spending money"],
            "tags": ["homestay", "village", "culture", "selebi-phikwe", "authentic", "community"],
            "image": IMG_CULTURE,
        },
        {
            "vendor": v8, "category": "sports", "title": "Mosetse River Fishing Day",
            "short_description": "Bream and barbel fishing on the Mosetse River",
            "description": "A guided fishing day on the tranquil Mosetse River east of Selebi-Phikwe. Target bream, sharptooth catfish, and barbel using traditional rod-and-line methods. Perfect for beginners.",
            "price": 480, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 360,
            "max_guests": 6, "is_featured": False, "avg_rating": 4.3, "review_count": 13, "booking_count": 24,
            "includes": ["Fishing gear", "Guide", "Packed lunch", "Refreshments"],
            "excludes": ["Fishing license", "Personal insurance"],
            "tags": ["fishing", "mosetse river", "selebi-phikwe", "bream", "angling"],
            "image": IMG_FISH,
        },
        {
            "vendor": v8, "category": "wellness", "title": "Phikwe Community Yoga & Wellness Morning",
            "short_description": "Outdoor yoga and wellness session with local practitioners",
            "description": "A 2-hour outdoor yoga and wellness morning hosted in a community garden in Selebi-Phikwe. Led by local yoga practitioners, the session incorporates traditional African breathwork and movement. Followed by a traditional herbal tea ceremony.",
            "price": 150, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 25, "is_featured": False, "avg_rating": 4.5, "review_count": 20, "booking_count": 47,
            "includes": ["Yoga mat", "Instructor", "Herbal tea ceremony"],
            "excludes": [],
            "tags": ["yoga", "community", "wellness", "selebi-phikwe", "herbal"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v8, "category": "safaris", "title": "Tuli Safari Day Trip from Selebi-Phikwe",
            "short_description": "Full-day game drive in the Tuli Block from Selebi-Phikwe",
            "description": "A full-day guided safari excursion from Selebi-Phikwe to the Tuli Block. Drive through mopane woodland and dramatic rocky landscapes in search of elephant, leopard, wild dog, and a spectacular array of birds.",
            "price": 1450, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "REQUEST", "duration_minutes": 600,
            "max_guests": 6, "is_featured": False, "avg_rating": 4.7, "review_count": 15, "booking_count": 22,
            "includes": ["4x4 vehicle", "Guide", "All meals", "Park fees", "Return transfer"],
            "excludes": ["Personal insurance"],
            "tags": ["tuli", "game drive", "selebi-phikwe", "day trip", "safari"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v8, "category": "events", "title": "Phikwe Annual Arts & Cultural Festival",
            "short_description": "Celebrate eastern Botswana's vibrant arts and culture scene",
            "description": "A weekend arts and cultural festival showcasing the best of eastern Botswana. Live music, traditional dance, visual arts exhibitions, food stalls, and craft vendors. Free children's corner all weekend.",
            "price": 120, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 480,
            "max_guests": 500, "is_featured": False, "avg_rating": 4.4, "review_count": 43, "booking_count": 118,
            "includes": ["2-day festival pass", "Programme booklet"],
            "excludes": ["Food and drinks", "Craft purchases"],
            "tags": ["festival", "arts", "culture", "selebi-phikwe", "music"],
            "image": IMG_EVENT,
        },
        {
            "vendor": v8, "category": "family", "title": "Selebi-Phikwe Junior Naturalist Camp",
            "short_description": "A half-day nature and wildlife camp for children aged 8–15",
            "description": "An educational outdoor camp experience for children. Activities include animal track identification, insect study, birdwatching, and basic bush survival skills. Led by qualified nature educators from the local wildlife club.",
            "price": 210, "price_unit": "per child", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.7, "review_count": 28, "booking_count": 64,
            "includes": ["Educators", "Activity kit", "Packed lunch", "Certificate"],
            "excludes": ["Transport"],
            "tags": ["kids", "nature camp", "selebi-phikwe", "education", "family"],
            "image": IMG_FAMILY,
        },

        # ── PALAPYE — v9 Palapye Heritage Tours ──────────────────────────────
        {
            "vendor": v9, "category": "culture", "title": "Serowe Khama Memorial Museum Tour",
            "short_description": "Visit the birthplace of Botswana's founding president",
            "description": "A guided tour of Serowe — the hometown of Sir Seretse Khama, Botswana's first president. Visit the Khama III Memorial Museum, the royal kgotla, and the graves of the Khama dynasty. One of Botswana's most important cultural heritage sites.",
            "price": 220, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 20, "is_featured": True, "avg_rating": 4.8, "review_count": 33, "booking_count": 61,
            "includes": ["Guide", "Museum entry", "Water bottle"],
            "excludes": ["Transport to Serowe"],
            "tags": ["serowe", "khama", "heritage", "museum", "palapye", "history"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v9, "category": "culture", "title": "Shoshong Ruins Archaeological Walk",
            "short_description": "Explore the ruins of the 19th century Bangwato capital",
            "description": "A guided archaeological walk through the ruins of Shoshong — the former capital of the Bangwato kingdom in the 1800s. Hear stories of the kgosi, trade routes, and early missionaries. A fascinating window into pre-colonial Botswana.",
            "price": 260, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 270,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.6, "review_count": 21, "booking_count": 37,
            "includes": ["Archaeologist guide", "Printed trail map", "Refreshments"],
            "excludes": ["Transport to Shoshong"],
            "tags": ["archaeology", "shoshong", "ruins", "palapye", "history", "bangwato"],
            "image": IMG_CULTURE,
        },
        {
            "vendor": v9, "category": "safaris", "title": "Serowe Bush Day Safari",
            "short_description": "Game spotting in the woodland surrounding Serowe village",
            "description": "A half-day guided safari through the mopane woodland and thorn bush surrounding Serowe. Encounter kudu, steenbok, warthog, impala, and a rich variety of woodland birds. Includes a traditional village stop.",
            "price": 380, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 270,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.4, "review_count": 19, "booking_count": 35,
            "includes": ["Guide", "Vehicle", "Refreshments"],
            "excludes": ["Lunch"],
            "tags": ["bush safari", "serowe", "palapye", "woodland", "wildlife"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v9, "category": "sports", "title": "Palapye Mosu Caves Adventure Hike",
            "short_description": "Hike to ancient caves with San rock art near Palapye",
            "description": "A guided half-day hike to the Mosu caves northeast of Palapye. The caves contain ancient San rock paintings and offer panoramic views of the central Botswana landscape. Moderate difficulty — suitable for fit beginners.",
            "price": 320, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 300,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.5, "review_count": 17, "booking_count": 30,
            "includes": ["Guide", "Rock art interpretation", "Refreshments"],
            "excludes": ["Transport", "Personal insurance"],
            "tags": ["hiking", "caves", "rock art", "palapye", "san", "adventure"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v9, "category": "culture", "title": "Central Botswana Village Immersion Day",
            "short_description": "A full day living as a community member in a traditional village",
            "description": "Spend a full day in a traditional Batswana village near Palapye. Help with farming, participate in a cooking demonstration, attend an evening storytelling session around the fire, and experience the warmth of rural hospitality.",
            "price": 460, "price_unit": "per person", "city": "Palapye",
            "booking_type": "REQUEST", "duration_minutes": 480,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.8, "review_count": 12, "booking_count": 18,
            "includes": ["Host family guide", "All meals", "Traditional cooking class", "Transport"],
            "excludes": ["Accommodation"],
            "tags": ["village", "community", "culture", "palapye", "authentic"],
            "image": IMG_CULTURE,
        },
        {
            "vendor": v9, "category": "culture", "title": "Palapye Pottery & Basketry Arts Workshop",
            "short_description": "Create traditional Batswana craft with master artisans",
            "description": "A 3-hour hands-on workshop where you'll try your hand at both traditional Botswana pottery and the famous tightly-woven Botswana basketry. Work alongside skilled artisans from the local women's craft cooperative.",
            "price": 340, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.7, "review_count": 22, "booking_count": 41,
            "includes": ["Materials", "Artisan instructors", "Take-home piece", "Refreshments"],
            "excludes": [],
            "tags": ["pottery", "basketry", "crafts", "palapye", "women's cooperative"],
            "image": IMG_CRAFT,
        },
        {
            "vendor": v9, "category": "family", "title": "Palapye Railway Heritage Experience",
            "short_description": "Explore Palapye's historic railway station and living museum",
            "description": "A guided railway heritage experience at the old Palapye railway station — one of Botswana's original BCR stations dating to 1897. Kids can climb on a restored locomotive, learn about the railway's history, and enjoy a picnic lunch at the station.",
            "price": 180, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 30, "is_featured": False, "avg_rating": 4.4, "review_count": 26, "booking_count": 57,
            "includes": ["Guide", "Station entry", "Picnic lunch"],
            "excludes": [],
            "tags": ["railway", "heritage", "family", "palapye", "history", "kids"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v9, "category": "dining", "title": "Palapye Traditional Brewery & Food Experience",
            "short_description": "Taste traditional sorghum beer and Setswana street food",
            "description": "An afternoon experience visiting a traditional sorghum beer (bojalwa jwa Setswana) brewery in Palapye. Learn about the fermentation process, taste fresh and mature traditional beer, and enjoy a spread of authentic local street foods.",
            "price": 250, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.5, "review_count": 18, "booking_count": 35,
            "includes": ["Brewery tour", "Beer tasting", "Street food spread"],
            "excludes": ["Additional food purchases"],
            "tags": ["traditional beer", "sorghum", "palapye", "street food", "culture"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v9, "category": "events", "title": "Palapye Kgotla Night — Community Storytelling",
            "short_description": "An evening of traditional storytelling and music at the kgotla",
            "description": "Join community elders and griots at the Palapye kgotla for an evening of traditional storytelling, proverbs, riddles, and acoustic music. A rare, authentic cultural experience that celebrates the oral traditions of the Bangwato people.",
            "price": 190, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 30, "is_featured": False, "avg_rating": 4.8, "review_count": 14, "booking_count": 26,
            "includes": ["Kgotla entry", "Storytelling session", "Traditional refreshments"],
            "excludes": [],
            "tags": ["kgotla", "storytelling", "oral tradition", "palapye", "evening"],
            "image": IMG_EVENT,
        },
        {
            "vendor": v9, "category": "wellness", "title": "Palapye Healing Plants & Traditional Medicine Walk",
            "short_description": "Walk the bush with a traditional healer and learn plant medicine",
            "description": "A 3-hour guided walk with a practicing traditional healer (ngaka ya setswana) in the woodlands near Palapye. Learn which plants are used for healing, protection, and spiritual practices. An educational and deeply meaningful experience.",
            "price": 290, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.7, "review_count": 16, "booking_count": 28,
            "includes": ["Traditional healer guide", "Plant identification booklet", "Herbal tea", "Refreshments"],
            "excludes": ["Transport"],
            "tags": ["traditional medicine", "healing plants", "palapye", "ngaka", "wellness"],
            "image": IMG_HIKE,
        },

        # ── EXTRA GABORONE LISTINGS ───────────────────────────────────────────
        {
            "vendor": v2, "category": "dining", "title": "Gaborone Wine & Cheese Evening",
            "short_description": "South African wines paired with artisanal cheese in Gaborone",
            "description": "An intimate wine and cheese pairing evening hosted by a certified sommelier. Taste six curated South African and Botswana wines alongside a selection of local and imported artisanal cheeses. Held at a private cellar in the Phakalane area.",
            "price": 520, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 150,
            "max_guests": 16, "is_featured": False, "avg_rating": 4.7, "review_count": 21, "booking_count": 39,
            "includes": ["6 wine tastings", "Cheese board", "Sommelier guide", "Welcome drink"],
            "excludes": ["Additional wine purchases"],
            "tags": ["wine", "cheese", "gaborone", "evening", "pairing"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v5, "category": "events", "title": "Gaborone Live Music Night at The Grand Palm",
            "short_description": "Botswana's top live acts on the most iconic stage in the capital",
            "description": "An electrifying live music evening at The Grand Palm Hotel featuring Botswana's best contemporary artists. From Afro-jazz and kwaito to traditional setswana rhythms, this monthly event showcases the breadth of local musical talent.",
            "price": 250, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 150, "is_featured": False, "avg_rating": 4.6, "review_count": 44, "booking_count": 136,
            "includes": ["Concert entry", "Welcome drink"],
            "excludes": ["Dinner", "Additional drinks"],
            "tags": ["live music", "gaborone", "concert", "afrojazz", "events"],
            "image": IMG_EVENT,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Gaborone Pilates & Brunch Morning",
            "short_description": "A 60-minute pilates reformer class followed by a healthy brunch",
            "description": "Start your Saturday with a rejuvenating pilates reformer class at our Broadhurst studio, followed by a wholesome brunch featuring smoothie bowls, avocado toast, and seasonal fruit. Limited to 10 per session for a premium experience.",
            "price": 220, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.7, "review_count": 28, "booking_count": 61,
            "includes": ["Pilates class", "Mat & equipment", "Healthy brunch"],
            "excludes": [],
            "tags": ["pilates", "brunch", "wellness", "gaborone", "fitness"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v5, "category": "culture", "title": "Gaborone Gallery Hop & Art Walk",
            "short_description": "Visit four contemporary galleries in one guided afternoon",
            "description": "A curated afternoon gallery tour visiting four of Gaborone's most exciting contemporary art spaces. Your guide — a practising local artist — introduces the works and the artists. Ends with a private wine reception at the final gallery.",
            "price": 310, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 210,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.6, "review_count": 17, "booking_count": 29,
            "includes": ["Gallery entry (4 venues)", "Artist guide", "Wine reception"],
            "excludes": ["Art purchases", "Transport"],
            "tags": ["art", "galleries", "culture", "gaborone", "contemporary"],
            "image": IMG_MUSEUM,
        },
        {
            "vendor": v2, "category": "dining", "title": "Kalahari Truffle Dinner Experience",
            "short_description": "Botswana's rarest ingredient celebrated across a 4-course menu",
            "description": "An exclusive dinner celebrating the Kalahari truffle (Terfezia pfeilii), one of Botswana's most prized culinary ingredients. Chef Kolobetso creates four courses built around this desert delicacy, paired with selected Botswana wines.",
            "price": 1400, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 210,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.9, "review_count": 11, "booking_count": 17,
            "includes": ["4-course truffle menu", "Wine pairing", "Chef's table interaction"],
            "excludes": [],
            "tags": ["truffle", "fine dining", "kalahari", "gaborone", "exclusive"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v5, "category": "family", "title": "Gaborone Craft & Junior Art Workshop",
            "short_description": "Creative arts and crafts workshop for children in Gaborone",
            "description": "A 2-hour arts and crafts workshop for children aged 6–14, inspired by Botswana's natural world. Kids create paintings, clay sculptures, and printed fabrics using natural materials and Botswana-themed designs. All materials included.",
            "price": 160, "price_unit": "per child", "city": "Gaborone",
            "booking_type": "INSTANT", "duration_minutes": 120,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.7, "review_count": 33, "booking_count": 78,
            "includes": ["All materials", "Art instructor", "Take-home artwork", "Refreshments"],
            "excludes": [],
            "tags": ["kids", "art", "crafts", "family", "gaborone"],
            "image": IMG_CRAFT,
        },
        {
            "vendor": v3, "category": "wellness", "title": "Corporate Wellness & Team Yoga Day",
            "short_description": "Tailored yoga and mindfulness workshop for corporate teams",
            "description": "A half-day corporate wellness session combining yoga, breathwork, and mindfulness designed for teams of up to 30. Our specialist facilitators customise the programme to your team's needs. Includes a healthy catered lunch.",
            "price": 380, "price_unit": "per person", "city": "Gaborone",
            "booking_type": "REQUEST", "duration_minutes": 300,
            "max_guests": 30, "is_featured": False, "avg_rating": 4.8, "review_count": 9, "booking_count": 14,
            "includes": ["Yoga & mindfulness session", "Facilitators", "Mats & equipment", "Healthy lunch"],
            "excludes": ["Venue hire (if off-site)"],
            "tags": ["corporate", "wellness", "yoga", "team building", "gaborone"],
            "image": IMG_YOGA,
        },

        # ── EXTRA FRANCISTOWN LISTINGS ────────────────────────────────────────
        {
            "vendor": v6, "category": "safaris", "title": "Majale River Wildlife Walk",
            "short_description": "Walk the Majale River floodplain in search of plains game",
            "description": "A guided 3-hour walk along the Majale River north of Francistown. The floodplain grasslands host large herds of zebra, wildebeest, and impala in the wet season. A rewarding and accessible wildlife experience close to the city.",
            "price": 280, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 10, "is_featured": False, "avg_rating": 4.4, "review_count": 14, "booking_count": 27,
            "includes": ["Guide", "Binoculars", "Refreshments"],
            "excludes": ["Transport"],
            "tags": ["wildlife walk", "majale river", "francistown", "plains game"],
            "image": IMG_SAFARI,
        },
        {
            "vendor": v6, "category": "wellness", "title": "Francistown Sunset Yoga at Shashe Dam",
            "short_description": "A calming sunset yoga session on the shores of Shashe Dam",
            "description": "A one-hour yoga and mindfulness session on the grass banks of the Shashe Dam at sunset. Open to all levels. Followed by a light snack and herbal tea as the sun dips behind the granite hills. Equipment provided.",
            "price": 160, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 90,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.6, "review_count": 18, "booking_count": 42,
            "includes": ["Yoga mat", "Instructor", "Herbal tea & snack"],
            "excludes": [],
            "tags": ["yoga", "sunset", "shashe dam", "francistown", "wellness"],
            "image": IMG_YOGA,
        },
        {
            "vendor": v6, "category": "culture", "title": "Tati Gold Rush Historical Jeep Tour",
            "short_description": "Explore 1860s gold mining sites in an open-top jeep",
            "description": "A guided jeep tour of the Tati concessions area east of Francistown, visiting original gold mining shafts, the ruins of the 1860s settlement, and the old Merry-Go-Round Mine. Your historian guide brings the gold rush era to vivid life.",
            "price": 490, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.7, "review_count": 16, "booking_count": 29,
            "includes": ["Jeep transport", "Historian guide", "Refreshments", "Historical photo booklet"],
            "excludes": ["Lunch"],
            "tags": ["gold rush", "tati", "history", "jeep", "francistown"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v6, "category": "family", "title": "Francistown Animal Sanctuary Visit",
            "short_description": "Meet rescued wild animals at Francistown's rehabilitation centre",
            "description": "A guided visit to the Francistown Wildlife Rehabilitation Centre, home to rescued cheetahs, meerkats, porcupines, and small antelope. Families learn about the animals' stories and the centre's conservation work. Feeding sessions included.",
            "price": 210, "price_unit": "per person", "city": "Francistown",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 25, "is_featured": False, "avg_rating": 4.8, "review_count": 29, "booking_count": 66,
            "includes": ["Guide", "Centre entry", "Animal feeding session", "Refreshments"],
            "excludes": [],
            "tags": ["animals", "sanctuary", "family", "francistown", "cheetah", "conservation"],
            "image": IMG_FAMILY,
        },
        {
            "vendor": v6, "category": "dining", "title": "Francistown Sunset River Dinner",
            "short_description": "Fine dining on the banks of the Tati River at sunset",
            "description": "A 3-course al fresco dinner on the landscaped banks of the Tati River at the edge of Francistown. Featuring Botswana beef, fresh river bream, and locally grown vegetables. Live acoustic guitar accompaniment.",
            "price": 680, "price_unit": "per person", "city": "Francistown",
            "booking_type": "REQUEST", "duration_minutes": 180,
            "max_guests": 20, "is_featured": False, "avg_rating": 4.8, "review_count": 13, "booking_count": 22,
            "includes": ["3-course dinner", "Welcome drink", "Live music"],
            "excludes": ["Wine (BWP 250 extra)", "Transport"],
            "tags": ["dinner", "river", "francistown", "fine dining", "romantic"],
            "image": IMG_FOOD,
        },

        # ── EXTRA LOBATSE LISTINGS ────────────────────────────────────────────
        {
            "vendor": v7, "category": "sports", "title": "Lobatse Rock Climbing & Abseiling",
            "short_description": "Climb the granite outcrops in the hills surrounding Lobatse",
            "description": "A half-day guided rock climbing and abseiling experience on the natural granite outcrops around Lobatse. Suitable for beginners — no experience required. Certified instructor and all safety equipment provided.",
            "price": 420, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.5, "review_count": 16, "booking_count": 28,
            "includes": ["Instructor", "Climbing equipment", "Safety briefing", "Refreshments"],
            "excludes": ["Personal insurance"],
            "tags": ["rock climbing", "abseiling", "lobatse", "adventure", "outdoor"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v7, "category": "culture", "title": "Lobatse Batswana Grass Weaving Masterclass",
            "short_description": "Master the art of traditional Botswana basket weaving",
            "description": "A 4-hour grass weaving workshop at a cooperative in Lobatse. Learn the intricate patterns and techniques of traditional Botswana basketry — one of the country's most celebrated art forms. Take home your own creation.",
            "price": 320, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.8, "review_count": 17, "booking_count": 31,
            "includes": ["Materials", "Master weaver instructor", "Take-home basket"],
            "excludes": [],
            "tags": ["weaving", "basket", "craft", "lobatse", "traditional"],
            "image": IMG_CRAFT,
        },
        {
            "vendor": v7, "category": "events", "title": "Lobatse Community Music & Food Night",
            "short_description": "An evening of live traditional music and local food in Lobatse",
            "description": "A community-organised music and food evening showcasing Lobatse's local talent. Enjoy live setswana folk music, traditional dance, and a communal dinner featuring dishes from across southern Botswana. A warm, authentic celebration.",
            "price": 180, "price_unit": "per person", "city": "Lobatse",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 60, "is_featured": False, "avg_rating": 4.5, "review_count": 22, "booking_count": 53,
            "includes": ["Event entry", "Traditional dinner", "Live performances"],
            "excludes": ["Alcoholic drinks"],
            "tags": ["music", "food night", "community", "lobatse", "traditional"],
            "image": IMG_EVENT,
        },

        # ── EXTRA SELEBI-PHIKWE LISTINGS ─────────────────────────────────────
        {
            "vendor": v8, "category": "sports", "title": "Selebi-Phikwe Golf Academy Half-Day",
            "short_description": "Lessons and a round at Selebi's well-maintained golf course",
            "description": "A half-day golf experience at the Selebi-Phikwe Golf Club. Starts with a 1-hour lesson from the resident PGA professional, followed by a 9-hole round on the tree-lined course. Club hire available. All handicaps welcome.",
            "price": 390, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 270,
            "max_guests": 8, "is_featured": False, "avg_rating": 4.4, "review_count": 19, "booking_count": 37,
            "includes": ["Golf lesson", "9-hole round", "Refreshments"],
            "excludes": ["Club hire (BWP 150 extra)", "Golf balls"],
            "tags": ["golf", "selebi-phikwe", "sport", "lessons", "course"],
            "image": IMG_ADVENTURE,
        },
        {
            "vendor": v8, "category": "dining", "title": "Phikwe Mining Town Food & Culture Tour",
            "short_description": "Taste the melting pot of cultures that shaped Selebi-Phikwe",
            "description": "A 3-hour guided food and culture walking tour through Selebi-Phikwe, a city built by mining that attracted workers from across southern Africa. Sample dishes influenced by Batswana, Zimbabwean, and South African cooking traditions.",
            "price": 240, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.5, "review_count": 14, "booking_count": 26,
            "includes": ["Guide", "4 food tastings", "Cultural background booklet"],
            "excludes": ["Additional food purchases"],
            "tags": ["food tour", "culture", "selebi-phikwe", "mining", "diversity"],
            "image": IMG_FOOD,
        },
        {
            "vendor": v8, "category": "family", "title": "Eastern Botswana Community Football Afternoon",
            "short_description": "Play football with local youth and community teams in Selebi-Phikwe",
            "description": "Join a friendly community football afternoon in Selebi-Phikwe. Visitors are welcomed by local youth teams for a fun match, skills drills, and a communal braai afterwards. A joyful and genuine community connection.",
            "price": 150, "price_unit": "per person", "city": "Selebi-Phikwe",
            "booking_type": "INSTANT", "duration_minutes": 240,
            "max_guests": 22, "is_featured": False, "avg_rating": 4.6, "review_count": 26, "booking_count": 58,
            "includes": ["Football kit hire", "Community guide", "Post-match braai"],
            "excludes": [],
            "tags": ["football", "community", "selebi-phikwe", "family", "sport"],
            "image": IMG_ADVENTURE,
        },

        # ── EXTRA PALAPYE LISTINGS ────────────────────────────────────────────
        {
            "vendor": v9, "category": "sports", "title": "Palapye Trail Running Experience",
            "short_description": "Run the ridges and woodland trails around Palapye",
            "description": "A guided trail running experience through the mopane woodland and rocky ridges surrounding Palapye. Three route lengths (5/10/18km) available. Suitable for all trail running levels. Ends with a cold drink and fruit platter.",
            "price": 280, "price_unit": "per person", "city": "Palapye",
            "booking_type": "INSTANT", "duration_minutes": 180,
            "max_guests": 12, "is_featured": False, "avg_rating": 4.5, "review_count": 15, "booking_count": 28,
            "includes": ["Guide", "Trail map", "Post-run refreshments"],
            "excludes": ["Personal insurance", "Running gear"],
            "tags": ["trail running", "palapye", "sport", "outdoor", "fitness"],
            "image": IMG_HIKE,
        },
        {
            "vendor": v1, "category": "lodges", "title": "Maun Desert & Delta Lodge Weekend",
            "short_description": "Two nights at our lodge on the edge of the Okavango",
            "description": "A 2-night lodge stay at the gateway to the Okavango Delta, just outside Maun. Comfortable en-suite chalets, a pool overlooking the Thamalakane River, and daily mokoro and game drive activities. Perfect as a budget-friendly introduction to the delta.",
            "price": 4800, "price_unit": "per person", "city": "Maun",
            "booking_type": "REQUEST", "duration_minutes": 2880,
            "max_guests": 16, "is_featured": False, "avg_rating": 4.6, "review_count": 31, "booking_count": 52,
            "includes": ["2 nights accommodation", "All meals", "1 mokoro trip", "1 game drive", "Airport transfer"],
            "excludes": ["Flights", "Park fees", "Alcoholic drinks"],
            "tags": ["lodge", "maun", "okavango", "weekend", "accommodation"],
            "image": IMG_LODGE,
        },
        {
            "vendor": v9, "category": "culture", "title": "Palapye Serowe Storytelling & Dinner Evening",
            "short_description": "Bessie Head's Botswana — literary dinner and cultural evening in Serowe",
            "description": "An evening celebrating the literary heritage of Serowe, home of celebrated author Bessie Head. Begin with a guided visit to the Bessie Head Archive at the Khama III Museum, then enjoy a traditional 3-course dinner with readings and storytelling inspired by her writing.",
            "price": 420, "price_unit": "per person", "city": "Palapye",
            "booking_type": "REQUEST", "duration_minutes": 270,
            "max_guests": 15, "is_featured": False, "avg_rating": 4.7, "review_count": 10, "booking_count": 16,
            "includes": ["Museum visit", "3-course dinner", "Storytelling session", "Bessie Head anthology"],
            "excludes": ["Transport to Serowe"],
            "tags": ["bessie head", "literary", "serowe", "palapye", "dinner", "culture"],
            "image": IMG_CULTURE,
        },
    ]

    created_listings = []
    for data in listings_data:
        slug = slugify(data["title"])
        counter = 1
        base_slug = slug
        while db.query(Listing).filter(Listing.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        cat = cats.get(data.pop("category"))
        image_url = data.pop("image")
        vendor_obj = data.pop("vendor")

        listing = Listing(
            vendor_id=vendor_obj.id,
            category_id=cat.id if cat else None,
            slug=slug,
            status=ListingStatus.ACTIVE,
            **{k: v for k, v in data.items()},
        )
        db.add(listing)
        db.flush()

        img = Image(listing_id=listing.id, url=image_url, is_primary=True, sort_order=0, alt_text=listing.title)
        db.add(img)
        created_listings.append(listing)

    db.commit()
    print(f"  ✔ {len(created_listings)} listings created")

    # ─── Sample Bookings & Reviews ─────────────────────────────────────────────
    all_customers = [customer, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10]
    review_comments = [
        "Absolutely incredible experience! One of the best things I've done in Botswana. Highly recommend.",
        "Our guide was exceptional — knowledgeable, friendly, and passionate. Unforgettable.",
        "Great value for money. Everything was perfectly organised and the scenery was breathtaking.",
        "A must-do for anyone visiting Botswana. We will definitely be back.",
        "The team made us feel so welcome. Authentic, memorable, and expertly run.",
        "Exceeded all expectations. Easily the highlight of our trip to Botswana.",
        "Truly world-class. I've travelled widely and this experience rivals the very best.",
        "Perfect from start to finish. Great guide, beautiful location, excellent food.",
        "We brought the whole family and everyone loved it. Perfect for all ages.",
        "Simply stunning. I had zero complaints — everything ran like clockwork.",
        "An amazing cultural experience. We learned so much and had so much fun.",
    ]

    for i, listing in enumerate(created_listings):
        cust = all_customers[i % len(all_customers)]
        booking = Booking(
            customer_id=cust.id,
            listing_id=listing.id,
            status=BookingStatus.CONFIRMED,
            booking_date=(datetime.utcnow() + timedelta(days=i + 7)).strftime("%Y-%m-%d"),
            guests=2,
            total_amount=listing.price * 2,
            confirmed_at=datetime.utcnow(),
        )
        db.add(booking)
        db.flush()

        commission = round(listing.price * 2 * 0.10, 2)
        payment = Payment(
            booking_id=booking.id,
            amount=listing.price * 2,
            commission=commission,
            vendor_payout=round(listing.price * 2 - commission, 2),
            status=PaymentStatus.PAID,
            paid_at=datetime.utcnow(),
        )
        db.add(payment)

        if listing.review_count > 0:
            review = Review(
                listing_id=listing.id,
                author_id=cust.id,
                booking_id=booking.id,
                rating=5,
                comment=review_comments[i % len(review_comments)],
                is_published=True,
            )
            db.add(review)

    db.commit()
    print(f"  ✔ {len(created_listings)} bookings & reviews created (spread across 11 customers)")

    print("\n✅ Seed complete!")
    print(f"\n  Total listings: {len(created_listings)}")
    print(f"  Cities covered: Gaborone, Francistown, Maun, Kasane, Lobatse, Selebi-Phikwe, Palapye + Ghanzi, Tuli Block, Gweta")
    print("\nDemo accounts:")
    print("  Admin:     admin@leisurespot.co.bw         / Admin@LeisureSpot2024!")
    print("  Customer:  demo.customer@leisurespot.co.bw / Customer@Demo2024!")
    print("  Customer:  thabo.moeng@gmail.com           / Customer@Demo2024!")
    print("  Vendors:   okavango@leisurespot.co.bw      / Vendor@Demo2024!")
    print("             gaborone.eats@leisurespot.co.bw / Vendor@Demo2024!")
    print("             wellness.bw@leisurespot.co.bw   / Vendor@Demo2024!")
    print("             northern.trails@leisurespot.co.bw / Vendor@Demo2024!")
    print("             southern.star@leisurespot.co.bw / Vendor@Demo2024!")
    print("             selebi.eco@leisurespot.co.bw    / Vendor@Demo2024!")
    print("             palapye.heritage@leisurespot.co.bw / Vendor@Demo2024!")
    print("             delta.luxury@leisurespot.co.bw  / Vendor@Demo2024!")

    db.close()


if __name__ == "__main__":
    seed()
