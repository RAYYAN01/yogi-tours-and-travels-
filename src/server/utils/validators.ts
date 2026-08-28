export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const PHONE_RE = /^[+]?[\d\s-]{8,16}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EnquiryInput {
  type?: string;
  name?: string;
  phone?: string;
  email?: string;
  pickupLocation?: string;
  destination?: string;
  tripType?: string;
  pickupDate?: string;
  returnDate?: string;
  vehicleType?: string;
  passengers?: string;
  message?: string;
  sourcePage?: string;
  website?: string; // honeypot field
}

const VALID_TYPES = new Set(["outstation", "local", "airport", "quote", "contact", "package", "vehicle"]);

// Applied to every short free-text field below — generous enough for any
// real input, tight enough to stop a single field from carrying an
// oversized payload (the global 100kb body-size limit in app.ts already
// bounds the request as a whole; this bounds each field individually).
const SHORT_FIELD_MAX = 200;

function checkMaxLength(errors: Record<string, string>, key: string, value: string | undefined, label: string): void {
  if (value && value.length > SHORT_FIELD_MAX) {
    errors[key] = `${label} is too long.`;
  }
}

export function validateEnquiry(body: EnquiryInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.name || body.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  } else if (body.name.trim().length > 100) {
    errors.name = "Name is too long.";
  }

  if (!body.phone || !PHONE_RE.test(body.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (body.email && body.email.trim() !== "" && !EMAIL_RE.test(body.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (body.type && !VALID_TYPES.has(body.type)) {
    errors.type = "Invalid enquiry type.";
  }

  if (body.type === "outstation" || body.type === "local" || body.type === "airport") {
    if (!body.pickupLocation || body.pickupLocation.trim().length < 2) {
      errors.pickupLocation = "Please enter a pickup location.";
    }
  }
  if (body.type === "outstation" && (!body.destination || body.destination.trim().length < 2)) {
    errors.destination = "Please enter a destination.";
  }

  // The simplified enquiry forms (popup modal, Contact page, homepage widget)
  // send type "quote" / "contact" and always include a travel date.
  if ((body.type === "quote" || body.type === "contact") && !(body.pickupDate || "").trim()) {
    errors.pickupDate = "Please choose your travel date.";
  }

  checkMaxLength(errors, "pickupLocation", body.pickupLocation, "Pickup location");
  checkMaxLength(errors, "destination", body.destination, "Destination");
  checkMaxLength(errors, "tripType", body.tripType, "Trip type");
  checkMaxLength(errors, "vehicleType", body.vehicleType, "Vehicle type");
  checkMaxLength(errors, "pickupDate", body.pickupDate, "Travel date");
  checkMaxLength(errors, "returnDate", body.returnDate, "Return date");
  checkMaxLength(errors, "passengers", body.passengers, "Passengers");
  checkMaxLength(errors, "sourcePage", body.sourcePage, "Source page");

  if (body.message && body.message.length > 2000) {
    errors.message = "Message is too long.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
