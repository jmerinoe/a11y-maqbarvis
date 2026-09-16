# Verify Report: Variant Options i18n

## Outcome: PASS

## Automated verification

| Check | Result |
|-------|--------|
| `npm test` | 29/29 pass (5 files) — includes new `variant-options-i18n.test.js` (7 tests) |
| `npm run build` | OK — vite v8, 27 modules, no errors |
| i18n parity (`i18n.test.js`) | Pass — 8 new `variant.*` keys present in ES and EN, no empty values |
| Trap registry (`trap-registry.test.js`) | Pass — still 18 traps, no ID changes |
| Grep `Única`/`One size` in `src/` | No raw data values remain — only i18n labels (`'One size'` en, `'Talla única'` es) and the test asserting their absence as input values |
| `data-trap` attributes | Unchanged — TR-06 and TR-09 markup structure preserved (`<span>` not `<label>`; `<div>` + `onclick`, no role/name) |

## Scenario coverage (spec → test/manual)

| Spec scenario | Verified by |
|---------------|-------------|
| Color filter labels in Spanish | Test: "localizes color filter labels in es and en" (Azul/Rojo) |
| Color filter labels in English | Same test, en branch (Blue/Red, "One size") |
| Single one-size filter option | Test: "renders a single one-size filter option" — one `value="one-size"` input, no `Única`/`One size` inputs |
| Filtering by one-size | Test: returns exactly p007 + p008 |
| Variant selector localized | Test: p007 size selector → one option, "Talla única", `data-value="one-size"` |
| Selection state survives localization | Test: `variant-selected` marks `[data-value="red"]` selected |
| Cart line item localized | Test: "Talla única · Rojo" |
| Language switch re-localizes | Test renders filters under both `setLanguage('es')` and `setLanguage('en')`; canonical `value`/state unaffected |
| Traps unchanged | trap-registry tests + unchanged `data-trap` attributes; TR-06/TR-09 markup preserved |

## Manual checks performed

- Code review of rendered markup: filter `<span>` shows localized label while `value`/`onchange` carry canonical values.
- Confirmed `handleVariantSelected` no longer depends on rendered text — selection is robust to any future label change.

## Known limitations / notes

- Cart is in-memory: items added before reload store canonical values; no migration needed.
- `variantLabel` fallback intentionally renders language-neutral sizes (`S`, `28`, …) raw — no keys required for them.
- This change is not a trap correction: the registry remains at 18 traps and the moderator overlays for TR-06/TR-09 keep working over the same elements.
