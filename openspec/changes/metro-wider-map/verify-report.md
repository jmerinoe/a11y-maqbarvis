# Verify report: Wider metro map

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-940-01 Narrowed column | ✅ | `minmax(430px, 470px)` in `.metro-main` |
| REQ-940-02 Single-line legend | ✅ | `.legend-status`: nowrap + ellipsis + `min-width: 0`; `title` on cut entry |
| REQ-940-03 Single-line route | ✅ | `.metro-tramos li > span`: nowrap + ellipsis + `min-width: 0`; `title` with full text |
| REQ-940-04 Centring | ✅ | Cap constant `518px` = 470 max-side + 16 gap + 32 padding |
| REQ-940-05 Behaviour unchanged | ✅ | No map/hotspot/zoom/data changes; ≤1100px media query untouched; 213 tests green |

## Width math delivered

- Side floor: longest entries ≈ 385–425px content + 32px panel padding → 430px minimum column.
- `mapWidth = min(availH × 0.9088, viewportW − 518)`.
- Width-bound windows gain up to ~140px of map width; height-bound (wide) screens keep the same map size — inherent to the portrait aspect, as documented in the proposal.

## Test run

- `apps/experience`: **23 files / 213 tests — all green** (vitest, jsdom).
- Pure layout change; covered by existing render/interaction tests.

## Post-review note

Owner feedback made the intent explicit: the visible frame must be wider
so zoom/pan has more viewport. `.metro-map-wrap` now draws the frame at
full column width and the plano centres inside it — the extra ~100px of
column width is now visible instead of dead space beside the map border.
