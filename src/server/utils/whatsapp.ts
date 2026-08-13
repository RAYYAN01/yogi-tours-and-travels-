import { whatsappDigits } from "../config/env.js";
import type { NewEnquiry } from "../db/enquiries.js";

/** Builds a wa.me deep link pre-filled with a readable summary of the enquiry. */
export function buildWhatsAppLink(enquiry: NewEnquiry): string {
  const lines: string[] = [`New enquiry from the website (${labelForType(enquiry.type)})`, ""];
  lines.push(`Name: ${enquiry.name}`);
  lines.push(`Phone: ${enquiry.phone}`);
  if (enquiry.email) lines.push(`Email: ${enquiry.email}`);
  if (enquiry.pickupLocation) lines.push(`Pickup: ${enquiry.pickupLocation}`);
  if (enquiry.destination) lines.push(`Destination: ${enquiry.destination}`);
  if (enquiry.tripType) lines.push(`Trip Type: ${enquiry.tripType}`);
  if (enquiry.pickupDate) lines.push(`Pickup Date: ${enquiry.pickupDate}`);
  if (enquiry.returnDate) lines.push(`Return Date: ${enquiry.returnDate}`);
  if (enquiry.vehicleType) lines.push(`Vehicle: ${enquiry.vehicleType}`);
  if (enquiry.passengers) lines.push(`Passengers: ${enquiry.passengers}`);
  if (enquiry.message) lines.push(`Message: ${enquiry.message}`);
  if (enquiry.sourcePage) lines.push("", `Page: ${enquiry.sourcePage}`);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappDigits()}?text=${text}`;
}

function labelForType(type: NewEnquiry["type"]): string {
  const labels: Record<NewEnquiry["type"], string> = {
    outstation: "Outstation Booking",
    local: "Local / Intercity Booking",
    airport: "Airport Transfer",
    quote: "Quote Request",
    contact: "Contact Enquiry",
    package: "Tour Package Enquiry",
    vehicle: "Vehicle Enquiry"
  };
  return labels[type];
}
