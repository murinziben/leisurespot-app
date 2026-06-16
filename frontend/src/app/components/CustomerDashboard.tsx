import { useState } from "react";
import {
  LayoutDashboard, Calendar, Heart, MessageSquare, CreditCard, Settings,
  Bell, LogOut, Star, MapPin, ChevronRight, Clock, Send, Menu, X
} from "lucide-react";

interface CustomerDashboardProps {
  onNavigate: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: Calendar, label: "My Bookings", id: "bookings" },
  { icon: Heart, label: "Wishlist", id: "wishlist" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: CreditCard, label: "Payment Methods", id: "payment" },
  { icon: Settings, label: "Profile Settings", id: "profile" },
  { icon: Bell, label: "Notifications", id: "notifications" },
];

const bookings = [
  { id: "LS-2026-0042", title: "Chobe National Park Full-Day Safari", provider: "Wilderness Expeditions", image: "https://images.unsplash.com/photo-1577971132997-c10be9372519", date: "20 Jun 2026", time: "07:00 AM", guests: 2, amount: 1870, status: "confirmed" },
  { id: "LS-2026-0031", title: "Traditional African Spa Day", provider: "Ubuntu Wellness Centre", image: "https://images.unsplash.com/photo-1765910639954-27ae0c260586", date: "25 Jun 2026", time: "10:00 AM", guests: 1, amount: 473, status: "pending" },
  { id: "LS-2026-0018", title: "Sunset Dinner at Molapo Crossing", provider: "Molapo Crossing Restaurant", image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c", date: "15 May 2026", time: "07:00 PM", guests: 4, amount: 1344, status: "completed" },
  { id: "LS-2026-0009", title: "Botswana Music & Arts Festival", provider: "Gaborone Events Co.", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063", date: "01 Apr 2026", time: "03:00 PM", guests: 2, amount: 378, status: "cancelled" },
];

const wishlistItems = [
  { id: "1", title: "Okavango Delta Mokoro Canoeing", image: "https://images.unsplash.com/photo-1498038116800-4159eb9b2a62", price: 620, rating: 5, location: "Maun" },
  { id: "2", title: "Khama Rhino Sanctuary Tour", image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174", price: 480, rating: 5, location: "Serowe" },
  { id: "3", title: "Gaborone Game Reserve Family Safari", image: "https://images.unsplash.com/photo-1633539656390-142a7e8573a0", price: 390, rating: 4, location: "Gaborone" },
];

const messages = [
  { provider: "Wilderness Expeditions", last: "Your booking for 20 Jun has been confirmed!", time: "2 min ago", unread: true },
  { provider: "Ubuntu Wellness Centre", last: "We look forward to hosting you for your spa day.", time: "1 hour ago", unread: false },
  { provider: "Molapo Crossing Restaurant", last: "Hope you enjoyed your dinner with us!", time: "Yesterday", unread: false },
];

const statusColors: Record<string, string> = {
  confirmed: "#2E7D32",
  pending: "#E8711A",
  completed: "#1B5E7B",
  cancelled: "#C62828",
};

const activityFeed = [
  { action: "Booking confirmed", detail: "Chobe National Park Safari · 20 Jun 2026", time: "2 min ago" },
  { action: "Payment processed", detail: "BWP 1,870 for Chobe Safari", time: "5 min ago" },
  { action: "Review submitted", detail: "5★ for Molapo Crossing Restaurant", time: "3 days ago" },
  { action: "Wishlist updated", detail: "Saved Okavango Delta Mokoro Canoeing", time: "1 week ago" },
];

export function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const [activePage, setActivePage] = useState("overview");
  const [bookingTab, setBookingTab] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [selectedConv, setSelectedConv] = useState(0);

  const filteredBookings = bookingTab === "All" ? bookings : bookings.filter((b) => b.status.toLowerCase() === bookingTab.toLowerCase());

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User avatar */}
      <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--teal)" }}
          >
            KM
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Kefilwe Moeti</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>kefilwe@example.com</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors"
            style={{
              background: activePage === id ? "var(--teal-light)" : "transparent",
              color: activePage === id ? "var(--teal)" : "var(--text-secondary)",
            }}
          >
            <Icon size={18} />
            {label}
            {id === "messages" && <span className="ml-auto w-5 h-5 rounded-full text-xs text-white flex items-center justify-center" style={{ background: "var(--orange)" }}>1</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors hover:bg-red-50"
          style={{ color: "#C62828" }}
        >
          <LogOut size={18} />
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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-2xl">
            <button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
                {navItems.find((n) => n.id === activePage)?.label || "Dashboard"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Welcome back, Kefilwe 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} color="var(--text-secondary)" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "var(--orange)" }} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {activePage === "overview" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Bookings", value: "12", color: "var(--teal)", sub: "All time" },
                  { label: "Upcoming", value: "2", color: "var(--orange)", sub: "Next 30 days" },
                  { label: "Completed", value: "8", color: "var(--success)", sub: "Experiences" },
                  { label: "Saved", value: "6", color: "#C62828", sub: "Wishlist items" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: stat.color }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming bookings */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>Upcoming Bookings</h3>
                    <button onClick={() => setActivePage("bookings")} className="text-xs font-medium" style={{ color: "var(--teal)" }}>View all</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {bookings.filter((b) => b.status === "confirmed" || b.status === "pending").slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "var(--secondary)" }}>
                        <img src={`${b.image}?w=80&h=80&fit=crop&auto=format`} alt={b.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.title}</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.date} · {b.guests} guests</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[b.status] }}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Recent Activity</h3>
                  <div className="flex flex-col gap-4">
                    {activityFeed.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--teal)" }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.action}</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.detail}</p>
                        </div>
                        <span className="text-xs flex-shrink-0" style={{ color: "var(--text-secondary)" }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {activePage === "bookings" && (
            <div className="bg-white rounded-xl" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              {/* Tab bar */}
              <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border-color)" }}>
                {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBookingTab(tab)}
                    className="px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors"
                    style={{
                      borderColor: bookingTab === tab ? "var(--teal)" : "transparent",
                      color: bookingTab === tab ? "var(--teal)" : "var(--text-secondary)",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-5 flex flex-col gap-4">
                {filteredBookings.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: "var(--text-secondary)" }}>No bookings found for this status.</p>
                )}
                {filteredBookings.map((b) => (
                  <div key={b.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl" style={{ background: "var(--secondary)", border: "1px solid var(--border-color)" }}>
                    <img src={`${b.image}?w=200&h=130&fit=crop&auto=format`} alt={b.title} className="w-full sm:w-36 h-32 sm:h-auto rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}>{b.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{b.provider}</p>
                          </div>
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-full text-white flex-shrink-0"
                            style={{ background: statusColors[b.status] }}
                          >
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <Calendar size={12} />
                            {b.date} at {b.time}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <Clock size={12} />
                            {b.guests} guests
                          </div>
                          <div className="text-xs font-bold" style={{ color: "var(--teal)" }}>
                            BWP {b.amount.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>Ref: {b.id}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:bg-gray-50" style={{ border: "1px solid var(--border-color)", color: "var(--teal)" }}>View Details</button>
                        {b.status === "confirmed" && (
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors hover:bg-red-50" style={{ color: "#C62828" }}>Cancel</button>
                        )}
                        {b.status === "completed" && (
                          <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-opacity hover:opacity-90" style={{ background: "var(--orange)" }}>Leave Review</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WISHLIST */}
          {activePage === "wishlist" && (
            <div>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Your saved experiences</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <div className="relative h-44">
                      <img src={`${item.image}?w=500&h=300&fit=crop&auto=format`} alt={item.title} className="w-full h-full object-cover" />
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white shadow">
                        <Heart size={15} fill="#C62828" color="#C62828" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{item.title}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={12} color="var(--text-secondary)" />
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.location}, Botswana</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: "var(--orange)" }}>BWP {item.price}/person</span>
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 text-xs font-medium rounded-lg"
                            style={{ background: "var(--teal-light)", color: "var(--teal)" }}
                            onClick={() => onNavigate("listing-detail")}
                          >
                            Book
                          </button>
                          <button
                            className="px-3 py-1 text-xs font-medium rounded-lg border"
                            style={{ border: "1px solid #C62828", color: "#C62828" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {activePage === "messages" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)", height: "calc(100vh - 160px)" }}>
              <div className="flex h-full">
                {/* Conversation list */}
                <div className="w-72 border-r flex-shrink-0 flex flex-col" style={{ borderColor: "var(--border-color)" }}>
                  <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
                    <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Messages</p>
                  </div>
                  {messages.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedConv(i)}
                      className="flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b"
                      style={{
                        borderColor: "var(--border-color)",
                        background: selectedConv === i ? "var(--teal-light)" : "white",
                      }}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "var(--teal)" }}>
                        {m.provider.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{m.provider}</p>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: "var(--text-secondary)" }}>{m.time}</span>
                        </div>
                        <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-secondary)" }}>{m.last}</p>
                      </div>
                      {m.unread && <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: "var(--orange)" }} />}
                    </button>
                  ))}
                </div>

                {/* Chat window */}
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "var(--border-color)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "var(--teal)" }}>
                      {messages[selectedConv].provider.charAt(0)}
                    </div>
                    <p className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>{messages[selectedConv].provider}</p>
                  </div>
                  <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
                    <div className="flex justify-start">
                      <div className="max-w-xs px-4 py-2.5 rounded-2xl text-sm" style={{ background: "var(--secondary)", color: "var(--text-primary)" }}>
                        {messages[selectedConv].last}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-xs px-4 py-2.5 rounded-2xl text-sm text-white" style={{ background: "var(--teal)" }}>
                        Thank you! Looking forward to it.
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: "var(--border-color)" }}>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B5E7B]"
                      style={{ border: "1px solid var(--border-color)", background: "var(--secondary)" }}
                    />
                    <button
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90"
                      style={{ background: "var(--teal)" }}
                      onClick={() => setChatInput("")}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generic pages */}
          {["payment", "profile", "notifications"].includes(activePage) && (
            <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--teal-light)" }}>
                {activePage === "payment" && <CreditCard size={28} color="var(--teal)" />}
                {activePage === "profile" && <Settings size={28} color="var(--teal)" />}
                {activePage === "notifications" && <Bell size={28} color="var(--teal)" />}
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                {navItems.find((n) => n.id === activePage)?.label}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>This section is coming soon. Check back shortly!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
