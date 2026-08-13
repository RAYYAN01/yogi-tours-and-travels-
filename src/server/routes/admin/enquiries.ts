import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";
import { setFlash } from "../../middleware/viewLocals.js";
import { allEnquiries, findEnquiry, updateEnquiryStatus } from "../../db/enquiries.js";
import type { EnquiryStatus } from "../../types/models.js";

const router = Router();
router.use(requireAdmin);

const VALID_STATUSES: EnquiryStatus[] = ["new", "contacted", "closed"];

router.get("/", (req, res) => {
  const status = typeof req.query.status === "string" && VALID_STATUSES.includes(req.query.status as EnquiryStatus)
    ? (req.query.status as EnquiryStatus)
    : undefined;
  res.render("admin/enquiries-list", {
    enquiries: allEnquiries(status),
    statusFilter: status || "all",
    layoutSection: "admin"
  });
});

router.get("/:id", (req, res, next) => {
  const enquiry = findEnquiry(Number(req.params.id));
  if (!enquiry) {
    next();
    return;
  }
  res.render("admin/enquiry-detail", { enquiry, layoutSection: "admin" });
});

router.post("/:id/status", verifyCsrfToken, (req, res) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  if (VALID_STATUSES.includes(status)) {
    updateEnquiryStatus(id, status);
    setFlash(req, "success", "Enquiry status updated.");
  }
  res.redirect(`/admin/enquiries/${id}`);
});

export default router;
