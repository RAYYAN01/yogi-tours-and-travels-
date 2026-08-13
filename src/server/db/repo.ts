import { db } from "./connection.js";

/** node:sqlite returns null-prototype row objects; normalize to plain objects. */
export function toPlain<T>(row: unknown): T {
  return row ? ({ ...(row as Record<string, unknown>) } as T) : (row as T);
}

export function toPlainList<T>(rows: unknown[]): T[] {
  return rows.map((r) => toPlain<T>(r));
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

interface RepoOptions {
  table: string;
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
  const orderBy = opts.orderBy ?? "sortOrder ASC, id ASC";

  return {
    all(): T[] {
      return toPlainList<T>(db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all());
    },
    allWhere(whereSql: string, ...params: unknown[]): T[] {
      return toPlainList<T>(
        db.prepare(`SELECT * FROM ${table} WHERE ${whereSql} ORDER BY ${orderBy}`).all(...(params as never[]))
      );
    },
    findById(id: number): T | undefined {
      return toPlain<T>(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id));
    },
    findBySlug(slug: string): T | undefined {
      return toPlain<T>(db.prepare(`SELECT * FROM ${table} WHERE slug = ?`).get(slug));
    },
    count(): number {
      const row = toPlain<{ c: number }>(db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get());
      return row?.c ?? 0;
    },
    insert(data: Record<string, unknown>): number {
      const cols = Object.keys(data);
      const placeholders = cols.map(() => "?").join(", ");
      const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`);
      const info = stmt.run(...(cols.map((c) => data[c]) as never[]));
      return Number(info.lastInsertRowid);
    },
    update(id: number, data: Record<string, unknown>): void {
      const cols = Object.keys(data);
      if (cols.length === 0) return;
      const setSql = cols.map((c) => `${c} = ?`).join(", ");
      const stmt = db.prepare(`UPDATE ${table} SET ${setSql}, updatedAt = ? WHERE id = ?`);
      stmt.run(...(cols.map((c) => data[c]) as never[]), now(), id);
    },
    remove(id: number): void {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    }
  };
}

export { now };
