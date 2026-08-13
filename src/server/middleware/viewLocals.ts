import type { Request, Response, NextFunction } from "express";
import { business, env, telHref, mailtoHref, whatsappDigits } from "../config/env.js";
import { mainNav, footerServiceLinks, footerToursLinks, footerCompanyLinks, legalLinks } from "../config/nav.js";
import { organizationSchema } from "../utils/schema.js";
import { parseJsonArray } from "../db/repo.js";
import { VEHICLE_CATEGORY_LABELS } from "../db/content.js";
import type { Vehicle, VehicleCategory } from "../types/models.js";

const orgSchema = organizationSchema();

const CATEGORY_ICON: Record<VehicleCategory, string> = {
  car: "car",
  "tempo-traveller": "van",
  "mini-bus": "bus",
  "tourist-bus": "bus"
};

/**
 * Injects site-wide data every EJS view needs (nav, business info, current
 * path for active-link state, csrf token, flash message) so individual
 * routes don't have to repeat this on every render() call.
 */
export function injectViewLocals(req: Request, res: Response, next: NextFunction): void {
  res.locals.business = business;
  res.locals.env = env;
  res.locals.telHref = telHref();
  res.locals.mailtoHref = mailtoHref();
  res.locals.whatsappDigits = whatsappDigits();
  res.locals.mainNav = mainNav;
  res.locals.footerServiceLinks = footerServiceLinks;
  res.locals.footerToursLinks = footerToursLinks;
  res.locals.footerCompanyLinks = footerCompanyLinks;
  res.locals.legalLinks = legalLinks;
  res.locals.currentPath = req.path;
  // Header sits over a dark hero only on pages that opt in (e.g. home); everywhere
  // else it needs a solid background so nav text stays legible over light content.
  res.locals.transparentHeader = false;
  res.locals.organizationSchema = orgSchema;
  res.locals.parseJsonArray = parseJsonArray;
  res.locals.vehicleCategoryLabels = VEHICLE_CATEGORY_LABELS;
  res.locals.vehicleCategoryIcon = (cat: VehicleCategory): string => CATEGORY_ICON[cat] || "car";
  // Indian tour-vehicle convention: Tempo Traveller / Mini Bus / Tourist Bus
  // capacity is always quoted as "passenger seats + 1 driver" (e.g. "12+1").
  // Cars don't use this convention, so they keep a plain seat count.
  res.locals.seatLabel = (v: Pick<Vehicle, "seats" | "category">): string =>
    v.category === "car" ? `${v.seats} Seats` : `${v.seats}+1 Seats`;
  res.locals.canonicalUrl = `${env.siteUrl}${req.path}`;
  res.locals.isAdmin = Boolean(req.session?.adminUsername);
  res.locals.adminUsername = req.session?.adminUsername || "";
  res.locals.csrfToken = req.session?.csrfToken || "";

  if (req.session?.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  } else {
    res.locals.flash = null;
  }

  next();
}

export function setFlash(req: Request, type: "success" | "error", message: string): void {
  req.session.flash = { type, message };
}
