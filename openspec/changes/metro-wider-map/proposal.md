# Proposal: Wider metro map — narrow the side column to its one-line floor

## Why

On the chromatic experience screen, the side column ("Estado de las líneas" + "Tu recorrido") takes 450–570px while the plano could use more room. Two constraints govern how narrow that column can go: every legend entry and every route leg must fit on **a single line**. Today the band `minmax(450px, 570px)` already lets the longest legs wrap at its lower end — the single-line rule is only half-met, and the column is wider than the content strictly needs.

## What Changes

### Scope

1. **Side column narrowed** — `.metro-main` grid goes from `minmax(450px, 570px)` to `minmax(430px, 470px)`: ~100px (22%) narrower, freed width flows to the map column.
2. **Single-line guarantee** — `.legend-status` and the tramo label span get `white-space: nowrap` (+ `text-overflow: ellipsis` with the full text kept in `title`/aria-label as the graceful fallback for pathological cases).
3. **Light compression** — side panels' padding 1.25rem → 1rem and entry font ~0.9rem so the longest real entries fit inside 430px without truncation:
   - Legend worst case (~410px content) → ~385px after compression.
   - Tramo worst case (~455px content) → ~425px after compression.
4. **Centring formula updated** — `.metro-main` width cap constant `618px` → `518px` (470 max-side + 16 gap + 32 padding) so the composed block keeps centring exactly.
5. **Designer's `.md-main` untouched** — different screen, already has its own constants.

### The width math (why 430px floor)

| Entry | Content width (current) | After ~0.9rem compression |
|---|---|---|
| `Alonso Martínez — Corte: no entran ni salen trenes` | ~410px | ~385px |
| `L4 Restricciones (los metros tardan el triple)` | ~330px | ~310px |
| `L10 · Ciudad Universitaria → Nuevos Ministerios — 18 minutos` + × btn | ~455px | ~425px |

Floor = longest entry + panel padding (2×16px) ≈ **430px**.

### Resulting max map width

```
mapWidth = min( (dvh − 24px) × 0.9088 ,  viewportW − side − 48 )
```

- **Width-bound viewports** (window narrower than bound + side + 48): the map gains up to ~100–140px (~15–20%) — e.g. a 1200×800 window goes from ~598px to ~705px map width.
- **Height-bound viewports** (wide screens): the map is already at its maximum height-imposed width (e.g. ~959px on 1080p) and cannot grow horizontally — the visible effect there is the side panels sitting closer to the map.

### Out of scope

- No changes to the map image, hotspots, zoom/pan, legend/tramo data or logic.
- No copy changes inside the entries (status texts and leg format stay).
- The stacked layout below 1100px is untouched.

## How

- `apps/experience/src/experiences/chromatic/styles/metro.css` — grid columns, centring constant, `.metro-side` panel padding, `.legend-status`/`.metro-tramos li > span` nowrap rules with `min-width: 0` so flex can shrink and ellipsis can kick in.
- Optional free gain: `.metro-main` vertical padding 0.75rem → 0.5rem adds ~8px of map height (~7px width) — included since it costs nothing.

## Assumptions

- "Una línea por entrada" means a hard guarantee → `nowrap` + `ellipsis`; full text stays reachable via `title` attribute if a pathological entry ever truncates.
- The 430–470px band is "un poco más estrecho" — going further would force truncation of real entries at current typography.

## Risks

- **Truncation risk**: covered by measuring against the longest realistic entries; `title` attr preserves full text.
- **Height-bound screens see no map enlargement**: inherent to the portrait map aspect — documented honestly, not a regression.
