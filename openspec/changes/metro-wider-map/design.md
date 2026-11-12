# Design: Wider metro map

## Current layout

- `.metro-main`: `grid-template-columns: minmax(0,1fr) minmax(450px,570px)`, width cap `min(100%, calc((100dvh − 1.5rem) × 0.9088 + 618px))`.
- The map is portrait (`1122.5 × 1235.1`, aspect 0.9088): `height: min(100cqh, 100cqw × mh/mw)` — height-bound on wide screens, width-bound on narrow ones.
- `.metro-panel` padding 1.25rem; `.legend-status` 0.95rem; tramo `<li>` = label span + × button.

## Width budget (floor calculation)

Longest entries (ES, uncompressed ≈ measured at ~7.3px/char):

| Entry | Content |
|---|---|
| Legend cut `Alonso Martínez — Corte: no entran ni salen trenes` | ~410px |
| Tramo `L10 · Ciudad Universitaria → Nuevos Ministerios — 18 minutos` + × | ~455px |

With the compression below (−7% text, padding 40→32px): floor ≈ **430px**, ceiling **470px** keeps a small flex for wider viewports.

## Changes (all in `styles/metro.css`)

1. `.metro-main`
   - `grid-template-columns: minmax(0, 1fr) minmax(430px, 470px)`
   - width cap `… + 618px` → `… + 518px`
   - vertical padding `0.75rem` → `0.5rem` (small free height gain)
2. `.metro-side .metro-panel` → `padding: 1rem` (side panels only)
3. `.legend-status` → `font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
4. `.metro-tramos li > span` → `font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;`
   and `.metro-tramos li` gets `min-width: 0` so the span can shrink without pushing the × out.
5. `metro.js` — add `title`/`aria-label` with the full text on tramo spans (legend statuses already short; give the cut entry a `title` too for symmetry).

## Map width result

`mapWidth = min(availH × 0.9088, viewportW − side − 48)`:

| Viewport | Before | After | Δ |
|---|---|---|---|
| 1200×800 (width-bound) | ~598px | ~705px | +107px |
| 1366×768 | ~676px | ~676px | height-bound, no change |
| 1920×1080 | ~959px | ~959px | height-bound, no change |

The gain materializes on narrower windows; on wide screens the block simply centres narrower.

## Accessibility

- Truncation is a fallback, not the norm — entries are sized to fit; `title` preserves the full string for hover, and the existing `aria-label` on the × button already names the leg.
- No focusable element is removed or reordered.

## Test plan

- CSS-only change: no logic tests needed. Existing chromatic suite guards regressions (renders, map interactions).
- Manual check: longest tramo entries at 430px stay one line; resize window across the width-bound boundary.
