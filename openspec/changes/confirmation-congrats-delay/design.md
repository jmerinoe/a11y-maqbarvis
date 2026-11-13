# Design: BLIND BUY — delay the congrats dialog ~5 seconds

## Current flow

`checkout.js` sets `faro-pending-congrats` → `navigate('#/confirmation')` → `renderConfirmation` reads the flag, removes it, and calls `showCongratsDialog(...)` synchronously. The dialog covers the confirmation screen instantly.

## Change in `confirmation.js`

```js
let congratsTimer = null;

export function renderConfirmation(container) {
  // ... existing render of the confirmation screen ...

  const pendingMs = sessionStorage.getItem('faro-pending-congrats');
  if (pendingMs !== null) {
    sessionStorage.removeItem('faro-pending-congrats');
    const pendingBaseline = sessionStorage.getItem('faro-pending-baseline');
    if (pendingBaseline !== null) sessionStorage.removeItem('faro-pending-baseline');

    clearTimeout(congratsTimer);
    congratsTimer = setTimeout(() => {
      // Guard: navigated away or another dialog already open
      if (!document.querySelector('.confirmation')) return;
      if (document.querySelector('[role="dialog"]')) return;
      showCongratsDialog(
        Number(pendingMs),
        pendingBaseline === null ? null : Number(pendingBaseline)
      );
    }, 5000);
    return;
  }

  // ... existing mission-failed branch (unchanged, synchronous) ...
}
```

### Why a module-level `congratsTimer`

`renderConfirmation` can be called multiple times (e.g. a re-render triggered by the router). Without clearing the previous timer, two callbacks would fire. The module-level variable is the simplest approach — it mirrors the `pendingTimer` pattern used in `route-hint.js` and `help-hint.js`.

### Guard rationale

- `!document.querySelector('.confirmation')` — the participant clicked "Volver al inicio" (`#/home`) or otherwise navigated away; the confirmation screen DOM is gone.
- `document.querySelector('[role="dialog"]')` — another dialog (e.g. abandon confirmation) opened during the 5 s; don't stack.

### Focus behaviour

Today, `screens/index.js` skips moving focus to the `h1` when a `role="dialog"` exists. With the delay, the dialog is NOT present at render time, so the router WILL focus the confirmation `h1` — which is the desired behaviour: the screen reader announces "Confirmación, heading level 1" and the participant reads the order summary. When the dialog opens 5 s later, `showCongratsDialog` moves focus into the dialog as usual.

## Test changes

### `user-experience-timer.test.js` — "shows an accessible congrats dialog and navigates to ranking"

Currently calls `renderConfirmation` and immediately asserts the dialog. Must switch to `vi.useFakeTimers()`, call `renderConfirmation`, assert dialog is null, `vi.advanceTimersByTime(5000)`, then assert the dialog.

### `screen-titles.test.js` — "does not steal focus when a dialog is open"

Currently sets `faro-pending-congrats` and asserts the dialog is focused. With the delay, the dialog is not open at render time, so the router focuses the `h1` instead. Update: either advance fake timers 5 s before asserting, or change the test to assert the `h1` is focused (which is now the correct behaviour at render time). The cleanest: use fake timers, advance 5 s, then assert dialog focus.

### `retry-mission.test.js` — "a retry completion is not submitted and shows the diff vs. baseline"

Calls `renderConfirmation` and asserts the dialog. Must advance fake timers 5 s. (This test already uses `vi.useFakeTimers()`.)

### `abandon-experience.test.js` — "a post-abandon replay completion is not resubmitted"

Asserts `faro-pending-congrats` is set — that assertion is about the flag, not the dialog, so it stays valid.

## New regression tests

- Dialog absent at 0 s, present at 5 s.
- Navigated away before 5 s → dialog does NOT open.
- Another dialog open at fire time → congrats does NOT stack.
