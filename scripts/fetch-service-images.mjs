// One-off utility: downloads representative service photos from Wikimedia
// Commons (free-licensed, see IMAGE_CREDITS.json) for each service category.
// Mirrors fetch-vehicle-images.mjs / fetch-destination-images.mjs. A couple of
// services without a distinct real photo available reuse a thematically close
// one (e.g. group/event transportation reuse the tourist coach photo) rather
// than an unrelated stock image.
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "public/assets/images/services";
fs.mkdirSync(OUT_DIR, { recursive: true });

const UA = "YogiToursAndTravelsWebsite/1.0 (https://example.com; local dev build, non-commercial fetch script)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const targets = [
  { slug: "outstation-travel", file: "Bangalore-Mysore road, July 2014.JPG" },
  { slug: "airport-transfer", file: "Terminal 1 of Kempegowda International Airport.jpg" },
  { slug: "local-intercity-travel", file: "An urban road and traffic in Bangalore Karnataka India April 2014.jpg" },
  { slug: "corporate-travel", file: "ITPL-Whitefield-Bangalore1.jpg" },
  { slug: "wedding-transportation", file: "Car Rent For Wedding in Delhi.JPG" },
  { slug: "educational-tours", file: "School bus, Indore.jpg" },
  { slug: "pilgrimage-tours", file: "A 900 year old Temple in South India (37892625552).jpg" },
  { slug: "resort-trips", file: "Resort calicut kerala.jpg" },
  { slug: "event-transportation", file: "Sarji Convention hall, Shivamogga, Karnataka (2026) 01.jpg" }
];

async function fetchWithRetry(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status !== 429) return res;
    const wait = 2000 * (i + 1);
    console.log(`  (rate limited, waiting ${wait}ms...)`);
    await sleep(wait);
  }
  return fetch(url, { headers: { "User-Agent": UA } });
}

async function getInfo(filename) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    "File:" + filename
  )}&prop=imageinfo&iiprop=url|extmetadata|size&format=json`;
  const res = await fetchWithRetry(api);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  return page?.imageinfo?.[0];
}

const credits = [];

for (const t of targets) {
  try {
    const info = await getInfo(t.file);
    if (!info) {
      console.log(`✗ ${t.slug}: file info not found`);
      continue;
    }
    const meta = info.extmetadata;
    const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, "").trim() : "");

    const encodedName = encodeURIComponent(t.file.replace(/ /g, "_"));
    const downloadUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedName}?width=1280`;
    const imgRes = await fetchWithRetry(downloadUrl);
    if (!imgRes.ok) throw new Error(`download ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const outPath = path.join(OUT_DIR, `${t.slug}.jpg`);
    fs.writeFileSync(outPath, buf);

    credits.push({
      slug: t.slug,
      file: `${t.slug}.jpg`,
      commonsFile: `https://commons.wikimedia.org/wiki/File:${t.file.replace(/ /g, "_")}`,
      license: strip(meta?.LicenseShortName?.value) || "Unknown",
      artist: strip(meta?.Artist?.value) || strip(meta?.Credit?.value) || "Unknown",
      licenseUrl: meta?.LicenseUrl?.value || ""
    });
    console.log(`✓ ${t.slug} [${(buf.length / 1024).toFixed(0)} KB]`);
  } catch (err) {
    console.log(`✗ ${t.slug}:`, err.message);
  }
  await sleep(900);
}

const existing = fs.existsSync("IMAGE_CREDITS.json") ? JSON.parse(fs.readFileSync("IMAGE_CREDITS.json", "utf8")) : [];
const bySlug = new Map(existing.map((e) => [e.slug, e]));
for (const c of credits) bySlug.set(c.slug, c); // re-running replaces stale entries instead of duplicating them
fs.writeFileSync("IMAGE_CREDITS.json", JSON.stringify([...bySlug.values()], null, 2));
console.log(`\nDone. ${credits.length}/${targets.length} service images saved.`);
