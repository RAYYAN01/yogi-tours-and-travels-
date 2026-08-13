import { qs, qsa } from "../utils/dom.js";

/** Confirm before destructive admin actions (delete buttons carry data-confirm="message"). */
export function initAdminConfirm(): void {
  qsa<HTMLFormElement>("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const message = form.dataset.confirm || "Are you sure?";
      if (!window.confirm(message)) {
        event.preventDefault();
      }
    });
  });
}

/** Mobile admin sidebar toggle. */
export function initAdminSidebar(): void {
  const sidebar = qs<HTMLElement>("#admin-sidebar");
  const overlay = qs<HTMLElement>("#admin-sidebar-overlay");
  const toggle = qs<HTMLButtonElement>("#admin-sidebar-toggle");
  if (!sidebar || !overlay || !toggle) return;

  function open(): void {
    sidebar!.classList.remove("-translate-x-full");
    overlay!.classList.remove("opacity-0", "pointer-events-none");
    toggle!.setAttribute("aria-expanded", "true");
  }
  function close(): void {
    sidebar!.classList.add("-translate-x-full");
    overlay!.classList.add("opacity-0", "pointer-events-none");
    toggle!.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", open);
  overlay.addEventListener("click", close);
}

/** Live-preview the selected file for admin "image" fields before upload. */
export function initImagePreview(): void {
  qsa<HTMLInputElement>('input[type="file"][name="imageFile"]').forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const previewContainer = input.closest("div")?.parentElement?.querySelector<HTMLElement>(".ph, img");
      if (!previewContainer) return;
      const url = URL.createObjectURL(file);
      if (previewContainer.tagName === "IMG") {
        (previewContainer as HTMLImageElement).src = url;
      } else {
        const img = document.createElement("img");
        img.src = url;
        img.className = "w-full h-full object-cover";
        previewContainer.replaceWith(img);
      }
    });
  });
}
