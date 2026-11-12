# Apply progress: DECIPHER MODE — six-minute help hint

## M1 — Component + copy ✅

- `copy.js` — `hint.title` / `hint.msg` / `hint.ok` keys; `obf`/`plain` identical (facilitator help is always plain). `ALGIA` wrapped in `<strong>` for the accent highlight. Dedicated `hint.ok` ("Entendido") because `btn.ok`'s `obf` register is bureaucratic.
- `components/help-hint.js` — `hintEligible()` guard (comprehension + `startedAt` + `!completedAt` + `!hintShown` + `!isReplaySession`), `armHelpHint()` (immediate fire past 6 min, else `setTimeout` with session re-check at fire time), `showHelpHint()` (shared overlay/dialog pattern, focus save/restore, Escape, `btn-primary` dismiss). `hintShown` persisted via `setSession`.

## M2 — Wiring ✅

- `hospital-shell.js` — `bindHospitalNav()` calls `armHelpHint()` before the nav guard; all three hospital screens inherit the arming.

## M3 — Tests & docs ✅

- `comprehension.test.js` — new `comprehension help hint` describe (6 cases): fires past 6 min with `ALGIA` strong, silent before 6 min, fires mid-screen via fake timers, once per session across screens, Escape closes, silent in replay/completed.
- Suite: 23 files / 219 tests — all green.
- This file + `verify-report.md`.
