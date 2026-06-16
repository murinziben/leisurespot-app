import { useState } from "react";
import {
  LayoutDashboard, List, Calendar, BarChart2, DollarSign, Star, MessageSquare,
  Building2, FileText, LogOut, MapPin, Plus, ChevronDown, Upload, Check, Menu, X, Bell
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProviderDashboardProps {
  onNavigate: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: List, label: "My Listings", id: "listings" },
  { icon: Calendar, label: "Bookings", id: "bookings" },
  { icon: BarChart2, label: "Availability", id: "availability" },
  { icon: DollarSign, label: "Earnings", id: "earnings" },
  { icon: Star, label: "Reviews", id: "reviews" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Building2, label: "Business Profile", id: "profile" },
  { icon: FileText, label: "Documents", id: "documents" },
];

const trendData = [
  { day: "Jun 1", bookings: 3 }, { day: "Jun 5", bookings: 5 }, { day: "Jun 10", bookings: 4 },
  { day: "Jun 15", bookings: 8 }, { day: "Jun 20", bookings: 6 }, { day: "Jun 25", bookings: 9 },
  { day: "Jun 30", bookings: 7 },
];

const providerListings = [
  { id: "1", title: "Chobe National Park Full-Day Safari", category: "Safari", price: 850, active: true, rating: 5.0, bookings: 142, image: "https://images.unsplash.com/photo-1577971132997-c10be9372519" },
  { id: "2", title: "Chobe River Sunset Boat Cruise", category: "Tourism", price: 420, active: true, rating: 4.8, bookings: 98, image: "https://images.unsplash.com/photo-1652778287834-d626affb8eff" },
  { id: "3", title: "Bush Camping Overnight Experience", category: "Safari", price: 1200, active: false, rating: 4.6, bookings: 34, image: "https://images.unsplash.com/photo-1627759501315-28407b7cac86" },
];

const providerBookings = [
  { ref: "LS-2026-0042", customer: "Kefilwe Moeti", listing: "Chobe Full-Day Safari", date: "20 Jun 2026", guests: 2, amount: 1870, status: "confirmed" },
  { ref: "LS-2026-0039", customer: "James Tsheko", listing: "Sunset Boat Cruise", date: "22 Jun 2026", guests: 4, amount: 1764, status: "pending" },
  { ref: "LS-2026-0035", customer: "Thandi Nkosi", listing: "Chobe Full-Day Safari", date: "18 Jun 2026", guests: 2, amount: 1870, status: "completed" },
  { ref: "LS-2026-0028", customer: "Lesedi Dube", listing: "Bush Camping", date: "10 Jun 2026", guests: 3, amount: 3780, status: "completed" },
];

const statusColors: Record<string, string> = {
  confirmed: "#2E7D32",
  pending: "#E8711A",
  completed: "#1B5E7B",
  cancelled: "#C62828",
};

const steps = ["Basic Info", "Pricing & Guests", "Location & Images", "Availability"];

