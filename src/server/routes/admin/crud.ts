import { Router, type RequestHandler } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { verifyCsrfToken } from "../../middleware/csrf.js";
import { setFlash } from "../../middleware/viewLocals.js";
import { upload, uploadedPath } from "../../middleware/upload.js";
import { slugify } from "../../utils/slug.js";
import { linesToJsonArray, parseJsonArray } from "../../db/repo.js";
import { resources, type ResourceConfig, type FieldConfig } from "./resourceConfig.js";

const router = Router();
router.use(requireAdmin);

async function uniqueSlug(resource: ResourceConfig, base: string, ignoreId?: number): Promise<string> {
  let slug = slugify(base) || "item";
  let n = 2;
  // repo.findBySlug throws if the table has no slug column, but slugSource is only set for
  // resources that do have one, so this is safe for the resources that call uniqueSlug().
  while (true) {
    const existing = await resource.repo.findBySlug(slug);
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${slugify(base)}-${n++}`;
  }
}

function buildRecordFromBody(
  resource: ResourceConfig,
  body: Record<string, unknown>,
  file: Express.Multer.File | undefined,
  existingImage: string | undefined,
  isCreate: boolean
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const field of resource.fields) {
    const raw = body[field.name];
    switch (field.type) {
      case "checkbox":
        record[field.name] = raw ? 1 : 0;
        break;
      case "number":
        record[field.name] = raw !== undefined && raw !== "" ? Number(raw) : Number(field.defaultValue ?? 0);
        break;
      case "lines":
        record[field.name] = linesToJsonArray(typeof raw === "string" ? raw : "");
        break;
      case "image": {
        if (file) {
          record[field.name] = uploadedPath(file.filename);
        } else if (typeof raw === "string" && raw.trim() !== "") {
          record[field.name] = raw.trim();
        } else {
          record[field.name] = existingImage ?? "";
        }
        break;
      }
      default:
        record[field.name] = typeof raw === "string" ? raw.trim() : (field.defaultValue ?? "");
    }
  }

  if (resource.slugSource) {
    const sourceValue = String(record[resource.slugSource] ?? "");
    const providedSlug = typeof body.slug === "string" && body.slug.trim() !== "" ? body.slug : sourceValue;
    record.slug = providedSlug; // finalized (uniqueness-checked) by the caller
  }

  if (resource.key === "blog" && isCreate) {
    // new post: stamp publishedAt now
    record.publishedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
  }

  return record;
}

function findImageField(resource: ResourceConfig): FieldConfig | undefined {
  return resource.fields.find((f) => f.type === "image");
}

resources.forEach((resource) => {
  const imageField = findImageField(resource);
  // Every generic-form.ejs submits as multipart/form-data (so resources with
  // a photo field can attach a file), even resources with no image field of
  // their own — so multer must run unconditionally here. Without it,
  // req.body would be empty for those submissions: express.json()/
  // express.urlencoded() only parse json/urlencoded bodies, not multipart.
  const maybeUpload: RequestHandler = upload.single("imageFile");

  // LIST
  router.get(`/${resource.key}`, async (req, res, next) => {
    try {
      const items = await resource.repo.all();
      res.render("admin/generic-list", { resource, items, layoutSection: "admin" });
    } catch (err) {
      next(err);
    }
  });

  // NEW FORM
  router.get(`/${resource.key}/new`, (req, res) => {
    res.render("admin/generic-form", { resource, item: null, mode: "create", errors: null, layoutSection: "admin" });
  });

  // CREATE
  router.post(`/${resource.key}`, maybeUpload, verifyCsrfToken, async (req, res) => {
    try {
      const record = buildRecordFromBody(resource, req.body, req.file, undefined, true);
      if (resource.slugSource) {
        record.slug = await uniqueSlug(resource, String(record.slug || ""));
      }
      const id = await resource.repo.insert(record);
      setFlash(req, "success", `${resource.singular} created successfully.`);
      res.redirect(`/admin/${resource.key}/${id}/edit`);
    } catch (err) {
      console.error(`Failed to create ${resource.key}:`, err);
      res.status(400).render("admin/generic-form", {
        resource,
        item: req.body,
        mode: "create",
        errors: "Something went wrong saving this item. Please check the fields and try again.",
        layoutSection: "admin"
      });
    }
  });

  // EDIT FORM
  router.get(`/${resource.key}/:id/edit`, async (req, res, next) => {
    try {
      const item = await resource.repo.findById(Number(req.params.id));
      if (!item) {
        next();
        return;
      }
      // Expand JSON "lines" fields back into newline-separated text for the textarea.
      const viewItem: Record<string, unknown> = { ...item };
      for (const f of resource.fields) {
        if (f.type === "lines") {
          viewItem[f.name] = parseJsonArray(viewItem[f.name] as string).join("\n");
        }
      }
      res.render("admin/generic-form", { resource, item: viewItem, mode: "edit", errors: null, layoutSection: "admin" });
    } catch (err) {
      next(err);
    }
  });

  // UPDATE
  router.post(`/${resource.key}/:id`, maybeUpload, verifyCsrfToken, async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const existing = await resource.repo.findById(id);
      if (!existing) {
        res.status(404).render("admin/error", { title: "Not found", message: "That item no longer exists.", layoutSection: "admin" });
        return;
      }
      try {
        const existingImageValue = imageField ? String((existing as Record<string, unknown>)[imageField.name] ?? "") : undefined;
        const record = buildRecordFromBody(resource, req.body, req.file, existingImageValue, false);
        delete record.publishedAt; // never overwrite original publish date from the edit form
        if (resource.slugSource) {
          record.slug = await uniqueSlug(resource, String(record.slug || ""), id);
        }
        await resource.repo.update(id, record);
        setFlash(req, "success", `${resource.singular} updated successfully.`);
        res.redirect(`/admin/${resource.key}/${id}/edit`);
      } catch (err) {
        console.error(`Failed to update ${resource.key} #${id}:`, err);
        res.status(400).render("admin/generic-form", {
          resource,
          item: { ...req.body, id },
          mode: "edit",
          errors: "Something went wrong saving this item. Please check the fields and try again.",
          layoutSection: "admin"
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // DELETE
  router.post(`/${resource.key}/:id/delete`, verifyCsrfToken, async (req, res, next) => {
    try {
      await resource.repo.remove(Number(req.params.id));
      setFlash(req, "success", `${resource.singular} deleted.`);
      res.redirect(`/admin/${resource.key}`);
    } catch (err) {
      next(err);
    }
  });
});

export default router;
