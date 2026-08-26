import { queryOne, run } from "./connection.js";
import type { AdminUser } from "../types/models.js";

export async function findAdminByUsername(username: string): Promise<AdminUser | undefined> {
  return queryOne<AdminUser>("SELECT * FROM admin_users WHERE username = ?", [username]);
}

export async function createAdminUser(username: string, passwordHash: string): Promise<number> {
  const row = await queryOne<{ id: number }>(
    'INSERT INTO admin_users (username, "passwordHash") VALUES (?, ?) RETURNING id',
    [username, passwordHash]
  );
  return row?.id ?? 0;
}

export async function adminUserCount(): Promise<number> {
  const row = await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM admin_users");
  return row ? Number(row.c) : 0;
}

export async function updateAdminPassword(username: string, passwordHash: string): Promise<void> {
  await run('UPDATE admin_users SET "passwordHash" = ? WHERE username = ?', [passwordHash, username]);
}

/** Stores a hash of the reset token (never the raw token) plus its expiry — the raw token only ever exists in the emailed link. */
export async function setResetToken(username: string, tokenHash: string, expiresAt: string): Promise<void> {
  await run('UPDATE admin_users SET "resetTokenHash" = ?, "resetTokenExpires" = ? WHERE username = ?', [
    tokenHash,
    expiresAt,
    username
  ]);
}

/** Looks up an admin by reset-token hash, but only returns it if the token hasn't expired. */
export async function findAdminByValidResetToken(tokenHash: string): Promise<AdminUser | undefined> {
  return queryOne<AdminUser>(
    'SELECT * FROM admin_users WHERE "resetTokenHash" = ? AND "resetTokenExpires" > ?',
    [tokenHash, new Date().toISOString()]
  );
}

/** Clears the reset token after it's been used (or to invalidate it early). */
export async function clearResetToken(username: string): Promise<void> {
  await run('UPDATE admin_users SET "resetTokenHash" = NULL, "resetTokenExpires" = NULL WHERE username = ?', [username]);
}
