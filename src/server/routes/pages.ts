import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  vehiclesRepo,
  featuredServices,
  featuredPackages,
  servicesRepo,
  faqsRepo,
  testimonialsRepo,
  packagesRepo,
  startingPriceByCategory,
  galleryPreview,
  sortVehiclesAlphabetically
} from "../db/content.js";
import { faqSchema } from "../utils/schema.js";
import { TRIP_ROUTES } from "../config/tripRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const creditsPath = path.resolve(__dirname, "../../../IMAGE_CREDITS.json");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const [allFaqs, vehicles, services, packages, pricing, testimonials, galleryTeaser] = await Promise.all([
      faqsRepo.all(),
      vehiclesRepo.all(),
      featuredServices(6),
      featuredPackages(9),
      startingPriceByCategory(),
      testimonialsRepo.all(),
      galleryPreview()
    ]);
    const faqs = allFaqs.slice(0, 12);
    res.render("pages/home", {
      vehicles: sortVehiclesAlphabetically(vehicles),
      title: "Tours and Travels Near Me in Bangalore | Yogi Tours & Travels",
      metaDescription:
        "Looking for tours and travels near me in Bangalore? Yogi Tours & Travels covers every locality with car, cab, Tempo Traveller, Urbania and bus rental for local, airport and outstation trips — transparent per-km pricing, available 24/7.",
      canonicalPath: "/",
      // Only the home page opens on a full-bleed dark hero, so only it gets the transparent-over-hero header.
      transparentHeader: true,
      services,
      packages,
      pricing,
      faqs,
      testimonials,
      galleryTeaser,
      homeRoutes: TRIP_ROUTES.slice(0, 6),
      schemas: [faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/about", async (req, res, next) => {
  try {
    const testimonials = await testimonialsRepo.all();
    res.render("pages/about", {
      title: "About Us | Yogi Tours & Travels — Bangalore Tours & Travels Agency",
      metaDescription:
        "Learn about Yogi Tours & Travels, a Bangalore-based tours and travels agency serving families, corporates and groups with cars, Tempo Travellers, mini buses and tourist buses.",
      canonicalPath: "/about",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "About", url: "/about" }
      ],
      testimonials
    });
  } catch (err) {
    next(err);
  }
});

router.get("/contact", (req, res) => {
  res.render("pages/contact", {
    title: "Contact Us | Yogi Tours & Travels — Bangalore",
    metaDescription:
      "Get in touch with Yogi Tours & Travels for cab bookings, Tempo Traveller rentals, bus hire and tour package enquiries in Bangalore. Call, WhatsApp or send an enquiry.",
    canonicalPath: "/contact",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" }
    ]
  });
});

router.get("/privacy-policy", (req, res) => {
  res.render("pages/legal", {
    title: "Privacy Policy | Yogi Tours & Travels",
    metaDescription: "Read the privacy policy for Yogi Tours & Travels covering how enquiry and booking information is collected and used.",
    canonicalPath: "/privacy-policy",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Privacy Policy", url: "/privacy-policy" }
    ],
    pageHeading: "Privacy Policy",
    lastUpdated: "8 August 2026",
    template: "privacy"
  });
});

router.get("/terms-and-conditions", (req, res) => {
  res.render("pages/legal", {
    title: "Terms & Conditions | Yogi Tours & Travels",
    metaDescription: "Terms and conditions for using the Yogi Tours & Travels website and booking services.",
    canonicalPath: "/terms-and-conditions",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Terms & Conditions", url: "/terms-and-conditions" }
    ],
    pageHeading: "Terms & Conditions",
    lastUpdated: "8 August 2026",
    template: "terms"
  });
});

router.get("/cancellation-policy", (req, res) => {
  res.render("pages/legal", {
    title: "Cancellation Policy | Yogi Tours & Travels",
    metaDescription: "Cancellation and rescheduling policy for bookings made with Yogi Tours & Travels.",
    canonicalPath: "/cancellation-policy",
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Cancellation Policy", url: "/cancellation-policy" }
    ],
    pageHeading: "Cancellation Policy",
    lastUpdated: "8 August 2026",
    template: "cancellation"
  });
});

router.get("/photo-credits", (req, res) => {
  let credits: Array<{ slug: string; artist: string; license: string; licenseUrl: string; commonsFile: string }> = [];
  try {
    credits = JSON.parse(fs.readFileSync(creditsPath, "utf8"));
  } catch {
    credits = [];
  }
  res.render("pages/photo-credits", {
    title: "Photo Credits | Yogi Tours & Travels",
    metaDescription: "Attribution for destination and vehicle photography used on this site, sourced from Wikimedia Commons under free-culture licenses.",
    canonicalPath: "/photo-credits",
    noindex: true,
    crumbs: [
      { name: "Home", url: "/" },
      { name: "Photo Credits", url: "/photo-credits" }
    ],
    credits
  });
});

export default router;
