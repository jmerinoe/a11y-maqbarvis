# Tasks: COLOR TRAP — progressive route hints every 3 minutes

## M1 — Optimal legs

- [ ] `metro.js`: `buildGraph` edges carry `line`; new `optimalRouteLegs(from, to)`

## M2 — Component + copy + wiring

- [ ] i18n `metro.hintTitle`/`metro.hintMsg` (ES + EN)
- [ ] `components/route-hint.js`: `armRouteHint()` + `showRouteHint()`
- [ ] `screens/metro.js`: arm in `renderMetro`

## M3 — Tests & docs

- [ ] `chromatic.test.js`: legs correctness, schedule, once-each, ordering, replay/completed silence, close
- [ ] Full suite green
- [ ] `apply-progress.md` + `verify-report.md`
