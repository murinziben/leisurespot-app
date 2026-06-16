import { useState } from "react";
import {
  LayoutDashboard, Users, Building2, List, Calendar, DollarSign, Star,
  BarChart2, Tag, MapPin, FileText, Settings, Shield, ChevronDown,
  Search, Menu, X, Bell, TrendingUp
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Users", id: "users" },
  { icon: Building2, label: "Providers", id: "providers" },
  { icon: List, label: "Listings", id: "listings" },
  { icon: Calendar, label: "Bookings", id: "bookings" },
  { icon: DollarSign, label: "Payments", id: "payments" },
  { icon: Star, label: "Reviews", id: "reviews" },
  { icon: BarChart2, label: "Reports", id: "reports" },
  { icon: Tag, label: "Promotions", id: "promotions" },
  { icon: MapPin, label: "Locations", id: "locations" },
  { icon: FileText, label: "Audit Logs", id: "logs" },
  { icon: Settings, label: "Platform Settings", id: "settings" },
];

const bookingTrend = [
  { day: "Jun 1", bookings: 18 }, { day: "Jun 5", bookings: 24 }, { day: "Jun 10", bookings: 31 },
  { day: "Jun 15", bookings: 28 }, { day: "Jun 20", bookings: 42 }, { day: "Jun 25", bookings: 36 },
  { day: "Jun 30", bookings: 45 },
];

const revenueByCategory = [
  { category: "Safari", revenue: 82000 },
  { category: "Dining", revenue: 34000 },
  { category: "Wellness", revenue: 28000 },
  { category: "Sports", revenue: 21000 },
  { category: "Events", revenue: 19000 },
  { category: "Family", revenue: 16000 },
];

const allUsers = [
  { id: "USR-001", name: "Kefilwe Moeti", email: "kefilwe@example.com", role: "Customer", status: "active", joined: "12 Jan 2026" },
  { id: "USR-002", name: "James Tsheko", email: "james@example.com", role: "Customer", status: "active", joined: "5 Feb 2026" },
  { id: "USR-003", name: "Thandi Nkosi", email: "thandi@example.com", role: "Provider", status: "active", joined: "22 Mar 2026" },
  { id: "USR-004", name: "Lesedi Dube", email: "lesedi@example.com", role: "Customer", status: "suspended", joined: "14 Apr 2026" },
  { id: "USR-005", name: "Mpho Kgosi", email: "mpho@example.com", role: "Admin", status: "active", joined: "1 Jan 2026" },
];

const allProviders = [
  { id: "PRV-001", business: "Wilderness Expeditions", owner: "Samuel Mokgosi", category: "Safari", status: "verified", listings: 3, joined: "10 Jan 2026" },
  { id: "PRV-002", business: "Ubuntu Wellness Centre", owner: "Naledi Sehume", category: "Wellness", status: "pending", listings: 1, joined: "5 Mar 2026" },
  { id: "PRV-003", business: "Delta Adventures", owner: "Bongani Tau", category: "Sports", status: "verified", listings: 4, joined: "20 Feb 2026" },
  { id: "PRV-004", business: "Gaborone Events Co.", owner: "Kaelo Ntshole", category: "Events", status: "suspended", listings: 2, joined: "8 Apr 2026" },
];

const allListings = [
  { id: "LST-001", title: "Chobe National Park Safari", provider: "Wilderness Expeditions", category: "Safari", price: 850, status: "active", rating: 5.0, bookings: 142 },
  { id: "LST-002", title: "Traditional Spa Day", provider: "Ubuntu Wellness Centre", category: "Wellness", price: 450, status: "active", rating: 4.8, bookings: 67 },
  { id: "LST-003", title: "Sunset Boat Cruise", provider: "Delta Adventures", category: "Sports", price: 420, status: "suspended", rating: 4.6, bookings: 98 },
  { id: "LST-004", title: "Botswana Music Festival", provider: "Gaborone Events Co.", category: "Events", price: 180, status: "active", rating: 4.4, bookings: 203 },
];

