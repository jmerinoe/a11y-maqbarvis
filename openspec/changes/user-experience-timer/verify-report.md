# Verify report: User identification, experience selection, and purchase-flow timing

## Verdict: PASS

## Automated verification

| Requirement | Evidence |
|-------------|----------|
| REQ-800-01 unique username | Tests: empty rejected, `'  ana  '` rejected as duplicate of `Ana` (trim + case-insensitive), session created on valid name; duplicate error rendered in `role="alert"` field associated via `aria-describedby` |
| REQ-800-02 experience selection | Test: registry-driven list renders the screen-reader link; click stores `experienceId` |
| REQ-800-03 instructions + explicit start | Test: no `#experience-timer` and no `startedAt` after render; both appear only after Continuar |
| REQ-800-04 persistent timer | Overlay mounted on `document.body`; test rewrites `#app.innerHTML` and the node survives; interval computes from timestamp |
| REQ-800-05 exact purchase | `isCompletedOrder` requires a single matching line item — wrong variant, wrong product, and extra items all fail; checkout test shows `faro-pending-congrats` + saved result only for the exact order |
| REQ-800-06 result record | Saved record asserted: user, experienceId, ISO startedAt/endedAt, elapsedMs, result |
| REQ-800-07 congrats dialog | Test asserts `role="dialog"`, `aria-modal="true"`, congrats text + `06:27`, close navigates to `#/ranking` |
| REQ-800-08 ranking | Test: 12 results → top 10; equal elapsed ordered by earlier `endedAt`; table renders position/user/time; "Nuevo participante" clears session → `#/login` |
| REQ-800-09 session guard + entry | Test: `#/products` without session → `#/login`; router init restores timer for active sessions |
| REQ-800-10 accessible new screens | Real `<label for>`, links, buttons, `role="alert"`, `role="dialog"`; no `data-trap` added |

## Test results

```
Test Files  13 passed (13)
Tests       75 passed (75)
```

`npm run build`: OK (Vite).

## Manual review notes

- Timer badge styled as external instrumentation (dark monospace, green accent, fixed top-right, z-index above Faro) per the "not part of Faro" requirement.
- Completion is hooked at order creation (`handleSubmit` success), not on confirmation render — the `faro-pending-congrats` flag carries the elapsed ms to the confirmation screen.
- Existing traps untouched; existing tests unaffected (they call renderers directly, bypassing the route guard; checkout tests already seed a cart).

## Known limitations / notes

- Users and results live in `localStorage` of the demo browser profile — clearing site data resets them (intended for the workshop machine).
- The session is per-tab (`sessionStorage`): a reload mid-experience restores the timer; a new tab starts fresh at `#/login`.
- Timer display precision is `MM:SS`; ranking precision is milliseconds (`elapsedMs`).
- No focus trap loop inside the congrats dialog (focus moves in, Escape/button close) — sufficient for the workshop flow; a full trap can be added if the dialog grows.
