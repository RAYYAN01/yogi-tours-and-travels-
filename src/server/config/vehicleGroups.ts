// Vehicle-capacity landing pages combined with a Bangalore locality, e.g.
// /9seater-tempotraveller/rajajinagar — one URL per (vehicle group ×
// location) pair. Kept to 5 real, search-relevant capacity groupings rather
// than a page per individual vehicle SKU or per seat-count within mini-bus/
// tourist-bus, since per-locality search intent for a 21 vs 25 seater mini
// bus (for example) isn't meaningfully different — see CATEGORY_KEYWORDS in
// routes/vehicles.ts for the same reasoning applied to the category pages.
//
// Vehicles are looked up live from the database by category (+ seats where
// set) rather than hardcoded slugs, so this never drifts from what's
// actually in the fleet.
import type { VehicleCategory } from "../types/models.js";

export interface VehicleGroup {
  slug: string;
  /** Shown in the H1, title tag and breadcrumb. */
  label: string;
  category: VehicleCategory;
  /** Exact seat count to filter to, or omit to include the whole category. */
  seats?: number;
  /** One general, real sentence about this vehicle group — not location-specific. */
  about: string;
}

export const VEHICLE_GROUPS: VehicleGroup[] = [
  {
    slug: "9seater-tempotraveller",
    label: "9 Seater Tempo Traveller",
    category: "tempo-traveller",
    seats: 9,
    about:
      "A compact Tempo Traveller with forward-facing push-back seats and a dedicated luggage boot — a practical size for small families, friend groups and short office outings that don't need a full-size Traveller."
  },
  {
    slug: "12seater-tempotraveller",
    label: "12 Seater Tempo Traveller",
    category: "tempo-traveller",
    seats: 12,
    about:
      "A mid-size Tempo Traveller, including wide 'Maharaja' sofa-style seating options, suited to mid-size family groups, pilgrimage trips and multi-day outstation travel where a little extra width and legroom per passenger matters."
  },
  {
    slug: "17seater-tempotraveller",
    label: "17 Seater Tempo Traveller & Force Urbania",
    category: "tempo-traveller",
    seats: 17,
    about:
      "Full-size 17-seater group transport, including the Force Urbania, for large family groups, pilgrimage tours and multi-day outstation trips that need full group capacity with individual windows and a dedicated luggage boot."
  },
  {
    slug: "mini-bus-rental",
    label: "Mini Bus",
    category: "mini-bus",
    about:
      "21 and 25 seater mini buses for corporate offsites, wedding groups and mid-sized school or community trips, available for local and outstation hire with driver."
  },
  {
    slug: "tourist-bus-rental",
    label: "Tourist Bus",
    category: "tourist-bus",
    about:
      "40 and 55 seater tourist buses for large group tours, institutional travel and big event logistics, available for outstation and local hire with driver."
  }
];

export function findVehicleGroup(slug: string): VehicleGroup | undefined {
  return VEHICLE_GROUPS.find((g) => g.slug === slug);
}
