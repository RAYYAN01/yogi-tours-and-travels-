import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";

// KNOWN LIMITATION ON VERCEL: this writes to local disk, which Vercel's
// serverless functions serve read-only (only /tmp is writable, and it's
// wiped between invocations). The admin "upload a photo" file input will
// error there. The "or paste an image URL" text field next to it in every
// admin image form still works — paste a path to an asset already in the
// repo, or a URL from external image hosting — until this is swapped for a
// real object-storage upload (Vercel Blob, S3, Cloudinary, etc).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../../public/assets/uploads");

// SVG deliberately excluded: it can embed <script>, making it a stored-XSS
// vector if the file is ever opened directly rather than embedded as an
// <img> (which strips scripting). Raster formats cover every real use case
// here (vehicle/service/gallery photos).
//
// The stored file's extension is ALWAYS taken from this map (see
// saveUploadedFile below), never from the client-supplied original
// filename — a request can name its upload "x.html" while claiming an
// allowed image Content-Type, and the extension is what express.static
// later serves the file as. Keying the extension off the same validated
// allowlist as the MIME check means the two can never disagree with each
// other, which is what made that mismatch exploitable in the first place.
const ALLOWED_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif"
};

// Buffered in memory rather than written straight to disk: multer has to
// run before the admin CSRF check, because the CSRF token is itself a
// field in this same multipart body — something has to parse the body
// before verifyCsrfToken can read it. If multer wrote the file to a
// publicly servable path as a side effect of that parsing, a request that
// goes on to fail CSRF verification would already have left an
// attacker-supplied file live on disk before the 403 is ever returned.
// Deferring the actual write to saveUploadedFile() — called from inside
// the route handler, i.e. only once verifyCsrfToken has already passed —
// closes that gap.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_EXT[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, AVIF, GIF) are allowed."));
    }
  }
});

/**
 * Writes an in-memory uploaded file to disk under a name whose extension is
 * derived solely from its validated mimetype, and returns its public path.
 * Call only after every other request validation (CSRF included) has
 * already passed.
 */
export function saveUploadedFile(file: Express.Multer.File): string {
  const ext = ALLOWED_MIME_EXT[file.mimetype] ?? ".jpg";
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, name), file.buffer);
  return `/assets/uploads/${name}`;
}
