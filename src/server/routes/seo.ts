import { Router } from "express";
import { env, business } from "../config/env.js";
import { vehiclesRepo, servicesRepo, packagesRepo, publishedBlogPosts, VEHICLE_CATEGORY_SLUGS, faqsRepo } from "../db/content.js";

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

router.get("/sitemap.xml", async (req, res, next) => {
 try {
  const urls: Array<{ path: string; priority: string; changefreq: string }> = [...STATIC_PATHS];

  for (const cat of VEHICLE_CATEGORY_SLUGS) {
    urls.push({ path: `/fleet/${cat}`, priority: "0.8", changefreq: "weekly" });
  }
  const [vehicles, services, packages, blogPosts] = await Promise.all([
    vehiclesRepo.all(),
    servicesRepo.all(),
    packagesRepo.all(),
    publishedBlogPosts()
  ]);
  for (const v of vehicles) {
    urls.push({ path: `/fleet/${v.category}/${v.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  for (const s of services) {
    urls.push({ path: `/services/${s.slug}`, priority: "0.8", changefreq: "monthly" });
  }
  for (const p of packages) {
    urls.push({ path: `/tour-packages/${p.slug}`, priority: "0.7", changefreq: "monthly" });
  }
  for (const post of blogPosts) {
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
 } catch (err) {
  next(err);
 }
});

router.get("/robots.txt", (req, res) => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

# Generative/answer-engine crawlers — explicitly welcomed so this site can be
# cited by AI search & chat assistants (ChatGPT, Perplexity, Claude, Google
# AI Overviews), not just indexed by traditional search.
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${env.siteUrl}/sitemap.xml
`;
  res.type("text/plain").send(body);
});

/**
 * llms.txt (llmstxt.org) — a plain-language summary of the site for LLMs
 * and AI search agents to consume directly, since they don't render pages
 * or follow internal links the way a browser does. Built from the same
 * real, non-fabricated content already backing the rest of the site.
 */
router.get("/llms.txt", async (req, res, next) => {
  try {
    const [vehicles, services, packages, faqs] = await Promise.all([
      vehiclesRepo.all(),
      servicesRepo.all(),
      packagesRepo.all(),
      faqsRepo.all()
    ]);

    const vehiclesByCategory = new Map<string, typeof vehicles>();
    for (const v of vehicles) {
      const list = vehiclesByCategory.get(v.category) ?? [];
      list.push(v);
      vehiclesByCategory.set(v.category, list);
    }

    const categoryOrder: Array<{ slug: string; label: string }> = [
      { slug: "car", label: "Cars" },
      { slug: "tempo-traveller", label: "Tempo Travellers" },
      { slug: "mini-bus", label: "Mini Buses" },
      { slug: "tourist-bus", label: "Tourist Buses" }
    ];

    const fleetSection = categoryOrder
      .map(({ slug, label }) => {
        const list = vehiclesByCategory.get(slug) ?? [];
        if (!list.length) return "";
        const lines = list
          .map((v) => `- ${v.name} (${v.seats} seats)${v.ratePerKm ? ` — ₹${v.ratePerKm}/km` : " — price on request"}: ${env.siteUrl}/fleet/${v.category}/${v.slug}`)
          .join("\n");
        return `### ${label}\n${lines}`;
      })
      .filter(Boolean)
      .join("\n\n");

    const servicesSection = services
      .map((s) => `- ${s.name}: ${s.shortDescription} ${env.siteUrl}/services/${s.slug}`)
      .join("\n");

    const packagesSection = packages
      .slice(0, 20)
      .map((p) => `- ${p.title} (${p.duration}, ${p.destination}): ${env.siteUrl}/tour-packages/${p.slug}`)
      .join("\n");

    const faqSection = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

    const body = `# ${business.name}

> ${business.description}

Bangalore-based tours and travels agency. Address: ${business.addressLine}. Phone/WhatsApp: ${business.whatsapp}. Email: ${business.email}. Open 24 hours. Rated ${business.googleRating.value}/5 from ${business.googleRating.count} Google reviews. Serves ${business.areaServed.join(", ")} and surrounding areas.

## Fleet

${fleetSection}

Full fleet: ${env.siteUrl}/fleet

## Services

${servicesSection}

Full services list: ${env.siteUrl}/services

## Tour Packages

${packagesSection}

Full tour packages list: ${env.siteUrl}/tour-packages

## Frequently Asked Questions

${faqSection}

## Other pages

- About: ${env.siteUrl}/about
- Contact: ${env.siteUrl}/contact
- Blog: ${env.siteUrl}/blog
- Gallery: ${env.siteUrl}/gallery
`;

    res.type("text/plain").send(body);
  } catch (err) {
    next(err);
  }
});

export default router;
