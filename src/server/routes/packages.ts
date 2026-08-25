import { Router } from "express";
import { packagesRepo, packageHighlights, packageVehicleOptions, vehiclesRepo } from "../db/content.js";
import { touristTripSchema, breadcrumbSchema, faqSchema } from "../utils/schema.js";

const router = Router();

const TRAVEL_CATEGORIES = ["Hill Station", "Heritage", "Wildlife & Nature", "Beach", "Backwaters", "Pilgrimage"] as const;

router.get("/", async (req, res, next) => {
  try {
    const categoryFilter = typeof req.query.category === "string" ? req.query.category : "";
    const regionFilter = typeof req.query.region === "string" ? req.query.region : "";

    let packages = categoryFilter
      ? await packagesRepo.allWhere('"travelCategory" = ?', categoryFilter)
      : await packagesRepo.all();
    if (regionFilter === "karnataka") {
      packages = packages.filter((p) => p.destination.includes("Karnataka"));
    } else if (regionFilter === "south-india") {
      packages = packages.filter((p) => !p.destination.includes("Karnataka"));
    }

    res.render("pages/packages-list", {
      title: "Tour Packages from Bangalore | Coorg, Ooty, Mysore, Goa & More",
      metaDescription:
        "Tour packages from Bangalore — Coorg, Ooty, Mysore, Chikmagalur, Hampi, Goa and Kerala backwaters. Customisable itineraries, your choice of vehicle.",
      canonicalPath: "/tour-packages",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Tours & Packages", url: "/tour-packages" }
      ],
      packages,
      categories: TRAVEL_CATEGORIES,
      activeCategory: categoryFilter,
      activeRegion: regionFilter,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Tours & Packages", url: "/tour-packages" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const pkg = await packagesRepo.findBySlug(req.params.slug);
    if (!pkg) {
      next();
      return;
    }
    const related = (await packagesRepo.allWhere('"travelCategory" = ? AND id != ?', pkg.travelCategory, pkg.id)).slice(
      0,
      3
    );
    const fallbackRelated =
      related.length > 0 ? related : (await packagesRepo.all()).filter((p) => p.id !== pkg.id).slice(0, 3);
    const vehicles = await vehiclesRepo.all();

    // Honest, direct-answer Q&A built only from confirmed fields on the
    // package (no fabricated pricing) — matches the visible FAQ block in
    // package-detail.ejs so schema and page content stay in sync.
    const packageFaqs = [
      {
        question: `How many days is the ${pkg.title}?`,
        answer: `This is a ${pkg.duration} package starting from ${pkg.startLocation}.`
      },
      {
        question: `How much does the ${pkg.title} cost?`,
        answer: `Cost depends on your vehicle choice, group size and travel dates — share your requirement for a confirmed quotation.`
      },
      {
        question: `Who is the ${pkg.title} suitable for?`,
        answer: pkg.idealFor
      }
    ];

    res.render("pages/package-detail", {
      title: `${pkg.title} | ${pkg.duration} Tour Package from Bangalore`,
      metaDescription: `${pkg.title} — ${pkg.duration} tour package from Bangalore to ${pkg.destination}. ${pkg.idealFor}`,
      canonicalPath: `/tour-packages/${pkg.slug}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Tours & Packages", url: "/tour-packages" },
        { name: pkg.title, url: `/tour-packages/${pkg.slug}` }
      ],
      pkg,
      highlights: packageHighlights(pkg),
      vehicleOptions: packageVehicleOptions(pkg),
      vehicles,
      related: fallbackRelated,
      packageFaqs,
      schemas: [
        touristTripSchema({
          name: pkg.title,
          description: pkg.description,
          url: `/tour-packages/${pkg.slug}`,
          duration: pkg.duration
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Tours & Packages", url: "/tour-packages" },
          { name: pkg.title, url: `/tour-packages/${pkg.slug}` }
        ]),
        faqSchema(packageFaqs)
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
