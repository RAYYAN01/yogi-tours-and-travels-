import { vehiclesRepo, servicesRepo, packagesRepo, faqsRepo, testimonialsRepo, galleryRepo, blogRepo } from "../../db/content.js";
import type { createRepo } from "../../db/repo.js";

export type FieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "lines" | "image";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  help?: string;
  placeholder?: string;
  defaultValue?: string | number;
}

export interface ResourceConfig {
  key: string; // url segment under /admin/:key
  label: string; // "Vehicles"
  singular: string; // "Vehicle"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  repo: ReturnType<typeof createRepo<any>>;
  fields: FieldConfig[];
  slugSource?: string; // field name to derive the slug from (omit if resource has no slug)
  listColumns: string[]; // field names to show as columns in the admin list table
}

export const resources: ResourceConfig[] = [
  {
    key: "vehicles",
    label: "Vehicles",
    singular: "Vehicle",
    repo: vehiclesRepo,
    slugSource: "name",
    listColumns: ["name", "category", "seats", "featured"],
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "car", label: "Car" },
          { value: "tempo-traveller", label: "Tempo Traveller" },
          { value: "mini-bus", label: "Mini Bus" },
          { value: "tourist-bus", label: "Tourist Bus" }
        ]
      },
      { name: "name", label: "Vehicle Name", type: "text", required: true, placeholder: "e.g. Innova Crysta" },
      { name: "seats", label: "Seats", type: "number", required: true, defaultValue: 4 },
      { name: "luggage", label: "Luggage Capacity", type: "text", required: true, placeholder: "e.g. 4 bags" },
      { name: "ac", label: "Air Conditioned", type: "checkbox", defaultValue: 1 },
      { name: "tagline", label: "Short Tagline", type: "text", required: true, placeholder: "One sentence used on cards" },
      { name: "description", label: "Full Description", type: "textarea", required: true },
      { name: "vehicleClass", label: "Service Class (optional)", type: "text", placeholder: "e.g. Economy, Semi Economy, Compact SUV", help: "Shown as a badge on the card. Our own service-tier label, not a third-party rating." },
      { name: "rating", label: "Display Rating 1–5 (optional)", type: "number", help: "Shows as a star badge. This is a self-declared display rating, not aggregated from real customer reviews — leave blank to hide it." },
      { name: "features", label: "Features (one per line)", type: "lines", help: "e.g. Air Conditioning, Push-back Seats" },
      { name: "imageKey", label: "Front Photo (used on cards)", type: "image" },
      { name: "gallery", label: "Additional Photos (one path per line, shown on detail page)", type: "lines", help: "e.g. /assets/images/vehicles/my-slug-side.jpg — upload the files first, then paste their paths here." },
      { name: "ratePerKm", label: "Rate per KM (₹, optional)", type: "number", help: "Leave blank to show \"Get Best Quote\" instead of a rate. Only enter a real published rate." },
      { name: "featured", label: "Show on homepage (featured)", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "services",
    label: "Services",
    singular: "Service",
    repo: servicesRepo,
    slugSource: "name",
    listColumns: ["name", "featured"],
    fields: [
      { name: "name", label: "Service Name", type: "text", required: true },
      { name: "icon", label: "Icon Name", type: "text", defaultValue: "route", help: "Name from src/views/partials/icon.ejs, e.g. route, plane, building, heart" },
      { name: "shortDescription", label: "Short Description (card)", type: "textarea", required: true },
      { name: "description", label: "Full Description (detail page)", type: "textarea", required: true },
      { name: "highlights", label: "Highlights (one per line)", type: "lines" },
      { name: "imageKey", label: "Photo", type: "image" },
      { name: "featured", label: "Show on homepage (featured)", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "packages",
    label: "Tour Packages",
    singular: "Package",
    repo: packagesRepo,
    slugSource: "title",
    listColumns: ["title", "destination", "travelCategory", "featured"],
    fields: [
      { name: "title", label: "Package Title", type: "text", required: true },
      { name: "destination", label: "Destination", type: "text", required: true },
      {
        name: "travelCategory",
        label: "Travel Category",
        type: "select",
        options: ["Hill Station", "Heritage", "Wildlife & Nature", "Beach", "Backwaters", "Pilgrimage"].map((v) => ({ value: v, label: v }))
      },
      { name: "duration", label: "Duration", type: "text", required: true, placeholder: "e.g. 2 Days / 1 Night" },
      { name: "startLocation", label: "Start Location", type: "text", defaultValue: "Bangalore" },
      { name: "idealFor", label: "Ideal For", type: "textarea" },
      { name: "highlights", label: "Highlights (one per line)", type: "lines" },
      { name: "vehicleOptions", label: "Vehicle Options (one per line)", type: "lines" },
      { name: "description", label: "Full Description", type: "textarea", required: true },
      { name: "imageKey", label: "Photo", type: "image" },
      { name: "featured", label: "Show on homepage (featured)", type: "checkbox" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    repo: faqsRepo,
    listColumns: ["question", "category"],
    fields: [
      { name: "question", label: "Question", type: "text", required: true },
      { name: "answer", label: "Answer", type: "textarea", required: true },
      { name: "category", label: "Category", type: "text", defaultValue: "General" },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    repo: testimonialsRepo,
    listColumns: ["name", "rating", "tripType", "isPlaceholder"],
    fields: [
      { name: "name", label: "Customer Name", type: "text", required: true },
      {
        name: "rating",
        label: "Rating",
        type: "select",
        options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} stars` })),
        defaultValue: 5
      },
      { name: "review", label: "Review Text", type: "textarea", required: true },
      { name: "tripType", label: "Trip Type", type: "text", placeholder: "e.g. Family Trip to Coorg" },
      {
        name: "isPlaceholder",
        label: "Placeholder (not yet a verified real review)",
        type: "checkbox",
        defaultValue: 1,
        help: "Keep checked until this is a real, verified customer review — the site displays a small notice on placeholder reviews."
      },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "gallery",
    label: "Gallery",
    singular: "Gallery Item",
    repo: galleryRepo,
    listColumns: ["category", "caption"],
    fields: [
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Vehicles", "Tours", "Group Travel", "Corporate", "Weddings", "Destinations"].map((v) => ({ value: v, label: v }))
      },
      { name: "imageKey", label: "Photo", type: "image" },
      { name: "caption", label: "Caption", type: "text" },
      { name: "altText", label: "Alt Text (accessibility)", type: "text", required: true },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  },
  {
    key: "blog",
    label: "Blog Posts",
    singular: "Blog Post",
    repo: blogRepo,
    slugSource: "title",
    listColumns: ["title", "published", "publishedAt"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "excerpt", label: "Excerpt (used in listings & meta description)", type: "textarea", required: true },
      { name: "content", label: "Content (HTML: <p>, <h2>, <ul> allowed)", type: "textarea", required: true },
      { name: "coverImageKey", label: "Cover Photo", type: "image" },
      { name: "author", label: "Author", type: "text", defaultValue: "Yogi Tours & Travels" },
      { name: "published", label: "Published (visible on site)", type: "checkbox", defaultValue: 1 },
      { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 }
    ]
  }
];

export function getResource(key: string): ResourceConfig | undefined {
  return resources.find((r) => r.key === key);
}
