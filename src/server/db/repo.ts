import { query, queryOne, run } from "./connection.js";

/** Legacy shape carried over from the node:sqlite version — rows are already plain objects with pg, so these are now no-ops kept for call-site compatibility. */
export function toPlain<T>(row: unknown): T {
  return row as T;
}

export function toPlainList<T>(rows: unknown[]): T[] {
  return rows as T[];
}

/** Parse a JSON-encoded string[] column, tolerating malformed/empty data. */
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Turn admin-form textarea input (one item per line) into a JSON-encoded string[]. */
export function linesToJsonArray(text: string | undefined | null): string {
  if (!text) return "[]";
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

const now = (): string => new Date().toISOString().replace("T", " ").slice(0, 19);

const SAFE_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Postgres folds unquoted identifiers to lowercase — every camelCase column
 * needs double-quoting. Every column name insert()/update() see today comes
 * from a fixed, developer-defined field list (never raw req.body keys), so
 * this check is a no-op in current usage — it's here so a column name can
 * never carry a stray `"` and break out of the quoted identifier if a future
 * call site is less careful about what it passes in.
 */
const q = (col: string): string => {
  if (!SAFE_IDENTIFIER.test(col)) {
    throw new Error(`Unsafe column identifier: ${col}`);
  }
  return `"${col}"`;
};

interface RepoOptions {
  table: string;
  /** Pre-quoted ORDER BY clause, e.g. '"sortOrder" ASC, id ASC'. Column names with a capital letter must be double-quoted. */
  orderBy?: string;
}

/**
 * Minimal typed CRUD repository over a single table.
 * Kept intentionally generic so every content type (vehicles, services,
 * packages, faqs, testimonials, gallery, blog posts) shares one code path
 * instead of duplicating near-identical SQL eight times.
 */
export function createRepo<T extends { id: number }>(opts: RepoOptions) {
  const { table } = opts;
  const orderBy = opts.orderBy ?? '"sortOrder" ASC, id ASC';

  return {
    async all(): Promise<T[]> {
      return query<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
    },
    /** whereSql must already double-quote any camelCase column, e.g. '"travelCategory" = ?'. */
    async allWhere(whereSql: string, ...params: unknown[]): Promise<T[]> {
      return query<T>(`SELECT * FROM ${table} WHERE ${whereSql} ORDER BY ${orderBy}`, params);
    },
    async findById(id: number): Promise<T | undefined> {
      return queryOne<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    },
    async findBySlug(slug: string): Promise<T | undefined> {
      return queryOne<T>(`SELECT * FROM ${table} WHERE slug = ?`, [slug]);
    },
    async count(): Promise<number> {
      const row = await queryOne<{ c: string }>(`SELECT COUNT(*) as c FROM ${table}`);
      return row ? Number(row.c) : 0;
    },
    async insert(data: Record<string, unknown>): Promise<number> {
      const cols = Object.keys(data);
      const placeholders = cols.map(() => "?").join(", ");
      const row = await queryOne<{ id: number }>(
        `INSERT INTO ${table} (${cols.map(q).join(", ")}) VALUES (${placeholders}) RETURNING id`,
        cols.map((c) => data[c])
      );
      return row?.id ?? 0;
    },
    async update(id: number, data: Record<string, unknown>): Promise<void> {
      const cols = Object.keys(data);
      if (cols.length === 0) return;
      const setSql = cols.map((c) => `${q(c)} = ?`).join(", ");
      await run(`UPDATE ${table} SET ${setSql}, "updatedAt" = ? WHERE id = ?`, [
        ...cols.map((c) => data[c]),
        now(),
        id
      ]);
    },
    async remove(id: number): Promise<void> {
      await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    }
  };
}

export { now };
