import { business, env } from "../config/env.js";

export function organizationSchema(): Record<string, unknown> {
  const sameAs: string[] = Object.values(business.social).filter((url) => url !== "");
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${env.siteUrl}/#organization`,
    name: business.name,
    description: business.description,
    url: env.siteUrl,
    telephone: business.whatsapp,
    email: business.email,
    // Real, existing site assets — Google's LocalBusiness rich-result
    // eligibility looks for both an "image" and a "logo".
    image: [`${env.siteUrl}/assets/images/og-default.png`],
    logo: `${env.siteUrl}/assets/images/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.addressLine)}`,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59"
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: business.googleRating.value,
      reviewCount: business.googleRating.count
    },
    // First entry carries the "Bengaluru"/"Bangalore" dual-name explicitly so
    // search & AI engines resolve both spellings to the same served city;
    // the rest are the specific localities we operate in day-to-day.
    areaServed: [
      { "@type": "City", name: "Bangalore", alternateName: "Bengaluru" },
      ...business.areaServed.filter((a) => a !== "Bangalore").map((a) => ({ "@type": "City", name: a }))
    ],
    // Local/day-trip operating radius around Bengaluru — longer named
    // outstation routes (Goa, Chennai, Hyderabad etc.) are declared
    // separately as TouristTrip/Service schema on their own route pages.
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: { "@type": "GeoCoordinates", latitude: business.geo.latitude, longitude: business.geo.longitude },
      geoRadius: String(business.serviceRadiusKm * 1000)
    },
    priceRange: "$$",
    ...(sameAs.length ? { sameAs } : {})
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${env.siteUrl}${item.url}`
    }))
  };
}

export function faqSchema(faqs: Array<{ question: string; answer: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer }
    }))
  };
}

export function serviceSchema(input: { name: string; description: string; url: string }): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: { "@type": "City", name: "Bangalore" }
  };
}

export function productVehicleSchema(input: {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  /** Real confirmed per-km rate in INR — omitted (no `offers` block) rather than faked when not yet confirmed. */
  ratePerKm?: number | null;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    brand: { "@type": "Organization", name: business.name },
    ...(input.ratePerKm
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: String(input.ratePerKm),
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: String(input.ratePerKm),
              priceCurrency: "INR",
              unitText: "per kilometre"
            },
            availability: "https://schema.org/InStock",
            url: `${env.siteUrl}${input.url}`,
            description: "Per-kilometre rate — final quotation confirmed on enquiry.",
            areaServed: { "@type": "City", name: "Bangalore", alternateName: "Bengaluru" }
          }
        }
      : {})
  };
}

export function touristTripSchema(input: {
  name: string;
  description: string;
  url: string;
  duration: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    provider: { "@id": `${env.siteUrl}/#organization` }
  };
}

/** DB timestamps are stored as "YYYY-MM-DD HH:MM:SS" — schema.org/Google want real ISO 8601 ("...T...Z"). */
function toIso(dbTimestamp: string): string {
  const d = new Date(dbTimestamp.includes("T") ? dbTimestamp : `${dbTimestamp.replace(" ", "T")}Z`);
  return Number.isNaN(d.getTime()) ? dbTimestamp : d.toISOString();
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  /** Absolute image URL — real cover photo, not the generic site default. */
  image?: string;
  /** Real places/topics the post is substantively about, for entity grounding (GEO/AEO). */
  mentions?: Array<{ name: string; type?: string }>;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    datePublished: toIso(input.datePublished),
    dateModified: toIso(input.dateModified ?? input.datePublished),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${env.siteUrl}${input.url}` },
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.mentions?.length
      ? { mentions: input.mentions.map((m) => ({ "@type": m.type ?? "Place", name: m.name })) }
      : {}),
    author: { "@type": "Organization", name: input.author },
    publisher: { "@id": `${env.siteUrl}/#organization` }
  };
}
