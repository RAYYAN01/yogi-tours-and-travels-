import { Router } from "express";
import bcrypt from "bcryptjs";
import { findAdminByUsername } from "../../db/adminUsers.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";

const router = Router();

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
  const valid = user && typeof password === "string" && bcrypt.compareSync(password, user.passwordHash);

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
    req.session.adminUsername = user.username;
    res.redirect(returnTo);
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
