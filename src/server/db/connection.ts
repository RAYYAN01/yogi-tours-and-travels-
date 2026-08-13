import { Pool, type QueryResultRow } from "pg";
import { env } from "../config/env.js";
import { SCHEMA_SQL } from "./schema.js";

if (!env.databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[db] DATABASE_URL is not set — the app will fail on the first query. Set it to a Postgres connection string."
  );
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  // Hosted Postgres (Vercel Postgres/Neon/Supabase) requires TLS; their
  // certs aren't in Node's default trust store, so this is the standard
  // "connect, don't verify the chain" setting recommended by all three.
  ssl: env.databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
});

/** Rewrites node:sqlite-style "?" positional placeholders into Postgres's "$1, $2, ...". */
function toPgSql(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(toPgSql(sql), params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Runs a write query and returns the affected row count. */
export async function run(sql: string, params: unknown[] = []): Promise<{ rowCount: number }> {
  const result = await pool.query(toPgSql(sql), params);
  return { rowCount: result.rowCount ?? 0 };
}

let schemaReady: Promise<void> | null = null;

/** Idempotent — safe to call on every cold start of a serverless function. */
export function initSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = pool.query(SCHEMA_SQL).then(() => undefined);
  }
  return schemaReady;
}
