import { createRepo, parseJsonArray } from "./repo.js";
import type {
  Vehicle,
  Service,
  TourPackage,
  Faq,
  Testimonial,
  GalleryItem,
  BlogPost,
  VehicleCategory,
  GalleryCategory
} from "../types/models.js";

export const vehiclesRepo = createRepo<Vehicle>({ table: "vehicles" });
export const servicesRepo = createRepo<Service>({ table: "services" });
export const packagesRepo = createRepo<TourPackage>({ table: "packages" });
export const faqsRepo = createRepo<Faq>({ table: "faqs" });
export const testimonialsRepo = createRepo<Testimonial>({ table: "testimonials" });
export const galleryRepo = createRepo<GalleryItem>({ table: "gallery" });
export const blogRepo = createRepo<BlogPost>({ table: "blog_posts", orderBy: '"publishedAt" DESC' });

/**
 * Vehicle names that carry their seat count as a leading number (our
 * category-listing convention, e.g. "12 Seater Tempo Traveller", "21 Seater
 * Mini Bus") would otherwise sort by that leading digit and scatter every
 * seating variant apart from its siblings and from vehicles of the same
 * type that don't happen to lead with a number (e.g. "Maharaja Tempo
 * Traveller", "Force Urbania"). Stripping a leading "<n> Seater " token
 * before comparing groups same-type variants together, exactly like
 * comparing "Toyota Innova Crysta" vs "Toyota Innova Hycross" already does
 * for name-first vehicles — the displayed name itself is never changed.
 */
const LEADING_SEAT_COUNT_RE = /^\d+\s*seater\s+/i;

function vehicleSortBaseName(name: string): string {
  return name.trim().replace(LEADING_SEAT_COUNT_RE, "").trim();
}

/**
 * Reusable sort: vehicle TYPE first (Cars, then Tempo Travellers, then Mini
 * Buses, then Tourist Buses — VEHICLE_CATEGORY_SLUGS order, smallest
 * passenger class to largest), then alphabetical (case-insensitive,
 * numeric-aware) by base name within that category, with same-base-name
 * seating variants ordered by seat count ascending. Apply this to any
 * vehicle list right before rendering cards — never rely on
 * sortOrder/id/insertion order for customer-facing display. Calling it on
 * an already-single-category list (vehiclesByCategory) is a no-op for the
 * category comparison, so the same function is safe to use everywhere.
 */
export function sortVehiclesAlphabetically<T extends { name: string; seats: number; category: VehicleCategory }>(
  vehicles: T[]
): T[] {
  return [...vehicles].sort((a, b) => {
    const categoryComparison = VEHICLE_CATEGORY_SLUGS.indexOf(a.category) - VEHICLE_CATEGORY_SLUGS.indexOf(b.category);
    if (categoryComparison !== 0) return categoryComparison;

    const baseA = vehicleSortBaseName(a.name);
    const baseB = vehicleSortBaseName(b.name);
    const baseComparison = baseA.localeCompare(baseB, undefined, { sensitivity: "base", numeric: true });
    if (baseComparison !== 0) return baseComparison;

    const seatComparison = a.seats - b.seats;
    if (seatComparison !== 0) return seatComparison;

    // Final deterministic tie-break for two vehicles with an identical base name and seat count.
    return a.name.trim().localeCompare(b.name.trim(), undefined, { sensitivity: "base", numeric: true });
  });
}

export async function vehiclesByCategory(category: VehicleCategory): Promise<Vehicle[]> {
  const vehicles = await vehiclesRepo.allWhere("category = ?", category);
  return sortVehiclesAlphabetically(vehicles);
}

