import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).render("pages/404", {
    title: "Page Not Found | Yogi Tours & Travels",
    metaDescription: "The page you're looking for doesn't exist or may have moved.",
    noindex: true
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error("Unhandled error:", err);
  const status = 500;
  res.status(status).render("pages/500", {
    title: "Something Went Wrong | Yogi Tours & Travels",
    metaDescription: "An unexpected error occurred.",
    noindex: true
  });
}
