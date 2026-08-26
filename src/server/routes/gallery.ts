import { Router } from "express";
import { galleryRepo, galleryByCategory } from "../db/content.js";
import { breadcrumbSchema } from "../utils/schema.js";
import type { GalleryCategory } from "../types/models.js";

const router = Router();

const CATEGORIES: GalleryCategory[] = ["Vehicles", "Tours", "Group Travel", "Corporate", "Weddings", "Destinations"];

router.get("/", async (req, res, next) => {
  try {
    const activeCategory = typeof req.query.category === "string" ? req.query.category : "All";
    const [items, allItems] = await Promise.all([
      galleryByCategory(
        (CATEGORIES as string[]).includes(activeCategory) ? (activeCategory as GalleryCategory) : "All"
      ),
      galleryRepo.all()
    ]);

    res.render("pages/gallery", {
      title: "Gallery | Yogi Tours & Travels, Bangalore",
      metaDescription:
        "Browse photos of our vehicle fleet, group tours, corporate travel and wedding transportation from Yogi Tours & Travels, Bangalore.",
      canonicalPath: "/gallery",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Gallery", url: "/gallery" }
      ],
      items,
      allItems,
      categories: CATEGORIES,
      activeCategory,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Gallery", url: "/gallery" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
