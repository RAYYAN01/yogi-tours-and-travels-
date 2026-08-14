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
    "Yogi Tours & Travels is a Bangalore-based tours and travels agency offering car rentals, Tempo Traveller and mini bus hire, tourist bus rental, airport transfers, outstation cabs and customised tour packages across Karnataka and South India.",
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
  googleBusinessProfile: "",
  mapsEmbed: ""
} as const;

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
