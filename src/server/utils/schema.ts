import { business, env } from "../config/env.js";

export function organizationSchema(includeRating = false): Record<string, unknown> {
  // The verified Google Business Profile belongs in sameAs alongside social
  // profiles — it's the strongest signal tying this website to the real,
  // Google-verified business entity (helps local pack / Knowledge Panel / AI
  // answers resolve them as the same organization rather than two entities).
  const sameAs: string[] = [
    ...Object.values(business.social).filter((url) => url !== ""),
    ...(business.googleBusinessProfile ? [business.googleBusinessProfile] : [])
  ];
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${env.siteUrl}/#organization`,
    name: business.name,
    // Exact-string match to the verified Google Business Profile listing name
    // ("YOGI TOURS AND TRAVELS") — the on-site name uses "&" and different
    // capitalization, so this keeps entity resolution between the site and
    // the Maps listing unambiguous even though the strings differ slightly.
    alternateName: "Yogi Tours and Travels",
    description: business.description,
    url: env.siteUrl,
    telephone: business.whatsapp,
    email: business.email,
    // Google's own Knowledge Graph ID for this business — an explicit,
    // unambiguous entity identifier rather than relying on name/address matching.
    ...(business.googleKnowledgeGraphId
      ? {
          identifier: {
            "@type": "PropertyValue",
            propertyID: "Google Knowledge Graph ID",
            value: business.googleKnowledgeGraphId
          }
        }
      : {}),
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
    // Google's review-snippet spam policy targets aggregateRating markup that
    // appears on pages not substantively about the rated entity (e.g. the
    // same badge repeated on every blog post or legal page). Keep it only on
    // pages that opt in — home, about, contact — where the whole page is
    // about this business.
    ...(includeRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.googleRating.value,
            reviewCount: business.googleRating.count
          }
        }
      : {}),
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

export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
  /** Raw DB "YYYY-MM-DD HH:MM:SS" updatedAt — converted to ISO 8601. Freshness signal for AI answer engines (ChatGPT/Gemini/Claude) deciding whether cached page content is still current. */
  dateModified?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: { "@type": "City", name: "Bangalore" },
    ...(input.dateModified ? { dateModified: toIso(input.dateModified) } : {})
  };
}

export function vehicleServiceSchema(input: {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  /** Real confirmed per-km rate in INR — omitted (no `offers` block) rather than faked when not yet confirmed. */
  ratePerKm?: number | null;
  /** Raw DB "YYYY-MM-DD HH:MM:SS" updatedAt — converted to ISO 8601. */
  dateModified?: string;
}): Record<string, unknown> {
  // A chauffeur-driven vehicle-for-hire is a rental service, not a purchasable
  // good — "Service" matches what's actually being sold; "Product" implies
  // Merchant-listing eligibility (priceValidUntil, shipping, etc.) this isn't.
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.name,
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: { "@type": "City", name: "Bangalore", alternateName: "Bengaluru" },
    ...(input.dateModified ? { dateModified: toIso(input.dateModified) } : {}),
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
  /** Raw DB "YYYY-MM-DD HH:MM:SS" updatedAt — converted to ISO 8601. Omitted for statically-configured routes (TRIP_ROUTES) that have no updatedAt of their own. */
  dateModified?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: input.name,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    ...(input.dateModified ? { dateModified: toIso(input.dateModified) } : {})
  };
}

/**
 * DB timestamps are normally stored as plain "YYYY-MM-DD HH:MM:SS" (no
 * timezone — treated as UTC by appending "Z" before parsing). Some rows
 * predate that convention and already carry their own offset, e.g.
 * "2026-08-13 20:11:57.28099+00" from when a column was timestamptz — for
 * those, appending another "Z" produces an invalid double-offset string
 * that Date silently rejects, so this checks for an existing Z/±HH[:MM]
 * suffix first and leaves the string alone (space-and-offset format parses
 * fine on its own) rather than assuming the plain-format case unconditionally.
 */
export function toIso(dbTimestamp: string): string {
  const trimmed = dbTimestamp.trim();
  const hasOffset = /(Z|[+-]\d{2}(:?\d{2})?)$/.test(trimmed);
  const candidate = hasOffset ? trimmed : `${trimmed.replace(" ", "T")}Z`;
  const d = new Date(candidate);
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

/**
 * WebSite entity, tied to the organization via publisher/@id so search and AI
 * engines resolve the site and the business as one entity rather than two.
 * Deliberately omits SearchAction — this site has no internal search endpoint,
 * and declaring one Google can't actually use is invalid structured data.
 */
export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${env.siteUrl}/#website`,
    url: env.siteUrl,
    name: business.name,
    alternateName: "Yogi Tours and Travels",
    description: business.description,
    inLanguage: "en-IN",
    publisher: { "@id": `${env.siteUrl}/#organization` }
  };
}

/**
 * Marks the page's FAQ block as safe to read aloud/quote verbatim — the
 * `SpeakableSpecification` property Google Assistant and other AI answer
 * surfaces (ChatGPT, Gemini, Claude included, where the underlying crawler
 * respects it) use to pick which part of a page is a clean, self-contained
 * answer rather than pulling from the whole page and misquoting surrounding
 * nav/CTA copy. `cssSelectors` must match real ids/classes present in the
 * rendered HTML of the same page (each faqSchema()-emitting route wraps its
 * visible FAQ block in `id="faq"` specifically so this can target it).
 */
export function speakableSchema(canonicalPath: string, cssSelectors: string[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${env.siteUrl}${canonicalPath}`,
    url: `${env.siteUrl}${canonicalPath}`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors
    }
  };
}
