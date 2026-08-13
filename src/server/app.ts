import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { initSchema, pool } from "./db/connection.js";
import { injectViewLocals } from "./middleware/viewLocals.js";
import { ensureCsrfToken } from "./middleware/csrf.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { LEGACY_REDIRECTS } from "./config/redirects.js";

import pagesRouter from "./routes/pages.js";
import vehiclesRouter from "./routes/vehicles.js";
import servicesRouter from "./routes/services.js";
import packagesRouter from "./routes/packages.js";
import galleryRouter from "./routes/gallery.js";
import blogRouter from "./routes/blog.js";
import apiRouter from "./routes/api.js";
import seoRouter from "./routes/seo.js";
import adminRouter from "./routes/admin/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../");

const app = express();

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(projectRoot, "src/views"));

app.use(
  helmet({
    contentSecurityPolicy: false // relaxed for a small server-rendered site; revisit with a strict CSP before production launch
  })
);
app.use(compression());
if (!env.isProd) {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Postgres schema creation is async (unlike the old node:sqlite version,
// which ran it synchronously at import time) — every request waits for the
// one-time CREATE TABLE IF NOT EXISTS pass before hitting a route. initSchema()
// memoizes its promise, so this is a no-op after the first request.
app.use((req, res, next) => {
  initSchema().then(() => next(), next);
});

const PgSession = connectPgSimple(session);

app.use(
  session({
    // Serverless instances don't share memory (and are recycled constantly),
    // so the default in-memory session store would log admins out at random.
    // Postgres-backed sessions survive across invocations the same way the
    // rest of the app's data does. createTableIfMissing handles first run.
    store: new PgSession({ pool, tableName: "session", createTableIfMissing: true }),
    name: "ytt.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProd,
      maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
  })
);

// Legacy URLs from the previous website — 301 to the closest current page
// so any residual Google ranking/backlinks transfer instead of hitting a 404.
app.use((req, res, next) => {
  const target = LEGACY_REDIRECTS[req.path];
  if (target) {
    res.redirect(301, target);
    return;
  }
  next();
});

app.use(ensureCsrfToken);
app.use(injectViewLocals);

app.use(
  "/assets/uploads",
  express.static(path.join(projectRoot, "public/assets/uploads"), { maxAge: env.isProd ? "7d" : 0 })
);
app.use(express.static(path.join(projectRoot, "public"), { maxAge: env.isProd ? "1d" : 0 }));

// Basic abuse protection on the public enquiry endpoint.
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again in a little while." }
});
app.use("/api/enquiry", enquiryLimiter);

// Brute-force protection on admin login.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/admin/login", loginLimiter);

app.use(seoRouter);
app.use(pagesRouter);
app.use("/fleet", vehiclesRouter);
app.use("/services", servicesRouter);
app.use("/tour-packages", packagesRouter);
app.use("/gallery", galleryRouter);
app.use("/blog", blogRouter);
app.use("/api", apiRouter);
app.use("/admin", adminRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Vercel's Node runtime invokes the exported app directly per-request — it
// does not want (and will not use) a listening server. api/index.js imports
// this same module for that environment.
if (!process.env.VERCEL) {
  app.listen(env.port, () => {
    console.log(`Yogi Tours & Travels server running at ${env.siteUrl} (port ${env.port}, ${env.nodeEnv})`);
  });
}

export default app;
