import "dotenv/config";

function required(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  siteUrl: required("SITE_URL", "http://localhost:3000"),
  /** GA4 Measurement ID (e.g. "G-XXXXXXX") — leave unset to skip loading Google Analytics entirely. */
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || "",
  /** Google Search Console HTML-tag verification token (the content= value only, not the whole meta tag) — leave unset to skip the tag. */
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || "",
  sessionSecret: required("SESSION_SECRET", "dev-secret-change-me"),
  /** Postgres connection string (e.g. from Vercel Postgres/Neon/Supabase). Required in production. */
  databaseUrl: process.env.DATABASE_URL || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    notifyTo: process.env.NOTIFY_EMAIL_TO || ""
  }
} as const;

export const business = {
  name: "Yogi Tours & Travels",
  shortName: "Yogi Tours & Travels",
  tagline: "Travel Comfortably. Explore Freely.",
  description:
    "Yogi Tours & Travels is a Bengaluru (Bangalore)-based tours and travels agency — serving India's Silicon City and areas up to 150 km around it — offering car rentals, Tempo Traveller and mini bus hire, tourist bus rental, airport transfers, outstation cabs and customised tour packages across Karnataka and South India.",
  phone: process.env.BUSINESS_PHONE || "+91 90000 00000",
  whatsapp: process.env.BUSINESS_WHATSAPP || "+91 90000 00000",
  email: process.env.BUSINESS_EMAIL || "info@yogitourstravels.com",
  // Real address + rating, sourced directly from the verified Google Business
  // Profile ("YOGI TOURS AND TRAVELS", Bengaluru) — the phone number on that
  // profile matches business.whatsapp above, confirming it's the same business.
  addressLine: "326, 1st Main Rd, KCHS Layout, Bhuvaneshwari Nagar, Nagadevana Halli, Bengaluru, Karnataka 560056",
  address: {
    streetAddress: "326, 1st Main Rd, KCHS Layout, Bhuvaneshwari Nagar, Nagadevana Halli",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560056",
    addressCountry: "IN"
  },
  // Neighbourhood-level coordinates for Nagadevanahalli, Bengaluru 560056 —
  // geocoded from the real address above via OpenStreetMap Nominatim (not
  // fabricated). Precise enough for schema.org GeoCoordinates/GeoCircle;
  // not claimed as a rooftop-exact pin.
  geo: { latitude: 12.9361617, longitude: 77.4940345 },
  /** Real-world outstation service radius we consistently quote for — matches the routes actually listed on the site (Mysore, Coorg, Chikmagalur etc. sit within it; longer ones like Goa/Chennai/Hyderabad are quoted individually). */
  serviceRadiusKm: 150,
  /** Google Business Profile shows "Open 24 hours". */
  openingHours: "24/7",
  /** Real rating from the verified Google Business Profile as of 2026-08-14 — update if it changes. */
  googleRating: { value: 4.9, count: 210 },
  areaServed: [
    "Bangalore",
    "Whitefield",
    "Electronic City",
    "Koramangala",
    "HSR Layout",
    "Jayanagar",
    "JP Nagar",
    "Indiranagar",
    "Yelahanka",
    "Hebbal",
    "Marathahalli",
    "Rajajinagar"
  ],
  social: {
    facebook: "",
    instagram: "https://www.instagram.com/yogi_travels93/",
    youtube: "",
    twitter: ""
  },
  // Verified Google Business Profile, supplied by the owner via their own
  // "Share" link (https://share.google/aoUumyZBQXRl3AGOK), which resolves to
  // Google Knowledge Graph entity /g/11ld89nkjl "YOGI TOURS AND TRAVELS".
  // Stored as the clean kgmid URL rather than the share short-link so it has
  // no tracking parameters and points at a stable entity identifier.
  googleBusinessProfile: "https://www.google.com/search?kgmid=/g/11ld89nkjl",
  /** Google Knowledge Graph machine ID for this business — used as a schema.org identifier so search/AI engines tie this site to the verified listing. */
  googleKnowledgeGraphId: "/g/11ld89nkjl"
} as const;

/** No-API-key Google Maps embed URL, pinned to the real geocoded coordinates above. Used for the embedded map on /contact and location pages. */
export const mapsEmbedUrl = `https://www.google.com/maps?q=${business.geo.latitude},${business.geo.longitude}&z=15&output=embed`;

/** WhatsApp number stripped of everything except leading + and digits, for wa.me links. */
export function whatsappDigits(): string {
  return business.whatsapp.replace(/[^\d]/g, "");
}

export function telHref(): string {
  return `tel:${business.phone.replace(/\s+/g, "")}`;
}

export function mailtoHref(subject?: string): string {
  return `mailto:${business.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
