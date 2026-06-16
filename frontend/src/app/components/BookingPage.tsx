import { useState } from "react";
import { Check, Shield, Download, Home, ChevronRight, CreditCard, Smartphone } from "lucide-react";
import { Navbar } from "./Navbar";

interface BookingPageProps {
  onNavigate: (page: string) => void;
}

export function BookingPage({ onNavigate }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [paymentTab, setPaymentTab] = useState<"card" | "mobile">("card");
  const [showCvv, setShowCvv] = useState(false);
  const [mobileNetwork, setMobileNetwork] = useState("orange");

  const booking = {
    title: "Chobe National Park Full-Day Safari",
    provider: "Wilderness Expeditions",
    image: "https://images.unsplash.com/photo-1577971132997-c10be9372519",
    date: "Saturday, 20 June 2026",
    time: "07:00 AM",
    guests: 2,
    pricePerPerson: 850,
  };

  const subtotal = booking.pricePerPerson * booking.guests;
  const platformFee = Math.round(subtotal * 0.05);
  const total = subtotal + platformFee;
  const ref = "LS-2026-0042";

  const stepLabels = ["Review Booking", "Payment", "Confirmation"];

  return (
    <div className="min-h-screen" style={{ background: "var(--secondary)" }}>
      <Navbar onNavigate={onNavigate} currentPage="booking" />

      <div className="pt-16">
        {/* Progress bar */}
        <div className="bg-white border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="flex items-center gap-0">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        background: step > i + 1 ? "var(--success)" : step === i + 1 ? "var(--teal)" : "var(--secondary)",
                        color: step >= i + 1 ? "white" : "var(--text-secondary)",
                        border: step <= i ? "2px solid var(--border-color)" : "none",
                      }}
                    >
                      {step > i + 1 ? <Check size={16} /> : i + 1}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap hidden sm:block" style={{ color: step === i + 1 ? "var(--teal)" : "var(--text-secondary)" }}>
                      {label}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3" style={{ background: step > i + 1 ? "var(--teal)" : "var(--border-color)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* STEP 1 — Review Booking */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>Review Your Booking</h2>
              <div className="bg-white rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                <div className="flex gap-0">
                  <img src={`${booking.image}?w=300&h=200&fit=crop&auto=format`} alt={booking.title} className="w-36 sm:w-48 object-cover flex-shrink-0" />
                  <div className="p-5 flex-1">
                    <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: "var(--teal)" }}>Safari</span>
                    <h3 className="mt-2 font-bold text-base" style={{ fontFamily: "Poppins, sans-serif" }}>{booking.title}</h3>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{booking.provider}</p>
                    <div className="mt-3 flex flex-col gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <p>📅 {booking.date}</p>
                      <p>🕖 {booking.time}</p>
                      <p>👥 {booking.guests} guests</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t" style={{ borderColor: "var(--border-color)", background: "var(--secondary)" }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Price Breakdown</h4>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>BWP {booking.pricePerPerson} × {booking.guests} guests</span>
                      <span>BWP {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>Platform fee (5%)</span>
                      <span>BWP {platformFee}</span>
                    </div>
                    <hr style={{ borderColor: "var(--border-color)" }} />
                    <div className="flex justify-between font-bold">
                      <span style={{ fontFamily: "Poppins, sans-serif" }}>Total</span>
                      <span style={{ color: "var(--teal)", fontFamily: "Poppins, sans-serif" }}>BWP {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ background: "var(--teal-light)", border: "1px solid var(--teal)" }}>
                <Shield size={18} color="var(--teal)" />
                <p className="text-sm" style={{ color: "var(--teal)" }}>
                  <strong>Free cancellation</strong> up to 48 hours before your experience. No payment charged until provider confirms.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 text-white font-bold rounded-xl text-base transition-opacity hover:opacity-90"
                style={{ background: "var(--orange)", borderRadius: "12px", height: "52px" }}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Order summary */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  <h3 className="font-semibold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Order Summary</h3>
                  <img src={`${booking.image}?w=400&h=200&fit=crop&auto=format`} alt={booking.title} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <p className="font-semibold text-sm mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{booking.title}</p>
                  <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{booking.date} · {booking.guests} guests</p>
                  <hr style={{ borderColor: "var(--border-color)" }} className="my-3" />
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                      <span>BWP {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Platform fee</span>
                      <span>BWP {platformFee}</span>
                    </div>
                    <hr style={{ borderColor: "var(--border-color)" }} className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span style={{ color: "var(--teal)" }}>BWP {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <div className="lg:col-span-3">
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Poppins, sans-serif" }}>Payment Details</h2>

                {/* Tabs */}
                <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--secondary)", border: "1px solid var(--border-color)" }}>
                  {([["card", CreditCard, "Card Payment"], ["mobile", Smartphone, "Mobile Money"]] as const).map(([tab, Icon, label]) => (
                    <button
                      key={tab}
                      onClick={() => setPaymentTab(tab as "card" | "mobile")}
                      className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                      style={{
                        background: paymentTab === tab ? "white" : "transparent",
                        color: paymentTab === tab ? "var(--teal)" : "var(--text-secondary)",
                        boxShadow: paymentTab === tab ? "var(--shadow-card)" : "none",
                      }}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                  {paymentTab === "card" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Cardholder Name</label>
                        <input placeholder="Kefilwe Moeti" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Card Number</label>
                        <div className="relative">
                          <input placeholder="4242 4242 4242 4242" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B] pr-16" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                            <div className="w-6 h-4 rounded-sm" style={{ background: "#1A1F71" }} />
                            <div className="w-6 h-4 rounded-sm" style={{ background: "#FF5F00" }} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Expiry Date</label>
                          <input placeholder="MM / YY" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>CVV</label>
                          <input type={showCvv ? "text" : "password"} placeholder="•••" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" style={{ accentColor: "var(--teal)" }} />
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Save card for future bookings</span>
                      </label>
                    </div>
                  )}

                  {paymentTab === "mobile" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Select Network</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: "orange", name: "Orange Money", color: "#FF6600" },
                            { id: "mascom", name: "Mascom MyZaka", color: "#0066CC" },
                          ].map((net) => (
                            <button
                              key={net.id}
                              onClick={() => setMobileNetwork(net.id)}
                              className="p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all"
                              style={{
                                borderColor: mobileNetwork === net.id ? net.color : "var(--border-color)",
                                background: mobileNetwork === net.id ? `${net.color}10` : "white",
                              }}
                            >
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: net.color }}>
                                <Smartphone size={18} color="white" />
                              </div>
                              <span className="text-sm font-semibold" style={{ color: net.color }}>{net.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Mobile Number</label>
                        <input placeholder="+267 7X XXX XXXX" className="w-full px-4 py-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[#1B5E7B]" style={{ border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--secondary)" }} />
                        <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>You will receive a PIN prompt on your phone to confirm payment.</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(3)}
                    className="w-full mt-6 py-3 text-white font-bold rounded-xl text-base transition-opacity hover:opacity-90"
                    style={{ background: "var(--orange)", borderRadius: "12px", height: "52px" }}
                  >
                    Pay BWP {total.toLocaleString()}
                  </button>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-5 mt-5">
                  {["SSL Secured", "256-bit Encryption", "PCI Compliant", "Instant Confirmation"].map((badge) => (
                    <div key={badge} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <Shield size={13} color="var(--success)" />
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Confirmation */}
          {step === 3 && (
            <div className="text-center py-8">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "var(--success)", boxShadow: "0 0 0 12px rgba(46,125,50,0.1)" }}
              >
                <Check size={40} color="white" strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Poppins, sans-serif", color: "var(--success)" }}>
                Booking Confirmed!
              </h1>
              <p className="text-base mb-2" style={{ color: "var(--text-secondary)" }}>
                Your booking reference number is:
              </p>
              <div
                className="inline-block px-6 py-3 rounded-xl text-xl font-bold mb-8"
                style={{ background: "var(--teal-light)", color: "var(--teal)", fontFamily: "monospace", border: "2px dashed var(--teal)" }}
              >
                {ref}
              </div>

              {/* Booking summary */}
              <div className="bg-white rounded-2xl p-6 text-left mb-8 mx-auto max-w-sm" style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}>
                <img src={`${booking.image}?w=400&h=200&fit=crop&auto=format`} alt={booking.title} className="w-full h-36 object-cover rounded-xl mb-4" />
                <h3 className="font-bold text-base mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{booking.title}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{booking.provider}</p>
                <div className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>📅 {booking.date}</p>
                  <p>🕖 {booking.time}</p>
                  <p>👥 {booking.guests} guests</p>
                  <p className="font-bold mt-1" style={{ color: "var(--teal)" }}>Total Paid: BWP {total.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-8 py-3 font-semibold rounded-xl border-2 flex items-center gap-2 justify-center transition-colors hover:bg-[#1B5E7B] hover:text-white"
                  style={{ borderColor: "var(--teal)", color: "var(--teal)", borderRadius: "12px" }}
                >
                  <Download size={18} />
                  Download Receipt
                </button>
                <button
                  onClick={() => onNavigate("landing")}
                  className="px-8 py-3 font-semibold text-white rounded-xl flex items-center gap-2 justify-center transition-opacity hover:opacity-90"
                  style={{ background: "var(--orange)", borderRadius: "12px" }}
                >
                  <Home size={18} />
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
