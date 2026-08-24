import { Router } from "express";
import { LOCATIONS, findLocation } from "../config/locations.js";
import { vehiclesRepo, VEHICLE_CATEGORY_SLUGS, VEHICLE_CATEGORY_LABELS } from "../db/content.js";
import { breadcrumbSchema } from "../utils/schema.js";
import type { VehicleCategory } from "../types/models.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("pages/locations-list", {
    title: "Tours and Travels Near Me — Areas We Serve in Bangalore | Yogi Tours & Travels",
    metaDescription:
      "Tours and travels near me — find your locality. Car, cab, Tempo Traveller and bus rental across Bangalore, covering Whitefield, Koramangala and more.",
    canonicalPath: "/locations",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Locations", url: "/locations" }
    ],
    locations: LOCATIONS,
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Locations", url: "/locations" }
      ])
    ]
  });
});

router.get("/car-rental-:slug", async (req, res, next) => {
  try {
    const location = findLocation(req.params.slug);
    if (!location) {
      next();
      return;
    }
    const nearby = location.nearbySlugs.map((s) => findLocation(s)).filter((l): l is NonNullable<typeof l> => Boolean(l));

    // One representative, currently-priced vehicle per category, for a compact "vehicles available here" section.
    const featuredVehicles = (
      await Promise.all(
        VEHICLE_CATEGORY_SLUGS.map(async (cat) => {
          const list = await vehiclesRepo.allWhere("category = ? AND \"ratePerKm\" IS NOT NULL", cat as VehicleCategory);
          return list[0];
        })
      )
    ).filter((v): v is NonNullable<typeof v> => Boolean(v));

    const canonicalPath = `/locations/car-rental-${location.slug}`;
    res.render("pages/location-detail", {
      title: `Tours and Travels Near ${location.name}, Bangalore | Yogi Tours & Travels`,
      metaDescription: `Tours and travels near ${location.name}, Bangalore — book car, cab, Tempo Traveller and bus rental with local pickup. Local, airport and outstation trips with transparent per-km pricing.`,
      canonicalPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Locations", url: "/locations" },
        { name: location.name, url: canonicalPath }
      ],
      location,
      nearby,
      featuredVehicles,
      vehicleCategoryLabelsList: VEHICLE_CATEGORY_SLUGS.map((s) => ({ slug: s, label: VEHICLE_CATEGORY_LABELS[s] })),
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Locations", url: "/locations" },
          { name: location.name, url: canonicalPath }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
