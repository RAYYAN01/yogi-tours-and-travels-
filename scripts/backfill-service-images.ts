// One-off: the services table was seeded before real photos existed for it
// (imageKey: ""), so seed.ts's idempotent "skip if already seeded" guard
// won't pick up the new images. This backfills imageKey on existing rows
// using the same slug -> path rules as seedServices() in seed.ts.
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { servicesRepo } from "../src/server/db/content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const SERVICE_IMAGE_OVERRIDES: Record<string, string> = {
  "family-tours": "/assets/images/vehicles/maruti-ertiga.webp",
  "customized-tours": "/assets/images/destinations/coorg-getaway.webp",
  "group-transportation": "/assets/images/vehicles/tourist-bus-40-seater.webp"
};
function serviceImagePath(slug: string): string {
  if (SERVICE_IMAGE_OVERRIDES[slug]) return SERVICE_IMAGE_OVERRIDES[slug];
  const rel = `/assets/images/services/${slug}.webp`;
  return fs.existsSync(path.join(publicDir, "assets/images/services", `${slug}.webp`)) ? rel : "";
}

let updated = 0;
for (const s of servicesRepo.all()) {
  const imageKey = serviceImagePath(s.slug);
  if (imageKey && imageKey !== s.imageKey) {
    servicesRepo.update(s.id, { imageKey });
    console.log(`✓ ${s.slug} -> ${imageKey}`);
    updated++;
  }
}
console.log(`\nDone. ${updated} service(s) updated.`);
