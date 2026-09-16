# Apply Progress: Logo Icon — Lowercase "f" in Times New Roman

## Status: COMPLETE

All 4 milestones implemented. Build passes. 36/36 tests pass (33 existing + 3 new).

## What was built

### Milestone 1: Icon edit
- `src/components/header.js` — inside the logo `data:image/svg+xml` URI:
  - `font-family='serif'` → `font-family='Times New Roman'`
  - `>F</text>` → `>f</text>`
  - `font-size='22'` → `'28'` and baseline `y='28'` → optical centering (`y='20'` + `dominant-baseline='central'`) after visual feedback
- `<span>Faro</span>` wordmark, icon geometry/colors, `data-trap="TR-02"`, and missing `alt` all unchanged.

### Milestone 2: New structural test
- `src/tests/logo-icon.test.js` — 3 cases:
  1. Logo img src contains lowercase `f` text and `font-family='Times New Roman'`
  2. TR-02 preserved: `data-trap="TR-02"` present, no `alt` attribute
  3. `.logo-link` wordmark still reads "Faro"

### Milestone 3: Documentation
- This file + `verify-report.md` (no checklist change needed — TR-02 verification steps are unaffected by the glyph change).

### Milestone 4: Final verification
- `npm test` — 36/36 pass; trap-registry still reports 18 traps
- `npm run build` — OK
- Visual check in dev pending user confirmation

## Files changed

| File | Change |
|------|--------|
| `src/components/header.js` | SVG data-URI: `F`→`f`, `serif`→`Times New Roman` |
| `src/tests/logo-icon.test.js` | New — 3 tests |

## Requirements coverage

| Req | Status |
|-----|--------|
| REQ-LOG-01 lowercase letter | Done — `f` in the SVG text |
| REQ-LOG-02 Times New Roman | Done — `font-family='Times New Roman'` |
| REQ-LOG-03 wordmark unchanged | Done — "Faro" untouched |
| REQ-LOG-04 geometry/color unchanged | Done — only text and font-family edited |
| REQ-LOG-05 TR-02 preserved | Done — img without `alt`, `data-trap` intact, tested |
