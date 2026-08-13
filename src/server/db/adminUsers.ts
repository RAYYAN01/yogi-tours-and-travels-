import { db } from "./connection.js";
import { toPlain } from "./repo.js";
import type { AdminUser } from "../types/models.js";

export function findAdminByUsername(username: string): AdminUser | undefined {
  return toPlain<AdminUser>(db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username));
}

export function createAdminUser(username: string, passwordHash: string): number {
  const info = db
    .prepare("INSERT INTO admin_users (username, passwordHash) VALUES (?, ?)")
    .run(username, passwordHash);
  return Number(info.lastInsertRowid);
}

export function adminUserCount(): number {
  const row = toPlain<{ c: number }>(db.prepare("SELECT COUNT(*) as c FROM admin_users").get());
  return row?.c ?? 0;
}

export function updateAdminPassword(username: string, passwordHash: string): void {
  db.prepare("UPDATE admin_users SET passwordHash = ? WHERE username = ?").run(passwordHash, username);
}
