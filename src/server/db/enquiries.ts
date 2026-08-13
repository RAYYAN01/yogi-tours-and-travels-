import { db } from "./connection.js";
import { toPlain, toPlainList } from "./repo.js";
import type { Enquiry, EnquiryStatus } from "../types/models.js";

export interface NewEnquiry {
  type: Enquiry["type"];
  name: string;
  phone: string;
  email?: string | null;
  pickupLocation?: string | null;
  destination?: string | null;
  tripType?: string | null;
  pickupDate?: string | null;
  returnDate?: string | null;
  vehicleType?: string | null;
  passengers?: string | null;
  message?: string | null;
  sourcePage?: string | null;
}

export function createEnquiry(data: NewEnquiry): number {
  const stmt = db.prepare(`
    INSERT INTO enquiries
      (type, name, phone, email, pickupLocation, destination, tripType, pickupDate, returnDate, vehicleType, passengers, message, sourcePage, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
  `);
  const info = stmt.run(
    data.type,
    data.name,
    data.phone,
    data.email ?? null,
    data.pickupLocation ?? null,
    data.destination ?? null,
    data.tripType ?? null,
    data.pickupDate ?? null,
    data.returnDate ?? null,
    data.vehicleType ?? null,
    data.passengers ?? null,
    data.message ?? null,
    data.sourcePage ?? null
  );
  return Number(info.lastInsertRowid);
}

export function allEnquiries(statusFilter?: EnquiryStatus): Enquiry[] {
  if (statusFilter) {
    return toPlainList<Enquiry>(
      db.prepare("SELECT * FROM enquiries WHERE status = ? ORDER BY createdAt DESC").all(statusFilter)
    );
  }
  return toPlainList<Enquiry>(db.prepare("SELECT * FROM enquiries ORDER BY createdAt DESC").all());
}

export function findEnquiry(id: number): Enquiry | undefined {
  return toPlain<Enquiry>(db.prepare("SELECT * FROM enquiries WHERE id = ?").get(id));
}

export function updateEnquiryStatus(id: number, status: EnquiryStatus): void {
  db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, id);
}

export function enquiryCounts(): { total: number; new: number; contacted: number; closed: number } {
  const rows = toPlainList<{ status: EnquiryStatus; c: number }>(
    db.prepare("SELECT status, COUNT(*) as c FROM enquiries GROUP BY status").all()
  );
  const counts = { total: 0, new: 0, contacted: 0, closed: 0 };
  for (const row of rows) {
    counts[row.status] = row.c;
    counts.total += row.c;
  }
  return counts;
}
