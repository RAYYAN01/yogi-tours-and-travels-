import { qs, qsa } from "../utils/dom.js";
import { validateEnquiryPayload } from "../utils/validation.js";
import type { EnquiryApiResponse, FormState } from "../types.js";

function setRootState(root: HTMLElement, state: FormState): void {
  qsa<HTMLElement>("[data-form-state]", root).forEach((el) => {
    el.classList.toggle("hidden", el.dataset.formState !== state);
  });
}

function clearErrors(form: HTMLFormElement): void {
  qsa<HTMLElement>("[data-error-for]", form.closest("[data-enquiry-root]") || form).forEach((el) => {
    el.textContent = "";
  });
  qsa<HTMLInputElement>(".field-invalid", form).forEach((el) => el.classList.remove("field-invalid"));
}

/**
 * Like qs(), but skips matches sitting inside a hidden booking-widget tab
 * panel. Every tab panel repeats field names (`pickupLocation`, etc.) and
 * their own `[data-error-for]` slots, so an unscoped querySelector would
 * always resolve to the first (outstation) panel's element regardless of
 * which tab is actually active — silently writing errors where the user
 * can't see them.
 */
function qsVisible<T extends HTMLElement>(selector: string, root: ParentNode): T | null {
  return qsa<T>(selector, root).find((el) => {
    const panel = el.closest<HTMLElement>("[data-booking-panel]");
    return !panel || !panel.hidden;
  }) || null;
}

function showErrors(root: HTMLElement, form: HTMLFormElement, errors: Record<string, string>): void {
  let firstInvalid: HTMLElement | null = null;
  Object.entries(errors).forEach(([field, message]) => {
    // `[data-error-for="_form"]` doubles as the generic/non-field-specific error slot.
    const errorEl = qsVisible<HTMLElement>(`[data-error-for="${field}"]`, root);
    if (errorEl) errorEl.textContent = message;
    const input = qsVisible<HTMLElement>(`[name="${field}"]`, form);
    if (input) {
      input.classList.add("field-invalid");
      if (!firstInvalid) firstInvalid = input;
    }
  });
  (firstInvalid as HTMLElement | null)?.focus();
}

function setLoading(form: HTMLFormElement, loading: boolean): void {
  // Booking widget forms have one submit button per tab panel (same
  // data-submit-button marker) — only the visible tab's button should react.
  const btn = qsVisible<HTMLButtonElement>("[data-submit-button]", form);
  if (!btn) return;
  btn.disabled = loading;
  const label = qs<HTMLElement>("[data-btn-label]", btn);
  const spinner = qs<SVGElement>("svg", btn);
  if (label) label.textContent = loading ? "Sending..." : (label.dataset.originalLabel ?? label.textContent ?? "Send");
  if (!label?.dataset.originalLabel && label) label.dataset.originalLabel = label.textContent || "";
  spinner?.classList.toggle("hidden", !loading);
}

/**
 * Reads form fields into a plain payload — deliberately NOT a naive
 * `new FormData(form)` walk. The booking widget's three tabs (outstation /
 * local / airport) share field names like `type` and `pickupLocation` across
 * hidden panels, so a flat FormData walk would collect duplicates and the
 * last panel in DOM order (airport) would silently win regardless of the
 * active tab. Skipping fields inside a hidden `[data-booking-panel]` avoids
 * that, and forms without panels (contact page, enquiry modal) are
 * unaffected since the filter is then a no-op.
 */
function collectFormPayload(form: HTMLFormElement): Record<string, string> {
  const payload: Record<string, string> = {};
  Array.from(form.elements).forEach((el) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) return;
    if (!el.name || el.disabled) return;
    const panel = el.closest<HTMLElement>("[data-booking-panel]");
    if (panel && panel.hidden) return;
    if (el instanceof HTMLInputElement && (el.type === "radio" || el.type === "checkbox") && !el.checked) return;
    payload[el.name] = el.value;
  });
  return payload;
}

async function submitEnquiry(form: HTMLFormElement, root: HTMLElement): Promise<void> {
  clearErrors(form);
  const payload = collectFormPayload(form);
  payload.sourcePage = window.location.pathname;

  const clientErrors = validateEnquiryPayload(payload);
  if (Object.keys(clientErrors).length > 0) {
    showErrors(root, form, clientErrors);
    return;
  }

  setLoading(form, true);

  try {
    const response = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = (await response.json()) as EnquiryApiResponse;

    if (response.ok && data.success) {
      const whatsappLinks = qsa<HTMLAnchorElement>("[data-success-whatsapp]", root);
      whatsappLinks.forEach((a) => (a.href = data.whatsappUrl));
      setRootState(root, "success");
      qs<HTMLElement>('[data-form-state="success"] a, [data-form-state="success"] button', root)?.focus();
      return;
    }

    if (!data.success && data.errors) {
      showErrors(root, form, data.errors);
      return;
    }

    setRootState(root, "error");
  } catch {
    setRootState(root, "error");
  } finally {
    setLoading(form, false);
  }
}

export function initEnquiryForms(): void {
  qsa<HTMLElement>("[data-enquiry-root]").forEach((root) => {
    const form = qs<HTMLFormElement>("[data-enquiry-form]", root);
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitEnquiry(form, root);
    });

    qsa<HTMLButtonElement>("[data-form-reset]", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        form.reset();
        clearErrors(form);
        setRootState(root, "idle");
      });
    });

    qsa<HTMLButtonElement>("[data-form-retry]", root).forEach((btn) => {
      btn.addEventListener("click", () => setRootState(root, "idle"));
    });
  });
}

/** Resets a form's root back to its idle state — used when the enquiry modal reopens for a new trigger. */
export function resetEnquiryRoot(root: HTMLElement): void {
  const form = qs<HTMLFormElement>("[data-enquiry-form]", root);
  if (!form) return;
  form.reset();
  clearErrors(form);
  setRootState(root, "idle");
}

export function prefillEnquiryForm(
  root: HTMLElement,
  fields: { type?: string; message?: string; vehicleType?: string }
): void {
  const form = qs<HTMLFormElement>("[data-enquiry-form]", root);
  if (!form) return;
  if (fields.type) {
    const typeInput = qs<HTMLInputElement>('[name="type"]', form);
    if (typeInput) typeInput.value = fields.type;
  }
  if (fields.message) {
    const messageInput = qs<HTMLTextAreaElement>('[name="message"]', form);
    if (messageInput && !messageInput.value) messageInput.value = fields.message;
  }
  if (fields.vehicleType) {
    const vehicleInput = qs<HTMLSelectElement | HTMLInputElement>('[name="vehicleType"]', form);
    if (vehicleInput) {
      vehicleInput.value = fields.vehicleType;
      // The <select> is visually replaced by a custom listbox (customSelect.ts)
      // that only re-syncs its label on "change" — fire one so the prefilled
      // vehicle actually shows.
      vehicleInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
}
