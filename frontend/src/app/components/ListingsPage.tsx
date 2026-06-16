import { useState } from "react";
import { Search, Grid3X3, List, ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ListingCard, SAMPLE_LISTINGS } from "./ListingCard";

interface ListingsPageProps {
  onNavigate: (page: string) => void;
}

const allListings = [
  ...SAMPLE_LISTINGS,
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174",
    category: "Safari",
    title: "Khama Rhino Sanctuary Tour",
    provider: "Khama Nature Tours",
    location: "Serowe, Botswana",
    rating: 5,
    reviews: 77,
    price: 480,
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1652778287834-d626affb8eff",
    category: "Wellness",
    title: "Sunset Mokoro Meditation Retreat",
    provider: "Delta Soul Retreat",
    location: "Maun, Botswana",
    rating: 4,
    reviews: 41,
    price: 720,
  },
  {
    id: "9",
    image: "https://images.unsplash.com/photo-1742134516273-03ec7c4eb0c7",
    category: "Dining",
    title: "Braai & Botswana Cuisine Evening",
    provider: "Zebra Cultural Kitchen",
    location: "Gaborone, Botswana",
    rating: 4,
    reviews: 55,
    price: 250,
  },
];

export function ListingsPage({ onNavigate }: ListingsPageProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

  const categories = ["Safaris", "Dining", "Wellness", "Sports", "Events", "Family"];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredListings = allListings.filter((l) => {
    if (selectedCategories.length > 0 && !selectedCategories.some((c) => l.category.toLowerCase().includes(c.toLowerCase().slice(0, 4)))) return false;
    if (l.price < priceRange[0] || l.price > priceRange[1]) return false;
    if (selectedRatings.length > 0 && !selectedRatings.includes(Math.floor(l.rating))) return false;
    return true;
  });

  const sorted = [...filteredListings].sort((a, b) => {
    if (sortBy === "Price Low to High") return a.price - b.price;
    if (sortBy === "Price High to Low") return b.price - a.price;
    if (sortBy === "Highest Rated") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar onNavigate={onNavigate} currentPage="listings" />

      <div className="pt-16">
        {/* Page header */}
        <div className="py-8 px-4" style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border-color)" }}>
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
              Experiences in Botswana
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {sorted.length} results found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          {/* Sidebar filters */}
          <aside
            className={`w-72 flex-shrink-0 flex-col gap-6 hidden lg:flex`}
          >
            <div
              className="rounded-xl p-6 bg-white sticky top-20"
              style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}
            >
              {/* Search */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search experiences..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>Location</label>
                <select
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                >
                  <option>Anywhere in Botswana</option>
                  <option>Gaborone</option>
                  <option>Maun</option>
                  <option>Kasane</option>
                  <option>Francistown</option>
                </select>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>Category</label>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded"
                        style={{ accentColor: "var(--teal)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>
                  Price Range
                  <span className="ml-2 font-normal normal-case" style={{ color: "var(--text-secondary)" }}>
                    BWP {priceRange[0]} – BWP {priceRange[1]}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1500}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                  className="w-full"
                  style={{ accentColor: "var(--teal)" }}
                />
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>Rating</label>
                <div className="flex flex-col gap-2">
                  {[5, 4, 3].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(r)}
                        onChange={() => setSelectedRatings((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r])}
                        style={{ accentColor: "var(--teal)" }}
                      />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: r }).map((_, i) => (
                          <span key={i} className="text-xs" style={{ color: "#E8711A" }}>★</span>
                        ))}
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>Duration</label>
                <div className="flex flex-col gap-2">
                  {["Under 2 hours", "Half day (2–5h)", "Full day (5–8h)", "Multi-day"].map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" style={{ accentColor: "var(--teal)" }} />
                      <span className="text-sm" style={{ color: "var(--text-primary)" }}>{d}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-primary)" }}>Availability</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                />
              </div>

              <button
                onClick={() => { setSelectedCategories([]); setSelectedRatings([]); setPriceRange([0, 1500]); }}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--error)" }}
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          {/* Listings area */}
          <main className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Showing <strong style={{ color: "var(--text-primary)" }}>{sorted.length}</strong> results
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "white" }}
                >
                  {["Recommended", "Price Low to High", "Price High to Low", "Highest Rated"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-color)" }}>
                  {(["grid", "list"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-2 transition-colors"
                      style={{ background: viewMode === mode ? "var(--teal)" : "white" }}
                    >
                      {mode === "grid" ? (
                        <Grid3X3 size={16} color={viewMode === mode ? "white" : "var(--text-secondary)"} />
                      ) : (
                        <List size={16} color={viewMode === mode ? "white" : "var(--text-secondary)"} />
                      )}
                    </button>
                  ))}
                </div>
                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm rounded-lg border"
                  onClick={() => setFilterOpen(!filterOpen)}
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              : "flex flex-col gap-4"
            }>
              {sorted.map((listing) =>
                viewMode === "grid" ? (
                  <ListingCard key={listing.id} listing={listing} onNavigate={onNavigate} />
                ) : (
                  <div
                    key={listing.id}
                    className="flex bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "12px" }}
                    onClick={() => onNavigate("listing-detail")}
                  >
                    <img
                      src={`${listing.image}?w=300&h=200&fit=crop&auto=format`}
                      alt={listing.title}
                      className="w-48 h-36 object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col justify-between p-4 flex-1">
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: "var(--teal)" }}>{listing.category}</span>
                        <h3 className="mt-2 text-base font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>{listing.title}</h3>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{listing.provider} · {listing.location}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg" style={{ color: "var(--orange)", fontFamily: "Poppins, sans-serif" }}>BWP {listing.price}<span className="text-xs font-normal text-gray-500">/person</span></span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate("booking"); }}
                          className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg"
                          style={{ background: "var(--orange)", borderRadius: "8px" }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ border: "1px solid var(--border-color)" }}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: currentPage === p ? "var(--teal)" : "white",
                    color: currentPage === p ? "white" : "var(--text-primary)",
                    border: currentPage === p ? "none" : "1px solid var(--border-color)",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                className="p-2 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ border: "1px solid var(--border-color)" }}
                onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </main>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
