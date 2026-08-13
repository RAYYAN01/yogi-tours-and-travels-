import { qs, qsa } from "../utils/dom.js";

export function initGalleryFilter(): void {
  const filterBar = qs<HTMLElement>("[data-gallery-filters]");
  const grid = qs<HTMLElement>("[data-gallery-grid]");
  if (!filterBar || !grid) return;

  const buttons = qsa<HTMLButtonElement>("[data-gallery-filter]", filterBar);
  const items = qsa<HTMLElement>("[data-gallery-item]", grid);
  const emptyState = qs<HTMLElement>("[data-gallery-empty]");

  function applyFilter(category: string): void {
    let visibleCount = 0;
    items.forEach((item) => {
      const matches = category === "All" || item.dataset.galleryCategory === category;
      item.classList.toggle("hidden", !matches);
      if (matches) visibleCount++;
    });
    emptyState?.classList.toggle("hidden", visibleCount > 0);

    buttons.forEach((btn) => {
      const isActive = btn.dataset.galleryFilter === category;
      btn.setAttribute("aria-pressed", String(isActive));
      btn.classList.toggle("bg-brand-700", isActive);
      btn.classList.toggle("text-white", isActive);
      btn.classList.toggle("badge-outline", !isActive);
    });

    // Reflect the active filter in the URL for shareable/bookmarkable links, without reloading.
    const url = new URL(window.location.href);
    if (category === "All") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.replaceState({}, "", url);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.galleryFilter) applyFilter(btn.dataset.galleryFilter);
    });
  });
}
