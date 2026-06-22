# LeisureSpot BW

**Botswana's lifestyle discovery and booking platform.** LeisureSpot BW connects locals and visitors to the country's best experiences — safaris, dining, wellness, adventure, cultural events, and more — through a clean, fast, multi-role web application.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Roles and Portals](#roles-and-portals)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Seeding Demo Data](#seeding-demo-data)
- [Demo Credentials](#demo-credentials)
- [Frontend Architecture](#frontend-architecture)
- [Notification System](#notification-system)
- [Known Gaps and Next Steps](#known-gaps-and-next-steps)

---

## Overview

LeisureSpot BW is a full-stack booking marketplace with three distinct user roles:

- **Customers** — browse listings, book experiences, pay, leave reviews
- **Vendors** — list experiences, manage bookings, track earnings
- **Admins** — approve vendors, moderate listings, manage reviews, view platform revenue

The platform is designed as an MVP that works with real data from day one, using a localStorage-backed notification system that gracefully degrades when backend notification endpoints are not yet implemented.

---

## Architecture

```
Browser
  |
  v
Flask Frontend (port 3000)         <-- Jinja2 templates, static HTML/CSS/JS
  |
  | apiFetch() — JWT in Authorization header
  v
FastAPI Backend (port 4000)        <-- REST API, JWT auth, business logic
  |
  v
PostgreSQL (port 5433)             <-- Primary data store
  |
Redis (port 6379)                  <-- Session / cache (optional, not yet wired)
```

The frontend is a **server-rendered multi-page app** (Flask/Jinja2) where each page loads a minimal HTML shell and hydrates with JavaScript via the `apiFetch()` wrapper. There is no React or heavy SPA framework — pages are fast by default.

---

## Project Structure

```
leisurespot-bw/
|
|-- api/                        FastAPI backend
|   |-- main.py                 App entry point — registers routers, CORS
|   |-- config.py               Settings loaded from .env
|   |-- database.py             SQLAlchemy engine + session factory
|   |-- dependencies.py         Auth dependencies: get_current_user, require_vendor, require_admin
|   |-- schemas/                Pydantic request/response models
|   |   |-- auth.py
|   |   |-- booking.py
|   |   |-- listing.py
|   |   `-- vendor.py
|   `-- routers/                One file per domain
|       |-- auth.py             Register, login, refresh, /me, profile, change-password
|       |-- listings.py         CRUD, search, favorites, reviews, feature requests
|       |-- bookings.py         Create, get, cancel, vendor status update
|       |-- vendors.py          Onboarding, analytics
|       |-- admin.py            Users, vendors, listings, reviews, revenue, broadcast
|       `-- categories.py       List categories
|
|-- shared/
|   `-- models.py               SQLAlchemy ORM models shared by API and migrations
|
|-- web/                        Flask frontend
|   |-- app.py                  Route definitions (one route per page)
|   |-- templates/
|   |   |-- base.html           Master layout: fonts, CSS, JS, navbar, footer
|   |   |-- navbar.html         Responsive nav with notification bell + user dropdown
|   |   |-- footer.html         Links, newsletter subscribe
|   |   |-- index.html          Home page: hero, featured, categories, search
|   |   |-- search.html         Listing search with filters and chips
|   |   |-- listing.html        Listing detail: gallery, reviews histogram, book CTA
|   |   |-- book.html           Booking form with blackout date validation
|   |   |-- pay.html            Payment confirmation page
|   |   |-- auth/               Login, register, forgot password
|   |   |-- dashboard/          Customer: bookings list, booking detail + reviews
|   |   |-- vendor/             Dashboard, listings, new/edit listing, bookings, availability, profile
|   |   `-- admin/              Dashboard, users, vendors, listings, bookings, categories, reviews, revenue
|   `-- static/
|       |-- css/
|       |   |-- main.css        CSS custom properties, resets, layout grid
|       |   |-- components.css  Cards, buttons, badges, toasts, modals
|       |   `-- pages.css       Page-specific overrides
|       `-- js/
|           |-- api.js          apiFetch() — attaches JWT, handles 401, refreshes token
|           |-- auth.js         Login/logout state, auth-show/auth-hide, requireAuth(), requireRole()
|           |-- listings.js     Listing card rendering, favorites toggle
|           |-- booking.js      Booking form, date picker, blackout validation, payment redirect
|           |-- payment.js      Payment page logic, success handler
|           |-- vendor.js       Vendor dashboard, earnings chart, listing CRUD, availability prompt
|           |-- admin.js        Admin dashboard data, tables, modals
|           |-- notifications.js In-app notification store (localStorage + API sync)
|           `-- icons.js        Lucide icon helpers
|
|-- alembic/                    Database migrations
|   |-- versions/001_initial.py Full schema migration
|   `-- env.py
|
|-- docker/
|   `-- docker-compose.yml      PostgreSQL 16 + Redis 7
|
|-- init_db.py                  Create tables without running Alembic (fast first run)
|-- seed.py                     Seed 1 admin + 10 vendors + 230 listings + bookings + reviews
|-- reset_db.py                 Drop and recreate all tables
|-- requirements.txt            Python dependencies
|-- alembic.ini                 Alembic configuration
`-- .env                        Environment variables (do not commit)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI 0.115, Uvicorn |
| Frontend server | Flask 3.1, Jinja2 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (provisioned, not yet actively used) |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic 1.13 |
| Auth | JWT via python-jose, bcrypt password hashing |
| Charts | Chart.js 4.4.4 (CDN) |
| Icons | Lucide 0.525 (CDN) |
| Fonts | Poppins + Inter (Google Fonts) |
| Infra | Docker Compose for database services |

---

## Roles and Portals

### Customer
- Browse and search all active listings
- Book experiences (instant confirmation or vendor-approval flow)
- View booking history and details
- Leave star ratings and written reviews on completed bookings
- Re-book past experiences with one click
- Receive in-app notifications for booking and payment events
- Manage account profile and password

### Vendor
- Apply for vendor status (admin approval required)
- Create and manage experience listings with images, pricing, categories
- Set availability calendars with blackout dates
- Accept or reject booking requests
- Mark bookings as completed
- View earnings dashboard with bar/line combo chart (3M / 6M / 12M views)
- Request featured placement for listings

### Admin
- Approve or suspend vendor applications
- Activate, deactivate, or feature listings
- Manage all users and their roles
- Moderate and publish/unpublish reviews
- View platform revenue breakdown (gross, commission, vendor payout)
- Broadcast notifications to all users
- Manage listing categories

---

## Features

### Public
- Full-text listing search with city, category, price range, booking type, and rating filters
- Active filter chips with individual clear controls
- URL-synced filters (shareable search URLs)
- Real-time search suggestions (title, category, city) as you type
- Featured listings carousel on home page
- Category grid navigation
- Listing detail page: photo gallery, reviews histogram, verified-stay badges, star distribution bars
- Newsletter subscription

### Booking Flow
1. Customer selects a date (blackout dates highlighted and blocked)
2. Guest count × price = total shown in real time
3. Submit creates booking + payment record atomically
4. INSTANT listings auto-confirm; REQUEST listings go to vendor for approval
5. Customer redirected to payment confirmation page
6. In-app notification fired on booking creation and payment

### Vendor Earnings Chart
- Combo chart: revenue bars (BWP) + bookings line + moving-average trend line
- Period tabs: last 3 months / 6 months / 12 months
- Synthetic data distribution when API returns only totals (realistic growth curve)
- Destroys and re-creates Chart.js instance on period switch to prevent memory leaks

### In-App Notifications
- Bell icon with unread badge (desktop and mobile)
- Slide-down panel showing last 8 notifications with type icons and time-ago stamps
- Full notification history page at `/notifications`
- localStorage-backed store (works without backend notification endpoints)
- Best-effort sync with API when endpoints are available
- 45-second polling for new server-side notifications
- Completely hidden from unauthenticated users (no bell, no badge, no page)
- Clears on logout to prevent cross-user data leakage

### Review System
- Star rating (1–5) with labeled descriptions (Poor / Fair / Good / Great / Excellent)
- Review eligibility check: booking must be COMPLETED and date must be in the past
- Prevents duplicate reviews per booking
- "Leave Reviews" banner on customer dashboard when pending reviews exist
- Rating histogram on listing detail page with color-coded bars
- Verified-stay badge when review is linked to a booking

---

## Database Schema

Core models in `shared/models.py`:

| Model | Key Fields |
|---|---|
| `User` | id, email, password_hash, role (CUSTOMER / VENDOR / ADMIN), is_active, is_verified |
| `UserProfile` | user_id, first_name, last_name, phone, avatar_url, bio, city |
| `Vendor` | id, user_id, business_name, status (PENDING / APPROVED / SUSPENDED), city |
| `Category` | id, name, slug, icon, description |
| `Listing` | id, vendor_id, category_id, title, slug, price, booking_type (INSTANT / REQUEST), status, booking_count, avg_rating |
| `Image` | id, listing_id, url, is_primary, sort_order |
| `Booking` | id, listing_id, customer_id, booking_date, guests, total_amount, status (PENDING / CONFIRMED / COMPLETED / CANCELLED / REJECTED) |
| `Payment` | id, booking_id, amount, commission (10%), vendor_payout (90%), status, paid_at |
| `Review` | id, listing_id, booking_id, customer_id, rating (1–5), comment, is_published |
| `Favorite` | user_id, listing_id |
| `Notification` | id, user_id, type, message, link, is_read |

---

## API Reference

Base URL: `http://localhost:4000`

All authenticated endpoints require `Authorization: Bearer <token>` header.

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, receive tokens |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |
| PATCH | `/api/v1/auth/profile` | Yes | Update profile |
| POST | `/api/v1/auth/change-password` | Yes | Change password |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset |
| POST | `/api/v1/auth/logout` | Yes | Logout |

### Listings
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/listings/` | No | Search listings (search, city, category_slug, booking_type, min_price, max_price, min_rating, limit, offset) |
| GET | `/api/v1/listings/featured` | No | Featured listings |
| GET | `/api/v1/listings/suggest` | No | Autocomplete suggestions (`?q=`) |
| GET | `/api/v1/listings/my` | Vendor | Current vendor's listings |
| GET | `/api/v1/listings/favorites/ids` | Customer | IDs of favorited listings |
| GET | `/api/v1/listings/{id}` | No | Listing detail with reviews |
| POST | `/api/v1/listings/` | Vendor | Create listing |
| PATCH | `/api/v1/listings/{id}` | Vendor | Update listing |
| POST | `/api/v1/listings/{id}/favorite` | Customer | Toggle favorite |
| POST | `/api/v1/listings/{id}/request-feature` | Vendor | Request featured placement |
| GET | `/api/v1/listings/{id}/reviews` | No | Get listing reviews |
| POST | `/api/v1/listings/{id}/reviews` | Customer | Submit review |

### Bookings
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/bookings/` | Customer | Create booking |
| GET | `/api/v1/bookings/my` | Customer | My bookings |
| GET | `/api/v1/bookings/vendor` | Vendor | Vendor's incoming bookings |
| GET | `/api/v1/bookings/{id}` | Yes | Get booking detail |
| POST | `/api/v1/bookings/{id}/cancel` | Customer | Cancel booking |
| PATCH | `/api/v1/bookings/{id}/status` | Vendor | Confirm / complete / reject booking |

### Vendors
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/vendors/register` | Customer | Apply for vendor status |
| GET | `/api/v1/vendors/analytics` | Vendor | Revenue, bookings, listing stats |
| GET/PATCH | `/api/v1/vendors/profile` | Vendor | Vendor profile |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | Admin | Platform-wide stats |
| GET | `/api/v1/admin/users` | Admin | All users (filterable by role) |
| PATCH | `/api/v1/admin/users/{id}/role` | Admin | Change user role |
| PATCH | `/api/v1/admin/users/{id}/status` | Admin | Activate / deactivate user |
| GET | `/api/v1/admin/vendors` | Admin | All vendors |
| GET | `/api/v1/admin/vendors/pending` | Admin | Pending vendor applications |
| POST | `/api/v1/admin/vendors/{id}/approve` | Admin | Approve vendor |
| POST | `/api/v1/admin/vendors/{id}/suspend` | Admin | Suspend vendor |
| GET | `/api/v1/admin/listings` | Admin | All listings |
| PATCH | `/api/v1/admin/listings/{id}/status` | Admin | Set listing status |
| PATCH | `/api/v1/admin/listings/{id}/featured` | Admin | Grant/revoke featured status |
| GET | `/api/v1/admin/bookings` | Admin | All bookings |
| GET | `/api/v1/admin/reviews` | Admin | All reviews |
| POST | `/api/v1/admin/reviews/{id}/publish` | Admin | Publish review |
| DELETE | `/api/v1/admin/reviews/{id}` | Admin | Delete review |
| GET | `/api/v1/admin/revenue` | Admin | Revenue breakdown |
| GET | `/api/v1/admin/categories` | Admin | Manage categories |
| POST | `/api/v1/admin/notifications/broadcast` | Admin | Broadcast notification |

### Misc
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/categories/` | No | All categories |
| GET | `/health` | No | API health check |
| GET | `/docs` | No | Interactive API docs (Swagger UI) |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Docker Desktop (for PostgreSQL + Redis)
- Git

### 1. Clone and enter the project

```bash
cd leisurespot-bw
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Copy and configure environment

```bash
cp .env .env.local
# Edit .env with your actual values — see Environment Variables below
```

---

## Environment Variables

All variables live in `.env` at the project root.

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://leisurespot:strongpassword@127.0.0.1:5433/leisurespot_db` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | JWT signing secret — **change this in production** |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token lifetime |
| `ENVIRONMENT` | `development` | `development` or `production` |

---

## Database Setup

### Start the database services

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- PostgreSQL 16 on port **5433** (mapped from 5432 inside the container)
- Redis 7 on port **6379**

Verify they are running:

```bash
docker ps
```

### Create tables

```bash
python init_db.py
```

This runs `Base.metadata.create_all()` — faster than Alembic for a first run. If you prefer migrations:

```bash
alembic upgrade head
```

---

## Running the Application

You need two terminal windows running simultaneously.

### Terminal 1 — FastAPI backend

```bash
uvicorn api.main:app --reload --port 4000
```

The API will be available at:
- API base: `http://localhost:4000/api/v1`
- Interactive docs: `http://localhost:4000/docs`
- Health check: `http://localhost:4000/health`

### Terminal 2 — Flask frontend

```bash
python web/app.py
```

The frontend will be available at `http://localhost:3000`.

---

## Seeding Demo Data

Once the database tables exist, populate with realistic Botswana data:

```bash
python seed.py
```

This creates:
- 1 admin user
- 11 vendor users (10 approved + 1 pending)
- 12 customer users
- 8 categories
- 230 listings across all categories and cities
- 200+ bookings at various statuses
- 200+ published reviews with ratings

**To reset and re-seed:**

```bash
python reset_db.py
python init_db.py
python seed.py
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@leisurespot.co.bw` | `Admin@LeisureSpot2024!` |
| Vendor (Okavango Safaris) | `okavango@leisurespot.co.bw` | `Vendor@Demo2024!` |
| Vendor (Gaborone Eats) | `gaborone.eats@leisurespot.co.bw` | `Vendor@Demo2024!` |
| Vendor (Wellness BW) | `wellness.bw@leisurespot.co.bw` | `Vendor@Demo2024!` |
| Vendor (Adventure BW) | `adventure.bw@leisurespot.co.bw` | `Vendor@Demo2024!` |
| Customer | register at `/register` | any |

All vendor accounts share the password `Vendor@Demo2024!`.

---

## Frontend Architecture

### Auth state

`auth.js` reads `access_token`, `refresh_token`, and `user` from `localStorage` on every page load. It:
- Toggles visibility of `.auth-show` and `.auth-hide` elements via `display` style
- Sets `window.__userRole`, `window.__userId`, `window.__currentUser`
- Exposes `requireAuth()` — redirects to `/login` if not logged in
- Exposes `requireRole(role)` — redirects to home if role does not match
- Handles automatic token refresh on 401 responses

### API calls

`api.js` exports `apiFetch(path, options)` which:
- Prepends `window.API_BASE` (injected by Flask as `http://localhost:4000/api/v1`)
- Attaches the Bearer token from localStorage
- On 401, attempts a token refresh and retries once
- Returns parsed JSON or throws on network failure

### Page hydration pattern

Each page template:
1. Renders a static HTML shell (title, sidebar, empty containers)
2. Loads a JS file via `{% block extra_js %}`
3. JS fires on `DOMContentLoaded`, calls `apiFetch()`, renders data into the DOM

This means pages work with JavaScript disabled up to the shell — auth guards and data require JS.

### CSS custom properties

All colors are defined as CSS variables in `main.css`:

| Variable | Value | Usage |
|---|---|---|
| `--teal` | `#008080` | Primary brand color, CTAs |
| `--orange` | `#f97316` | Accent, ratings, vendor charts |
| `--teal-light` | `#e6f3f3` | Hover states, badges |
| `--danger` | `#ef4444` | Errors, cancellations, low ratings |
| `--success` | `#22c55e` | Confirmations, completed states |
| `--border-color` | `#e5e7eb` | All borders |
| `--text-secondary` | `#6b7280` | Muted text |

---

## Notification System

Notifications are stored in `localStorage` under the key `ls_notifs` (max 60 items, newest first). On each page load, the system attempts to sync with `GET /api/v1/notifications` and merge server-side notifications.

### Triggering a notification

From any JS file:

```javascript
window.pushNotification({
  type: 'booking_confirmed',
  message: 'Your booking for Okavango Safari has been confirmed.',
  link: '/dashboard/bookings/abc123'
});
```

The function is a no-op for unauthenticated users (checks `localStorage.access_token`).

### Notification types

`booking_new`, `booking_confirmed`, `booking_rejected`, `booking_cancelled`, `booking_completed`, `payment_confirmed`, `review_new`, `review_prompt`, `featured_approved`, `featured_rejected`, `listing_published`, `vendor_approved`, `admin_vendor`, `admin_listing`, `admin_featured`, `admin_booking`, `info`

Each type maps to an SVG icon and a color (teal for positive, red for rejection, orange for reviews).

---

## Known Gaps and Next Steps

The following items were identified during system testing and are ready to be built in priority order:

### 1. `notifications.html` template (Critical — causes 500 crash)
The Flask route `/notifications` exists but the template was never created. The mobile navbar "Notifications" link crashes the app. This page should render the full notification history with date groupings (Today / Yesterday / This week / Older) and an "All / Unread" filter toggle.

### 2. Reviews router (Critical — entire review feature non-functional)
The frontend calls three endpoints that do not exist in the API:
- `GET /api/v1/reviews/my` — used by the customer dashboard to show the pending-reviews banner
- `GET /api/v1/reviews/booking/{id}` — used by the booking detail page to check for an existing review
- `POST /api/v1/reviews` — used by the booking detail page to submit a new review

Currently reviews can only be read via `GET /listings/{id}/reviews`. A `/reviews` router needs to be created and registered in `main.py`.

### 3. Availability/blackout router (High — feature is silently broken)
The vendor availability calendar at `/vendor/availability` and the date picker in `book.html` both call:
- `GET /api/v1/listings/{id}/availability` — fetch blocked dates
- `POST /api/v1/listings/{id}/availability` — save blocked dates

Neither route exists. Vendors can open the calendar page but all saves fail. Customers see no blocked dates on any listing.

### 4. Wire `pushNotification()` triggers
Three places should call `pushNotification()` but currently do not:
- `payment.js` — after successful payment confirmation
- `vendor.js` `updateBookingStatus()` — after confirming or rejecting a booking
- `dashboard/booking.html` `confirmCancel()` — after customer cancels a booking

### 5. Clear notifications on logout
`auth.js` `clearAuth()` should call `localStorage.removeItem('ls_notifs')` to prevent a logged-out user from seeing a previous user's notifications on a shared device.

### 6. Remove emoji from `booking.js:129`
Line 129 of `web/static/js/booking.js` contains a `📧` character in a toast message. This violates the no-emoji UI constraint. Replace the toast with a `pushNotification()` call instead.

### 7. Payment endpoint
The `/pay/{booking_id}` page has no corresponding `POST /api/v1/bookings/{id}/pay` or `POST /api/v1/payments/{id}/pay` endpoint. For REQUEST-type bookings, vendor confirmation auto-marks the payment as PAID. For INSTANT bookings, payment is marked PAID at booking creation. The payment page currently renders a success UI without calling any API.
