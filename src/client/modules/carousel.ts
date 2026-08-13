import { qs, qsa } from "../utils/dom.js";

/** Native-scroll carousel: CSS scroll-snap handles touch/swipe, these buttons just nudge scrollLeft. */
export function initCarousels(): void {
  qsa<HTMLElement>("[data-carousel-track]").forEach((track) => {
    const section = track.closest<HTMLElement>("section") || track.parentElement;
    if (!section) return;
    const prevBtn = qs<HTMLButtonElement>("[data-carousel-prev]", section);
    const nextBtn = qs<HTMLButtonElement>("[data-carousel-next]", section);

    function scrollByCard(direction: 1 | -1): void {
      const card = track.querySelector<HTMLElement>(":scope > *");
      const amount = (card?.offsetWidth || 320) + 20;
      track.scrollBy({ left: amount * direction, behavior: "smooth" });
    }

    prevBtn?.addEventListener("click", () => scrollByCard(-1));
    nextBtn?.addEventListener("click", () => scrollByCard(1));
  });
}
