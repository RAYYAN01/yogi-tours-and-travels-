import { qs, qsa } from "../utils/dom.js";

export function initBookingTabs(): void {
  const widget = qs<HTMLElement>("#booking-widget");
  if (!widget) return;

  const tabs = qsa<HTMLButtonElement>("[data-booking-tab]", widget);
  const panels = qsa<HTMLElement>("[data-booking-panel]", widget);

  // The Outstation and Airport panels' trip-type radios share name="tripType"
  // (so the enquiry payload always carries a single "tripType" field, however
  // many panels define one) — but that means only one of them can ever be
  // checked across the whole form at a time, native browser radio-group
  // semantics apply regardless of which panel is currently hidden. Switching
  // tabs away and back silently leaves the panel with nothing checked, so
  // restore its own default whenever it becomes active again.
  function restoreDefaultTripType(panel: HTMLElement): void {
    const radios = qsa<HTMLInputElement>('input[name="tripType"]', panel);
    if (radios.length === 0 || radios.some((r) => r.checked)) return;
    const fallback = qs<HTMLInputElement>("[data-default-trip-type]", panel) ?? radios[0];
    if (fallback) fallback.checked = true;
  }

  function activate(name: string): void {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.bookingTab === name;
      tab.setAttribute("aria-selected", String(isActive));
    });
    panels.forEach((panel) => {
      const isActive = panel.dataset.bookingPanel === name;
      panel.hidden = !isActive;
      if (isActive) restoreDefaultTripType(panel);
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.bookingTab) activate(tab.dataset.bookingTab);
    });

    // WAI-ARIA tabs pattern: Left/Right/Home/End move focus between tabs and activate them.
    tab.addEventListener("keydown", (event) => {
      let targetIndex: number | null = null;
      if (event.key === "ArrowRight") targetIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") targetIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") targetIndex = 0;
      else if (event.key === "End") targetIndex = tabs.length - 1;

      if (targetIndex === null) return;
      event.preventDefault();
      const targetTab = tabs[targetIndex];
      if (!targetTab?.dataset.bookingTab) return;
      targetTab.focus();
      activate(targetTab.dataset.bookingTab);
    });
  });

  // Round trip -> reveal return date field (outstation panel)
  const returnDateField = qs<HTMLElement>("[data-return-date-field]", widget);
  qsa<HTMLInputElement>('input[name="tripType"]', widget).forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!returnDateField) return;
      const form = radio.closest("form");
      const isRoundTrip = form?.querySelector<HTMLInputElement>('input[name="tripType"]:checked')?.value === "Round Trip";
      const withinOutstation = radio.closest('[data-booking-panel="outstation"]');
      if (withinOutstation) {
        returnDateField.classList.toggle("hidden", !isRoundTrip);
        const returnInput = returnDateField.querySelector<HTMLInputElement>("input");
        if (returnInput) returnInput.required = Boolean(isRoundTrip);
      }
    });
  });

  // Local tab: "Custom" duration reveals a free-text field
  const durationSelect = qs<HTMLSelectElement>("[data-duration-select]", widget);
  const customField = qs<HTMLElement>("[data-custom-duration-field]", widget);
  durationSelect?.addEventListener("change", () => {
    const isCustom = durationSelect.value === "Custom";
    customField?.classList.toggle("hidden", !isCustom);
  });
}
