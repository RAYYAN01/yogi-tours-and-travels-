import type { Request, Response, NextFunction } from "express";
import { injectViewLocals } from "./viewLocals.js";

// Both handlers can run without injectViewLocals ever having reached this
// request — most importantly, errorHandler is exactly what fires when an
// upstream middleware (e.g. the DB-schema-check ahead of it in app.ts)
// itself throws, which skips every middleware after it, injectViewLocals
// included. Without this, the 500/404 templates crash on their own
// (head.ejs reading `canonicalUrl`/`business`/`env`/etc., none of which
// were ever set) instead of showing the friendly error page — turning a
// single failure into a raw, unstyled crash on every request. Calling it
// directly (not as registered middleware) is safe here: it's synchronous,
// does no DB work, and already treats a missing req.session as optional.
function ensureViewLocals(req: Request, res: Response): void {
  if (res.locals.canonicalUrl === undefined) {
    injectViewLocals(req, res, () => {});
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  ensureViewLocals(req, res);
  res.status(404).render("pages/404", {
    title: "Page Not Found | Yogi Tours & Travels",
    metaDescription: "The page you're looking for doesn't exist or may have moved.",
    noindex: true
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error("Unhandled error:", err);
  ensureViewLocals(req, res);
  const status = 500;
  res.status(status).render("pages/500", {
    title: "Something Went Wrong | Yogi Tours & Travels",
    metaDescription: "An unexpected error occurred.",
    noindex: true
  });
}
