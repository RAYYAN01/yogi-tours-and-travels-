import { qs, trapFocus, lockScroll } from "../utils/dom.js";

export function initMobileMenu(): void {
  const toggle = qs<HTMLButtonElement>("#mobile-menu-toggle");
  const closeBtn = qs<HTMLButtonElement>("#mobile-menu-close");
  const menu = qs<HTMLElement>("#mobile-menu");
  const overlay = qs<HTMLElement>("#mobile-menu-overlay");
  if (!toggle || !menu || !overlay) return;

  let lastFocused: HTMLElement | null = null;

  function open(): void {
    if (!menu || !overlay || !toggle) return;
    lastFocused = document.activeElement as HTMLElement;
    menu.classList.remove("translate-x-full");
    menu.setAttribute("aria-hidden", "false");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    toggle.setAttribute("aria-expanded", "true");
    lockScroll(true);
    document.addEventListener("keydown", onKeydown);
    window.setTimeout(() => qs<HTMLElement>("#mobile-menu-close")?.focus(), 250);
  }

  function close(): void {
    if (!menu || !overlay || !toggle) return;
    menu.classList.add("translate-x-full");
    menu.setAttribute("aria-hidden", "true");
    overlay.classList.add("opacity-0", "pointer-events-none");
    toggle.setAttribute("aria-expanded", "false");
    lockScroll(false);
    document.removeEventListener("keydown", onKeydown);
    (lastFocused || toggle).focus();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!menu) return;
    if (event.key === "Escape") {
      close();
      return;
    }
    trapFocus(menu, event);
  }

  toggle.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay.addEventListener("click", close);

  // Close on navigation link click, and on the drawer's own "WhatsApp Us"
  // trigger (which opens the enquiry modal on top of it) — otherwise the
  // drawer stays open behind the modal instead of getting out of the way.
  menu.querySelectorAll("a, [data-enquiry-trigger]").forEach((link) => link.addEventListener("click", close));
}
