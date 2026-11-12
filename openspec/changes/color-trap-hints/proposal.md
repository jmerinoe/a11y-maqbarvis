# Proposal: COLOR TRAP — progressive route hints every 3 minutes

## Why

COLOR TRAP participants can burn many minutes just finding the first viable tramo. Facilitators want a nudge system that keeps stuck runs moving without spoiling the route for fast players — the same pattern as the DECIPHER MODE six-minute hint, but progressive: one leg of the optimal route every 3 minutes.

## What Changes

### Scope

1. **Timed leg hints** — in an unfinished chromatic first run, a dialog shows the next leg of the optimal route at elapsed 3, 6, 9, 12, 15 and 18 minutes:
   - Title: `Veo que necesitas ayuda.` (same facilitator voice as DECIPHER MODE)
   - Body: `Tramo {n} de la ruta más rápida:` + the leg as `L12 · San Nicasio → Puerta del Sur` in `<strong>`
   - One dismiss button (`metro.dialog.ok` → "Entendido").
2. **Optimal route computed, not hardcoded** — new `optimalRouteLegs(from, to)` in `metro.js` extends the existing Dijkstra to rebuild the path and group consecutive same-line edges into legs. Verified against the graph: 50 min in exactly 6 legs — San Nicasio→Puerta del Sur (L12), →Noviciado (L10), →Canal (L2), →Gregorio Marañón (L7), →Nuevos Ministerios (L10), →Aeropuerto T4 (L8) — so the six thresholds match the six legs exactly.
3. **Same dialog pattern** — `congrats-overlay` + `congrats-dialog metro-dialog`, `chromatic-scope` (the dialog stays grayscale like the rest of the barrier run), `role="dialog"`, managed focus, Escape closes. Timer keeps running.
4. **Progress tracked in session** — `hintCount` persists how many hints were shown; survives navigation and reloads. The next hint fires at `(hintCount + 1) × 3 min`, or immediately if that threshold already passed (catch-up after reload/dialog-open).
5. **Copy** — i18n `metro.hintTitle`/`metro.hintMsg` keys, ES + EN.

### Out of scope

- Replay sessions: no hints (consistent with DECIPHER MODE).
- No changes to scoring, route validation, map or legend.
- `metro-design` dev editor does not arm hints.

## How

- `metro.js` data: `buildGraph` edges carry their `line` id (harmless for `optimalRouteMinutes`); new `optimalRouteLegs(from, to)` runs Dijkstra with `prev` tracking and collapses consecutive same-line edges into legs `{line, from, to, minutes}`.
- New `chromatic/components/route-hint.js`: `armRouteHint()` — eligibility guard (chromatic + `startedAt` + `!completedAt` + `!isReplaySession` + `hintCount < legs`), schedules `setTimeout` to the next 3-minute boundary (fires immediately when past), re-checks at fire time, defers 15 s while another overlay is open, shows `showRouteHint(n)` and increments `hintCount`; closing the dialog re-arms for the next leg.
- `screens/metro.js`: `armRouteHint()` at the top of `renderMetro` — every re-render re-arms safely.

## Test plan

- `optimalRouteLegs` returns the 6-leg, 50-minute route.
- Dialog shows leg 1 at/after 3 min, leg 2 at/after 6, … up to 6; none beyond.
- Not before 3 min; fires mid-screen via fake timers; `hintCount` prevents repeats; silent in replay/completed; Escape/button close; i18n EN works.
