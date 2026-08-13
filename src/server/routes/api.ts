import { Router } from "express";
import { validateEnquiry } from "../utils/validators.js";
import { createEnquiry } from "../db/enquiries.js";
import { buildWhatsAppLink } from "../utils/whatsapp.js";
import { notifyNewEnquiry } from "../utils/mailer.js";
import type { NewEnquiry } from "../db/enquiries.js";
import type { EnquiryType } from "../types/models.js";

const router = Router();

router.post("/enquiry", async (req, res) => {
  const body = req.body || {};

  // Honeypot: bots fill every field including the hidden one. Pretend success, store nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    res.json({ success: true, whatsappUrl: `https://wa.me/`, message: "Thanks — we'll be in touch." });
    return;
  }

  const { valid, errors } = validateEnquiry(body);
  if (!valid) {
    res.status(400).json({ success: false, errors });
    return;
  }

  // Combine date + time for airport bookings into a single readable pickupDate.
  let pickupDate: string | null = body.pickupDate || null;
  if (body.pickupTime && pickupDate) {
    pickupDate = `${pickupDate} ${body.pickupTime}`;
  }
  let message: string | undefined = body.message;
  if (body.customDuration) {
    message = `Custom duration requested: ${body.customDuration}${message ? " — " + message : ""}`;
  }

  const enquiry: NewEnquiry = {
    type: (body.type as EnquiryType) || "contact",
    name: String(body.name).trim(),
    phone: String(body.phone).trim(),
    email: body.email ? String(body.email).trim() : null,
    pickupLocation: body.pickupLocation || null,
    destination: body.destination || null,
    tripType: body.tripType || null,
    pickupDate,
    returnDate: body.returnDate || null,
    vehicleType: body.vehicleType || null,
    passengers: body.passengers || null,
    message: message || null,
    sourcePage: body.sourcePage || req.get("referer") || null
  };

  try {
    const id = await createEnquiry(enquiry);
    const whatsappUrl = buildWhatsAppLink(enquiry);
    void notifyNewEnquiry(enquiry);
    res.json({
      success: true,
      id,
      whatsappUrl,
      message: "Enquiry saved. Continue on WhatsApp to reach our team instantly."
    });
  } catch (err) {
    console.error("Failed to save enquiry:", err);
    res.status(500).json({ success: false, message: "Something went wrong saving your enquiry. Please call or WhatsApp us directly." });
  }
});

export default router;
