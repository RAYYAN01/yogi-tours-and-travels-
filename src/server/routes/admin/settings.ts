import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../middleware/auth.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";
import { setFlash } from "../../middleware/viewLocals.js";
import { findAdminByUsername, updateAdminPassword } from "../../db/adminUsers.js";

const router = Router();
router.use(requireAdmin);

router.get("/", (req, res) => {
  res.render("admin/settings", { error: null, layoutSection: "admin" });
});

router.post("/password", verifyCsrfToken, async (req, res) => {
  const username = req.session.adminUsername as string;
  const { currentPassword, newPassword, confirmPassword } = req.body || {};
  const user = await findAdminByUsername(username);

  if (!user || !bcrypt.compareSync(currentPassword || "", user.passwordHash)) {
    res.status(400).render("admin/settings", { error: "Current password is incorrect.", layoutSection: "admin" });
    return;
  }
  if (!newPassword || newPassword.length < 8) {
    res.status(400).render("admin/settings", { error: "New password must be at least 8 characters.", layoutSection: "admin" });
    return;
  }
  if (newPassword !== confirmPassword) {
    res.status(400).render("admin/settings", { error: "New password and confirmation do not match.", layoutSection: "admin" });
    return;
  }

  await updateAdminPassword(username, bcrypt.hashSync(newPassword, 10));
  setFlash(req, "success", "Password updated successfully.");
  res.redirect("/admin/settings");
});

export default router;
