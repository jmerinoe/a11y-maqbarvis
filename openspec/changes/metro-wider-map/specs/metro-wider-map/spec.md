# Spec: Wider metro map — narrow the side column to its one-line floor

## Purpose

The chromatic route-builder screen SHALL give more width to the metro plano at the expense of the side column ("Estado de las líneas" and "Tu recorrido"), which SHALL be narrowed to the minimum width at which every entry still fits on a single line.

## Requirements

### REQ-940-01: Narrowed side column
The `.metro-main` grid side column SHALL be `minmax(430px, 470px)` (previously `minmax(450px, 570px)`).

### REQ-940-02: Single-line legend entries
Every entry in "Estado de las líneas" SHALL occupy at most one text line: `.legend-status` SHALL use `white-space: nowrap` with `text-overflow: ellipsis`; the full text SHALL remain available (e.g. `title` attribute) when truncated.

### REQ-940-03: Single-line route entries
Every entry in "Tu recorrido" SHALL occupy at most one text line: the leg label span SHALL use `white-space: nowrap` with `text-overflow: ellipsis` and `min-width: 0` so the remove (×) button never wraps out of the row.

### REQ-940-04: Centring kept exact
The `.metro-main` width cap SHALL be updated so the composed block (map-bound width + gap + side column + padding) stays centred: constant `618px` → `518px` for `minmax(430px, 470px)`.

### REQ-940-05: Unchanged behaviour
Map image, hotspot geometry, zoom/pan, legend/tramo content and the ≤1100px stacked layout SHALL NOT change. No entry's text SHALL be shortened or altered.

## Scenarios

### Scenario: Wider map on a width-bound window
- **Given** a viewport narrower than map-bound + side + 48 (e.g. 1200×800)
- **When** the route-builder screen renders
- **Then** the map column is ~100px wider than before, while legend and route entries stay on one line

### Scenario: Longest entries still fit
- **Given** a route containing `L10 · Ciudad Universitaria → Nuevos Ministerios — 18 minutos`
- **When** the side column renders at its 430px minimum
- **Then** the entry occupies a single line (truncated only in pathological cases, full text in `title`)

### Scenario: Centred block
- **Given** a wide viewport (≥ bound + 518px)
- **When** the screen renders
- **Then** the map + side block is horizontally centred with equal margins
