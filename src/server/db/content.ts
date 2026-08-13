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
export const blogRepo = createRepo<BlogPost>({ table: "blog_posts", orderBy: "publishedAt DESC" });

export function vehiclesByCategory(category: VehicleCategory): Vehicle[] {
  return vehiclesRepo.allWhere("category = ?", category);
}

export function featuredPackages(limit = 6): TourPackage[] {
  return packagesRepo.allWhere("featured = 1").slice(0, limit);
}

export function featuredServices(limit = 6): Service[] {
  return servicesRepo.allWhere("featured = 1").slice(0, limit);
}

export function publishedBlogPosts(): BlogPost[] {
  return blogRepo.allWhere("published = 1");
}

export function galleryByCategory(category: GalleryCategory | "All"): GalleryItem[] {
  if (category === "All") return galleryRepo.all();
  return galleryRepo.allWhere("category = ?", category);
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
export function startingPriceByCategory(): Array<{ category: VehicleCategory; startingFrom: number | null }> {
  return VEHICLE_CATEGORY_SLUGS.map((category) => {
    const rates = vehiclesByCategory(category)
      .map((v) => v.ratePerKm)
      .filter((r): r is number => typeof r === "number" && r > 0);
    return { category, startingFrom: rates.length ? Math.min(...rates) : null };
  });
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
