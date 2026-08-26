import { Router } from "express";
import { LOCATIONS, findLocation } from "../config/locations.js";
import { vehiclesRepo, VEHICLE_CATEGORY_SLUGS, VEHICLE_CATEGORY_LABELS } from "../db/content.js";
import { breadcrumbSchema, faqSchema } from "../utils/schema.js";
import { clampDescription } from "../utils/meta.js";
import type { VehicleCategory } from "../types/models.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("pages/locations-list", {
    title: "Areas We Serve in Bangalore | Yogi Tours & Travels",
    metaDescription:
      "Car, cab, Tempo Traveller and bus rental across Bangalore localities — find your area, covering Whitefield, Koramangala and more.",
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
      title: `Tours and Travels Near ${location.name} | Yogi Tours`,
      metaDescription: clampDescription(`Tours and travels near ${location.name}, Bangalore — book car, cab, Tempo Traveller and bus rental with local pickup. Local, airport and outstation trips with transparent per-km pricing.`),
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
        ]),
        // Kept word-for-word in sync with the visible "Common Questions" block
        // in location-detail.ejs, so the schema never claims content the page
        // doesn't actually show.
        faqSchema([
          {
            question: `Do you offer airport pickup from ${location.name}?`,
            answer: `Yes — we cover pickup and drop to Kempegowda International Airport from ${location.name} and every other area we serve.`
          },
          {
            question: `Can I book an outstation trip from ${location.name}?`,
            answer: `Yes. Pickup is arranged directly from ${location.name} for outstation trips.`
          },
          {
            question: `Which vehicles are available in ${location.name}?`,
            answer: `The full fleet — sedans, Toyota Innova & Innova Crysta, Tempo Travellers, Force Urbania and buses — can be arranged for pickup in ${location.name}.`
          }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
