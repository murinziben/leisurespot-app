import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = os.getenv("JWT_SECRET", "leisurespot-flask-secret")


API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:4000/api/v1")

@app.context_processor
def inject_globals():
    return {"current_year": datetime.utcnow().year, "api_base_url": API_BASE_URL}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    return render_template("search.html")


@app.route("/listing/<listing_id>")
def listing(listing_id):
    return render_template("listing.html", listing_id=listing_id)


@app.route("/book/<listing_id>")
def book(listing_id):
    return render_template("book.html", listing_id=listing_id)


@app.route("/login")
def login():
    return render_template("auth/login.html")


@app.route("/register")
def register():
    return render_template("auth/register.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard/index.html")


@app.route("/dashboard/bookings/<booking_id>")
def booking_detail(booking_id):
    return render_template("dashboard/booking.html", booking_id=booking_id)


@app.route("/vendor/dashboard")
def vendor_dashboard():
    return render_template("vendor/dashboard.html")


@app.route("/vendor/listings")
def vendor_listings():
    return render_template("vendor/listings.html")


@app.route("/vendor/listings/new")
def vendor_new_listing():
    return render_template("vendor/new_listing.html")


@app.route("/vendor/bookings")
def vendor_bookings():
    return render_template("vendor/bookings.html")


@app.route("/vendor/onboarding")
def vendor_onboarding():
    return render_template("vendor/onboarding.html")


@app.route("/admin/dashboard")
def admin_dashboard():
    return render_template("admin/dashboard.html")


@app.route("/admin/users")
def admin_users():
    return render_template("admin/users.html")


@app.route("/admin/vendors")
def admin_vendors():
    return render_template("admin/vendors.html")


@app.route("/admin/bookings")
def admin_bookings():
    return render_template("admin/bookings.html")


@app.route("/admin/listings")
def admin_listings():
    return render_template("admin/listings.html")


@app.route("/admin/categories")
def admin_categories():
    return render_template("admin/categories.html")


@app.route("/admin/reviews")
def admin_reviews():
    return render_template("admin/reviews.html")


@app.route("/admin/revenue")
def admin_revenue():
    return render_template("admin/revenue.html")


@app.route("/about")
def about():
    return render_template("static/about.html")


@app.route("/contact")
def contact():
    return render_template("static/contact.html")


@app.route("/privacy")
def privacy():
    return render_template("static/privacy.html")


@app.route("/terms")
def terms():
    return render_template("static/terms.html")


@app.route("/forgot-password")
def forgot_password():
    return render_template("auth/forgot_password.html")


@app.route("/account")
def account():
    return render_template("dashboard/account.html")


@app.route("/vendor/profile")
def vendor_profile():
    return render_template("vendor/profile.html")


@app.route("/vendor/availability")
def vendor_availability():
    return render_template("vendor/availability.html")


@app.route("/notifications")
def notifications_page():
    return render_template("notifications.html")


@app.route("/pay/<booking_id>")
def pay(booking_id):
    return render_template("pay.html", booking_id=booking_id)


@app.route("/vendor/listings/<listing_id>/edit")
def vendor_edit_listing(listing_id):
    return render_template("vendor/edit_listing.html", listing_id=listing_id)


@app.route("/newsletter/subscribe", methods=["POST"])
def newsletter_subscribe():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    if not email or "@" not in email:
        return jsonify({"success": False, "detail": "Please enter a valid email address."}), 400
    # In production: persist email to DB / forward to mailing provider
    return jsonify({"success": True, "message": "You're subscribed! We'll be in touch soon."})


if __name__ == "__main__":
    app.run(port=3000, debug=True)
