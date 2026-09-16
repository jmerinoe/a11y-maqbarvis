# Proposal: Variant Options i18n — Localized Size/Color Labels & Single One-Size Option

## Why

The Faro ecommerce demo has two language-consistency defects in how product variant options (sizes and colors) are displayed:

1. **Color names are hardcoded in English.** The color filter on the products listing renders raw canonical values (`blue`, `black`, `white`, ...) regardless of the active page language. A Spanish-speaking attendee sees "blue" where the UI should say "Azul". The same happens in the product detail variant selector and in the cart line-item variant text (`M · blue`). This contradicts the spirit of REQ-I18N-02 ("no user-facing string shall be hardcoded inline") — the values were treated as data but are shown as user-facing text.

2. **The size list contains a duplicated option.** The filter shows both `Única` and `One size` as two distinct checkboxes — they are the same concept expressed in two languages at once. Products p007 and p008 carry `sizes: ['Única', 'One size']`, so the duplication also surfaces in the product detail variant selector, and selecting either value filters identically.

This is **not** a registered trap — it is a functional/linguistic evolution. TR-06 (checkboxes without `<label>`) and TR-09 (custom div variant selector) remain intact: the labels become localized text, but the controls stay deliberately inaccessible.

## What Changes

### Scope — variant option labels, all views

1. **Canonical one-size value** — product data and the filter size list are normalized to a single `one-size` value. `Única` and `One size` disappear as raw values. The option displays as "Talla única" (es) / "One size" (en).
2. **Localized color labels** — color keys (`blue`, `black`, `white`, `gray`, `green`, `red`, `brown`) remain the canonical data values used for filtering, `colorHex` lookup, and cart state. Only the *displayed text* is localized via new i18n keys.
3. **Applied in all three places where variant values are shown:**
   - Products listing filters (`filters.js`)
   - Product detail variant selector (`variant-selector.js` + selection matching in `product-detail.js`)
   - Cart line-item variant text (`cart-item.js`)
4. **i18n foundation** — new `variant.size.*` / `variant.color.*` keys in `es.js` and `en.js`, plus a `variantLabel(type, value)` helper that returns the localized label when a key exists and falls back to the raw value for language-neutral sizes (`S`, `M`, `28`, ...).

### Out of scope

- Trap changes: TR-06 and TR-09 are **preserved**. The `<span>` next to each checkbox is still not a `<label>`; the variant selector is still a `<div>` widget with `onclick`, no role, and no accessible name.
- Product names/descriptions (already localized) and `colorHex` values.
- Checkout, confirmation, search, header, and moderator overlay strings.
- Filtering semantics: filtering by `one-size` must return exactly the products that today match `Única`/`One size` (p007, p008). No behavior change beyond the label.

## How

### Architecture approach

The change introduces a **display layer** over canonical variant values:

1. **Data normalization** — `products.js`: `sizes: ['Única', 'One size']` → `sizes: ['one-size']` for p007 and p008. `filters.js`: `allSizes` ends with a single `'one-size'` entry. Because both sides of the comparison use the canonical value, `getFilteredProducts` needs **no change**.
2. **`variantLabel(type, value)` helper** in `i18n/index.js` — resolves `t('variant.<type>.<value>')`; if the key does not exist, returns the raw value. Language-neutral sizes render unchanged.
3. **Filters** — checkbox `value` and `filters.sizes`/`filters.colors` state keep canonical values (`one-size`, `blue`). Only the `<span>` text is localized.
4. **Variant selector** — option divs render the localized label and gain a `data-value` attribute carrying the canonical value. `handleVariantSelected` in `product-detail.js` switches from matching `el.textContent` (now localized) to `el.dataset.value` — a required internal fix, not a behavior change.
5. **Cart items** — `${item.size} · ${item.color}` renders via `variantLabel` for each part.
6. **Tests** — new structural test file; the existing i18n parity test automatically enforces the new keys in both tables.

### Testing strategy

- New `src/tests/variant-options-i18n.test.js`: single `one-size` filter option; localized color labels in ES and EN; variant selector shows one localized one-size option for p007; cart line item shows localized variant text; filtering by `one-size`/`blue` still matches the right products.
- `i18n.test.js` (unchanged) enforces ES/EN key parity and no empty values for the 8 new keys.
- `trap-registry.test.js` untouched — 18 traps, no `data-trap` attributes added or removed.

### Delivery

Single PR strategy. Localized to: `i18n/index.js`, `i18n/es.js`, `i18n/en.js`, `data/products.js`, `components/filters.js`, `components/variant-selector.js`, `screens/product-detail.js`, `components/cart-item.js`, one new test file, and `docs/verification-checklist.md` (informational note). Well under the ~400-line `size:exception` threshold.

## Assumptions

- Canonical color keys (`blue`, ...) are the correct data values: they key `colorHex`, filter state, and cart state. Localizing display only keeps all lookups intact.
- `one-size` is the canonical value; its localized labels are "Talla única" (es) and "One size" (en).
- Sizes `S`–`XL` and numeric `28`–`36` are language-neutral and need no translation keys.
- Filter and cart state are in-memory; existing sessions hold old raw values only until reload, so no migration is needed.

## Risks

| Risk | Mitigation |
|------|------------|
| `handleVariantSelected` matches options by `textContent`; localizing the text breaks visual selection | Add `data-value` to each option and match on `dataset.value` instead — explicit, localization-proof |
| Filtering regresses if canonical values diverge between filter list and product data | Both sides normalized to `one-size`; `getFilteredProducts` comparison unchanged; covered by test |
| Accidentally "fixing" TR-06/TR-09 while touching the markup | Keep `<span>` (not `<label>`) in filters and `<div>`+`onclick` (no role/name) in the selector; verify `data-trap` attributes unchanged |
| Cart items added before the change display raw values | Cart is in-memory and resets on reload; new items store canonical values only |
| `variantLabel` fallback shows raw key text for unmapped values | Helper compares `t(key)` output to the key itself and returns the raw value, not the key string |
