# Apply progress: DECIPHER MODE — trap focus in hospital dialogs

## M1 — Focus trap in hospital-dialog.js ✅

- `showHospitalDialog` — explicit index-based Tab/Shift+Tab trap: computes `items.indexOf(document.activeElement)` and focuses next/previous, wrapping at both ends. Enter on the dialog container clicks the OK button. Escape preserved.
- `showHospitalChoiceDialog` — same explicit trap. Tab cycles keep → finish → keep; Shift+Tab cycles finish → keep → finish.

## M1b — Same trap in help-hint.js and congrats-dialog.js ✅

- `help-hint.js` (six-minute hint) — explicit trap added.
- `congrats-dialog.js` ("¡Enhorabuena!") — explicit trap added; benefits all three experiences.

## M2 — Tests ✅

- `comprehension.test.js` — 3 new cases:
  - "traps Tab inside the info dialog" — Tab from dialog → OK button; Tab from OK wraps to itself; form field never focused.
  - "traps Tab/Shift+Tab inside the choice dialog" — Tab from dialog → keep; Tab from finish → wraps to keep; Shift+Tab from keep → wraps to finish.
  - "off-mission dialog OK button closes the dialog" — click `#hospital-dialog-ok` → dialog removed, booked confirmation visible.
- Suite: 24 files / 237 tests — all green.

## M3 — Docs ✅

- This file + `verify-report.md` + updated `design.md`.
