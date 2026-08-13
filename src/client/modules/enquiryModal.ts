import { qs, qsa, trapFocus, lockScroll } from "../utils/dom.js";
import { prefillEnquiryForm, resetEnquiryRoot } from "./enquiryForm.js";

export function initEnquiryModal(): void {
  const overlay = qs<HTMLElement>("#enquiry-modal-overlay");
  const modal = qs<HTMLElement>("#enquiry-modal");
  const panel = qs<HTMLElement>("#enquiry-modal-panel");
  const closeBtn = qs<HTMLButtonElement>("#enquiry-modal-close");
  if (!overlay || !modal || !panel) return;

  let lastFocused: HTMLElement | null = null;

  function open(context?: { type?: string; message?: string; vehicleType?: string }): void {
    if (!modal || !overlay || !panel) return;
    lastFocused = document.activeElement as HTMLElement;

    resetEnquiryRoot(modal);
    if (context) prefillEnquiryForm(modal, context);

    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.setAttribute("aria-hidden", "false");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    panel.classList.remove("translate-y-6", "sm:translate-y-0", "sm:scale-95", "opacity-0");
    lockScroll(true);
    document.addEventListener("keydown", onKeydown);
    window.setTimeout(() => qs<HTMLInputElement>("#enquiry-name", modal)?.focus(), 200);
  }

  function close(): void {
    if (!modal || !overlay || !panel) return;
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.setAttribute("aria-hidden", "true");
    overlay.classList.add("opacity-0", "pointer-events-none");
    panel.classList.add("translate-y-6", "sm:translate-y-0", "sm:scale-95", "opacity-0");
    lockScroll(false);
    document.removeEventListener("keydown", onKeydown);
    (lastFocused || document.body).focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!modal) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    trapFocus(modal, event);
  }

  qsa<HTMLElement>("[data-enquiry-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const type = trigger.dataset.enquiryType || "quote";
      const message = trigger.dataset.enquiryContext || "";
      const vehicleType = trigger.dataset.vehicleType || "";
      open({ type, message, vehicleType });
    });
  });

  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", close);
  qsa<HTMLButtonElement>("[data-modal-close]", modal).forEach((btn) => btn.addEventListener("click", close));
}
