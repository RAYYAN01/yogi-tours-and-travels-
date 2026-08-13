import { query, queryOne, run } from "./connection.js";
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

export async function createEnquiry(data: NewEnquiry): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `
    INSERT INTO enquiries
      (type, name, phone, email, "pickupLocation", destination, "tripType", "pickupDate", "returnDate", "vehicleType", passengers, message, "sourcePage", status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    RETURNING id
  `,
    [
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
    ]
  );
  return row?.id ?? 0;
}

export async function allEnquiries(statusFilter?: EnquiryStatus): Promise<Enquiry[]> {
  if (statusFilter) {
    return query<Enquiry>('SELECT * FROM enquiries WHERE status = ? ORDER BY "createdAt" DESC', [statusFilter]);
  }
  return query<Enquiry>('SELECT * FROM enquiries ORDER BY "createdAt" DESC');
}

export async function findEnquiry(id: number): Promise<Enquiry | undefined> {
  return queryOne<Enquiry>("SELECT * FROM enquiries WHERE id = ?", [id]);
}

export async function updateEnquiryStatus(id: number, status: EnquiryStatus): Promise<void> {
  await run("UPDATE enquiries SET status = ? WHERE id = ?", [status, id]);
}

export async function enquiryCounts(): Promise<{ total: number; new: number; contacted: number; closed: number }> {
  const rows = await query<{ status: EnquiryStatus; c: string }>(
    "SELECT status, COUNT(*) as c FROM enquiries GROUP BY status"
  );
  const counts = { total: 0, new: 0, contacted: 0, closed: 0 };
  for (const row of rows) {
    const c = Number(row.c);
    counts[row.status] = c;
    counts.total += c;
  }
  return counts;
}
