import { MapPin, Star } from "lucide-react";

export interface Listing {
  id: string;
  image: string;
  category: string;
  title: string;
  provider: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
}

interface ListingCardProps {
  listing: Listing;
  onNavigate?: (page: string) => void;
}

export function ListingCard({ listing, onNavigate }: ListingCardProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
      style={{ borderRadius: "12px", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}
      onClick={() => onNavigate?.("listing-detail")}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={`${listing.image}&w=600&h=400&fit=crop&auto=format`}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {/* Category pill */}
        <span
          className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full"
          style={{ background: "var(--teal)", borderRadius: "24px" }}
        >
          {listing.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3
          className="text-base font-semibold leading-tight"
          style={{ fontFamily: "Poppins, sans-serif", color: "var(--text-primary)" }}
        >
          {listing.title}
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{listing.provider}</p>

        <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          <MapPin size={13} />
          <span>{listing.location}</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              fill={i < Math.floor(listing.rating) ? "#E8711A" : "none"}
              color={i < Math.floor(listing.rating) ? "#E8711A" : "#cccccc"}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>({listing.reviews})</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
          <div>
            <span className="text-lg font-bold" style={{ color: "var(--orange)", fontFamily: "Poppins, sans-serif" }}>
              BWP {listing.price}
            </span>
            <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>/person</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate?.("booking"); }}
            className="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: "var(--orange)", borderRadius: "8px" }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export const SAMPLE_LISTINGS: Listing[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1577971132997-c10be9372519",
    category: "Safari",
    title: "Chobe National Park Full-Day Safari",
    provider: "Wilderness Expeditions",
    location: "Kasane, Botswana",
    rating: 5,
    reviews: 142,
    price: 850,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
    category: "Dining",
    title: "Sunset Dinner at Molapo Crossing",
    provider: "Molapo Crossing Restaurant",
    location: "Gaborone, Botswana",
    rating: 4,
    reviews: 89,
    price: 320,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1765910639954-27ae0c260586",
    category: "Wellness",
    title: "Traditional African Spa Day Experience",
    provider: "Ubuntu Wellness Centre",
    location: "Gaborone, Botswana",
    rating: 5,
    reviews: 67,
    price: 450,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
    category: "Events",
    title: "Botswana Music & Arts Festival",
    provider: "Gaborone Events Co.",
    location: "Gaborone, Botswana",
    rating: 4,
    reviews: 203,
    price: 180,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1498038116800-4159eb9b2a62",
    category: "Sports",
    title: "Okavango Delta Mokoro Canoeing",
    provider: "Delta Adventures",
    location: "Maun, Botswana",
    rating: 5,
    reviews: 118,
    price: 620,
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1633539656390-142a7e8573a0",
    category: "Family",
    title: "Gaborone Game Reserve Family Safari",
    provider: "Family Wild Safaris",
    location: "Gaborone, Botswana",
    rating: 4,
    reviews: 94,
    price: 390,
  },
];
