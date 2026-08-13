/**
 * Legacy URLs that used to exist on this domain under a previous website,
 * mapped to the closest equivalent page on the current site. Google may
 * still hold ranking signals / backlinks for these old paths — redirecting
 * (301, permanent) instead of letting them 404 preserves that equity by
 * pointing it at real, relevant content instead of a dead page.
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/best-outstation-cab-service-in-bangalore": "/services/outstation-travel",
  "/best-outstation-cab-service-in-bangalore/": "/services/outstation-travel"
};
