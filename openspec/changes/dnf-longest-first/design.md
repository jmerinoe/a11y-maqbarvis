# Design: DNF ordering — longest survival first

## Current comparator (identical shape in both places)

```js
dnfWeight(a) - dnfWeight(b) ||       // completed first
appointmentAt asc ||                  // comprehension metric (absent on DNF)
routeMinutes asc ||                   // chromatic metric (absent on DNF)
a.elapsedMs - b.elapsedMs ||          // ascending — earliest quitter first
endedAt asc || user asc
```

DNF rows carry no mission metric (`appointmentAt`/`routeMinutes` absent → equal fallbacks), so the elapsed term is what orders them today — ascending.

## Change

Replace the elapsed term with a direction-aware comparison in:

- `apps/experience/src/session/session.js` — `getRanking`
- `api/src/functions/public.js` — `/api/ranking` handler

```js
(a.result === 'abandoned' ? b.elapsedMs - a.elapsedMs : a.elapsedMs - b.elapsedMs)
```

Because `dnfWeight` is evaluated first, this term only ever compares rows of the same kind; `a.result` selects descending for DNF–DNF pairs and ascending otherwise. Comment updated accordingly in both files.

## Affected surfaces

- `#/ranking` (app) — via `getRanking`/`fetchRanking`.
- Kiosk board + admin list — inherit API order, no code change.
- Dev mock ranking — static sample data, unaffected.

## Test plan

- `abandon-experience.test.js` — flip the DNF ordering expectation to `DNF-slow` then `DNF-fast`; rename the case.
