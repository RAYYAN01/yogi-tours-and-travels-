import { qsa } from "../utils/dom.js";

/**
 * Plays exactly one of the two [data-hero-video] elements — a lighter
 * mobile/tablet encode and the full desktop one, CSS-swapped via the `lg:`
 * Tailwind breakpoint (1024px) in home.ejs's markup — and keeps the other
 * paused. Neither element carries a native `autoplay` attribute; this is
 * the only thing that ever calls .play(), specifically so the hidden one
 * never does.
 *
 * That matters because CSS `display:none` does not pause a <video>: once
 * told to play, a hidden element keeps buffering and playing exactly like a
 * visible one. Naively playing both regardless of visibility (the previous
 * behavior here) silently doubled the hero video's real bandwidth cost on
 * every homepage visit.
 *
 * Also honors prefers-reduced-motion (pausing, leaving the poster frame
 * visible) and re-evaluates on viewport resize / tablet rotation, so
 * crossing the lg breakpoint mid-session pauses the now-hidden video and
 * starts the now-visible one instead of leaving both in a stale state.
 */
export function initHeroVideo(): void {
  const videos = qsa<HTMLVideoElement>("[data-hero-video]");
  if (!videos.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopViewport = window.matchMedia("(min-width: 1024px)");

  const apply = (): void => {
    for (const video of videos) {
      const isDesktopVideo = video.dataset.heroVideo === "desktop";
      const shouldPlay = !reduceMotion.matches && isDesktopVideo === desktopViewport.matches;
      if (!shouldPlay) {
        video.pause();
      } else if (video.paused) {
        void video.play().catch(() => {
          /* autoplay can be blocked by the browser — the poster image covers this case */
        });
      }
    }
  };

  apply();
  reduceMotion.addEventListener("change", apply);
  desktopViewport.addEventListener("change", apply);
}
