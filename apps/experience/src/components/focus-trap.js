// focus-trap.js — keep Tab/Shift+Tab cycling among a dialog's own
// focusable controls while it is open. Returns the keydown handler so
// the caller can register/unregister it on document alongside its
// Escape handling. Same explicit index-based logic used by the
// hospital/congrats/help-hint dialogs.

export function trapFocusKeydown(dialog) {
  return (e) => {
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )];
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    if (e.shiftKey) {
      e.preventDefault();
      items[idx <= 0 ? items.length - 1 : idx - 1].focus();
    } else {
      e.preventDefault();
      items[idx === -1 || idx === items.length - 1 ? 0 : idx + 1].focus();
    }
  };
}
