const PHONE_RE = /^[+]?[\d\s-]{8,16}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Mirrors src/server/utils/validators.ts so users see the same errors
 * instantly, before the round-trip. Validates the already-collected payload
 * (see collectFormPayload in enquiryForm.ts) rather than walking the DOM —
 * the booking widget has three tab panels sharing field names, so validating
 * against raw form elements would pick up the wrong (inactive) panel's field.
 */
export function validateEnquiryPayload(payload: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = (payload.name || "").trim();
  if (!name || name.length < 2) errors.name = "Please enter your full name.";

  const phone = (payload.phone || "").trim();
  if (!phone || !PHONE_RE.test(phone)) errors.phone = "Please enter a valid phone number.";

  const email = (payload.email || "").trim();
  if (email && !EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";

  const type = payload.type;
  if (type === "outstation" || type === "local" || type === "airport") {
    const pickup = (payload.pickupLocation || "").trim();
    if (!pickup || pickup.length < 2) errors.pickupLocation = "Please enter a pickup location.";
  }
  if (type === "outstation") {
    const destination = (payload.destination || "").trim();
    if (!destination || destination.length < 2) errors.destination = "Please enter a destination.";
  }
  if (type === "contact") {
    const message = (payload.message || "").trim();
    if (!message || message.length < 3) errors.message = "Please enter a message.";
  }

  return errors;
}
