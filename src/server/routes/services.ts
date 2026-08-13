import { Router } from "express";
import { servicesRepo, serviceHighlights, faqsRepo } from "../db/content.js";
import { serviceSchema, breadcrumbSchema } from "../utils/schema.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("pages/services-list", {
    title: "Our Services | Outstation, Airport Transfer, Corporate & Wedding Travel — Bangalore",
    metaDescription:
      "Outstation trips, airport transfers, corporate travel, wedding transportation and custom itineraries — travel services from Yogi Tours & Travels, Bangalore.",
    canonicalPath: "/services",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" }
    ],
    services: servicesRepo.all(),
    schemas: [
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" }
      ])
    ]
  });
});

router.get("/:slug", (req, res, next) => {
  const service = servicesRepo.findBySlug(req.params.slug);
  if (!service) {
    next();
    return;
  }
  const relatedFaqs = faqsRepo.allWhere("category = ?", "Services").slice(0, 5);
  const related = servicesRepo.all().filter((s) => s.id !== service.id).slice(0, 3);

  res.render("pages/service-detail", {
    title: `${service.name} in Bangalore | Yogi Tours & Travels`,
    metaDescription: service.shortDescription,
    canonicalPath: `/services/${service.slug}`,
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Services", url: "/services" },
      { name: service.name, url: `/services/${service.slug}` }
    ],
    service,
    highlights: serviceHighlights(service),
    relatedFaqs,
    related,
    schemas: [
      serviceSchema({ name: service.name, description: service.description, url: `/services/${service.slug}` }),
      breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: service.name, url: `/services/${service.slug}` }
      ])
    ]
  });
});

export default router;
