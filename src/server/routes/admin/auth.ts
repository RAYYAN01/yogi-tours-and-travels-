import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  findAdminByUsername,
  setResetToken,
  findAdminByValidResetToken,
  clearResetToken,
  updateAdminPassword
} from "../../db/adminUsers.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";
import { sendAdminResetEmail } from "../../utils/mailer.js";
import { env } from "../../config/env.js";

const router = Router();

// Constant-effort fallback hash: compared against when the username doesn't
// exist, so login response time doesn't reveal whether an account exists
// (bcrypt.compareSync would otherwise be skipped entirely for unknown
// usernames, making that path measurably faster).
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

router.get("/login", (req, res) => {
  if (req.session.adminUsername) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", { error: null, layoutSection: "admin-auth" });
});

router.post("/login", verifyCsrfToken, async (req, res) => {
  const { username, password } = req.body || {};
  const user = typeof username === "string" ? await findAdminByUsername(username.trim()) : undefined;
  const passwordOk = bcrypt.compareSync(typeof password === "string" ? password : "", user?.passwordHash ?? DUMMY_HASH);
  const valid = Boolean(user) && passwordOk;

  if (!valid) {
    res.status(401).render("admin/login", { error: "Incorrect username or password.", layoutSection: "admin-auth" });
    return;
  }

  const returnTo = req.session.returnTo && req.session.returnTo.startsWith("/admin") ? req.session.returnTo : "/admin";

  // Regenerate the session on login to prevent session fixation — this clears
  // all existing session data, so returnTo was captured above before calling it.
  req.session.regenerate((err) => {
    if (err) {
      res.status(500).render("admin/login", { error: "Could not start a session. Please try again.", layoutSection: "admin-auth" });
      return;
    }
    // Safe: `valid` (checked above) is only true when `user` is defined.
    req.session.adminUsername = user!.username;
    res.redirect(returnTo);
  });
});

router.get("/forgot-password", (req, res) => {
  res.render("admin/forgot-password", { sent: false, layoutSection: "admin-auth" });
});

router.post("/forgot-password", verifyCsrfToken, async (req, res) => {
  const { username } = req.body || {};
  const user = typeof username === "string" ? await findAdminByUsername(username.trim()) : undefined;

  // Only act if the account exists, but always show the same response either
  // way — revealing whether a username exists is its own information leak.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    await setResetToken(user.username, tokenHash, expiresAt);
    const resetUrl = `${env.siteUrl}/admin/reset-password/${rawToken}`;
    const sent = await sendAdminResetEmail(resetUrl);
    if (!sent) {
      // SMTP isn't configured — the token is real and set, but nobody can
      // receive the link. Logged server-side (see mailer.ts) rather than
      // silently telling the visitor an email is on its way when it isn't.
      console.warn("[admin] Password reset requested but SMTP is not configured — no email could be sent.");
    }
  }

  res.render("admin/forgot-password", { sent: true, layoutSection: "admin-auth" });
});

router.get("/reset-password/:token", async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token ?? "").digest("hex");
  const user = await findAdminByValidResetToken(tokenHash);
  res.render("admin/reset-password", { token: req.params.token, valid: Boolean(user), error: null, layoutSection: "admin-auth" });
});

router.post("/reset-password/:token", verifyCsrfToken, async (req, res) => {
  const tokenHash = crypto.createHash("sha256").update(req.params.token ?? "").digest("hex");
  const user = await findAdminByValidResetToken(tokenHash);

  if (!user) {
    res.status(400).render("admin/reset-password", {
      token: req.params.token,
      valid: false,
      error: "This reset link is invalid or has expired.",
      layoutSection: "admin-auth"
    });
    return;
  }

  const { password, confirmPassword } = req.body || {};
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).render("admin/reset-password", {
      token: req.params.token,
      valid: true,
      error: "Password must be at least 8 characters.",
      layoutSection: "admin-auth"
    });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).render("admin/reset-password", {
      token: req.params.token,
      valid: true,
      error: "Passwords don't match.",
      layoutSection: "admin-auth"
    });
    return;
  }

  await updateAdminPassword(user.username, bcrypt.hashSync(password, 10));
  await clearResetToken(user.username);
  res.render("admin/login", { error: null, resetSuccess: true, layoutSection: "admin-auth" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
