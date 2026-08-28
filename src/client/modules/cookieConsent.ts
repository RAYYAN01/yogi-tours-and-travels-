import { qs, qsa } from "../utils/dom.js";

// Consent-gated cookie handling.
//
//  - The site's own session cookie is strictly necessary and always allowed.
//  - Analytics (Google Analytics 4) is optional. Its script is never loaded by
//    the server; it's injected here only once the visitor picks "Accept".
//  - "Reject" (or no stored choice yet) means no analytics script, and any
//    GA cookies from a previous "Accept" are cleared.
//
// The choice is stored in localStorage so it persists across visits, and can
// be revisited via any element carrying [data-cookie-settings] (footer link).

const STORAGE_KEY = "cookieConsent";
type Consent = "accepted" | "rejected";

declare global {
  interface Window {
    __gaMeasurementId?: string;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Consent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode / storage disabled — banner just reappears next visit */
  }
}

let analyticsLoaded = false;

function loadAnalytics(): void {
  const id = window.__gaMeasurementId;
  if (analyticsLoaded || !id) return;
  analyticsLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(): void {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { anonymize_ip: true });
}

function clearAnalyticsCookies(): void {
  const host = window.location.hostname;
  // Try the exact host and the registrable-domain form GA uses (".example.com").
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !(name === "_ga" || name === "_gid" || name.startsWith("_ga_") || name.startsWith("_gat"))) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

export function initCookieConsent(): void {
  const banner = qs<HTMLElement>("#cookie-consent");

  function showBanner(): void {
    banner?.classList.remove("hidden");
  }
  function hideBanner(): void {
    banner?.classList.add("hidden");
  }

  function apply(consent: Consent): void {
    writeConsent(consent);
    hideBanner();
    if (consent === "accepted") loadAnalytics();
    else clearAnalyticsCookies();
  }

  if (banner) {
    qsa<HTMLElement>("[data-cookie-accept]", banner).forEach((el) =>
      el.addEventListener("click", () => apply("accepted"))
    );
    qsa<HTMLElement>("[data-cookie-reject]", banner).forEach((el) =>
      el.addEventListener("click", () => apply("rejected"))
    );
  }

  // Footer "Cookie preferences" — reopen the banner to change the choice.
  qsa<HTMLElement>("[data-cookie-settings]").forEach((el) =>
    el.addEventListener("click", (event) => {
      event.preventDefault();
      showBanner();
    })
  );

  const existing = readConsent();
  if (existing === "accepted") {
    loadAnalytics();
  } else if (existing === null) {
    showBanner();
  }
}
