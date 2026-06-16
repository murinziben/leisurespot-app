import { MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{ background: "#1A1A2E", color: "#ffffff" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--teal)" }}>
                <MapPin size={16} color="white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>LeisureSpot</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#aaaaaa" }}>
              Discover and book the best leisure experiences in Botswana. Safaris, wellness, sports, events, and more — all in one place.
            </p>
            <p className="text-xs" style={{ color: "#888888" }}>📍 Gaborone, Botswana</p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "#cccccc", fontFamily: "Poppins, sans-serif" }}>Company</h4>
            <ul className="flex flex-col gap-3">
              {["About Us", "Careers", "Blog", "Press"].map((item) => (
                <li key={item}>
                  <button className="text-sm hover:text-white transition-colors" style={{ color: "#aaaaaa" }}>{item}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "#cccccc", fontFamily: "Poppins, sans-serif" }}>Support</h4>
            <ul className="flex flex-col gap-3">
              {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <button className="text-sm hover:text-white transition-colors" style={{ color: "#aaaaaa" }}>{item}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: "#cccccc", fontFamily: "Poppins, sans-serif" }}>Stay Updated</h4>
            <p className="text-sm mb-4" style={{ color: "#aaaaaa" }}>
              Get the latest experiences and deals delivered to your inbox.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm rounded-lg outline-none"
                style={{ background: "#2a2a3e", border: "1px solid #444", color: "#fff", borderRadius: "8px" }}
              />
              <button
                className="w-full py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ background: "var(--orange)", borderRadius: "8px" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid #333" }}>
          <p className="text-xs" style={{ color: "#888888" }}>
            © 2026 LeisureSpot. All rights reserved. Made in Botswana 🇧🇼
          </p>
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[#1B5E7B]" style={{ background: "#2a2a3e" }}>
                <Icon size={15} color="#aaaaaa" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
