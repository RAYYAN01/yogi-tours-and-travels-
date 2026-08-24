import { Router } from "express";
import {
  vehiclesRepo,
  vehiclesByCategory,
  VEHICLE_CATEGORY_LABELS,
  VEHICLE_CATEGORY_SLUGS,
  vehicleFeatures,
  vehicleGallery,
  packagesForVehicle
} from "../db/content.js";
import { productVehicleSchema, breadcrumbSchema, serviceSchema, faqSchema } from "../utils/schema.js";
import { env } from "../config/env.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";
import type { VehicleCategory } from "../types/models.js";

const router = Router();

// Singular form for "X Rental in Bangalore" phrasing — VEHICLE_CATEGORY_LABELS
// is plural ("Tempo Travellers"), which reads wrong directly in front of
// "Rental" ("Tempo Travellers Rental").
const CATEGORY_RENTAL_LABEL: Record<VehicleCategory, string> = {
  car: "Car",
  "tempo-traveller": "Tempo Traveller",
  "mini-bus": "Mini Bus",
  "tourist-bus": "Tourist Bus"
};

// Per-vehicle title override for a handful of high-intent "best X in
// Bangalore" queries — kept as an explicit, honest exception (not a blanket
// claim on every vehicle) since it's backed by the business's real 4.9★/210
// Google rating stated in the meta description below, not an empty boast.
const VEHICLE_TITLE_OVERRIDE: Record<string, string> = {
  "maharaja-tempo-traveller": "Best 12 Seater Tempo Traveller in Bangalore | Yogi Tours & Travels",
  "tempo-traveller-17-seater": "Best 17 Seater Tempo Traveller in Bangalore | Yogi Tours & Travels"
};

// Real, honest Q&A phrased close to how people actually search/ask AI
// assistants — surfaced as both an FAQPage schema and a matching visible
// section on the page (Google requires FAQ schema content to be visible,
// not just present in JSON-LD). Opt-in per vehicle slug, not a blanket
// addition, so nothing here overstates what's true for a vehicle without
// a written answer.
const VEHICLE_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  "tempo-traveller-17-seater": [
    {
      question: "Where can I find the best 17 seater Tempo Traveller in Bangalore?",
      answer:
        "Yogi Tours & Travels is rated 4.9★ from 210+ Google reviews and operates 17 seater Tempo Travellers across Bangalore (Bengaluru), with transparent per-km pricing and driver Bata confirmed upfront before booking."
    },
    {
      question: "Is there a 17 seater Tempo Traveller near me in Bangalore?",
      answer:
        "Yes — pickups are available across Bangalore, including Whitefield, Electronic City, Koramangala, HSR Layout, Jayanagar, JP Nagar, Indiranagar, Yelahanka, Hebbal, Marathahalli and Rajajinagar."
    },
    {
      question: "Is the 17 seater Tempo Traveller comfortable for long trips?",
      answer:
        "Yes. It has push-back seats, individual windows, reading lights and a dedicated luggage boot, making it a dependable option for multi-day outstation trips and pilgrimage tours, not just short city rides."
    },
    {
      question: "What is the rate for a 17 seater Tempo Traveller in Bangalore?",
      answer:
        "₹30/km AC and ₹28/km Non-AC, with a ₹700/day driver Bata — confirmed rates, not an estimate. Tolls, parking, permit and state taxes are additional and shown in your quotation."
    }
  ]
};

const CATEGORY_INTRO: Record<VehicleCategory, string> = {
  car: "From compact sedans and the Maruti Dzire to the Innova Crysta and Hycross — cars for hire with driver for airport transfers, city travel and outstation trips.",
  "tempo-traveller": "Tempo Traveller rental in Bangalore across 9, 12 and 17 seater options, including the Force Urbania, with driver for family and group travel, outstation trips across Karnataka and airport transfers.",
  "mini-bus": "21 and 25 seater mini buses for corporate offsites, wedding groups and mid-sized school or community trips, available for local and outstation hire.",
  "tourist-bus": "40 and 55 seater tourist buses for large group tours, institutional travel and big event logistics, available for outstation and local hire."
};

