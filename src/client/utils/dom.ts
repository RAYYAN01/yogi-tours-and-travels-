export function qs<T extends Element = Element>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function qsa<T extends Element = Element>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Simple focus trap: keeps Tab/Shift+Tab cycling within `container` while active. */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;
  const focusable = qsa<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    container
  ).filter((el) => el.offsetParent !== null);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

// Reference-counted: the mobile menu and the enquiry modal can legitimately
// both be open at once (a trigger button inside the drawer opens the
// modal without first closing the drawer), so a plain boolean would let
// whichever one closes second wrongly re-enable background scroll while
// the other is still open.
let scrollLockCount = 0;

export function lockScroll(lock: boolean): void {
  scrollLockCount = Math.max(0, scrollLockCount + (lock ? 1 : -1));
  document.documentElement.style.overflow = scrollLockCount > 0 ? "hidden" : "";
}
