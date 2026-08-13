import { Router } from "express";
import { publishedBlogPosts, blogRepo } from "../db/content.js";
import { blogPostingSchema, breadcrumbSchema } from "../utils/schema.js";
import { business } from "../config/env.js";

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

    res.render("pages/blog-post", {
      title: `${post.title} | Yogi Tours & Travels Blog`,
      metaDescription: post.excerpt,
      canonicalPath: `/blog/${post.slug}`,
      crumbs: [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: post.title, url: `/blog/${post.slug}` }
      ],
      post,
      related,
      schemas: [
        blogPostingSchema({
          title: post.title,
          description: post.excerpt,
          url: `/blog/${post.slug}`,
          datePublished: post.publishedAt,
          author: post.author || business.name
        }),
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
