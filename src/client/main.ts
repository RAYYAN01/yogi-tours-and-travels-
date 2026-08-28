// Single entry point, bundled by esbuild to /public/js/main.js and loaded on
// every page (public + admin). Each init function no-ops if its markup isn't
// present on the current page, so it's safe to call all of them everywhere
// rather than hand-wiring which script belongs on which page.
import { initMobileMenu } from "./modules/mobileMenu.js";
import { initHeaderScroll } from "./modules/headerScroll.js";
import { initBookingTabs } from "./modules/bookingTabs.js";
import { initEnquiryForms } from "./modules/enquiryForm.js";
import { initEnquiryModal } from "./modules/enquiryModal.js";
import { initFaqAccordions } from "./modules/faqAccordion.js";
import { initGalleryFilter } from "./modules/galleryFilter.js";
import { initGalleryLightbox } from "./modules/galleryLightbox.js";
import { initCarousels } from "./modules/carousel.js";
import { initRevealOnScroll } from "./modules/revealOnScroll.js";
import { initAdminConfirm, initAdminSidebar, initImagePreview } from "./modules/adminUi.js";
import { initHeroVideo } from "./modules/heroVideo.js";
import { initCustomSelects } from "./modules/customSelect.js";
import { initCookieConsent } from "./modules/cookieConsent.js";

/**
 * Runs an init function in isolation. Without this, an uncaught error in any
 * one module (e.g. initHeroVideo) would stop every init() call after it —
 * including initRevealOnScroll, which is what removes the CSS that hides
 * [data-reveal] sections. One failing module could otherwise leave the
 * entire page invisible (a "white screen") instead of just that one feature.
 */
function safeInit(name: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    console.error(`[init] ${name} failed:`, err);
  }
}

function init(): void {
  // Reveal content first — a failure anywhere below must never leave the page blank.
  safeInit("revealOnScroll", initRevealOnScroll);
  safeInit("mobileMenu", initMobileMenu);
  safeInit("headerScroll", initHeaderScroll);
  safeInit("heroVideo", initHeroVideo);
  safeInit("bookingTabs", initBookingTabs);
  safeInit("customSelects", initCustomSelects);
  safeInit("enquiryForms", initEnquiryForms);
  safeInit("enquiryModal", initEnquiryModal);
  safeInit("faqAccordions", initFaqAccordions);
  safeInit("galleryFilter", initGalleryFilter);
  safeInit("galleryLightbox", initGalleryLightbox);
  safeInit("carousels", initCarousels);
  safeInit("adminConfirm", initAdminConfirm);
  safeInit("adminSidebar", initAdminSidebar);
  safeInit("imagePreview", initImagePreview);
  safeInit("cookieConsent", initCookieConsent);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
