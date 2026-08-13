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
