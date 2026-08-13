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

router.get("/", requireAdmin, (req, res) => {
  res.render("admin/dashboard", {
    layoutSection: "admin",
    enquiryStats: enquiryCounts(),
    resourceStats: [
      { key: "vehicles", label: "Vehicles", count: vehiclesRepo.count() },
      { key: "services", label: "Services", count: servicesRepo.count() },
      { key: "packages", label: "Tour Packages", count: packagesRepo.count() },
      { key: "faqs", label: "FAQs", count: faqsRepo.count() },
      { key: "testimonials", label: "Testimonials", count: testimonialsRepo.count() },
      { key: "gallery", label: "Gallery Items", count: galleryRepo.count() },
      { key: "blog", label: "Blog Posts", count: blogRepo.count() }
    ],
    resources
  });
});

router.use("/enquiries", enquiriesRouter);
router.use("/settings", settingsRouter);
router.use("/", crudRouter);

export default router;
