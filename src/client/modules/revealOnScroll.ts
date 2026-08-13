import { qsa } from "../utils/dom.js";

/**
 * Scroll-triggered fade-in, built so it can never leave content invisible:
 *
 * - CSS never hides [data-reveal] elements by default (see main.css) — only
 *   the JS-added "reveal-pending" class does that. If this script fails to
 *   run at all, everything just stays visible with no animation.
 * - Elements already inside the viewport at page load (the hero, most
 *   obviously) are never hidden in the first place — scroll-reveal only
 *   makes sense for content you scroll to, and gating already-visible
 *   content behind a JS/observer round-trip is exactly what caused it to
 *   render blank when that round-trip didn't complete as expected.
 * - Anything that does get hidden is force-revealed after 2s regardless of
 *   whether IntersectionObserver ever fired, as a last-resort safety net.
 */
export function initRevealOnScroll(): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = qsa<HTMLElement>("[data-reveal]");
  if (targets.length === 0 || reduceMotion || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  function reveal(el: HTMLElement): void {
    el.classList.remove("reveal-pending");
    el.classList.add("is-revealed");
  }

  const pending: HTMLElement[] = [];
  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) return; // never hide what's already on screen
    el.classList.add("reveal-pending");
    observer.observe(el);
    pending.push(el);
  });

  if (pending.length > 0) {
    window.setTimeout(() => {
      pending.forEach(reveal);
      observer.disconnect();
    }, 2000);
  }
}
