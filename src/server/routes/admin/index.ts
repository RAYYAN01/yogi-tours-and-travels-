import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { enquiryCounts } from "../../db/enquiries.js";
import { vehiclesRepo, servicesRepo, packagesRepo, faqsRepo, testimonialsRepo, galleryRepo, blogRepo } from "../../db/content.js";
import authRouter from "./auth.js";
import enquiriesRouter from "./enquiries.js";
import settingsRouter from "./settings.js";
import crudRouter from "./crud.js";
import { resources } from "./resourceConfig.js";

const router = Router();

router.use("/", authRouter);

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const [
      enquiryStats,
      vehiclesCount,
      servicesCount,
      packagesCount,
      faqsCount,
      testimonialsCount,
      galleryCount,
      blogCount
    ] = await Promise.all([
      enquiryCounts(),
      vehiclesRepo.count(),
      servicesRepo.count(),
      packagesRepo.count(),
      faqsRepo.count(),
      testimonialsRepo.count(),
      galleryRepo.count(),
      blogRepo.count()
    ]);
    res.render("admin/dashboard", {
      layoutSection: "admin",
      enquiryStats,
      resourceStats: [
        { key: "vehicles", label: "Vehicles", count: vehiclesCount },
        { key: "services", label: "Services", count: servicesCount },
        { key: "packages", label: "Tour Packages", count: packagesCount },
        { key: "faqs", label: "FAQs", count: faqsCount },
        { key: "testimonials", label: "Testimonials", count: testimonialsCount },
        { key: "gallery", label: "Gallery Items", count: galleryCount },
        { key: "blog", label: "Blog Posts", count: blogCount }
      ],
      resources
    });
  } catch (err) {
    next(err);
  }
});

router.use("/enquiries", enquiriesRouter);
router.use("/settings", settingsRouter);
router.use("/", crudRouter);

export default router;
