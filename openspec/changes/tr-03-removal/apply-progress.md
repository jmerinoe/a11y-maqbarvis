# Apply Progress: TR-03 Removal — Carousel Without Focus Stealing

## Status: COMPLETE

All 5 milestones implemented. Build passes. 42/42 tests pass (36 existing + 6 new).

## What was built

### Milestone 1: Carousel correction (`src/screens/home.js`)
- Removed `data-trap="TR-03"` from the carousel `<section>` (slides keep `tabindex="0"`).
- Rewrote `startCarousel()`:
  - Interval callback only toggles `.active` — the focus-stealing block (`activeElement` check + `slides[current].focus()`) is gone.
  - Guarded `window.matchMedia('(prefers-reduced-motion: reduce)')`: no interval when `matches` is true; degrades to "no preference" when `matchMedia` is unavailable (jsdom-safe).
  - `change` listener stops/resumes rotation dynamically — via interval-only `stopRotation()` so the listener survives and can resume.
- Extended `stopCarousel()` to also remove the `motionQuery` change listener (prevents accumulation across re-renders).
- Updated file header + comments (TR-03 marked as corrected).

### Milestone 2: Trap registry correction
- `src/traps/registry.js`: TR-03 entry removed; header comment "18 accessibility traps" → "17".
- `src/traps/README.md`: "except TR-11" → "except TR-03 and TR-11".
- `src/tests/trap-registry.test.js`: count 18 → 17; `TR-03` removed from `expectedIds`; test title updated to "(TR-03, TR-11 corrected)".

### Milestone 3: New structural test
- `src/tests/carousel-motion.test.js` — 6 cases (stubbed `matchMedia` + `vi.useFakeTimers()`):
  1. Rotation does not move focus off the search input
  2. Auto-rotation advances slides under no preference
  3. No rotation under `prefers-reduced-motion: reduce`
  4. Dynamic stop on `reduce` and resume on `no-preference`
  5. No `data-trap="TR-03"` in rendered markup
  6. Slides keep `tabindex="0"`

### Milestone 4: Documentation
- `docs/verification-checklist.md`: TR-03 block replaced with a corrected-behavior note in the Home section (pattern per the TR-11 note).
- This file + `verify-report.md`.

### Milestone 5: Final verification
- `npm test` — 42/42 pass; trap-registry reports 17 traps
- `npm run build` — OK
- Grep `TR-03` in `src/` — no `data-trap` marker or registry entry remains (only comments noting the correction and test references)

## Files changed

| File | Change |
|------|--------|
| `src/screens/home.js` | Removed `data-trap`; `startCarousel` rewrite (no focus steal, reduced-motion guard + change listener); `stopCarousel` listener cleanup |
| `src/traps/registry.js` | TR-03 entry removed; header comment 18 → 17 |
| `src/traps/README.md` | "except TR-03 and TR-11" |
| `src/tests/trap-registry.test.js` | 17 traps; ID list without TR-03 |
| `src/tests/carousel-motion.test.js` | New — 6 tests |
| `docs/verification-checklist.md` | TR-03 block → corrected-behavior note |

## Requirements coverage

| Req | Status |
|-----|--------|
| REQ-T3R-01 rotation never steals focus | Done — `.focus()` call removed entirely; tested |
| REQ-T3R-02 respect prefers-reduced-motion | Done — no interval under `reduce`; dynamic stop/resume via `change` listener |
| REQ-T3R-03 graceful degradation | Done — optional-chained `matchMedia`, defaults to "no preference" |
| REQ-T3R-04 slides remain focusable | Done — `tabindex="0"` preserved; tested |
| REQ-T3R-05 TR-03 removed | Done — registry, marker, test, README, checklist all updated |
| REQ-T3R-06 no other traps touched | Done — 17 traps, all other `data-trap` intact |