const reports = [
  { item: "Misleading safari description", reporter: "James T.", reason: "False advertising", date: "5 Jun 2026", status: "open" },
  { item: "Rude provider staff review", reporter: "Kefilwe M.", reason: "Inappropriate behavior", date: "3 Jun 2026", status: "resolved" },
  { item: "Fake review spam", reporter: "Auto-detect", reason: "Review manipulation", date: "1 Jun 2026", status: "open" },
];

const statusColors: Record<string, string> = {
  active: "#2E7D32",
  verified: "#2E7D32",
  pending: "#E8711A",
  suspended: "#C62828",
  resolved: "#1B5E7B",
  open: "#E8711A",
};

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportTab, setReportTab] = useState("Listing Reports");
  const [searchQuery, setSearchQuery] = useState("");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--teal)" }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ fontFamily: "Poppins, sans-serif", color: "var(--teal)" }}>Admin Panel</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>LeisureSpot Platform</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => { setActivePage(id); setSidebarOpen(false); }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors"
            style={{
              background: activePage === id ? "var(--teal-light)" : "transparent",
              color: activePage === id ? "var(--teal)" : "var(--text-secondary)",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm w-full text-left hover:bg-red-50" style={{ color: "#C62828" }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--secondary)" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border-r min-h-screen" style={{ borderColor: "var(--border-color)" }}>
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-2xl overflow-y-auto"><button className="absolute top-4 right-4" onClick={() => setSidebarOpen(false)}><X size={20} /></button><SidebarContent /></div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="font-bold text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
              {navItems.find((n) => n.id === activePage)?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ background: "var(--teal)" }}>Super Admin</span>
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} color="var(--text-secondary)" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: "#C62828" }} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <div>
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Total Users", value: "15,284", delta: "+124 this week", color: "var(--teal)", icon: Users },
                  { label: "Total Providers", value: "127", delta: "+8 pending approval", color: "var(--orange)", icon: Building2 },
                  { label: "Active Listings", value: "483", delta: "32 inactive", color: "var(--success)", icon: List },
                  { label: "Bookings Today", value: "47", delta: "+12% vs yesterday", color: "var(--teal)", icon: Calendar },
                  { label: "Revenue Today", value: "BWP 42,180", delta: "+18% vs yesterday", color: "#E8711A", icon: DollarSign },
                  { label: "Pending Verifications", value: "14", delta: "Require review", color: "#C62828", icon: Shield },
                ].map((k) => (
                  <div key={k.label} className="bg-white rounded-xl p-5 flex items-start gap-4" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}20` }}>
                      <k.icon size={20} color={k.color} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>{k.label}</p>
                      <p className="text-2xl font-bold" style={{ fontFamily: "Poppins, sans-serif", color: k.color }}>{k.value}</p>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                        <TrendingUp size={10} />
                        {k.delta}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Bookings Over Time — June 2026</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bookingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bookings" stroke="var(--teal)" strokeWidth={2.5} dot={{ fill: "var(--teal)", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Revenue by Category (BWP)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="var(--orange)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Tables row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
                    <h3 className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Recent Bookings</h3>
                    <button className="text-xs" style={{ color: "var(--teal)" }}>View all</button>
                  </div>
                  <table className="w-full text-xs">
                    <thead><tr style={{ background: "var(--secondary)" }}>{["Ref", "Customer", "Amount", "Status"].map((h) => <th key={h} className="text-left px-4 py-2 font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {[
                        { ref: "LS-2026-0042", customer: "Kefilwe M.", amount: "BWP 1,870", status: "confirmed" },
                        { ref: "LS-2026-0041", customer: "James T.", amount: "BWP 840", status: "pending" },
                        { ref: "LS-2026-0040", customer: "Thandi N.", amount: "BWP 3,780", status: "confirmed" },
                        { ref: "LS-2026-0039", customer: "Lesedi D.", amount: "BWP 506", status: "completed" },
                      ].map((b) => (
                        <tr key={b.ref} className="border-t" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-4 py-2.5 font-mono" style={{ color: "var(--teal)" }}>{b.ref}</td>
                          <td className="px-4 py-2.5">{b.customer}</td>
                          <td className="px-4 py-2.5 font-semibold">{b.amount}</td>
                          <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: statusColors[b.status] }}>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
                    <h3 className="font-semibold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Pending Provider Verifications</h3>
                    <button className="text-xs" style={{ color: "var(--teal)" }}>View all</button>
                  </div>
                  <table className="w-full text-xs">
                    <thead><tr style={{ background: "var(--secondary)" }}>{["Provider", "Category", "Actions"].map((h) => <th key={h} className="text-left px-4 py-2 font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {allProviders.filter((p) => p.status === "pending").concat([{ id: "PRV-005", business: "Savannah Spa", owner: "Naledi K.", category: "Wellness", status: "pending", listings: 0, joined: "7 Jun 2026" }]).map((p) => (
                        <tr key={p.id} className="border-t" style={{ borderColor: "var(--border-color)" }}>
                          <td className="px-4 py-2.5 font-medium">{p.business}</td>
                          <td className="px-4 py-2.5" style={{ color: "var(--text-secondary)" }}>{p.category}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1">
                              <button className="px-2 py-1 text-xs font-semibold text-white rounded" style={{ background: "var(--success)" }}>Verify</button>
                              <button className="px-2 py-1 text-xs font-semibold rounded border" style={{ border: "1px solid #C62828", color: "#C62828" }}>Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activePage === "users" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="p-5 border-b flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "var(--border-color)" }}>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-secondary)" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)", background: "var(--secondary)", width: "240px" }} />
                </div>
                <select className="px-3 py-2 text-sm rounded-lg" style={{ border: "1px solid var(--border-color)" }}>
                  <option>All Roles</option><option>Customer</option><option>Provider</option><option>Admin</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: "var(--secondary)" }}>{["User ID", "Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {allUsers.filter((u) => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <tr key={u.id} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{u.id}</td>
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                        <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: u.role === "Admin" ? "var(--teal-light)" : "var(--secondary)", color: u.role === "Admin" ? "var(--teal)" : "var(--text-secondary)" }}>{u.role}</span></td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[u.status] }}>{u.status}</span></td>
                        <td className="px-4 py-3 text-xs">{u.joined}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs font-medium rounded border" style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}>View</button>
                            <button className="px-2 py-1 text-xs font-medium rounded border" style={{ border: "1px solid var(--orange)", color: "var(--orange)" }}>Suspend</button>
                            <button className="px-2 py-1 text-xs font-medium rounded border" style={{ border: "1px solid #C62828", color: "#C62828" }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROVIDERS */}
          {activePage === "providers" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="p-5 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: "var(--border-color)" }}>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-secondary)" />
                  <input placeholder="Search providers..." className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)", background: "var(--secondary)", width: "240px" }} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: "var(--secondary)" }}>{["Provider ID", "Business Name", "Owner", "Category", "Status", "Listings", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {allProviders.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{p.id}</td>
                        <td className="px-4 py-3 font-medium">{p.business}</td>
                        <td className="px-4 py-3 text-xs">{p.owner}</td>
                        <td className="px-4 py-3 text-xs">{p.category}</td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[p.status] }}>{p.status}</span></td>
                        <td className="px-4 py-3 text-xs">{p.listings}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}>View</button>
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--success)", color: "var(--success)" }}>Verify</button>
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid #C62828", color: "#C62828" }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LISTINGS */}
          {activePage === "listings" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="p-5 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: "var(--border-color)" }}>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="var(--text-secondary)" />
                  <input placeholder="Search listings..." className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none" style={{ border: "1px solid var(--border-color)", background: "var(--secondary)", width: "240px" }} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: "var(--secondary)" }}>{["ID", "Title", "Provider", "Category", "Price", "Status", "Rating", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {allListings.map((l) => (
                      <tr key={l.id} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--teal)" }}>{l.id}</td>
                        <td className="px-4 py-3 font-medium text-sm max-w-xs truncate">{l.title}</td>
                        <td className="px-4 py-3 text-xs">{l.provider}</td>
                        <td className="px-4 py-3 text-xs">{l.category}</td>
                        <td className="px-4 py-3 font-semibold text-xs" style={{ color: "var(--teal)" }}>BWP {l.price}</td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[l.status] }}>{l.status}</span></td>
                        <td className="px-4 py-3 text-xs">★ {l.rating}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--teal)", color: "var(--teal)" }}>View</button>
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--orange)", color: "var(--orange)" }}>Feature</button>
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid #C62828", color: "#C62828" }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS */}
          {activePage === "reports" && (
            <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="flex border-b overflow-x-auto" style={{ borderColor: "var(--border-color)" }}>
                {["Listing Reports", "Provider Reports", "Review Reports", "User Reports"].map((tab) => (
                  <button key={tab} onClick={() => setReportTab(tab)} className="px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors" style={{ borderColor: reportTab === tab ? "var(--teal)" : "transparent", color: reportTab === tab ? "var(--teal)" : "var(--text-secondary)" }}>{tab}</button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ background: "var(--secondary)" }}>{["Reported Item", "Reporter", "Reason", "Date", "Status", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
                        <td className="px-4 py-3 font-medium text-sm">{r.item}</td>
                        <td className="px-4 py-3 text-xs">{r.reporter}</td>
                        <td className="px-4 py-3 text-xs">{r.reason}</td>
                        <td className="px-4 py-3 text-xs">{r.date}</td>
                        <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ background: statusColors[r.status] }}>{r.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--success)", color: "var(--success)" }}>Resolve</button>
                            <button className="px-2 py-1 text-xs rounded border" style={{ border: "1px solid var(--text-secondary)", color: "var(--text-secondary)" }}>Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activePage === "settings" && (
            <div className="max-w-2xl flex flex-col gap-6">
              {[
                {
                  title: "General Settings",
                  fields: [
                    { label: "Platform Name", defaultValue: "LeisureSpot" },
                    { label: "Support Email", defaultValue: "support@leisurespot.bw" },
                    { label: "Default Currency", defaultValue: "BWP — Botswana Pula" },
                  ]
                },
                {
                  title: "Commission Settings",
                  fields: [
                    { label: "Platform Fee Percentage", defaultValue: "10" },
                  ]
                },
                {
                  title: "Listing Settings",
                  fields: [
                    { label: "Maximum Images per Listing", defaultValue: "10" },
                    { label: "Maximum Listing Price (BWP)", defaultValue: "50000" },
                  ]
                }
              ].map((section) => (
                <div key={section.title} className="bg-white rounded-xl p-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <h3 className="font-semibold mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>{section.title}</h3>
                  <div className="flex flex-col gap-4">
                    {section.fields.map((f) => (
                      <div key={f.label}>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{f.label}</label>
                        <input defaultValue={f.defaultValue} className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                      </div>
                    ))}
                  </div>
                  <button className="mt-5 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90" style={{ background: "var(--teal)", borderRadius: "8px" }}>
                    Save Changes
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generic placeholder pages */}
          {["bookings", "payments", "reviews", "promotions", "locations", "logs"].includes(activePage) && (
            <div className="bg-white rounded-xl p-8 text-center" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--teal-light)" }}>
                {(() => { const Item = navItems.find((n) => n.id === activePage); return Item ? <Item.icon size={28} color="var(--teal)" /> : null; })()}
              </div>
              <h3 className="font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{navItems.find((n) => n.id === activePage)?.label}</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Full module coming soon. Core features are complete.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
