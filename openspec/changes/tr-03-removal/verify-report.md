# Verify Report: TR-03 Removal — Carousel Without Focus Stealing

## Outcome: PASS

## Automated verification

| Check | Result |
|-------|--------|
| `npm test` | 42/42 pass (8 files) — includes new `carousel-motion.test.js` (6 tests) |
| `npm run build` | OK — vite, no errors |
| Trap registry | Pass — 17 traps; expected ID set TR-01, TR-02, TR-04…TR-10, TR-12…TR-19 |
| `data-trap="TR-03"` | Absent — removed from the carousel section; grep in `src/` confirms only comments/test references remain |
| Other traps | Unaffected — TR-01, TR-02, TR-04…TR-19 intact; moderator.test.js passes |

## Scenario coverage (spec → test)

| Spec scenario | Verified by |
|---------------|-------------|
| Rotation does not interrupt keyboard navigation | Test: focus stays on `#search-input` across two interval ticks |
| Rotation continues under no preference | Test: slides advance 0 → 1 → 2 with fake timers |
| No auto-rotation under reduced motion | Test: `matches: true` stub → slide 0 stays active over 9s |
| Preference toggles while page is open | Test: `change` dispatch → interval stops on `reduce`, resumes on `no-preference` |
| Manual focus on a slide still works | Test: `.carousel-slide` keeps `tabindex="0"` |
| TR-03 no longer present | Test: no `[data-trap="TR-03"]` in DOM; registry test asserts 17 traps + ID set |

## Manual checks performed

- Code review of `startCarousel`/`stopCarousel`: the interval callback contains no `focus()` call; the `change` listener uses interval-only `stopRotation()` so resume works; `stopCarousel()` clears both timer and listener to avoid accumulation on re-render.
- Confirmed `matchMedia` access is optional-chained → safe under jsdom (degrades to "no preference").

## Known limitations / notes

- Auto-rotation continues without a visible pause control (owner's confirmed choice). SC 2.2.2 is mitigated by the `prefers-reduced-motion` opt-out and the removal of focus stealing; a pause/play button remains a possible future evolution (i18n keys `home.carousel.*` already exist).
- `stopHomeCarousel` remains an unused export (pre-existing; timer previously survived navigation too — behavior unchanged).
