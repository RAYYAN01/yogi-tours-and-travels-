import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { SCHEMA_SQL } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../../data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

// Reasonable defaults for a small server-rendered site.
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

export function initSchema(): void {
  db.exec(SCHEMA_SQL);
  migrate();
}

/**
 * CREATE TABLE IF NOT EXISTS only applies to brand-new databases — a column
 * added to schema.ts after the table already exists (like this one) needs an
 * explicit ALTER TABLE to reach existing installs. Guarded via
 * PRAGMA table_info so it's safe to run on every startup.
 */
function migrate(): void {
  const vehicleCols = db.prepare("PRAGMA table_info(vehicles)").all() as Array<{ name: string }>;
  if (!vehicleCols.some((c) => c.name === "gallery")) {
    db.exec("ALTER TABLE vehicles ADD COLUMN gallery TEXT NOT NULL DEFAULT '[]';");
  }
  if (!vehicleCols.some((c) => c.name === "vehicleClass")) {
    db.exec("ALTER TABLE vehicles ADD COLUMN vehicleClass TEXT NOT NULL DEFAULT '';");
  }
  if (!vehicleCols.some((c) => c.name === "rating")) {
    db.exec("ALTER TABLE vehicles ADD COLUMN rating REAL;");
  }
}

initSchema();