function normalizeVehicleLabel(s: string): string {
  return s.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Best-effort match between a free-text vehicle label (e.g. a tour
 * package's vehicleOptions entry, often a shorthand like "Innova Crysta")
 * and a real fleet vehicle, for internal linking. Exact match first, then
 * a single-candidate substring match; returns null rather than guessing
 * when the label is generic (e.g. "Sedan"), ambiguous, or refers to a
 * vehicle no longer in the fleet — callers must render plain, unlinked
 * text in that case rather than link to a guess or a dead page.
 */
export function matchVehicleByLabel(label: string, vehicles: Vehicle[]): Vehicle | null {
  const norm = normalizeVehicleLabel(label);
  if (!norm) return null;
  const exact = vehicles.find((v) => normalizeVehicleLabel(v.name) === norm);
  if (exact) return exact;
  const candidates = vehicles.filter((v) => {
    const vn = normalizeVehicleLabel(v.name);
    return vn.includes(norm) || norm.includes(vn);
  });
  return candidates.length === 1 ? candidates[0]! : null;
}

/**
 * Reverse lookup for the vehicle detail page: tour packages whose
 * vehicleOptions mentions this vehicle, using the same matching rule as
 * matchVehicleByLabel so the two stay consistent in both directions.
 */
export async function packagesForVehicle(vehicle: Vehicle): Promise<TourPackage[]> {
  const allPackages = await packagesRepo.all();
  return allPackages.filter((p) => packageVehicleOptions(p).some((opt) => matchVehicleByLabel(opt, [vehicle]) !== null));
}

export async function featuredPackages(limit = 6): Promise<TourPackage[]> {
  return (await packagesRepo.allWhere("featured = 1")).slice(0, limit);
}

export async function featuredServices(limit = 6): Promise<Service[]> {
  return (await servicesRepo.allWhere("featured = 1")).slice(0, limit);
}

export async function publishedBlogPosts(): Promise<BlogPost[]> {
  return blogRepo.allWhere("published = 1");
}

export async function galleryByCategory(category: GalleryCategory | "All"): Promise<GalleryItem[]> {
  if (category === "All") return galleryRepo.all();
  return galleryRepo.allWhere("category = ?", category);
}

const GALLERY_CATEGORY_ICONS: Record<GalleryCategory, string> = {
  Vehicles: "car",
  Tours: "mountain",
  "Group Travel": "users-group",
  Corporate: "building",
  Weddings: "heart",
  Destinations: "map-pin"
};

/**
 * One real photo per gallery category, for the homepage teaser. Categories
 * with no real photo yet (imageKey never set) are skipped entirely rather
 * than shown as an empty placeholder tile — the "View Full Gallery" link
 * covers the rest.
 */
export async function galleryPreview(): Promise<
  Array<{ category: GalleryCategory; icon: string; imageKey: string; altText: string }>
> {
  const categories: GalleryCategory[] = ["Vehicles", "Tours", "Group Travel", "Corporate", "Weddings", "Destinations"];
  const items = await Promise.all(
    categories.map(async (category) => {
      const [first] = await galleryRepo.allWhere('category = ? AND "imageKey" != \'\'', category);
      return first ? { category, icon: GALLERY_CATEGORY_ICONS[category], imageKey: first.imageKey, altText: first.altText } : null;
    })
  );
  return items.filter((i): i is NonNullable<typeof i> => i !== null);
}

export const VEHICLE_CATEGORY_LABELS: Record<VehicleCategory, string> = {
  car: "Cars",
  "tempo-traveller": "Tempo Travellers",
  "mini-bus": "Mini Buses",
  "tourist-bus": "Tourist Buses"
};

export const VEHICLE_CATEGORY_SLUGS: VehicleCategory[] = ["car", "tempo-traveller", "mini-bus", "tourist-bus"];

/**
 * Lowest admin-entered ratePerKm per category, for the homepage pricing
 * table. Categories with no vehicle that has a rate set yet come back with
 * `startingFrom: null` so the view can show "Contact for price" instead of
 * a fabricated number.
 */
export async function startingPriceByCategory(): Promise<
  Array<{ category: VehicleCategory; startingFrom: number | null }>
> {
  return Promise.all(
    VEHICLE_CATEGORY_SLUGS.map(async (category) => {
      const vehicles = await vehiclesByCategory(category);
      const rates = vehicles.map((v) => v.ratePerKm).filter((r): r is number => typeof r === "number" && r > 0);
      return { category, startingFrom: rates.length ? Math.min(...rates) : null };
    })
  );
}

/** Convenience accessors that deserialize JSON columns for view rendering. */
export function vehicleFeatures(v: Vehicle): string[] {
  return parseJsonArray(v.features);
}

export function vehicleGallery(v: Vehicle): string[] {
  return parseJsonArray(v.gallery);
}

export function serviceHighlights(s: Service): string[] {
  return parseJsonArray(s.highlights);
}

export function packageHighlights(p: TourPackage): string[] {
  return parseJsonArray(p.highlights);
}

export function packageVehicleOptions(p: TourPackage): string[] {
  return parseJsonArray(p.vehicleOptions);
}
