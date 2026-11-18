# Tasks: DECIPHER MODE — trap focus in hospital dialogs

## M1 — Focus trap in hospital-dialog.js

- [ ] `showHospitalDialog`: add Tab/Shift+Tab trap on the overlay (same pattern as `cart.js` `bindCartDialog`)
- [ ] `showHospitalChoiceDialog`: add the same trap

## M2 — Tests

- [ ] `comprehension.test.js`: Tab stays inside the info dialog (focus never reaches form fields)
- [ ] `comprehension.test.js`: Shift+Tab wraps in the choice dialog
- [ ] `comprehension.test.js`: Tab wraps forward in the choice dialog
- [ ] Full suite green

## M3 — Docs

- [ ] `apply-progress.md` + `verify-report.md`
