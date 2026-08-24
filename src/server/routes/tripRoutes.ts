import { Router } from "express";
import { TRIP_ROUTES, findTripRoute } from "../config/tripRoutes.js";
import { vehiclesRepo } from "../db/content.js";
import { breadcrumbSchema, touristTripSchema, faqSchema } from "../utils/schema.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("pages/routes-list", {
    title: "Bangalore Outstation Cab Routes | Tempo Traveller Rental | Yogi Tours & Travels",
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

    // Interconnect route pages with each other — same-state routes first
    // (most relevant to a traveller comparing options), then fill from the
    // rest, so every route page links onward instead of dead-ending back
    // at /routes.
    const otherRoutes = [
      ...TRIP_ROUTES.filter((r) => r.slug !== route.slug && r.state === route.state),
      ...TRIP_ROUTES.filter((r) => r.slug !== route.slug && r.state !== route.state)
    ].slice(0, 4);

    // Mirrors the on-page Q&A exactly, so the FAQPage schema matches what's
    // actually visible rather than diverging from it.
    const routeFaqs = [
      {
        question: `What is the distance from Bangalore to ${route.destination}?`,
        answer: `Approximately ${route.distanceKm} km by road, taking around ${route.travelTimeHours} depending on traffic and the exact pickup point. This can vary by a few kilometres depending on the route taken.`
      },
      {
        question: `Can I book a one-way drop to ${route.destination}?`,
        answer: "Yes, one-way drops are available on this route alongside round trips. Let us know your preference when you enquire."
      },
      {
        question: "Which vehicle should I choose for this route?",
        answer: "This depends on your group size — see the suggested vehicles on this page, or browse the full fleet for seating and luggage details."
      },
      {
        question: "What is included in the fare?",
        answer: "Each vehicle's per-km rate, minimum daily kilometres and driver Bata are listed on its own page. Toll, parking, permit and state taxes are additional and confirmed in your quotation."
      }
    ];

    const canonicalPath = `/routes/${route.slug}`;
    res.render("pages/route-detail", {
      title: `Bangalore to ${route.destination} Cab | Tempo Traveller & Cab Rental | Yogi Tours & Travels`,
      metaDescription: `Bangalore to ${route.destination} cab — approx ${route.distanceKm} km, ${route.travelTimeHours}. Innova, Tempo Traveller rental and more with transparent per-km pricing.`,
      canonicalPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Routes", url: "/routes" },
        { name: `Bangalore to ${route.destination}`, url: canonicalPath }
      ],
      route,
      vehicles,
      otherRoutes,
      schemas: [
        touristTripSchema({
          name: `Bangalore to ${route.destination} Cab`,
          description: route.intro,
          url: canonicalPath,
          duration: route.travelTimeHours
        }),
        faqSchema(routeFaqs),
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
