import { Router } from "express";
import { VEHICLE_GROUPS, findVehicleGroup } from "../config/vehicleGroups.js";
import { LOCATIONS, findLocation } from "../config/locations.js";
import { vehiclesRepo } from "../db/content.js";
import { breadcrumbSchema, faqSchema } from "../utils/schema.js";
import { clampDescription } from "../utils/meta.js";

const router = Router();

// /:groupSlug/:locationSlug — e.g. /9seater-tempotraveller/rajajinagar. Mounted
// at the root, after every other router (see app.ts), so it only ever
// receives requests that didn't match a real 1- or 3+-segment route first.
router.get("/:groupSlug/:locationSlug", async (req, res, next) => {
  try {
    const group = findVehicleGroup(req.params.groupSlug);
    if (!group) {
      next();
      return;
    }
    const location = findLocation(req.params.locationSlug);
    if (!location) {
      next();
      return;
    }

    const vehicles = group.seats
      ? await vehiclesRepo.allWhere("category = ? AND seats = ?", group.category, group.seats)
      : await vehiclesRepo.allWhere("category = ?", group.category);

    // Never publish a page for a combination with nothing to actually show.
    if (vehicles.length === 0) {
      next();
      return;
    }

    const canonicalPath = `/${group.slug}/${location.slug}`;
    const nearbyLocations = location.nearbySlugs.map((s) => findLocation(s)).filter((l): l is NonNullable<typeof l> => Boolean(l));
    // A handful of other vehicle groups for the same location, and other
    // locations for the same group — bounded lists, not a link to every
    // other combination page, so this doesn't become a link farm.
    const otherGroups = VEHICLE_GROUPS.filter((g) => g.slug !== group.slug);
    const otherLocations = LOCATIONS.filter((l) => l.slug !== location.slug).slice(0, 8);

    res.render("pages/vehicle-location-detail", {
      title: `${group.label} in ${location.name}, Bangalore | Yogi Tours`,
      metaDescription: clampDescription(
        `Book a ${group.label} in ${location.name}, Bangalore with driver — real per-km pricing, for local, outstation and group trips. Enquire with Yogi Tours & Travels.`
      ),
      canonicalPath,
      crumbs: [
        { name: "Home", url: "/" },
        { name: group.label, url: `/fleet/${group.category}` },
        { name: location.name, url: canonicalPath }
      ],
      group,
      location,
      vehicles,
      nearbyLocations,
      otherGroups,
      otherLocations,
      schemas: [
        breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: group.label, url: `/fleet/${group.category}` },
          { name: location.name, url: canonicalPath }
        ]),
        // Kept word-for-word in sync with the visible FAQ block in
        // vehicle-location-detail.ejs — see locations.ts route for the same rule.
        faqSchema([
          {
            question: `Is a ${group.label} available for pickup in ${location.name}?`,
            answer: `Yes — a ${group.label} can be arranged for pickup directly from ${location.name}.`
          },
          {
            question: `Can I book a ${group.label} from ${location.name} for an outstation trip?`,
            answer: `Yes. Outstation trips are available with a ${group.label} starting from ${location.name}, with the driver's Bata and minimum daily kilometres confirmed at booking.`
          },
          {
            question: `What's the fare for a ${group.label} from ${location.name}?`,
            answer: `Per-kilometre rates are shown on each vehicle below where confirmed. Enquire with your route and dates for an exact quotation.`
          }
        ])
      ]
    });
  } catch (err) {
    next(err);
  }
});

export default router;
