# Proposal: Second workshop experience — Experiencia cromática

## Why

The workshop currently ships a single experience (screen-reader / Faro ecommerce). A second experience, **Experiencia cromática**, simulates a person who cannot perceive color: the UI renders only in black, white and grays, and the task relies on information conveyed *only* by color-coded line tones — which become indistinguishable.

## What Changes

### Scope

1. **Directory reorganization** — experience-specific code moves under `src/experiences/<id>/`:
   - `src/experiences/screen-reader/` — Faro screens, components, data, traps, styles (existing experience, behavior unchanged).
   - `src/experiences/chromatic/` — metro screens, data, components, styles (new).
   - Shared instrumentation stays at `src/` (session, router, i18n, panel-shell, timer, dialogs, session screens).
2. **New experience registry entry** `chromatic` ("Experiencia cromática") — appears in `#/experiences`, gets its own ranking automatically.
3. **Instructions screen** — same structured format (welcome/objective/mission/mission card/continue); timer starts on Continuar exactly as today.
4. **Metro info web** (grayscale):
   - Madrid metro plano (attached PDF) embedded as reference.
   - Line legend: each line shows a tone swatch + status (operativa / restricciones / interrumpida). Under grayscale the tones are indistinguishable — that is the point of the experience.
   - **Tramo builder**: pick line → origin → destination. Same-line tramo → added to a list with its duration and the running total. Different-lines pair → popup "selecciona tramos de la misma línea". Interrupted-line tramo → blocked popup.
   - Tramo list shows each leg with its time plus total.
5. **Mission** — fastest route San Nicasio → Barajas ("coger un vuelo"). Line 6 interrupted; line 4 restricted (×3 time). On "Comprobar ruta":
   - Route = optimal → success congrats popup, timer stops, ranking window shows position (existing shared flow).
   - Connected but slower → popup "existen rutas más rápidas", timer keeps running.
   - Not connected San Nicasio→Barajas → popup indicating the route doesn't reach the destination.
6. **Grayscale presentation** — chromatic screens render under a grayscale filter + monochrome palette.

### Out of scope

- Kiosk: untouched (it already lists experiences dynamically).
- No changes to existing Faro behavior, traps, tests or session flow — only file moves.
- No new traps beyond the intentional color-only information that *is* the experience's point.

## How

### Architecture approach

```
apps/experience/src/
  experiences/
    screen-reader/        ← moved Faro code
      screens/  components/  data/  traps/  styles/
    chromatic/            ← new
      screens/  components/  data/  styles/
  (shared at src/: session, router, store→per-experience, i18n,
   components/{panel-shell,experience-timer,congrats-dialog,…},
   screens/{login,experience-select,instructions,ranking})
```

- `src/data/experiences.js` — registry gains `chromatic` with localized content, `requiredItem`-equivalent mission descriptor, and a `routes`/`homeRoute` mapping so the router resolves experience-specific screens.
- `src/experiences/chromatic/data/metro.js` — lines `{id, status, multiplier, stations[]}` encoded from the official plano; modeled lines: **L4, L6, L8, L10, L12** (L6 interrupted — listed in legend/selector, tramos blocked).
- Graph model: nodes = stations; edges = consecutive stations on each line weighted `line.minutesPerStop × statusMultiplier` (interrupted → excluded). **Optimal route computed by Dijkstra** — no hardcoded answer.
- `src/experiences/chromatic/screens/metro.js` — plano embed + legend + builder + tramo list + Comprobar; route validation: starts at San Nicasio, contiguous tramos, ends at Barajas; totals compared to computed optimum.
- Completion reuses the shared pipeline: `submitResult` + `stopExperienceTimer` + `faro-pending-congrats` → congrats dialog → `#/ranking` (window already per-experience).
- Grayscale: `.chromatic-scope { filter: grayscale(1) }` + monochrome palette scoped to chromatic screens.

### Data note

Real Madrid metro topology matters here: San Nicasio and Puerta del Sur are **adjacent** on the L12 circle; L10 links Puerta del Sur → Nuevos Ministerios where L8 begins (→ Barajas). The L6 circular would shortcut Príncipe Pío → Nuevos Ministerios but is interrupted; the L4 path via Alonso Martínez → Mar de Cristal is penalized ×3. Optimal expected: L12 → L10 → L8.

### Testing strategy

New `chromatic.test.js`: line/station data integrity, same-line vs different-line tramo handling, interrupted block, tramo list + total, Dijkstra optimum, route validation (success / slower / unreachable), grayscale scope class, grayscale grayscale-rendering of legend swatches, instructions continue → timer. Existing suite must stay green after the directory move.

### Delivery

Single evolution, several commits OK. ~20 moved files + ~10 new files + tests + openspec docs.

## Assumptions

1. Per-stop time: configurable per line, default **2 min/stop**; restricted lines multiply ×3; interrupted lines cannot be selected for tramos.
2. Modeled lines are L4, L6, L8, L10, L12 with official station lists from the plano — enough for the mission's real topology.
3. "Ruta más rápida" = user's submitted route connects San Nicasio→Barajas **and** its total equals the computed optimum (equally-fast alternatives also pass).
4. The plano PDF is embedded on the metro screen (copied to `public/`); grayscale filter applied to the embed where the browser allows.
5. Instructions text for chromatic follows the same structure; I will draft ES/EN drafts for review.
6. A tramo can go backwards along a line (direction doesn't matter, only stop count).
7. Transfers at shared stations are implicit: next tramo just starts at the previous tramo's destination.

## Risks

| Risk | Mitigation |
|------|------------|
| Directory move breaks imports/tests | Move + fix imports mechanically; full suite must stay green before new work |
| Station data errors change the optimum | Encode from official plano; sanity-check expected optimal route in tests |
| Grayscale filter on PDF embed may not apply in all browsers | Acceptable — PDF is reference material; UI itself is grayscale |
| Route ambiguity (circular L12 directions) | Tramo time = min stops between the two stations on the line |
