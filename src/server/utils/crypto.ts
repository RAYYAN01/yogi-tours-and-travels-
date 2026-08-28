import crypto from "node:crypto";
import { env } from "../config/env.js";

// AES-256-GCM field-level encryption for PII stored in the database (enquiry
// name/phone/email — see db/enquiries.ts). Ciphertext is self-describing
// (prefixed) so plaintext rows written before ENCRYPTION_KEY was configured
// still read back correctly instead of erroring.
const ALGO = "aes-256-gcm";
const PREFIX = "enc:v1:";
const IV_LEN = 12;
const TAG_LEN = 16;

let cachedKey: Buffer | null | undefined;

function getKey(): Buffer | null {
  if (cachedKey !== undefined) return cachedKey;
  if (!env.encryptionKey) {
    cachedKey = null;
    return cachedKey;
  }
  const key = Buffer.from(env.encryptionKey, "hex");
  if (key.length !== 32) {
    console.warn("[crypto] ENCRYPTION_KEY must be 32 bytes (64 hex chars) — field encryption disabled.");
    cachedKey = null;
    return cachedKey;
  }
  cachedKey = key;
  return cachedKey;
}

/** Encrypts a field for storage. Returns the plaintext unchanged if ENCRYPTION_KEY isn't configured. */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === "") return plaintext ?? null;
  const key = getKey();
  if (!key) return plaintext;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

/** Decrypts a field read from storage. Values without the encryption prefix (legacy plaintext rows) pass through unchanged. */
export function decryptField(value: string | null): string | null {
  if (value == null || !value.startsWith(PREFIX)) return value;
  const key = getKey();
  if (!key) return value;
  try {
    const raw = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, IV_LEN);
    const authTag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ciphertext = raw.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString("utf8");
  } catch (err) {
    console.error("[crypto] Failed to decrypt field — wrong ENCRYPTION_KEY?", err);
    return "[decryption failed]";
  }
}
