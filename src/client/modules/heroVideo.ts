import { qs } from "../utils/dom.js";

/** Pauses the hero background video for users who've asked for reduced motion — the poster frame stays visible. */
export function initHeroVideo(): void {
  const video = qs<HTMLVideoElement>("[data-hero-video]");
  if (!video) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = (): void => {
    if (reduceMotion.matches) {
      video.pause();
      video.removeAttribute("autoplay");
    } else if (video.paused) {
      void video.play().catch(() => {
        /* autoplay can be blocked by the browser — the poster image covers this case */
      });
    }
  };

  apply();
  reduceMotion.addEventListener("change", apply);
}
