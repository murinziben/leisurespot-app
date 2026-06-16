import { useState } from "react";
import { MapPin, Star, Shield, ChevronLeft, ChevronRight, Heart, Share2, Check, Minus, Plus, Calendar, Users } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface ListingDetailPageProps {
  onNavigate: (page: string) => void;
}

const reviews = [
  { name: "Kefilwe M.", date: "May 2026", rating: 5, comment: "Absolutely breathtaking experience! The guide was knowledgeable and the wildlife sightings were incredible. Will definitely return.", avatar: "KM" },
  { name: "James T.", date: "April 2026", rating: 5, comment: "Best safari experience I've had in Botswana. Professional team, amazing food, and stunning views of the Chobe River.", avatar: "JT" },
  { name: "Thandi N.", date: "March 2026", rating: 4, comment: "Great day out! Saw elephants, hippos, and a crocodile. The boat cruise at sunset was magical.", avatar: "TN" },
];

const included = [
  "Professional safari guide",
  "Round-trip transfers from Kasane",
  "Packed lunch and refreshments",
  "Park entry fees",
  "Game drive in open 4WD vehicle",
  "All wildlife conservation fees",
];

export function ListingDetailPage({ onNavigate }: ListingDetailPageProps) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("2026-06-20");
  const [wishlist, setWishlist] = useState(false);

  const pricePerPerson = 850;
  const platformFee = Math.round(pricePerPerson * guests * 0.05);
  const subtotal = pricePerPerson * guests;
  const total = subtotal + platformFee;

  const images = [
    "https://images.unsplash.com/photo-1577971132997-c10be9372519",
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174",
    "https://images.unsplash.com/photo-1578326626553-39f72c545b07",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={onNavigate} currentPage="listing-detail" />

      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <button onClick={() => onNavigate("landing")} className="hover:underline">Home</button>
          <ChevronRight size={14} />
          <button onClick={() => onNavigate("listings")} className="hover:underline">Safaris</button>
          <ChevronRight size={14} />
          <span style={{ color: "var(--text-primary)" }}>Chobe National Park Full-Day Safari</span>
        </div>

        {/* Image gallery */}
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-3 gap-3 rounded-2xl overflow-hidden h-80 md:h-[420px]">
            <div className="col-span-2 relative">
              <img
                src={`${images[0]}?w=900&h=600&fit=crop&auto=format`}
                alt="Main safari"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex-1 relative overflow-hidden">
                <img src={`${images[1]}?w=400&h=280&fit=crop&auto=format`} alt="Rhinos" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 relative overflow-hidden">
                <img src={`${images[2]}?w=400&h=280&fit=crop&auto=format`} alt="Elephants" className="w-full h-full object-cover" />
                <button
                  className="absolute bottom-3 right-3 px-4 py-2 text-xs font-semibold bg-white rounded-lg shadow-md"
                  style={{ color: "var(--text-primary)" }}
                >
                  View All Photos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left — details */}
            <div className="lg:col-span-2">
              {/* Title row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span
                    className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-3"
                    style={{ background: "var(--teal)", borderRadius: "24px" }}
                  >
                    Safari
                  </span>
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Chobe National Park Full-Day Safari
                  </h1>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin size={15} color="var(--text-secondary)" />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Kasane, Botswana</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium"
                        style={{ background: "var(--teal-light)", color: "var(--teal)" }}
                      >
                        <Shield size={12} />
                        Wilderness Expeditions
                        <span className="text-xs">✓ Verified</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="#E8711A" color="#E8711A" />
                      ))}
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>5.0 (142 reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWishlist(!wishlist)}
                    className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors hover:bg-gray-50"
                    style={{ border: "1px solid var(--border-color)" }}
                  >
                    <Heart size={18} fill={wishlist ? "#C62828" : "none"} color={wishlist ? "#C62828" : "var(--text-secondary)"} />
                  </button>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors hover:bg-gray-50"
                    style={{ border: "1px solid var(--border-color)" }}
                  >
                    <Share2 size={18} color="var(--text-secondary)" />
                  </button>
                </div>
              </div>

              <hr style={{ borderColor: "var(--border-color)" }} className="my-6" />

              {/* About */}
              <section className="mb-8">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>About This Experience</h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  Experience the wildlife wonders of Chobe National Park — home to Africa's largest elephant population. This full-day safari takes you through the park's diverse ecosystems, from riverine forests along the Chobe River to open floodplains teeming with wildlife.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  Your expert guide will lead you through the park in a specially designed open 4WD safari vehicle, providing fascinating commentary on the animals, plants, and ecology of this extraordinary wilderness. The day culminates with a stunning sunset boat cruise along the Chobe River.
                </p>
                <div className="flex gap-4 mt-4 flex-wrap">
                  {[{ label: "Duration", value: "Full Day (8h)" }, { label: "Group Size", value: "Up to 8" }, { label: "Language", value: "English, Setswana" }].map((info) => (
                    <div key={info.label} className="px-4 py-2 rounded-lg" style={{ background: "var(--secondary)", border: "1px solid var(--border-color)" }}>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{info.label}</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{info.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* What's included */}
              <section className="mb-8">
                <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>What's Included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {included.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--teal-light)" }}>
                        <Check size={11} color="var(--teal)" />
                      </div>
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Map */}
              <section className="mb-8">
                <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Location</h3>
                <div
                  className="w-full h-48 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--secondary)", border: "1px solid var(--border-color)", borderRadius: "12px" }}
                >
                  <div className="text-center">
                    <MapPin size={32} color="var(--teal)" className="mx-auto mb-2" />
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Chobe National Park</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Kasane, North-West Botswana</p>
                  </div>
                </div>
              </section>

              {/* Reviews */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>
                    Guest Reviews
                    <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-secondary)" }}>(142)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>5.0</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="#E8711A" color="#E8711A" />)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  {reviews.map((r, i) => (
                    <div key={i} className="pb-5" style={{ borderBottom: i < reviews.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: "var(--teal)" }}
                        >
                          {r.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.name}</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.date}</p>
                        </div>
                        <div className="ml-auto flex">
                          {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={13} fill="#E8711A" color="#E8711A" />)}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right — booking card */}
            <div className="lg:col-span-1">
              <div
                className="sticky top-20 rounded-2xl p-6 bg-white"
                style={{ boxShadow: "0px 8px 32px rgba(0,0,0,0.12)", border: "1px solid var(--border-color)", borderRadius: "16px" }}
              >
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold" style={{ color: "var(--orange)", fontFamily: "Poppins, sans-serif" }}>BWP {pricePerPerson}</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>/person</span>
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                    Select Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-secondary)" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                      style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                    />
                  </div>
                </div>

                {/* Guests */}
                <div className="mb-6">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                    Guests
                  </label>
                  <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Users size={16} color="var(--text-secondary)" />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-7 h-7 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ border: "1px solid var(--border-color)" }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{guests}</span>
                      <button
                        onClick={() => setGuests(Math.min(8, guests + 1))}
                        className="w-7 h-7 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{ border: "1px solid var(--border-color)" }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div
                  className="rounded-xl p-4 mb-5"
                  style={{ background: "var(--secondary)", borderRadius: "12px" }}
                >
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "var(--text-secondary)" }}>BWP {pricePerPerson} × {guests} guests</span>
                    <span style={{ color: "var(--text-primary)" }}>BWP {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span style={{ color: "var(--text-secondary)" }}>Platform fee (5%)</span>
                    <span style={{ color: "var(--text-primary)" }}>BWP {platformFee}</span>
                  </div>
                  <hr style={{ borderColor: "var(--border-color)" }} />
                  <div className="flex justify-between font-bold mt-3">
                    <span style={{ fontFamily: "Poppins, sans-serif" }}>Total</span>
                    <span style={{ color: "var(--teal)", fontFamily: "Poppins, sans-serif" }}>BWP {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("booking")}
                  className="w-full py-3 text-white font-bold rounded-xl text-base transition-opacity hover:opacity-90"
                  style={{ background: "var(--orange)", borderRadius: "12px", height: "52px" }}
                >
                  Book Now
                </button>

                <p className="text-center text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
                  No payment charged until provider confirms
                </p>

                <hr style={{ borderColor: "var(--border-color)" }} className="my-4" />
                <div className="flex items-center justify-center gap-3">
                  <Shield size={16} color="var(--success)" />
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Secure booking · Verified provider · Free cancellation up to 48h before
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
