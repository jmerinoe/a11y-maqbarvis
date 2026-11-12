# Apply progress: Wider metro map

## M1 — Layout & single-line rules ✅

`apps/experience/src/experiences/chromatic/styles/metro.css`:

- `.metro-main`: side column `minmax(430px, 470px)` (was `450–570`); centring cap `618px` → `518px`; vertical padding `0.75rem` → `0.5rem` (dvh term updated `1.5rem` → `1rem` to match).
- `.metro-side .metro-panel`: padding `1.25rem` → `1rem` (side panels only).
- `.legend-status`: `0.9rem` + `min-width: 0` + `nowrap` + `ellipsis`.
- `.metro-tramos li`: `min-width: 0`; `li > span`: `0.9rem` + `nowrap` + `ellipsis`.

`apps/experience/src/experiences/chromatic/screens/metro.js`:

- Tramo label span gets `title` with the full leg text (shared `label` var).
- Cut legend entry gets `title` with the full station+status text.

### Post-review refinement (visible frame)

The owner clarified the intent: the *frame* (recuadro) itself must be
visibly wider so zoom/pan gets more viewport. Implemented:

- `.metro-map-wrap` now carries the visible border + white background —
  it is the full-column-width frame (was the map box's own border).
- `.metro-map` border removed (redundant inside the framed wrap; also
  avoided a scaled-looking border when zoomed).
- `attachMapView` centres the plano inside the frame when it fits
  (`tx = (rw − mw) / 2`) instead of pinning it flush-right.

## M2 — Verify ✅

- Suite: 23 files / 213 tests — all green.
- Map image, hotspots, zoom/pan, ≤1100px stacked layout untouched.

## M3 — Docs ✅

- This file + `verify-report.md`.
