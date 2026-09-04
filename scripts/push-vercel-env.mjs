// Populate the new Vercel project's Production env vars from local .env via the
// Vercel REST API (the CLI path is blocked in this environment).
//
//   node scripts/push-vercel-env.mjs
//
import fs from "node:fs";

const TOKEN = fs.readFileSync(".vercel-token", "utf8").trim();
const PROJECT_ID = "prj_2r1KqRt4vIgORy1GoYGal0kp9fY7";
const TEAM_ID = "team_coAynqM4hyGGr5CvNLulY3xE";

const envFile = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1)];
    })
);

const OVERRIDES = {
  NODE_ENV: "production",
  SITE_URL: "https://www.yogitourstravels.com"
};

const KEYS = [
  "NODE_ENV",
  "SITE_URL",
  "DATABASE_URL",
  "SESSION_SECRET",
  "ENCRYPTION_KEY",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "BUSINESS_PHONE",
  "BUSINESS_WHATSAPP",
  "BUSINESS_EMAIL"
];

const base = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?upsert=true&teamId=${TEAM_ID}`;

for (const key of KEYS) {
  const value = OVERRIDES[key] ?? envFile[key];
  if (!value) {
    console.log(`!! ${key}: no value found, skipping`);
    continue;
  }
  const res = await fetch(base, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, type: "encrypted", target: ["production"] })
  });
  const body = await res.json().catch(() => ({}));
  console.log(res.ok ? `ok  ${key}  (${value.length} chars)` : `FAIL ${key}: ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
}

console.log("\nDone. Trigger a redeploy now.");
