import { useState } from "react";
import { Eye, EyeOff, MapPin, ArrowLeft } from "lucide-react";

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export function AuthPage({ onNavigate }: AuthPageProps) {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#C62828", "#E8711A", "#2E7D32", "#1B5E7B"];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--secondary)" }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-96 flex-shrink-0"
        style={{ background: "var(--teal)" }}
      >
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
            <MapPin size={16} color="white" />
          </div>
          <span className="text-xl font-bold text-white" style={{ fontFamily: "Poppins, sans-serif" }}>LeisureSpot</span>
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
            Join 15,000+ explorers
          </p>
          <h2 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontSize: "2rem" }}>
            Discover Botswana's best leisure experiences
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "Book safaris, wellness, sports & more",
              "Instant booking confirmation",
              "Secure payments in BWP",
              "Trusted local providers",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--orange)" }}>
                  <span className="text-white text-xs">✓</span>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <p className="text-sm italic mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
            "Booked an incredible Okavango Delta tour in 5 minutes. Best platform for Botswana experiences!"
          </p>
          <p className="text-xs font-semibold text-white">Kefilwe M. — Gaborone</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <button
          onClick={() => onNavigate("landing")}
          className="mb-8 flex items-center gap-2 text-sm transition-colors hover:text-[#1B5E7B] self-start ml-0 lg:ml-8"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div
          className="w-full max-w-md bg-white rounded-2xl p-8"
          style={{ borderRadius: "16px", boxShadow: "var(--shadow-card)" }}
        >
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8" style={{ background: "var(--secondary)" }}>
            {(["signin", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "var(--teal)" : "var(--text-secondary)",
                  boxShadow: tab === t ? "var(--shadow-card)" : "none",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {tab === "signin" ? (
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onNavigate("customer-dashboard"); }}>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="kefilwe@example.com"
                  defaultValue="kefilwe@example.com"
                  className="w-full px-4 py-3 rounded-lg outline-none text-sm transition-all focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    defaultValue="password123"
                    className="w-full px-4 py-3 pr-12 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Remember me</span>
                </label>
                <button type="button" className="text-sm font-medium" style={{ color: "var(--teal)" }}>
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg mt-2 transition-opacity hover:opacity-90"
                style={{ background: "var(--orange)", borderRadius: "8px", height: "48px" }}
              >
                Sign In
              </button>

              <div className="relative flex items-center gap-4 my-2">
                <div className="flex-1 h-px" style={{ background: "var(--border-color)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Or continue with</span>
                <div className="flex-1 h-px" style={{ background: "var(--border-color)" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Don't have an account?{" "}
                <button type="button" onClick={() => setTab("register")} className="font-semibold" style={{ color: "var(--teal)" }}>
                  Create Account
                </button>
              </p>
            </form>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onNavigate("customer-dashboard"); }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>First Name</label>
                  <input
                    type="text"
                    placeholder="Kefilwe"
                    className="w-full px-4 py-3 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Moeti"
                    className="w-full px-4 py-3 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="kefilwe@example.com"
                  className="w-full px-4 py-3 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+267 7X XXX XXXX"
                  className="w-full px-4 py-3 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                  style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{ background: i <= strengthScore ? strengthColors[strengthScore] : "#E0E0E0" }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[strengthScore] }}>
                      {strengthLabels[strengthScore]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-3 pr-12 rounded-lg outline-none text-sm focus:ring-2 focus:ring-[#1B5E7B]"
                    style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showConfirm ? <EyeOff size={16} color="var(--text-secondary)" /> : <Eye size={16} color="var(--text-secondary)" />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="mt-0.5 rounded" required />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  I agree to the{" "}
                  <button type="button" className="font-medium" style={{ color: "var(--teal)" }}>Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" className="font-medium" style={{ color: "var(--teal)" }}>Privacy Policy</button>
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 text-white font-semibold rounded-lg mt-1 transition-opacity hover:opacity-90"
                style={{ background: "var(--orange)", borderRadius: "8px", height: "48px" }}
              >
                Create Account
              </button>

              <div className="relative flex items-center gap-4 my-1">
                <div className="flex-1 h-px" style={{ background: "var(--border-color)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Or continue with</span>
                <div className="flex-1 h-px" style={{ background: "var(--border-color)" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50" style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50" style={{ border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("signin")} className="font-semibold" style={{ color: "var(--teal)" }}>
                  Sign In
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
