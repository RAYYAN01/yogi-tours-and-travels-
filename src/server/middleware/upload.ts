import path from "node:path";
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
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, name);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, AVIF, GIF, SVG) are allowed."));
    }
  }
});

export function uploadedPath(filename: string): string {
  return `/assets/uploads/${filename}`;
}
