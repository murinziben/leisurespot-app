from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, listings, bookings, vendors, admin, categories

app = FastAPI(
    title="LeisureSpot API",
    description="Botswana's #1 Lifestyle Discovery & Booking Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(listings.router, prefix=PREFIX)
app.include_router(bookings.router, prefix=PREFIX)
app.include_router(vendors.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)
app.include_router(categories.router, prefix=PREFIX)


@app.get("/")
def root():
    return {"message": "LeisureSpot API v1.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
