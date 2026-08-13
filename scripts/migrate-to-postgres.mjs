// One-off: copies every row from the local SQLite database (data/app.db)
// into the Postgres database pointed at by DATABASE_URL. Run this once,
// after creating the Postgres database and before/after the first deploy —
// safe to re-run (each table is upserted by primary key), but intended as a
// single migration pass from the pre-Postgres version of this app.
//
// Usage: DATABASE_URL="postgres://..." node scripts/migrate-to-postgres.mjs
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.resolve(__dirname, "../data/app.db");

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL to your Postgres connection string first, e.g.:");
  console.error('  DATABASE_URL="postgres://user:pass@host/db" node scripts/migrate-to-postgres.mjs');
  process.exit(1);
}

const sqlite = new DatabaseSync(sqlitePath);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
});

// [sqlite table, [camelCase columns to quote in Postgres]]
const TABLES = [
  ["vehicles", ["vehicleClass", "ratePerKm", "sortOrder", "createdAt", "updatedAt"]],
  ["services", ["shortDescription", "sortOrder", "createdAt", "updatedAt"]],
  ["packages", ["travelCategory", "startLocation", "idealFor", "vehicleOptions", "sortOrder", "createdAt", "updatedAt"]],
  ["faqs", ["sortOrder", "createdAt", "updatedAt"]],
  ["testimonials", ["tripType", "isPlaceholder", "sortOrder", "createdAt", "updatedAt"]],
  ["gallery", ["altText", "sortOrder", "createdAt", "updatedAt"]],
  ["blog_posts", ["coverImageKey", "publishedAt", "sortOrder", "createdAt", "updatedAt"]],
  [
    "enquiries",
    ["pickupLocation", "tripType", "pickupDate", "returnDate", "vehicleType", "sourcePage", "createdAt"]
  ],
  ["admin_users", ["passwordHash", "createdAt"]]
];

function quoteCol(col, camelCaseCols) {
  return camelCaseCols.includes(col) ? `"${col}"` : col;
}

async function migrateTable(table, camelCaseCols) {
  const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
  if (rows.length === 0) {
    console.log(`  ${table}: nothing to migrate`);
    return;
  }
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => quoteCol(c, camelCaseCols)).join(", ");
  let n = 0;
  for (const row of rows) {
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const updateSet = cols
      .filter((c) => c !== "id")
      .map((c) => `${quoteCol(c, camelCaseCols)} = EXCLUDED.${quoteCol(c, camelCaseCols)}`)
      .join(", ");
    await pool.query(
      `INSERT INTO ${table} (${colList}) VALUES (${placeholders}) ON CONFLICT (id) DO UPDATE SET ${updateSet}`,
      cols.map((c) => row[c])
    );
    n++;
  }
  // Keep the SERIAL sequence ahead of the highest migrated id so future inserts don't collide.
  await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM ${table}))`);
  console.log(`  ${table}: migrated ${n} row(s)`);
}

async function main() {
  console.log("Migrating SQLite -> Postgres...");
  for (const [table, camelCaseCols] of TABLES) {
    await migrateTable(table, camelCaseCols);
  }
  console.log("Done.");
  await pool.end();
  sqlite.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
