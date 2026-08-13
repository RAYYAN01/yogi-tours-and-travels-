// One-off utility: re-encodes every downloaded destination photo to a
// properly web-sized WebP (max 1280px wide, quality 72) so the site stays
// fast. Run after fetch-destination-images.mjs. Not part of the regular
// build — output is committed as a static asset.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const DIR = process.argv[2] || "public/assets/images/destinations";
const files = fs.readdirSync(DIR).filter((f) => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(f));

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const inPath = path.join(DIR, file);
  const base = file.replace(/\.[^.]+$/, "");
  const outPath = path.join(DIR, `${base}.webp`);
  const before = fs.statSync(inPath).size;

  await sharp(inPath)
    .rotate() // respect EXIF orientation
    // Cap width only (keep native aspect ratio) — the site crops per-context
    // with CSS object-cover, so a pre-cropped fixed aspect here would fight
    // that and could crop out the subject in a differently-shaped slot.
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(outPath);

  const after = fs.statSync(outPath).size;
  totalBefore += before;
  totalAfter += after;
  console.log(`${file} -> ${base}.webp  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);

  fs.unlinkSync(inPath); // remove the original, keep only the optimized WebP
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
