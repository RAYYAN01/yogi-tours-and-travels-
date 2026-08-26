import nodemailer from "nodemailer";
import { env, business } from "../config/env.js";
import type { NewEnquiry } from "../db/enquiries.js";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
  }
  return transporter;
}

/**
 * Sends a notification email for a new enquiry when SMTP is configured.
 * If SMTP env vars are missing, this is a deliberate no-op — the enquiry is
 * already safely stored in the database and visible in /admin, so a missing
 * mail server never blocks or breaks the enquiry flow.
 */
export async function notifyNewEnquiry(enquiry: NewEnquiry): Promise<void> {
  const t = getTransporter();
  const to = env.smtp.notifyTo || business.email;
  if (!t) {
    console.log(`[mailer] SMTP not configured — skipping email notification for enquiry from ${enquiry.name}.`);
    return;
  }
  try {
    await t.sendMail({
      from: `"${business.name} Website" <${env.smtp.user}>`,
      to,
      subject: `New website enquiry — ${enquiry.type} — ${enquiry.name}`,
      text: Object.entries(enquiry)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    });
  } catch (err) {
    console.error("[mailer] Failed to send enquiry notification email:", err);
  }
}

/**
 * Sends the admin password-reset link. Same deliberate no-op behaviour as
 * notifyNewEnquiry when SMTP isn't configured — returns false so the caller
 * can log it, rather than silently pretending an email went out.
 */
export async function sendAdminResetEmail(resetUrl: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] SMTP not configured — cannot send admin password reset email. Reset URL: ${resetUrl}`);
    return false;
  }
  try {
    await t.sendMail({
      from: `"${business.name} Website" <${env.smtp.user}>`,
      to: env.smtp.notifyTo || business.email,
      subject: `Reset your ${business.name} admin password`,
      text: `A password reset was requested for the ${business.name} admin panel.\n\nReset it here (valid for 30 minutes): ${resetUrl}\n\nIf you didn't request this, you can ignore this email — your password won't change unless the link above is used.`
    });
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send admin reset email:", err);
    return false;
  }
}
