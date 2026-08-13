import { Router } from "express";
import { TRIP_ROUTES, findTripRoute } from "../config/tripRoutes.js";
import { vehiclesRepo } from "../db/content.js";
import { breadcrumbSchema, touristTripSchema } from "../utils/schema.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("pages/routes-list", {
    title: "Bangalore Outstation Cab Routes | Yogi Tours & Travels",
    metaDescription:
      "Distance, travel time and vehicle options for popular outstation routes from Bangalore — Mysore, Coorg, Ooty, Hampi, Tirupati and more.",
    canonicalPath: "/routes",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Routes", url: "/routes" }
    ],
    routes: TRIP_ROUTES,
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Routes", url: "/routes" }
      ])
    ]
  });
});

router.get("/:slug", async (req, res, next) => {
  try {
    const route = findTripRoute(req.params.slug);
    if (!route) {
      next();
      return;
    }
    const vehicles = (
      await Promise.all(route.vehicleSlugs.map((v) => vehiclesRepo.findBySlug(v.slug)))
    ).filter((v): v is NonNullable<typeof v> => Boolean(v));

    const canonicalPath = `/routes/${route.slug}`;
    res.render("pages/route-detail", {
      title: `Bangalore to ${route.destination} Cab | Yogi Tours & Travels`,
      metaDescription: `Bangalore to ${route.destination} cab — approx ${route.distanceKm} km, ${route.travelTimeHours}. Innova, Tempo Traveller and more with transparent per-km pricing.`,
      canonicalPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Routes", url: "/routes" },
        { name: `Bangalore to ${route.destination}`, url: canonicalPath }
      ],
      route,
      vehicles,
      schemas: [
        touristTripSchema({
          name: `Bangalore to ${route.destination} Cab`,
          description: route.intro,
          url: canonicalPath,
          duration: route.travelTimeHours
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Routes", url: "/routes" },
          { name: `Bangalore to ${route.destination}`, url: canonicalPath }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
