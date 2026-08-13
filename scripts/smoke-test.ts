// Lightweight crawler: starts at "/", follows every internal <a href> and
// <img src>/smart-image reference it finds, and reports any non-2xx/3xx
// response. No new dependency (cheerio, etc.) — a regex link extractor is
// good enough for a same-origin crawl over server-rendered HTML.
export {}; // marks this file as a module so top-level await (used below) is allowed

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3000";

const HREF_RE = /(?:href|src)="([^"]+)"/g;

const visited = new Set<string>();
const queue: string[] = ["/"];
const results: Array<{ url: string; status: number; referrer: string }> = [];
const broken: Array<{ url: string; status: number; referrer: string }> = [];

function normalize(href: string, referrer: string): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return href.startsWith(BASE) ? href.slice(BASE.length) || "/" : null; // external, skip
  }
  if (href.startsWith("//")) return null;
  if (!href.startsWith("/")) return null; // ignore relative/js: etc for this simple crawler
  return href.split("#")[0] || "/";
}

async function crawl(): Promise<void> {
  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || visited.has(path)) continue;
    visited.add(path);

    let status = 0;
    let html = "";
    try {
      const res = await fetch(BASE + path, { redirect: "manual" });
      status = res.status;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) html = await res.text();
    } catch (err) {
      console.error(`FETCH ERROR ${path}:`, err);
      status = 0;
    }

    results.push({ url: path, status, referrer: "" });
    if (status === 0 || status >= 400) {
      broken.push({ url: path, status, referrer: "" });
    }

    if (html && path.startsWith("/admin")) continue; // don't crawl into auth-gated admin pages

    let match: RegExpExecArray | null;
    HREF_RE.lastIndex = 0;
    while ((match = HREF_RE.exec(html))) {
      const raw = match[1];
      if (!raw) continue;
      const normalized = normalize(raw, path);
      if (normalized && !visited.has(normalized) && !queue.includes(normalized)) {
        queue.push(normalized);
      }
    }
  }
}

await crawl();

console.log(`\nCrawled ${results.length} unique URLs from ${BASE}\n`);
results
  .sort((a, b) => a.url.localeCompare(b.url))
  .forEach((r) => console.log(`${String(r.status).padEnd(4)} ${r.url}`));

if (broken.length > 0) {
  console.error(`\n${broken.length} BROKEN LINK(S) FOUND:`);
  broken.forEach((b) => console.error(`  ${b.status} ${b.url}`));
  process.exitCode = 1;
} else {
  console.log(`\nNo broken links found.`);
}
