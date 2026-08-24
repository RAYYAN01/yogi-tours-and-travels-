import { qsa } from "../utils/dom.js";

/**
 * Pauses the hero background video(s) for users who've asked for reduced
 * motion — the poster frame stays visible. There are two [data-hero-video]
 * elements (a lighter mobile/tablet encode and the full desktop one, swapped
 * via the lg: breakpoint), so this applies to all of them rather than just
 * the first match — otherwise the hidden one would silently ignore the
 * reduced-motion preference once it becomes visible (e.g. rotating a tablet,
 * or resizing a desktop window down past lg).
 */
export function initHeroVideo(): void {
  const videos = qsa<HTMLVideoElement>("[data-hero-video]");
  if (!videos.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = (): void => {
    for (const video of videos) {
      if (reduceMotion.matches) {
        video.pause();
        video.removeAttribute("autoplay");
      } else if (video.paused) {
        void video.play().catch(() => {
          /* autoplay can be blocked by the browser — the poster image covers this case */
        });
      }
    }
  };

  apply();
  reduceMotion.addEventListener("change", apply);
}
