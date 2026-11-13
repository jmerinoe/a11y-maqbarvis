# Apply progress: BLIND BUY — delay the congrats dialog ~5 seconds

## M1 — Delay + guard in confirmation.js ✅

- `confirmation.js` — module-level `congratsTimer`; `showCongratsDialog` wrapped in `setTimeout(…, 5000)`; guards on `.confirmation` presence (navigated away) and existing `[role="dialog"]` (no stacking). Mission-failed branch unchanged (synchronous).

## M2 — Update affected tests ✅

- `user-experience-timer.test.js` — "shows an accessible congrats dialog" now uses `vi.useFakeTimers()`, asserts dialog absent at 0 s, `vi.advanceTimersByTime(5000)`, then asserts dialog.
- `screen-titles.test.js` — "does not steal focus when a dialog is open" now uses fake timers, advances 5 s before asserting dialog focus. Added `vi` import.
- `retry-mission.test.js` — "a retry completion … diff vs. baseline" now advances 5 s before asserting dialog (already used fake timers).

## M3 — New regression tests + docs ✅

- `user-experience-timer.test.js` — 2 new cases:
  - "does not open the congrats dialog if the participant navigated away" — clears `#app` before the timer fires; dialog stays null.
  - "does not stack the congrats dialog if another dialog is open" — injects a `[role="dialog"]` before the timer fires; congrats does not stack.
- Suite: 24 files / 234 tests — all green.
- This file + `verify-report.md`.
