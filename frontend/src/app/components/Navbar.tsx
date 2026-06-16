import { useState } from "react";
import { Menu, X, MapPin } from "lucide-react";

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Discover", page: "listings" },
    { label: "Experiences", page: "listings" },
    { label: "How It Works", page: "landing" },
    { label: "For Providers", page: "provider-dashboard" },
    { label: "About", page: "landing" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b"
      style={{ borderColor: "var(--border-color)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--teal)" }}
            >
              <MapPin size={16} color="white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "Poppins, sans-serif", color: "var(--teal)" }}
            >
              LeisureSpot
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => onNavigate(l.page)}
                className="text-sm font-medium transition-colors hover:text-[#1B5E7B]"
                style={{ color: "var(--text-secondary)", fontFamily: "Inter, sans-serif" }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate("auth")}
              className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-[#1B5E7B] hover:text-white"
              style={{ borderColor: "var(--teal)", color: "var(--teal)", borderRadius: "8px" }}
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate("auth")}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
              style={{ background: "var(--orange)", borderRadius: "8px", height: "40px" }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor: "var(--border-color)" }}>
          {links.map((l) => (
            <button
              key={l.label}
              onClick={() => { onNavigate(l.page); setMobileOpen(false); }}
              className="text-left py-2 text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {l.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
            <button
              onClick={() => { onNavigate("auth"); setMobileOpen(false); }}
              className="w-full py-2 text-sm font-medium rounded-lg border"
              style={{ borderColor: "var(--teal)", color: "var(--teal)" }}
            >
              Sign In
            </button>
            <button
              onClick={() => { onNavigate("auth"); setMobileOpen(false); }}
              className="w-full py-2 text-sm font-medium text-white rounded-lg"
              style={{ background: "var(--orange)" }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
