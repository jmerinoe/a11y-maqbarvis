# Verify report: BLIND BUY — fix the five keyboard traps

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-980-01 Skip link | ✅ | First header element; click focuses `#main-content` without changing `location.hash`; hidden until `:focus` |
| REQ-980-02 Real search button | ✅ | `<button>` with `aria-label`, `addEventListener` bound; test clicks it → `#/products` |
| REQ-980-03 Natural tab order | ✅ | No positive `tabindex` on `.product-card`; attribute removed entirely |
| REQ-980-04 Cart modal focus | ✅ | `role="dialog"`/`aria-modal`/`aria-labelledby`; focus in on open; Tab/Shift+Tab trapped; Escape → `#/products`; previous focus restored |
| REQ-980-05 Focus first invalid | ✅ | `firstInvalid.focus()` on failed submit; test asserts `activeElement === #ck-name` |
| REQ-980-06 Registry/annotations | ✅ | 10 traps in `registry.js`, 5 `data-trap` attrs removed, README updated, moderator unchanged |

## Test run

- `apps/experience`: **24 files / 232 tests — all green** (vitest, jsdom; 5 new fix cases + 4 updated files).

## Notes

- The remaining barriers still present: TR-02 (no alt), TR-05 (no label), TR-09 (M-size div), TR-10 (split price), TR-13 (icon remove), TR-14 (silent total), TR-15 (colour-only errors), TR-16 (placeholder labels), TR-17 (unassociated errors), TR-19 (silent confirmation).
