// Shared domain types used by the DB layer, routes and views.

export type VehicleCategory = "car" | "tempo-traveller" | "mini-bus" | "tourist-bus";

export interface Vehicle {
  id: number;
  category: VehicleCategory;
  name: string;
  slug: string;
  seats: number;
  luggage: string;
  ac: 0 | 1;
  tagline: string;
  description: string;
  features: string; // JSON-encoded string[]
  imageKey: string;
  /** Additional real photos (side/rear/interior) shown on the detail page — JSON-encoded string[]. The card everywhere else always uses imageKey (the front view) only. */
  gallery: string;
  /** Self-declared service tier shown as a badge, e.g. "Economy", "Compact SUV" — not a third-party rating. */
  vehicleClass: string;
  /** Self-declared 1–5 star display rating (not aggregated from real reviews) — null hides the star badge entirely. */
  rating: number | null;
  /** Real per-km rate in ₹, where we have one confirmed — null means "Get Best Quote" (no invented pricing). */
  ratePerKm: number | null;
  featured: 0 | 1;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  shortDescription: string;
  description: string;
  highlights: string; // JSON-encoded string[]
  imageKey: string;
  featured: 0 | 1;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TravelCategory =
  | "Hill Station"
  | "Heritage"
  | "Wildlife & Nature"
  | "Beach"
  | "Backwaters"
  | "Pilgrimage";

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  destination: string;
  travelCategory: TravelCategory;
  duration: string;
  startLocation: string;
  idealFor: string;
  highlights: string; // JSON-encoded string[]
  vehicleOptions: string; // JSON-encoded string[]
  description: string;
  imageKey: string;
  featured: 0 | 1;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: number;
  name: string;
  rating: number;
  review: string;
  tripType: string;
  isPlaceholder: 0 | 1;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type GalleryCategory = "Vehicles" | "Tours" | "Group Travel" | "Corporate" | "Weddings" | "Destinations";

export interface GalleryItem {
  id: number;
  category: GalleryCategory;
  imageKey: string;
  caption: string;
  altText: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML-safe stored markup (paragraphs)
  coverImageKey: string;
  author: string;
  published: 0 | 1;
  publishedAt: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type EnquiryType = "outstation" | "local" | "airport" | "quote" | "contact" | "package" | "vehicle";
export type EnquiryStatus = "new" | "contacted" | "closed";

export interface Enquiry {
  id: number;
  type: EnquiryType;
  name: string;
  phone: string;
  email: string | null;
  pickupLocation: string | null;
  destination: string | null;
  tripType: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  vehicleType: string | null;
  passengers: string | null;
  message: string | null;
  sourcePage: string | null;
  status: EnquiryStatus;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  passwordHash: string;
  resetTokenHash: string | null;
  resetTokenExpires: string | null;
  createdAt: string;
}

export interface NavLink {
  label: string;
  href: string;
  match: string;
}
