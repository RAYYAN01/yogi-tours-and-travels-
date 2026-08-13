import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { injectViewLocals } from "./middleware/viewLocals.js";
import { ensureCsrfToken } from "./middleware/csrf.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

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

app.use(
  session({
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

app.listen(env.port, () => {
  console.log(`Yogi Tours & Travels server running at ${env.siteUrl} (port ${env.port}, ${env.nodeEnv})`);
});

export default app;
