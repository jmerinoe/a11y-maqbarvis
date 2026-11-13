# Proposal: BLIND BUY — delay the congrats dialog ~5 seconds

## Why

When the participant completes the required purchase, the confirmation screen and the "¡Enhorabuena!" dialog appear simultaneously, so the participant never sees the order confirmation underneath. Facilitators want the confirmation screen visible for a few seconds first, then the congrats dialog on top — giving the participant a beat to register that the order went through.

## What Changes

### Scope

1. **5-second delay** — `renderConfirmation` in `confirmation.js` SHALL render the confirmation screen normally (title, order number, items, total, back-home link), then schedule `showCongratsDialog` via `setTimeout` after ~5 seconds instead of calling it synchronously.
2. **Navigation guard** — the timer callback SHALL check that the participant is still on the confirmation screen (no `role="dialog"` already present and the confirmation container still in the DOM) before opening the congrats dialog; if the participant navigated away (e.g. clicked "Volver al inicio"), the dialog SHALL NOT fire.
3. **Mission-failed dialog** — unchanged; it fires synchronously as today (the failed case has no order to admire).

### Out of scope

- No changes to the congrats dialog itself (content, focus, Escape, ranking navigation).
- No changes to COLOR TRAP or DECIPHER MODE completion dialogs.
- No changes to scoring, ranking, or session logic.
- No new i18n keys.

## How

- `confirmation.js`: replace the direct `showCongratsDialog(...)` call with `setTimeout(() => { ... guard ...; showCongratsDialog(...); }, 5000)`. Store the timer id so a re-render can clear it (avoid stacking if the screen re-renders before the delay elapses).
- The guard: `if (document.querySelector('[role="dialog"]')) return;` (another dialog already opened) and `if (!document.querySelector('.confirmation')) return;` (navigated away).

## Test plan

- Existing tests that assert the congrats dialog appears synchronously after `renderConfirmation` SHALL switch to fake timers and advance 5 s.
- New test: after `renderConfirmation`, the dialog is absent at 0 s and present at 5 s.
- New test: if the participant navigates away before 5 s (confirmation container gone), the timer fires but the dialog does NOT open.
- New test: if another dialog opens during the 5 s, the congrats dialog does NOT stack.
