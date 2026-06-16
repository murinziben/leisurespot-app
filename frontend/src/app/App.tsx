import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { ListingsPage } from "./components/ListingsPage";
import { ListingDetailPage } from "./components/ListingDetailPage";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { ProviderDashboard } from "./components/ProviderDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { BookingPage } from "./components/BookingPage";

type Page =
  | "landing"
  | "auth"
  | "listings"
  | "listing-detail"
  | "customer-dashboard"
  | "provider-dashboard"
  | "admin-dashboard"
  | "booking";

export default function App() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (target: string) => {
    if (
      [
        "landing", "auth", "listings", "listing-detail",
        "customer-dashboard", "provider-dashboard",
        "admin-dashboard", "booking",
      ].includes(target)
    ) {
      setPage(target as Page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      {page === "landing" && <LandingPage onNavigate={navigate} />}
      {page === "auth" && <AuthPage onNavigate={navigate} />}
      {page === "listings" && <ListingsPage onNavigate={navigate} />}
      {page === "listing-detail" && <ListingDetailPage onNavigate={navigate} />}
      {page === "customer-dashboard" && <CustomerDashboard onNavigate={navigate} />}
      {page === "provider-dashboard" && <ProviderDashboard onNavigate={navigate} />}
      {page === "admin-dashboard" && <AdminDashboard onNavigate={navigate} />}
      {page === "booking" && <BookingPage onNavigate={navigate} />}

      {/* Global page switcher — floating dev nav */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-wrap gap-1.5 items-center justify-center px-4 py-3 rounded-2xl shadow-2xl"
        style={{ background: "rgba(27,94,123,0.95)", backdropFilter: "blur(10px)", maxWidth: "calc(100vw - 32px)" }}
      >
        {[
          { id: "landing", label: "Landing" },
          { id: "auth", label: "Auth" },
          { id: "listings", label: "Listings" },
          { id: "listing-detail", label: "Detail" },
          { id: "customer-dashboard", label: "Customer" },
          { id: "provider-dashboard", label: "Provider" },
          { id: "admin-dashboard", label: "Admin" },
          { id: "booking", label: "Booking" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(p.id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: page === p.id ? "white" : "rgba(255,255,255,0.15)",
              color: page === p.id ? "var(--teal)" : "rgba(255,255,255,0.9)",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
