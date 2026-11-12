# Design: COLOR TRAP — progressive route hints every 3 minutes

## Data: `optimalRouteLegs(from, to)`

`optimalRouteMinutes` runs Dijkstra for minutes only. Extend `buildGraph` edges with `line: line.id` (ignored by the minutes function), then add `optimalRouteLegs`: same Dijkstra plus a `prev` map (node → `{from, line, w}`); rebuild the edge path, then collapse consecutive same-line edges into legs `{line, from, to, minutes}`. Verified output for San Nicasio → Aeropuerto T4: 50 min, 6 legs — matching the six 3-minute slots exactly.

## Component: `components/route-hint.js`

```js
const HINT_EVERY_MS = 3 * 60 * 1000;
let pendingTimer = null;

function eligible(session) {
  return session?.experienceId === 'chromatic' && session.startedAt &&
    !session.completedAt && !isReplaySession(session) &&
    (session.hintCount ?? 0) < legs().length;
}

export function armRouteHint() {
  clearTimeout(pendingTimer); pendingTimer = null;
  const s = getSession();
  if (!eligible(s)) return;
  const next = ((s.hintCount ?? 0) + 1) * HINT_EVERY_MS;
  const remaining = next - (Date.now() - s.startedAt);
  remaining <= 0 ? fire() : (pendingTimer = setTimeout(fire, remaining));
}

function fire() {
  pendingTimer = null;
  const s = getSession();
  if (!eligible(s)) return;
  if (document.querySelector('.congrats-overlay')) {        // don't stack
    pendingTimer = setTimeout(fire, 15000); return;
  }
  const n = (s.hintCount ?? 0) + 1;
  setSession({ ...s, hintCount: n });
  showRouteHint(n, legs()[n - 1]);   // on close → armRouteHint() re-arms
}
```

`legs()` memoizes `optimalRouteLegs(mission.origin, mission.destination)` — the mission endpoints come from `getExperienceById('chromatic').mission` (checked: `origin`/`destination` fields already drive the map).

`showRouteHint` mirrors `metro-dialog.js`: `congrats-overlay chromatic-scope` (grayscale, matching the barrier run), `congrats-dialog metro-dialog`, `aria-labelledby`, focus save/restore, Escape + `metro.dialog.ok` close → `armRouteHint()` to schedule the next leg.

## Copy (i18n, ES + EN)

- `metro.hintTitle` — 'Veo que necesitas ayuda.' / 'Looks like you need a hand.'
- `metro.hintMsg` — 'Tramo {n} de la ruta más rápida: {leg}' / 'Leg {n} of the fastest route: {leg}'
- `leg` param is built in the component as `<strong>${line} · ${from} → ${to}</strong>` and rendered via innerHTML.

## Wiring

`renderMetro` calls `armRouteHint()` first thing — it re-renders on every tramo interaction, so the schedule self-heals after each action and on load/reload. `metro-design.js` (dev editor) does not arm.

## Edge cases

- Dialog left open past the next threshold: next hint only schedules on close, then fires immediately (catch-up) — never stacks.
- Suboptimal/abandon/other dialog open at fire time: retry in 15 s.
- Completion/abandon sets `completedAt` → eligibility dies, pending timer no-ops on re-check.
- Data change alters leg count: `hintCount < legs.length` adapts automatically.

## Test plan

- `chromatic.test.js`: `optimalRouteLegs` returns the 6 legs/50 min; hint fires ≥3 min with leg 1; silent <3 min; mid-screen fire via fake timers; leg order and `hintCount` progression; once-each; silent in replay/completed; Escape/button close re-arms.
