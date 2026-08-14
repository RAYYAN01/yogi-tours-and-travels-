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
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.streetAddress,
      addressLocality: business.address.addressLocality,
      addressRegion: business.address.addressRegion,
      postalCode: business.address.postalCode,
      addressCountry: business.address.addressCountry
    },
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
    areaServed: business.areaServed.map((a) => ({ "@type": "City", name: a })),
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
            description: "Per-kilometre rate — final quotation confirmed on enquiry."
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

export function blogPostingSchema(input: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  author: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: `${env.siteUrl}${input.url}`,
    datePublished: input.datePublished,
    author: { "@type": "Organization", name: input.author },
    publisher: { "@id": `${env.siteUrl}/#organization` }
  };
}
