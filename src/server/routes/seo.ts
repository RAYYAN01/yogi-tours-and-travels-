import { Router } from "express";
import { env } from "../config/env.js";
import { vehiclesRepo, servicesRepo, packagesRepo, publishedBlogPosts, VEHICLE_CATEGORY_SLUGS } from "../db/content.js";

const router = Router();

const STATIC_PATHS = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/fleet", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "weekly" },
  { path: "/tour-packages", priority: "0.9", changefreq: "weekly" },
  { path: "/gallery", priority: "0.5", changefreq: "monthly" },
  { path: "/blog", priority: "0.6", changefreq: "weekly" },
  { path: "/contact", priority: "0.6", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.2", changefreq: "yearly" },
  { path: "/terms-and-conditions", priority: "0.2", changefreq: "yearly" },
  { path: "/cancellation-policy", priority: "0.2", changefreq: "yearly" }
];

router.get("/sitemap.xml", (req, res) => {
  const urls: Array<{ path: string; priority: string; changefreq: string }> = [...STATIC_PATHS];

  for (const cat of VEHICLE_CATEGORY_SLUGS) {
    urls.push({ path: `/fleet/${cat}`, priority: "0.8", changefreq: "weekly" });
  }
  for (const v of vehiclesRepo.all()) {
    urls.push({ path: `/fleet/${v.category}/${v.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  for (const s of servicesRepo.all()) {
    urls.push({ path: `/services/${s.slug}`, priority: "0.8", changefreq: "monthly" });
  }
  for (const p of packagesRepo.all()) {
    urls.push({ path: `/tour-packages/${p.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  for (const post of publishedBlogPosts()) {
    urls.push({ path: `/blog/${post.slug}`, priority: "0.5", changefreq: "monthly" });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${env.siteUrl}${u.path}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.type("application/xml").send(body);
});

router.get("/robots.txt", (req, res) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${env.siteUrl}/sitemap.xml
`;
  res.type("text/plain").send(body);
});

export default router;
