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

/** Constant-time string equality — plain `===` on a secret token leaks its value one byte at a time via response-time differences. */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on a length mismatch rather than returning false,
  // and comparing against a same-length-but-wrong buffer first keeps this
  // check itself from leaking the real token's length via an early throw.
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const submitted = (req.body && req.body._csrf) || req.get("x-csrf-token");
  const expected = req.session.csrfToken;
  if (typeof submitted === "string" && expected && timingSafeStringEqual(submitted, expected)) {
    next();
    return;
  }
  res.status(403).render("admin/error", {
    title: "Security check failed",
    message: "Your session expired or the form was submitted incorrectly. Please go back and try again.",
    layoutSection: "admin"
  });
}
