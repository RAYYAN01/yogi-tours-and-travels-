import { Router } from "express";
import { servicesRepo, serviceHighlights, faqsRepo } from "../db/content.js";
import { serviceSchema, breadcrumbSchema, faqSchema, speakableSchema } from "../utils/schema.js";
import type { Service } from "../types/models.js";

const router = Router();

// Real, published posts relevant to a specific service — an editorial link,
// not a generic "read our blog" pointer, so it only appears where it's
// actually on-topic.
const SERVICE_RELATED_POSTS: Record<string, { slug: string; title: string }> = {
  "outstation-travel": { slug: "outstation-taxi-service-bangalore-what-to-expect", title: "What to Expect From an Outstation Taxi Booking" }
};

// Real alternate phrasings people search for each service — not fabricated
// claims (this is just search-term vocabulary, unlike body copy), matched to
// what each service's own shortDescription already says it does. Opt-in per
// slug like CATEGORY_KEYWORDS/VEHICLE_TITLE_OVERRIDE in vehicles.ts, so a new
// service added via /admin just falls back to the generic pattern in
// serviceKeywords() below until a real entry is written for it here.
const SERVICE_KEYWORDS: Record<string, string> = {
  "outstation-travel": "outstation cab bangalore, outstation taxi service bangalore, one way cab bangalore, round trip cab bangalore, outstation cab booking bangalore",
  "airport-transfer": "airport taxi bangalore, airport cab booking bangalore, kempegowda airport taxi, airport pickup and drop bangalore, bangalore airport transfer service",
  "local-intercity-travel": "local cab service bangalore, hourly car rental bangalore, intercity cab bangalore, city taxi service bangalore",
  "corporate-travel": "corporate cab service bangalore, employee transportation bangalore, corporate car rental bangalore, business travel cab bangalore",
  "wedding-transportation": "wedding car rental bangalore, wedding cab service bangalore, baraat vehicle rental bangalore, guest shuttle service bangalore",
  "educational-tours": "school bus rental bangalore, college excursion bus bangalore, educational tour bus rental bangalore, study tour transportation bangalore",
  "pilgrimage-tours": "pilgrimage tour cab bangalore, temple tour taxi bangalore, pilgrimage tour package bangalore, group pilgrimage vehicle bangalore",
  "family-tours": "family tour package bangalore, family vacation cab bangalore, family trip car rental bangalore",
  "resort-trips": "resort cab bangalore, weekend getaway cab bangalore, resort trip taxi bangalore",
  "customized-tours": "custom tour package bangalore, personalized itinerary bangalore, custom road trip bangalore",
  "group-transportation": "group travel bangalore, bulk vehicle booking bangalore, association transportation bangalore",
  "event-transportation": "event transportation bangalore, conference cab service bangalore, exhibition transport bangalore"
};

function serviceKeywords(service: Service): string {
  const name = service.name.toLowerCase();
  const generic = `${name} bangalore, ${name} near me, book ${name} bangalore`;
  const specific = SERVICE_KEYWORDS[service.slug];
  return specific ? `${specific}, ${generic}` : generic;
}

router.get("/", async (req, res, next) => {
  try {
    const services = await servicesRepo.all();
    res.render("pages/services-list", {
      title: "Travel & Cab Services in Bangalore | Yogi Tours",
      metaDescription:
        "Outstation trips, airport transfers, corporate travel, wedding transportation and custom itineraries — travel services from Yogi Tours & Travels, Bangalore.",
      // The list page gets one line per service name (not each service's full
      // detail-page keyword set below — stacking all of those here would be
      // 60+ near-duplicate phrases on one tag, which is exactly the keyword-
      // stuffing pattern that makes the tag look spammy to anything that
      // still reads it).
      metaKeywords: `${services.map((s) => `${s.name.toLowerCase()} bangalore`).join(", ")}, travel services bangalore, cab services bangalore`,
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
      title: `${service.name} Service in Bangalore | Yogi Tours`,
      metaDescription: service.shortDescription,
      metaKeywords: serviceKeywords(service),
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
        serviceSchema({
          name: service.name,
          description: service.description,
          url: `/services/${service.slug}`,
          dateModified: service.updatedAt
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.name, url: `/services/${service.slug}` }
        ]),
        ...(relatedFaqs.length
          ? [faqSchema(relatedFaqs.map((f) => ({ question: f.question, answer: f.answer }))), speakableSchema(`/services/${service.slug}`, ["#faq"])]
          : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
