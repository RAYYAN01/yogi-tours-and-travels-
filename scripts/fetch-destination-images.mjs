// One-off utility (not part of the build): downloads a lead photo for each
// destination from Wikipedia/Wikimedia Commons, records proper attribution,
// and writes public/assets/images/destinations/<slug>.jpg + a credits file.
// Every image used here is under a free-reuse license (GFDL / CC-BY-SA /
// CC-BY / public domain) — see IMAGE_CREDITS.json for the exact license and
// author per photo.
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = "public/assets/images/destinations";
fs.mkdirSync(OUT_DIR, { recursive: true });

const UA = "YogiToursAndTravelsWebsite/1.0 (https://example.com; local dev build, non-commercial fetch script)";

const targets = [
  { slug: "coorg-getaway", wiki: "Madikeri" },
  { slug: "ooty-coonoor-hill-tour", wiki: "Ooty" },
  { slug: "mysore-heritage-day-tour", wiki: "Mysore_Palace" },
  { slug: "chikmagalur-coffee-trails", wiki: "Chikmagalur" },
  { slug: "wayanad-nature-escape", wiki: "Wayanad" },
  { slug: "hampi-heritage-trail", wiki: "Hampi" },
  { slug: "goa-beach-holiday", wiki: "Palolem_Beach" },
  { slug: "kerala-backwaters-tour", wiki: "Alappuzha" },
  { slug: "tirupati-pilgrimage-tour", wiki: "Tirumala_Venkateswara_Temple" },
  { slug: "dharmasthala-kukke-pilgrimage", wiki: "Dharmasthala" },
  { slug: "kodaikanal-hill-escape", wiki: "Kodaikanal" },
  { slug: "munnar-tea-garden-trail", wiki: "Munnar" },
  { slug: "trivandrum-kovalam-beach-tour", wiki: "Kovalam" },
  { slug: "mantralaya-pilgrimage-tour", wiki: "Mantralayam" },
  { slug: "pondicherry-heritage-beach-tour", wiki: "Puducherry_(city)" },
  { slug: "rameshwaram-pilgrimage-tour", wiki: "Ramanathaswamy_Temple" },
  { slug: "kanyakumari-tour", wiki: "Kanyakumari" },
  { slug: "gokarna-beach-getaway", wiki: "Gokarna,_Karnataka" },
  { slug: "nandi-hills-sunrise-trip", wiki: "Nandi_Hills" },
  { slug: "sakleshpur-western-ghats-trail", wiki: "Sakleshpur" },
  { slug: "hero-bangalore", wiki: "Bangalore" }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA }, ...opts });
    if (res.status !== 429) return res;
    const wait = 1500 * (i + 1);
    console.log(`  (rate limited, waiting ${wait}ms...)`);
    await sleep(wait);
  }
  return fetch(url, { headers: { "User-Agent": UA }, ...opts });
}

async function getSummary(wiki) {
  const res = await fetchWithRetry(`https://en.wikipedia.org/api/rest_v1/page/summary/${wiki}`);
  if (!res.ok) throw new Error(`summary ${res.status}`);
  return res.json();
}

function filenameFromImageUrl(url) {
  const parts = url.split("/");
  const thumbIdx = parts.indexOf("thumb");
  if (thumbIdx !== -1 && parts.length > thumbIdx + 3) return decodeURIComponent(parts[thumbIdx + 3]);
  return decodeURIComponent(parts[parts.length - 1].split("?")[0]);
}

function resizeThumbUrl(url, width) {
  return url.replace(/\/\d+px-/, `/${width}px-`);
}

async function downloadImage(imageUrl) {
  // Try a reasonable resized width first (keeps files small); fall back to
  // progressively smaller widths, then the untouched original URL, since
  // Wikimedia's thumbnailer 400s if asked to upscale past the source size.
  const candidates = [];
  if (imageUrl.includes("/thumb/")) {
    candidates.push(resizeThumbUrl(imageUrl, 1400), resizeThumbUrl(imageUrl, 900), resizeThumbUrl(imageUrl, 600));
  }
  candidates.push(imageUrl);

  for (const url of candidates) {
    const res = await fetchWithRetry(url);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  throw new Error("all download attempts failed");
}

async function getLicense(filename) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    "File:" + filename
  )}&prop=imageinfo&iiprop=extmetadata&format=json`;
  const res = await fetchWithRetry(api);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { license: "Unknown", artist: "Unknown", licenseUrl: "" };
  }
  const page = Object.values(data.query?.pages || {})[0];
  const meta = page?.imageinfo?.[0]?.extmetadata;
  if (!meta) return { license: "Unknown", artist: "Unknown", licenseUrl: "" };
  const strip = (v) => (v ? String(v).replace(/<[^>]*>/g, "").trim() : "");
  return {
    license: strip(meta.LicenseShortName?.value) || "Unknown",
    artist: strip(meta.Artist?.value) || strip(meta.Credit?.value) || "Unknown",
    licenseUrl: meta.LicenseUrl?.value || ""
  };
}

const credits = [];
const failed = [];

for (const t of targets) {
  try {
    const summary = await getSummary(t.wiki);
    await sleep(400);
    const imageUrl = summary.originalimage?.source || summary.thumbnail?.source;
    if (!imageUrl) {
      console.log(`✗ ${t.slug}: no image found for "${t.wiki}"`);
      failed.push(t);
      continue;
    }
    const filename = filenameFromImageUrl(imageUrl);
    const buf = await downloadImage(imageUrl);
    const ext = path.extname(filename) || ".jpg";
    const outPath = path.join(OUT_DIR, `${t.slug}${ext}`);
    fs.writeFileSync(outPath, buf);

    await sleep(400);
    const license = await getLicense(filename);
    credits.push({
      slug: t.slug,
      file: `${t.slug}${ext}`,
      sourcePage: `https://en.wikipedia.org/wiki/${t.wiki}`,
      commonsFile: `https://commons.wikimedia.org/wiki/File:${filename}`,
      ...license
    });
    console.log(`✓ ${t.slug} <- ${t.wiki} (${license.license}, ${license.artist}) [${(buf.length / 1024).toFixed(0)} KB]`);
  } catch (err) {
    console.log(`✗ ${t.slug} (${t.wiki}):`, err.message);
    failed.push(t);
  }
  await sleep(800);
}

const existing = fs.existsSync("IMAGE_CREDITS.json") ? JSON.parse(fs.readFileSync("IMAGE_CREDITS.json", "utf8")) : [];
const bySlug = new Map(existing.map((e) => [e.slug, e]));
for (const c of credits) bySlug.set(c.slug, c); // merge rather than overwrite — other scripts (services, vehicles) share this file
fs.writeFileSync("IMAGE_CREDITS.json", JSON.stringify([...bySlug.values()], null, 2));
console.log(`\nDone. ${credits.length}/${targets.length} images saved. See IMAGE_CREDITS.json.`);
if (failed.length) {
  console.log("Failed:", failed.map((f) => f.slug).join(", "));
}
