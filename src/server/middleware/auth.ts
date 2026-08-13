import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    adminUsername?: string;
    csrfToken?: string;
    flash?: { type: "success" | "error"; message: string };
    returnTo?: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session.adminUsername) {
    next();
    return;
  }
  req.session.returnTo = req.originalUrl;
  res.redirect("/admin/login");
}
