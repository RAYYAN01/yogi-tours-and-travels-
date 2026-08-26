import { Router } from "express";
import { servicesRepo, serviceHighlights, faqsRepo } from "../db/content.js";
import { serviceSchema, breadcrumbSchema, faqSchema } from "../utils/schema.js";

const router = Router();

// Real, published posts relevant to a specific service — an editorial link,
// not a generic "read our blog" pointer, so it only appears where it's
// actually on-topic.
const SERVICE_RELATED_POSTS: Record<string, { slug: string; title: string }> = {
  "outstation-travel": { slug: "outstation-taxi-service-bangalore-what-to-expect", title: "What to Expect From an Outstation Taxi Booking" }
};

router.get("/", async (req, res, next) => {
  try {
    const services = await servicesRepo.all();
    res.render("pages/services-list", {
      title: "Our Services | Bangalore Travel & Cab Services",
      metaDescription:
        "Outstation trips, airport transfers, corporate travel, wedding transportation and custom itineraries — travel services from Yogi Tours & Travels, Bangalore.",
      canonicalPath: "/services",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" }
      ],
      services,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const service = await servicesRepo.findBySlug(req.params.slug);
    if (!service) {
      next();
      return;
    }
    const [relatedFaqsAll, allServices] = await Promise.all([
      faqsRepo.allWhere("category = ?", "Services"),
      servicesRepo.all()
    ]);
    const relatedFaqs = relatedFaqsAll.slice(0, 5);
    const related = allServices.filter((s) => s.id !== service.id).slice(0, 3);

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
      relatedPost: SERVICE_RELATED_POSTS[service.slug],
      schemas: [
        serviceSchema({ name: service.name, description: service.description, url: `/services/${service.slug}` }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.name, url: `/services/${service.slug}` }
        ]),
        ...(relatedFaqs.length ? [faqSchema(relatedFaqs.map((f) => ({ question: f.question, answer: f.answer })))] : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
