# Tasks: DECIPHER MODE — six-minute help hint

## M1 — Component + copy

- [ ] `copy.js`: `hint.title` + `hint.msg` (`obf`/`plain` identical, `ALGIA` in `<strong>`)
- [ ] `components/help-hint.js`: `armHelpHint()` + `showHelpHint()`

## M2 — Wiring

- [ ] `hospital-shell.js`: call `armHelpHint()` from `bindHospitalNav()`

## M3 — Tests & docs

- [ ] `comprehension.test.js`: fires ≥6 min, not before, once per session, not in replay/completed, Escape/button close
- [ ] Full suite green
- [ ] `apply-progress.md` + `verify-report.md`
