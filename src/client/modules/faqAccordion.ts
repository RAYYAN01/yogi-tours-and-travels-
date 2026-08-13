import { qsa } from "../utils/dom.js";

export function initFaqAccordions(): void {
  qsa<HTMLElement>("[data-faq-item]").forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    const panel = item.querySelector<HTMLElement>("[data-faq-panel]");
    const icon = item.querySelector<HTMLElement>(".faq-icon");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.classList.toggle("grid-rows-[1fr]", !isOpen);
      panel.classList.toggle("grid-rows-[0fr]", isOpen);
      icon?.classList.toggle("rotate-180", !isOpen);
    });
  });
}
