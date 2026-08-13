import { qs } from "../utils/dom.js";

/** Adds a subtle depth cue to the sticky (dark) header once the page has scrolled past the top. */
export function initHeaderScroll(): void {
  const bar = qs<HTMLElement>("#main-header-bar");
  if (!bar) return;

  // Pages without a dark hero render the bar permanently solid (see header.ejs) —
  // only the transparent-over-hero variant needs the scroll-driven background swap.
  const isTransparentHeader = bar.dataset.transparentHeader === "true";

  function update(): void {
    const scrolled = window.scrollY > 8;
    bar!.classList.toggle("shadow-[0_1px_0_rgba(0,0,0,0.4),0_8px_20px_-12px_rgba(0,0,0,0.5)]", scrolled);
    if (!isTransparentHeader) return;
    // Transparent over the hero at the top; once scrolled, pick up a glass background so it stays legible over page content.
    bar!.classList.toggle("bg-transparent", !scrolled);
    bar!.classList.toggle("border-transparent", !scrolled);
    bar!.classList.toggle("bg-ink-950/85", scrolled);
    bar!.classList.toggle("backdrop-blur-xl", scrolled);
    bar!.classList.toggle("backdrop-saturate-150", scrolled);
    bar!.classList.toggle("border-white/10", scrolled);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
}
