import { qs, qsa, trapFocus, lockScroll } from "../utils/dom.js";

export function initGalleryLightbox(): void {
  const lightbox = qs<HTMLElement>("#lightbox");
  const imageWrap = qs<HTMLElement>("#lightbox-image-wrap");
  const captionEl = qs<HTMLElement>("#lightbox-caption");
  const closeBtn = qs<HTMLButtonElement>("#lightbox-close");
  const prevBtn = qs<HTMLButtonElement>("#lightbox-prev");
  const nextBtn = qs<HTMLButtonElement>("#lightbox-next");
  const grid = qs<HTMLElement>("[data-gallery-grid]");
  if (!lightbox || !imageWrap || !grid) return;

  let lastFocused: HTMLElement | null = null;
  let currentIndex = 0;

  function getVisibleItems(): HTMLElement[] {
    return qsa<HTMLElement>("[data-gallery-item]", grid!).filter((el) => !el.classList.contains("hidden"));
  }

  function render(item: HTMLElement): void {
    if (!imageWrap) return;
    const visual = item.querySelector<HTMLElement>("img, .ph");
    imageWrap.innerHTML = "";
    if (visual) {
      const clone = visual.cloneNode(true) as HTMLElement;
      clone.classList.add("w-full", "h-full");
      if (clone.tagName === "IMG") clone.classList.add("object-cover");
      imageWrap.appendChild(clone);
    }
    if (captionEl) captionEl.textContent = item.dataset.caption || item.dataset.alt || "";
  }

  function openAt(index: number): void {
    const visible = getVisibleItems();
    const item = visible[index];
    if (!lightbox || !item) return;
    currentIndex = index;
    lastFocused = document.activeElement as HTMLElement;
    render(item);
    lightbox.classList.remove("opacity-0", "pointer-events-none");
    lightbox.setAttribute("aria-hidden", "false");
    lockScroll(true);
    document.addEventListener("keydown", onKeydown);
    window.setTimeout(() => closeBtn?.focus(), 100);
  }

  function close(): void {
    if (!lightbox) return;
    lightbox.classList.add("opacity-0", "pointer-events-none");
    lightbox.setAttribute("aria-hidden", "true");
    lockScroll(false);
    document.removeEventListener("keydown", onKeydown);
    (lastFocused || document.body).focus();
  }

  function step(delta: number): void {
    const visible = getVisibleItems();
    if (visible.length === 0) return;
    currentIndex = (currentIndex + delta + visible.length) % visible.length;
    const item = visible[currentIndex];
    if (item) render(item);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!lightbox) return;
    if (event.key === "Escape") return close();
    if (event.key === "ArrowRight") return step(1);
    if (event.key === "ArrowLeft") return step(-1);
    trapFocus(lightbox, event);
  }

  qsa<HTMLElement>("[data-gallery-item]", grid).forEach((item) => {
    item.addEventListener("click", () => {
      const visible = getVisibleItems();
      const index = visible.indexOf(item);
      openAt(index === -1 ? 0 : index);
    });
  });

  closeBtn?.addEventListener("click", close);
  prevBtn?.addEventListener("click", () => step(-1));
  nextBtn?.addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
}
