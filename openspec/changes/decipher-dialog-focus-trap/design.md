<|open|>argument key="content" type="string"<|sep|># Design: DECIPHER MODE — trap focus in hospital dialogs

## Problem

`showHospitalDialog` and `showHospitalChoiceDialog` in `hospital-dialog.js` open the dialog with `role="dialog" aria-modal="true"` and move focus into it via `dialog.focus()`. However, they only listen for `Escape` on `document` — there is no Tab/Shift+Tab trap. When the participant tabs, the focus escapes the overlay and lands on the form fields behind it. The dialog's button(s) are unreachable by keyboard if the participant tabs past the dialog's initial focus.

## Solution

The `keydown` listener on `document` traps Tab/Shift+Tab inside the dialog using an explicit index-based approach:

```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { close(); return; }
  if (e.key === 'Enter' && document.activeElement === dialog) {
    e.preventDefault();
    okBtn.click();
    return;
  }
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
});
```

### Why explicit index-based trap, not boundary-only

The initial implementation only intercepted Tab at the first/last focusable element and relied on the browser's default Tab behaviour for middle elements. In practice the browser's default did not move focus between the two buttons of the choice dialog. The explicit version handles **every** Tab/Shift+Tab press: it computes the index of the active element and focuses the next/previous item directly, wrapping at both ends. This works regardless of browser Tab-order quirks.

### Enter on the dialog container

The dialog `div` has `tabindex="-1"` and receives initial focus via `dialog.focus()`. A `div` does not respond to Enter natively. When `document.activeElement === dialog` and Enter is pressed, the handler clicks the primary button (`okBtn` for the info dialog, `#hospital-dialog-keep` for the choice dialog).

### Both functions get the same trap

`showHospitalDialog` has one button (`#hospital-dialog-ok`); `showHospitalChoiceDialog` has two (`#hospital-dialog-keep`, `#hospital-dialog-finish`). The trap code is identical — it queries focusables dynamically.

### Also applied to help-hint.js and congrats-dialog.js

The same explicit trap was added to `help-hint.js` (six-minute hint) and `congrats-dialog.js` ("¡Enhorabuena!") — both had the same missing Tab trap. `congrats-dialog.js` benefits all three experiences.

## Test changes

### `comprehension.test.js`

New tests in the existing "hospital dialogs" area:

1. **Tab stays inside the info dialog** — open an occupied-slot dialog, Tab from the OK button → focus wraps back, never reaches `#bk-date` or any form field.
2. **Tab/Shift+Tab inside the choice dialog** — open a non-closest-slot dialog, verify Tab cycles keep → finish → keep and Shift+Tab cycles finish → keep → finish.
3. **Off-mission dialog OK button closes the dialog** — click `#hospital-dialog-ok` → dialog removed, booked confirmation still visible.

Existing tests (dialog opens, Escape closes, button click closes) stay green — the trap only adds behaviour, it does not remove any.