router.get("/", async (req, res, next) => {
  try {
    const categories = await Promise.all(
      VEHICLE_CATEGORY_SLUGS.map(async (cat) => ({
        slug: cat,
        label: VEHICLE_CATEGORY_LABELS[cat],
        intro: CATEGORY_INTRO[cat],
        vehicles: await vehiclesByCategory(cat)
      }))
    );
    res.render("pages/vehicles-list", {
      title: "Vehicle Fleet | Car, Tempo Traveller, Mini Bus & Tourist Bus Rental in Bangalore",
      metaDescription:
        "Browse the full Yogi Tours & Travels fleet in Bangalore — sedans, Innova Crysta, Tempo Travellers, mini buses and tourist buses. Get a quote for your group size.",
      canonicalPath: "/fleet",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" }
      ],
      categories,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:category", async (req, res, next) => {
  try {
    const category = req.params.category as VehicleCategory;
    if (!VEHICLE_CATEGORY_SLUGS.includes(category)) {
      next();
      return;
    }
    const label = VEHICLE_CATEGORY_LABELS[category];
    const rentalLabel = CATEGORY_RENTAL_LABEL[category];
    const vehicles = await vehiclesByCategory(category);
    const categoryPath = `/fleet/${category}`;
    res.render("pages/vehicles-category", {
      title: `${rentalLabel} Rental in Bangalore | Yogi Tours & Travels`,
      metaDescription: `${CATEGORY_INTRO[category]} Transparent quotations, experienced drivers and well-maintained vehicles.`,
      canonicalPath: categoryPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" },
        { name: label, url: categoryPath }
      ],
      category,
      label,
      rentalLabel,
      intro: CATEGORY_INTRO[category],
      vehicles,
      schemas: [
        serviceSchema({
          name: `${rentalLabel} Rental in Bangalore`,
          description: CATEGORY_INTRO[category],
          url: categoryPath
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: label, url: categoryPath }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:category/:slug", async (req, res, next) => {
  try {
    const category = req.params.category as VehicleCategory;
    if (!VEHICLE_CATEGORY_SLUGS.includes(category)) {
      next();
      return;
    }
    const vehicle = await vehiclesRepo.findBySlug(req.params.slug);
    if (!vehicle || vehicle.category !== category) {
      next();
      return;
    }
    const label = VEHICLE_CATEGORY_LABELS[category];
    const related = (await vehiclesByCategory(category)).filter((v) => v.id !== vehicle.id).slice(0, 3);
    const featuredInPackages = (await packagesForVehicle(vehicle)).slice(0, 3);
    const relevantRoutes = TRIP_ROUTES.filter((r) => r.vehicleSlugs.some((v) => v.slug === vehicle.slug)).slice(0, 4);
    // Vehicles like "9 Seater Tempo Traveller" already state their capacity in
    // the name — appending "(9 seater)" again reads as a redundant stutter.
    // Only vehicles named without a seat count (Force Urbania, Toyota Innova
    // Crysta, etc.) get it appended.
    const seatSuffix = vehicle.name.toLowerCase().includes(`${vehicle.seats} seat`) ? "" : ` (${vehicle.seats} seater)`;
    const vehicleFaqs = VEHICLE_FAQS[vehicle.slug];

    res.render("pages/vehicle-detail", {
      title: VEHICLE_TITLE_OVERRIDE[vehicle.slug] ?? `${vehicle.name} Rental in Bangalore | Yogi Tours & Travels`,
      metaDescription: `Book the ${vehicle.name}${seatSuffix} with driver in Bangalore for outstation trips, airport transfers and group travel. ${vehicle.tagline}`,
      metaKeywords: `${vehicle.name.toLowerCase()} bangalore, ${vehicle.name.toLowerCase()} bengaluru, ${vehicle.name.toLowerCase()} rental, ${vehicle.name.toLowerCase()} near me, ${label.toLowerCase()} bangalore, ${vehicle.seats} seater rental bangalore`,
      canonicalPath: `/fleet/${category}/${vehicle.slug}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" },
        { name: label, url: `/fleet/${category}` },
        { name: vehicle.name, url: `/fleet/${category}/${vehicle.slug}` }
      ],
      vehicle,
      label,
      features: vehicleFeatures(vehicle),
      gallery: vehicleGallery(vehicle),
      related,
      featuredInPackages,
      relevantRoutes,
      vehicleFaqs,
      schemas: [
        productVehicleSchema({
          name: vehicle.name,
          description: vehicle.description,
          url: `/fleet/${category}/${vehicle.slug}`,
          imageUrl: vehicle.imageKey ? `${env.siteUrl}${vehicle.imageKey}` : undefined,
          ratePerKm: vehicle.ratePerKm
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: label, url: `/fleet/${category}` },
          { name: vehicle.name, url: `/fleet/${category}/${vehicle.slug}` }
        ]),
        ...(vehicleFaqs ? [faqSchema(vehicleFaqs)] : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
