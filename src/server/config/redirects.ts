/**
 * Legacy URLs that used to exist on this domain under a previous WordPress
 * website, mapped to the closest equivalent page on the current site.
 * Google still has many of these indexed with real ranking signals /
 * backlinks — redirecting (301, permanent) instead of letting them 404
 * preserves that equity by pointing it at real, relevant content instead
 * of a dead page. Keys are stored without a trailing slash; the app.ts
 * middleware normalizes incoming paths before matching, so a key here
 * covers both "/path" and "/path/".
 */
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/best-outstation-cab-service-in-bangalore": "/services/outstation-travel",
  "/best-outstation-cabs-service-in-bangalore": "/services/outstation-travel",
  // "9/10 Seater" in the old title matches the real 9 Seater Tempo
  // Traveller, not the 17-seat Force Urbania — was previously mismatched.
  "/luxury-tempo-traveller-9-10-seater-on-rent-in-bangalore": "/fleet/tempo-traveller/9-seater-tempo-traveller",
  "/best-sedan-cab-service-bangalore": "/fleet/car",

  // WordPress tag-archive pages
  "/tag/urbania-10-seater-for-rent-in-bangalore": "/fleet/tempo-traveller/force-urbania",
  "/tag/mini-bus-rental-bangalore-12-seater": "/fleet/mini-bus",
  "/tag/tempo-traveller-rental-bangalore": "/fleet/tempo-traveller",
  "/tag/book-tempo-traveller-on-rent-in-bangalore-online": "/fleet/tempo-traveller",
  "/tag/best-luxury-tempo-traveller-9-10-seater-on-rent-in-bangalore": "/fleet/tempo-traveller/9-seater-tempo-traveller",
  "/category/blog": "/blog",

  // Individual vehicle/keyword landing pages
  "/9-seater-tempo-traveller-rental-in-bangalore": "/fleet/tempo-traveller/9-seater-tempo-traveller",
  "/best-9-seater-tempo-traveller-for-rent-in-bangalore": "/fleet/tempo-traveller/9-seater-tempo-traveller",
  "/best-tempo-traveller-on-rent-in-bangalore": "/fleet/tempo-traveller",
  "/best-innova-car-rental-in-bangalore-for-outstation": "/fleet/car/toyota-innova",

  // Site structure pages
  "/about-us": "/about",
  "/booking": "/contact",
  "/blog-2": "/blog",

  // The "9 Seater Tempo Traveller" vehicle previously lived at a slug that
  // said "12-seater" — a real content/URL mismatch. Renamed to
  // 9-seater-tempo-traveller; this preserves any equity the old slug had
  // already picked up (indexed by Google, linked from elsewhere on this
  // site's own history, or bookmarked) instead of letting it 404.
  "/fleet/tempo-traveller/tempo-traveller-12-seater": "/fleet/tempo-traveller/9-seater-tempo-traveller"
};
