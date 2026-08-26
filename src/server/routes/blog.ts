import { Router } from "express";
import { publishedBlogPosts, blogRepo } from "../db/content.js";
import { blogPostingSchema, breadcrumbSchema, faqSchema } from "../utils/schema.js";
import { clampDescription } from "../utils/meta.js";
import { business, env } from "../config/env.js";

// Real places/entities each post is substantively about — used for BlogPosting
// "mentions" (entity grounding for GEO/AEO). Optional; posts not listed here
// just don't get the extra field rather than a guessed one.
const POST_MENTIONS: Record<string, Array<{ name: string; type?: string }>> = {
  "karnataka-to-gujarat-road-trip-statue-of-unity": [
    { name: "Statue of Unity" },
    { name: "Gujarat", type: "State" },
    { name: "Karnataka", type: "State" },
    { name: "Kevadia" },
    { name: "Narmada River", type: "River" }
  ]
};

// Real, on-page questions this post's H2 sections already answer — surfaced
// as FAQPage schema so the same content is eligible for AI-answer citation,
// not just full-page indexing.
const POST_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  "karnataka-to-gujarat-road-trip-statue-of-unity": [
    {
      question: "How far is the Statue of Unity from Bangalore/Karnataka by road?",
      answer:
        "Around 1,500 km one-way, driving north through Karnataka into Maharashtra (via Pune and Nashik) and then into Gujarat (via Surat and Vadodara) to Kevadia in Narmada district."
    },
    {
      question: "Can you drive from Bangalore to the Statue of Unity in one day?",
      answer:
        "It's not recommended — at around 1,500 km, groups typically split the drive into two days with an overnight halt in Maharashtra, arriving in Kevadia rested rather than exhausted."
    },
    {
      question: "Which vehicle suits a long-distance trip like Bangalore to Gujarat?",
      answer:
        "An Innova Crysta works well for a small family or friend group, while a Tempo Traveller suits a larger group travelling together on one vehicle for the full two-day drive each way."
    }
  ]
};

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const posts = await publishedBlogPosts();
    res.render("pages/blog-list", {
      title: "Travel Tips & Guides | Yogi Tours & Travels Blog",
      metaDescription:
        "Practical guides on choosing the right vehicle, planning outstation trips from Bangalore, airport transfers and corporate travel — from Yogi Tours & Travels.",
      canonicalPath: "/blog",
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" }
      ],
      posts,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const post = await blogRepo.findBySlug(req.params.slug);
    if (!post || !post.published) {
      next();
      return;
    }
    const related = (await publishedBlogPosts()).filter((p) => p.id !== post.id).slice(0, 3);
    const absoluteCoverImage = post.coverImageKey ? `${env.siteUrl}${post.coverImageKey}` : undefined;
    const faqs = POST_FAQS[post.slug];

    res.render("pages/blog-post", {
      title: `${post.title} | Yogi Tours & Travels Blog`,
      metaDescription: clampDescription(post.excerpt),
      canonicalPath: `/blog/${post.slug}`,
      // Falls back to the generic og-default.png in head.ejs when the post has no cover photo.
      ...(absoluteCoverImage ? { ogImage: absoluteCoverImage } : {}),
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${post.slug}` }
      ],
      post,
      related,
      faqs,
      schemas: [
        blogPostingSchema({
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: post.author || business.name,
          image: absoluteCoverImage,
          mentions: POST_MENTIONS[post.slug]
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` }
        ]),
        ...(faqs ? [faqSchema(faqs)] : [])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
