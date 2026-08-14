import { Router } from "express";
import bcrypt from "bcryptjs";
import { findAdminByUsername } from "../../db/adminUsers.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";

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

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
