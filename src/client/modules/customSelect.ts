import { qs, qsa } from "../utils/dom.js";

/**
 * Replaces a native <select>'s dropdown popup — which renders wildly
 * differently (and sometimes poorly) across browsers/OSes — with a listbox
 * we fully control. The original <select> stays in the DOM (hidden, not
 * removed) so form submission, prefill, and any other code reading its
 * `name`/`value` keeps working unchanged; this only replaces how the user
 * picks a value.
 */

interface OptionEntry {
  value: string;
  label: string;
  groupLabel?: string;
}

function readOptions(select: HTMLSelectElement): OptionEntry[] {
  const entries: OptionEntry[] = [];
  Array.from(select.children).forEach((child) => {
    if (child instanceof HTMLOptionElement) {
      entries.push({ value: child.value, label: child.textContent || "" });
    } else if (child instanceof HTMLOptGroupElement) {
      Array.from(child.children).forEach((opt) => {
        if (opt instanceof HTMLOptionElement) {
          entries.push({ value: opt.value, label: opt.textContent || "", groupLabel: child.label });
        }
      });
    }
  });
  return entries;
}

function closePanel(trigger: HTMLButtonElement, panel: HTMLUListElement): void {
  trigger.setAttribute("aria-expanded", "false");
  panel.hidden = true;
}

function openPanel(trigger: HTMLButtonElement, panel: HTMLUListElement): void {
  trigger.setAttribute("aria-expanded", "true");
  panel.hidden = false;
  const selected = qs<HTMLLIElement>('[aria-selected="true"]', panel) || qs<HTMLLIElement>('[role="option"]', panel);
  selected?.scrollIntoView({ block: "nearest" });
  selected?.focus();
}

function enhanceSelect(select: HTMLSelectElement): void {
  const entries = readOptions(select);
  if (entries.length === 0) return;

  const wrap = document.createElement("div");
  wrap.className = "custom-select-wrap";
  select.parentElement?.insertBefore(wrap, select);
  wrap.appendChild(select);
  select.classList.add("hidden");
  select.setAttribute("aria-hidden", "true");
  select.tabIndex = -1;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = `form-input custom-select-trigger${select.classList.contains("field-invalid") ? " field-invalid" : ""}`;
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  // The <label for="select-id"> can no longer focus the select directly (it's
  // now hidden), so re-point it at the trigger: give it an id for
  // aria-labelledby, and forward its click to open/focus the trigger.
  const associatedLabel = select.id ? document.querySelector<HTMLLabelElement>(`label[for="${select.id}"]`) : null;
  if (associatedLabel) {
    if (!associatedLabel.id) associatedLabel.id = `${select.id}-label`;
    trigger.setAttribute("aria-labelledby", associatedLabel.id);
    associatedLabel.addEventListener("click", (event) => {
      event.preventDefault();
      trigger.focus();
    });
  }

  const valueLabel = document.createElement("span");
  valueLabel.className = "custom-select-value";
  trigger.appendChild(valueLabel);

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("fill", "none");
  chevron.setAttribute("stroke", "currentColor");
  chevron.setAttribute("stroke-width", "1.75");
  chevron.setAttribute("stroke-linecap", "round");
  chevron.setAttribute("stroke-linejoin", "round");
  chevron.setAttribute("aria-hidden", "true");
  chevron.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
  trigger.appendChild(chevron);

  const panel = document.createElement("ul");
  panel.className = "custom-select-panel";
  panel.setAttribute("role", "listbox");
  panel.hidden = true;

  let lastGroup: string | undefined;
  const optionEls: HTMLLIElement[] = [];
  entries.forEach((entry) => {
    if (entry.groupLabel && entry.groupLabel !== lastGroup) {
      const groupEl = document.createElement("li");
      groupEl.className = "custom-select-optgroup-label";
      groupEl.textContent = entry.groupLabel;
      panel.appendChild(groupEl);
      lastGroup = entry.groupLabel;
    }
    const optEl = document.createElement("li");
    optEl.className = "custom-select-option";
    optEl.setAttribute("role", "option");
    optEl.dataset.value = entry.value;
    optEl.textContent = entry.label;
    optEl.tabIndex = -1;
    panel.appendChild(optEl);
    optionEls.push(optEl);
  });

  const syncFromSelect = (): void => {
    const match = entries.find((e) => e.value === select.value) ?? entries[0];
    valueLabel.textContent = match?.label ?? "";
    if (select.value) valueLabel.removeAttribute("data-placeholder");
    else valueLabel.setAttribute("data-placeholder", "true");
    optionEls.forEach((el) => el.setAttribute("aria-selected", String(el.dataset.value === select.value)));
  };

  const choose = (optEl: HTMLLIElement): void => {
    const value = optEl.dataset.value ?? "";
    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    syncFromSelect();
    closePanel(trigger, panel);
    trigger.focus();
  };

  optionEls.forEach((optEl) => {
    optEl.addEventListener("click", () => choose(optEl));
    optEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose(optEl);
      } else if (event.key === "Escape") {
        closePanel(trigger, panel);
        trigger.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const idx = optionEls.indexOf(optEl);
        const next = event.key === "ArrowDown" ? optionEls[idx + 1] : optionEls[idx - 1];
        next?.focus();
      }
    });
  });

  trigger.addEventListener("click", () => {
    if (panel.hidden) openPanel(trigger, panel);
    else closePanel(trigger, panel);
  });
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPanel(trigger, panel);
    }
  });

  document.addEventListener("click", (event) => {
    if (!wrap.contains(event.target as Node)) closePanel(trigger, panel);
  });

  select.addEventListener("change", syncFromSelect);
  // form.reset() doesn't fire "change" and resets values only after the
  // "reset" event finishes dispatching, so re-sync on the next tick.
  select.form?.addEventListener("reset", () => setTimeout(syncFromSelect, 0));

  syncFromSelect();
  wrap.appendChild(trigger);
  wrap.appendChild(panel);
}

export function initCustomSelects(): void {
  qsa<HTMLSelectElement>("select[data-custom-select]").forEach(enhanceSelect);
}
