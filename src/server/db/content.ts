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
 * Reusable sort: alphabetical (case-insensitive, numeric-aware) by the
 * vehicle's base name, with same-base-name variants ordered by seat count
 * ascending. Apply this to any vehicle list right before rendering cards —
 * never rely on sortOrder/id/insertion order for customer-facing display.
 */
export function sortVehiclesAlphabetically<T extends { name: string; seats: number }>(vehicles: T[]): T[] {
  return [...vehicles].sort((a, b) => {
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