export function ProviderDashboard({ onNavigate }: ProviderDashboardProps) {
  const [activePage, setActivePage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeListings, setActiveListings] = useState<Record<string, boolean>>({ "1": true, "2": true, "3": false });
  const [formStep, setFormStep] = useState(1);
  const [showAddListing, setShowAddListing] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0" style={{ background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Wilderness Expeditions</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Provider Account</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActivePage(id); setSidebarOpen(false); setShowAddListing(false); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors"
            style={{
              background: activePage === id ? "var(--teal-light)" : "transparent",
              color: activePage === id ? "var(--teal)" : "var(--text-secondary)",
            }}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left hover:bg-red-50" style={{ color: "#C62828" }}>
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--secondary)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 bg-white border-r min-h-screen" style={{ borderColor: "var(--border-color)" }}>
        <div className="sticky top-0 h-screen">
          <div className="px-6 py-5 border-b flex items-center gap-2" style={{ borderColor: "var(--border-color)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--teal)" }}>
              <MapPin size={14} color="white" />
            </div>
            <span className="font-bold text-base" style={{ fontFamily: "Poppins, sans-serif", color: "var(--teal)" }}>LeisureSpot</span>
          </div>
          <SidebarContent />
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-2xl"><button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}><X size={20} /></button><SidebarContent /></div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="font-bold text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
              {showAddListing ? "Add New Listing" : navItems.find((n) => n.id === activePage)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--teal-light)", color: "var(--teal)" }}>
              <Check size={12} />
              Verified Provider
            </span>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} color="var(--text-secondary)" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activePage === "overview" && !showAddListing && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Earnings This Month", value: "BWP 28,450", delta: "+12% vs last month", color: "var(--success)" },
                  { label: "Total Bookings", value: "274", delta: "All time", color: "var(--teal)" },
                  { label: "Pending Confirmations", value: "3", delta: "Require action", color: "var(--orange)" },
                  { label: "Average Rating", value: "4.9 ★", delta: "Based on 274 reviews", color: "#E8711A" },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>{k.label}</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: k.color }}>{k.value}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{k.delta}</p>
                  </div>
                ))}
              </div>

              {/* Booking trend chart */}
              <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Booking Trends — June 2026</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="var(--teal)" strokeWidth={2.5} dot={{ fill: "var(--teal)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recent bookings table */}
              <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border-color)" }}>
                  <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Recent Bookings</h3>
                  <button onClick={() => setActivePage("bookings")} className="text-xs font-medium" style={{ color: "var(--teal)" }}>View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "var(--secondary)" }}>
                        {["Ref", "Customer", "Listing", "Date", "Guests", "Amount", "Status"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {providerBookings.slice(0, 4).map((b, i) => (
                        <tr key={b.ref} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{b.ref}</td>
                          <td className="px-4 py-3 font-medium">{b.customer}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{b.listing}</td>
                          <td className="px-4 py-3 text-xs">{b.date}</td>
                          <td className="px-4 py-3 text-xs">{b.guests}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: "var(--teal)" }}>BWP {b.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[b.status] }}>
                              {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MY LISTINGS */}
          {activePage === "listings" && !showAddListing && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{providerListings.length} listings</p>
                <button
                  onClick={() => setShowAddListing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: "var(--orange)", borderRadius: "8px" }}
                >
                  <Plus size={16} />
                  Add New Listing
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {providerListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl flex gap-4 p-4" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <img src={`${listing.image}?w=200&h=130&fit=crop&auto=format`} alt={listing.title} className="w-32 h-24 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>{listing.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{listing.category} · BWP {listing.price}/person</p>
                        </div>
                        {/* Active toggle */}
                        <button
                          onClick={() => setActiveListings((prev) => ({ ...prev, [listing.id]: !prev[listing.id] }))}
                          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0"
                          style={{
                            background: activeListings[listing.id] ? "var(--teal-light)" : "#f5f5f5",
                            color: activeListings[listing.id] ? "var(--teal)" : "var(--text-secondary)",
                          }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: activeListings[listing.id] ? "var(--success)" : "#ccc" }} />
                          {activeListings[listing.id] ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>★ {listing.rating}</span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{listing.bookings} bookings</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 text-xs font-medium rounded-lg border" style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}>Edit</button>
                        <button className="px-3 py-1 text-xs font-medium rounded-lg border" style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADD LISTING FORM */}
          {showAddListing && (
            <div>
              <button onClick={() => setShowAddListing(false)} className="mb-6 text-sm flex items-center gap-1" style={{ color: "var(--teal)" }}>
                ← Back to My Listings
              </button>

              {/* Step indicator */}
              <div className="flex items-center gap-0 mb-8 overflow-x-auto">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <button
                      onClick={() => setFormStep(i + 1)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
                      style={{
                        background: formStep === i + 1 ? "var(--teal)" : formStep > i + 1 ? "var(--teal-light)" : "var(--secondary)",
                        color: formStep === i + 1 ? "white" : formStep > i + 1 ? "var(--teal)" : "var(--text-secondary)",
                      }}
                    >
                      <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: formStep > i + 1 ? "var(--teal)" : "transparent", border: formStep <= i + 1 ? "1.5px solid currentColor" : "none", color: formStep > i + 1 ? "white" : "inherit" }}>
                        {formStep > i + 1 ? "✓" : i + 1}
                      </span>
                      {step}
                    </button>
                    {i < steps.length - 1 && <div className="w-6 h-px mx-1" style={{ background: "var(--border-color)" }} />}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                {formStep === 1 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Basic Information</h3>
                    {[{ label: "Listing Title", placeholder: "e.g. Chobe Full-Day Safari Experience" }, { label: "Short Description", placeholder: "One sentence summary of your listing" }].map((f) => (
                      <div key={f.label}>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{f.label}</label>
                        <input className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" placeholder={f.placeholder} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      {[{ label: "Category", opts: ["Safari", "Dining", "Wellness", "Sports", "Events", "Family"] }, { label: "Subcategory", opts: ["Game Drive", "Boat Cruise", "Walking", "Photography"] }].map((f) => (
                        <div key={f.label}>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{f.label}</label>
                          <select className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}>
                            <option value="">Select {f.label}</option>
                            {f.opts.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Full Description</label>
                      <textarea rows={5} placeholder="Describe your experience in detail — what guests can expect, highlights, special features..." className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B] resize-none" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Pricing & Guests</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[{ label: "Price Per Person (BWP)", ph: "850" }, { label: "Duration", ph: "8 hours" }, { label: "Min Guests", ph: "1" }, { label: "Max Guests", ph: "8" }].map((f) => (
                        <div key={f.label}>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{f.label}</label>
                          <input type={f.ph === "850" || f.ph === "1" || f.ph === "8" ? "number" : "text"} placeholder={f.ph} className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Cancellation Policy</label>
                      <select className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}>
                        <option>Free cancellation up to 48 hours before</option>
                        <option>Free cancellation up to 24 hours before</option>
                        <option>Non-refundable</option>
                        <option>Custom policy</option>
                      </select>
                    </div>
                  </div>
                )}

                {formStep === 3 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Location & Images</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Location</label>
                        <select className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}>
                          <option>Kasane</option><option>Gaborone</option><option>Maun</option><option>Francistown</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Address</label>
                        <input placeholder="Street address or meeting point" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                      </div>
                    </div>
                    <div className="w-full h-36 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)", border: "1px dashed var(--border-color)" }}>
                      <div className="text-center">
                        <MapPin size={24} color="var(--teal)" className="mx-auto mb-2" />
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Map pin placeholder — Kasane, Botswana</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Photos (up to 10)</label>
                      <div className="w-full h-36 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors hover:bg-gray-50 cursor-pointer" style={{ border: "2px dashed var(--border-color)" }}>
                        <Upload size={24} color="var(--teal)" />
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Drag & drop images here</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>PNG, JPG up to 10MB each</p>
                      </div>
                    </div>
                  </div>
                )}

                {formStep === 4 && (
                  <div className="flex flex-col gap-6">
                    <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Availability Schedule</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                        <div key={day} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: "var(--secondary)", border: "1px solid var(--border-color)" }}>
                          <input type="checkbox" defaultChecked={i < 5} style={{ accentColor: "var(--teal)" }} />
                          <span className="text-sm font-medium w-24" style={{ color: "var(--text-primary)" }}>{day}</span>
                          <input type="time" defaultValue="07:00" className="px-2 py-1 text-sm rounded-lg" style={{ border: "1px solid var(--border-color)" }} />
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>to</span>
                          <input type="time" defaultValue="17:00" className="px-2 py-1 text-sm rounded-lg" style={{ border: "1px solid var(--border-color)" }} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Add Exception Dates</label>
                      <input type="date" className="px-3 py-2.5 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "white" }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  {formStep > 1 && (
                    <button onClick={() => setFormStep(formStep - 1)} className="px-6 py-2.5 text-sm font-semibold rounded-lg border" style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => formStep < 4 ? setFormStep(formStep + 1) : setShowAddListing(false)}
                    className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                    style={{ background: "var(--orange)", borderRadius: "8px" }}
                  >
                    {formStep < 4 ? "Continue" : "Publish Listing"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activePage === "bookings" && !showAddListing && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border-color)" }}>
                {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((tab) => (
                  <button key={tab} className="px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2" style={{ borderColor: tab === "All" ? "var(--teal)" : "transparent", color: tab === "All" ? "var(--teal)" : "var(--text-secondary)" }}>{tab}</button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "var(--secondary)" }}>
                      {["Ref", "Customer", "Listing", "Date", "Guests", "Amount", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {providerBookings.map((b) => (
                      <tr key={b.ref} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{b.ref}</td>
                        <td className="px-4 py-3 font-medium">{b.customer}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{b.listing}</td>
                        <td className="px-4 py-3 text-xs">{b.date}</td>
                        <td className="px-4 py-3 text-xs">{b.guests}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--teal)" }}>BWP {b.amount.toLocaleString()}</td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[b.status] }}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></td>
                        <td className="px-4 py-3">
                          {b.status === "pending" && (
                            <div className="flex gap-1">
                              <button className="px-2 py-1 text-xs font-semibold text-white rounded" style={{ background: "var(--success)" }}>Confirm</button>
                              <button className="px-2 py-1 text-xs font-semibold rounded border" style={{ border: "1px solid #C62828", color: "#C62828" }}>Decline</button>
                            </div>
                          )}
                          {b.status !== "pending" && <button className="px-2 py-1 text-xs text-[#1B5E7B] underline">View</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EARNINGS */}
          {activePage === "earnings" && !showAddListing && (
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <input type="date" defaultValue="2026-06-01" className="px-3 py-2 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)" }} />
                  <span style={{ color: "var(--text-secondary)" }}>—</span>
                  <input type="date" defaultValue="2026-06-30" className="px-3 py-2 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)" }} />
                </div>
                <button className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ background: "var(--teal)", borderRadius: "8px" }}>Request Payout</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Gross Revenue", value: "BWP 34,200", color: "var(--teal)" },
                  { label: "Platform Commission (10%)", value: "BWP 3,420", color: "var(--orange)" },
                  { label: "Net Earnings", value: "BWP 30,780", color: "var(--success)" },
                  { label: "Pending Payout", value: "BWP 12,450", color: "#C62828" },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>{k.label}</p>
                    <p className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: k.color }}>{k.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: "var(--secondary)" }}>
                        {["Booking Ref", "Listing", "Date", "Amount", "Commission (10%)", "Net"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {providerBookings.filter((b) => b.status === "completed").map((b) => (
                        <tr key={b.ref} className="border-t" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{b.ref}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{b.listing}</td>
                          <td className="px-4 py-3 text-xs">{b.date}</td>
                          <td className="px-4 py-3">BWP {b.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--orange)" }}>BWP {Math.round(b.amount * 0.1)}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: "var(--success)" }}>BWP {Math.round(b.amount * 0.9).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* GENERIC pages */}
          {["availability", "reviews", "messages", "profile", "documents"].includes(activePage) && !showAddListing && (
            <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--teal-light)" }}>
                {(() => { const Item = navItems.find((n) => n.id === activePage); return Item ? <Item.icon size={28} color="var(--teal)" /> : null; })()}
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{navItems.find((n) => n.id === activePage)?.label}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>This section is coming soon. Full implementation available in the next release.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
