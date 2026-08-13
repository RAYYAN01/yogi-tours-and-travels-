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
import { productVehicleSchema, breadcrumbSchema } from "../utils/schema.js";
import { env } from "../config/env.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";
import type { VehicleCategory } from "../types/models.js";

const router = Router();

const CATEGORY_INTRO: Record<VehicleCategory, string> = {
  car: "From compact sedans to the Innova Crysta and Hycross — comfortable cars for airport transfers, city travel and outstation trips.",
  "tempo-traveller": "9 to 17 seater Tempo Travellers, including Luxury and Maharaja configurations, for family and group travel.",
  "mini-bus": "20 to 29 seater mini buses for corporate offsites, wedding groups and mid-sized school or community trips.",
  "tourist-bus": "33 to 50 seater tourist buses for large group tours, institutional travel and big event logistics."
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
    const vehicles = await vehiclesByCategory(category);
    res.render("pages/vehicles-category", {
      title: `${label} on Rent in Bangalore | Yogi Tours & Travels`,
      metaDescription: `${CATEGORY_INTRO[category]} Transparent quotations, experienced drivers and well-maintained vehicles.`,
      canonicalPath: `/fleet/${category}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Fleet", url: "/fleet" },
        { name: label, url: `/fleet/${category}` }
      ],
      category,
      label,
      intro: CATEGORY_INTRO[category],
      vehicles,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Fleet", url: "/fleet" },
          { name: label, url: `/fleet/${category}` }
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

    res.render("pages/vehicle-detail", {
      title: `${vehicle.name} Rental in Bangalore | Yogi Tours & Travels`,
      metaDescription: `Book the ${vehicle.name} (${vehicle.seats} seater) in Bangalore for outstation trips, airport transfers and group travel. ${vehicle.tagline}`,
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
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
