# Verify Report: TR-06 + TR-07 Removal, TR-09 Partial Removal

## Outcome: PASS

## Automated verification

| Check | Result |
|-------|--------|
| `npm test` | 50/50 pass (9 files) — includes new `tr-06-07-09-removal.test.js` (8 tests) |
| `npm run build` | OK — vite, no errors |
| Trap registry | Pass — 15 traps; expected ID set TR-01, TR-02, TR-04, TR-05, TR-08…TR-10, TR-12…TR-19 |
| `data-trap="TR-06"` / `"TR-07"` | Absent — grep in `src/` finds only test assertions |
| `data-trap="TR-09"` | Present only on the M-option branch in `variant-selector.js` (with `tabindex="0"` so Tab doesn't skip it); exactly one marker renders per page |
| Other traps | Unaffected — TR-01, TR-02, TR-04, TR-05, TR-08, TR-10, TR-12…TR-19 intact; `moderator.test.js` passes |
| i18n parity | Pass — `products.buyNamed` present in both tables; `i18n.test.js` green |

## Scenario coverage (spec → test)

| Spec scenario | Verified by |
|---------------|-------------|
| Screen reader identifies every filter | Test: all 17 checkboxes have `id` + `label[for]` with non-empty localized text |
| Links list identifies each product | Test: unique link texts matching `Comprar — {name}` |
| Sizes/colors announced as radio group | Test: `fieldset`+`legend`+`role="radiogroup"`; every non-M size and every color is `role="radio"` + `aria-checked` + `tabindex="0"` — each option is its own Tab stop |
| M option remains trapped | Test: single `data-trap="TR-09"` div — `onclick`+`onkeydown`, `tabindex="0"`, no role, no name |
| M selectable but not identifiable | Test: `__faroSelectVariantKey` selects M on Enter (and ignores other keys); no role/name asserted |
| Mixed selection stays coherent | Test: select L → `.selected`+`aria-checked="true"`; select M → M selected, radios reset to `aria-checked="false"` |
| Registry correction | Test: 15 traps; TR-06/TR-07 absent; TR-09 kept |

## Manual checks performed

- Code review of `variant-selector.js`: the M exception lives only in the `size`+`M` branch; color options and non-M sizes always render `role="radio"` options; `aria-checked` reflects `selectedValue` on re-render.
- Code review of `handleVariantSelected`: syncs `aria-checked` alongside `.selected`, covering both directions (radio→M and M→radio).
- Confirmed jsdom limitation: inline `onclick`/`onkeydown` handlers evaluate `window.*` in jsdom's own scope, so the new test dispatches `variant-selected` directly (consistent with existing test conventions).
- CSS: `:focus-visible` on `.variant-option` gives every focusable option (ARIA radios and the trapped M div) a visible focus indicator.
- **Why ARIA radios and not native `<input type="radio">`:** a native radio group only contributes one Tab stop (arrow keys move between options), and `tabindex="0"` on the inputs does not change that — verified in-browser by the owner (Tab skipped from M straight to the color group). ARIA radios give each option its own Tab stop while keeping radio semantics.

## Known limitations / notes

- **TR-09 is intentionally partial**: the M size option remains a non-semantic `<div>` (owner's request — "la M mantiene la trampa"), with `tabindex="0"` so Tab doesn't skip it and an `onkeydown` handler so Enter/Space selects it (owner's follow-ups: not skipped, all sizes selectable). The trap now lives purely in semantics — no role, no accessible name: NVDA announces a generic clickable inside a correct ARIA radio group. The moderator badge annotates only M. Products without M (p003, p007, p008) render no TR-09 marker.
- The listing's M **filter** checkbox is labeled like the rest — the exception applies only to the detail selector.
- `variant-selected` listeners accumulate on `document` across re-renders (pre-existing behavior; handlers are idempotent — unchanged by this evolution).
