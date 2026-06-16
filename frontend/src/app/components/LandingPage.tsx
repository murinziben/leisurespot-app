import { useState } from "react";
import { Search, ChevronDown, Star, Check, ArrowRight, Users, Zap, Award } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ListingCard, SAMPLE_LISTINGS } from "./ListingCard";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const categories = [
  { label: "Restaurants & Cafes", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c" },
  { label: "Events & Entertainment", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063" },
  { label: "Wellness & Beauty", image: "https://images.unsplash.com/photo-1765910639954-27ae0c260586" },
  { label: "Sports & Recreation", image: "https://images.unsplash.com/photo-1498038116800-4159eb9b2a62" },
  { label: "Tourism & Safaris", image: "https://images.unsplash.com/photo-1577971132997-c10be9372519" },
  { label: "Family Experiences", image: "https://images.unsplash.com/photo-1633539656390-142a7e8573a0" },
];

const testimonials = [
  {
    quote: "LeisureSpot made planning our Botswana vacation incredibly easy. We booked a safari, a spa day, and a sunset dinner all in one place. Absolutely seamless!",
    reviewer: "Kefilwe Moeti",
    location: "Gaborone, Botswana",
    rating: 5,
  },
  {
    quote: "I discovered restaurants and experiences in Gaborone I never knew existed. The platform is intuitive and the listings are genuinely high quality.",
    reviewer: "James Tsheko",
    location: "Francistown, Botswana",
    rating: 5,
  },
  {
    quote: "As a tourist visiting from South Africa, LeisureSpot was my go-to guide. The booking process was fast and the providers were all excellent.",
    reviewer: "Thandi Nkosi",
    location: "Johannesburg, SA",
    rating: 4,
  },
];

const howItWorks = [
  {
    icon: Search,
    step: "01",
    title: "Search & Discover",
    desc: "Browse hundreds of experiences by location, category, or budget. Filter by price, ratings, and availability.",
  },
  {
    icon: Zap,
    step: "02",
    title: "Book Instantly",
    desc: "Select your date and guests and complete secure payment in minutes. Instant confirmation for most listings.",
  },
  {
    icon: Award,
    step: "03",
    title: "Experience & Review",
    desc: "Enjoy your experience and share your honest rating with the community to help other travelers.",
  },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={onNavigate} currentPage="landing" />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center"
        style={{ paddingTop: "64px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1619025005045-c91b0f7d879d?w=1600&h=900&fit=crop&auto=format)`,
          }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#E8711A", fontFamily: "Inter, sans-serif" }}
          >
            Discover More. Experience Better.
          </p>
          <h1
            className="text-white mb-6 leading-tight"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
          >
            Find Your Next Experience<br />in Botswana
          </h1>
          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}
          >
            Discover and book safaris, wellness, sports, events, and more — all in one place.
          </p>

          {/* Search bar */}
          <div
            className="bg-white rounded-2xl p-2 flex flex-col md:flex-row gap-2 items-stretch mx-auto"
            style={{ maxWidth: "700px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", minWidth: "60px" }}>Location</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">Anywhere in Botswana</option>
                <option>Gaborone</option>
                <option>Maun</option>
                <option>Kasane</option>
                <option>Francistown</option>
                <option>Palapye</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", minWidth: "60px" }}>Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "var(--text-primary)" }}
              >
                <option value="">All Categories</option>
                <option>Safaris</option>
                <option>Wellness</option>
                <option>Sports</option>
                <option>Events</option>
                <option>Dining</option>
                <option>Family</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: "1px solid var(--border-color)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)", minWidth: "36px" }}>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <button
              onClick={() => onNavigate("listings")}
              className="px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "var(--orange)", borderRadius: "12px", whiteSpace: "nowrap" }}
            >
              <Search size={16} />
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { value: "500+", label: "Experiences" },
              { value: "120+", label: "Providers" },
              { value: "15K+", label: "Happy Guests" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>{stat.value}</div>
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>Browse by Category</h2>
          <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            Find exactly the kind of experience you're looking for
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => onNavigate("listings")}
              className="relative overflow-hidden flex flex-col items-center justify-end transition-transform hover:-translate-y-1"
              style={{ borderRadius: "12px", height: "180px" }}
            >
              <img
                src={`${cat.image}?w=320&h=360&fit=crop&auto=format`}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 100%)" }} />
              <span className="relative z-10 text-white text-xs font-semibold text-center px-2 pb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-4" style={{ background: "var(--secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>Featured Experiences</h2>
            <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
              Hand-picked experiences loved by locals and tourists
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_LISTINGS.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onNavigate={onNavigate} />
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate("listings")}
              className="px-8 py-3 font-semibold rounded-lg border-2 inline-flex items-center gap-2 transition-colors hover:bg-[#1B5E7B] hover:text-white"
              style={{ borderColor: "var(--teal)", color: "var(--teal)", borderRadius: "8px" }}
            >
              View All Experiences
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" style={{ background: "var(--secondary)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>How LeisureSpot Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center flex flex-col items-center gap-4 p-8 bg-white rounded-xl" style={{ borderRadius: "12px", boxShadow: "var(--shadow-card)" }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ border: "2px solid var(--teal)", background: "var(--teal-light)" }}
                >
                  <Icon size={28} color="var(--teal)" strokeWidth={1.5} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--orange)" }}>{step}</span>
                <h3 style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-sm text-center" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>What Our Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-8 rounded-xl bg-white flex flex-col gap-4"
                style={{ borderRadius: "12px", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}
              >
                <span className="text-5xl font-bold leading-none" style={{ color: "var(--orange)", lineHeight: 1 }}>"</span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{t.quote}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={13} fill={j < t.rating ? "#E8711A" : "none"} color={j < t.rating ? "#E8711A" : "#ccc"} />
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)", fontFamily: "Poppins, sans-serif" }}>{t.reviewer}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider CTA */}
      <section className="py-20 px-4" style={{ background: "var(--teal)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Are You a Leisure Provider?</h2>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
            List your experience on LeisureSpot and reach thousands of travelers and locals looking for their next adventure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("provider-dashboard")}
              className="px-8 py-3 font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "#ffffff", color: "var(--teal)", borderRadius: "8px" }}
            >
              List Your Business
            </button>
            <button
              className="px-8 py-3 font-semibold rounded-lg border-2 transition-colors hover:bg-white hover:text-[#1B5E7B]"
              style={{ borderColor: "#ffffff", color: "#ffffff", borderRadius: "8px" }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
