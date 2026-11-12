# Apply progress: COLOR TRAP — progressive route hints every 3 minutes

## M1 — Optimal legs ✅

- `metro.js` — `buildGraph` edges now carry `line` (harmless for `optimalRouteMinutes`); new `optimalRouteLegs(from, to)`: Dijkstra + `prev` map, consecutive same-line edges collapse into legs `{line, from, to, minutes}`, `[]` when unreachable. Verified: San Nicasio → Aeropuerto T4 = 6 legs / 50 min.

## M2 — Component + copy + wiring ✅

- i18n — `metro.hintTitle` / `metro.hintMsg` in `es.js` + `en.js` (`{n}`/`{leg}` params; `leg` passed as `<strong>` HTML from the component); dismiss reuses `metro.dialog.ok`.
- `components/route-hint.js` — `hintEligible` guard (chromatic + `startedAt` + `!completedAt` + `!isReplaySession` + `hintCount < legs`), `armRouteHint()` schedules to the next 3-min boundary (immediate when past, re-check at fire time, 15 s defer while another overlay is open), `showRouteHint()` mirrors `metro-dialog` with `chromatic-scope` overlay; close → `armRouteHint()` re-arms the next leg. `hintCount` persisted via `setSession`.
- `screens/metro.js` — `armRouteHint()` at the top of `renderMetro` (re-arms on every render).

## M3 — Tests & docs ✅

- `chromatic.test.js` — data test (`optimalRouteLegs` → 6 legs/50 min, unreachable → `[]`) + `Chromatic route hints` describe (7 cases): leg 1 ≥3 min with `<strong>` leg and `chromatic-scope`, silent <3 min, mid-screen fire via fake timers, in-order catch-up (leg 2 at 6 min), once-each + stop after leg 6, silent in replay/completed, Escape closes.
- Suite: 23 files / 227 tests — all green.
- This file + `verify-report.md`.
