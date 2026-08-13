import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Minimal session-bound CSRF protection for the admin panel's own forms.
 * A token is generated once per session and must be echoed back on every
 * state-changing admin POST. Public-facing forms (enquiry API) are not
 * session-authenticated and are protected separately (rate limiting +
 * same-site cookies), so this only guards /admin.
 */
export function ensureCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString("hex");
  }
  next();
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const submitted = (req.body && req.body._csrf) || req.get("x-csrf-token");
  if (submitted && submitted === req.session.csrfToken) {
    next();
    return;
  }
  res.status(403).render("admin/error", {
    title: "Security check failed",
    message: "Your session expired or the form was submitted incorrectly. Please go back and try again.",
    layoutSection: "admin"
  });
}
