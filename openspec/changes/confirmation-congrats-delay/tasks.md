# Tasks: BLIND BUY — delay the congrats dialog ~5 seconds

## M1 — Delay + guard in confirmation.js

- [ ] `confirmation.js`: wrap `showCongratsDialog` in `setTimeout(…, 5000)` with module-level `congratsTimer`; guard on `.confirmation` presence and no existing `[role="dialog"]`

## M2 — Update affected tests

- [ ] `user-experience-timer.test.js`: fake timers, advance 5 s before asserting dialog
- [ ] `screen-titles.test.js`: fake timers, advance 5 s before asserting dialog focus
- [ ] `retry-mission.test.js`: advance 5 s before asserting dialog

## M3 — New regression tests + docs

- [ ] New tests: dialog absent at 0 s / present at 5 s; navigated away → no dialog; another dialog open → no stack
- [ ] Full suite green
- [ ] `apply-progress.md` + `verify-report.md`
