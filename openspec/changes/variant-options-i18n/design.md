# Design: Variant Options i18n

## 1. Overview

This evolution puts a **localized display layer** over canonical variant values and consolidates the duplicated one-size option. It touches four concerns:

1. **Canonical data** — `one-size` replaces `Única`/`One size` in product data and the filter list.
2. **i18n** — new `variant.size.*` / `variant.color.*` keys plus a `variantLabel(type, value)` helper.
3. **Display updates** — filters, variant selector, and cart line items render localized labels while keeping canonical values in state.
4. **Selection fix** — `handleVariantSelected` matches by `data-value` instead of rendered text.

No trap is modified: TR-06 and TR-09 remain fully in place.

## 2. Canonical value model

### Decision: normalize at the data layer

Two options were considered:

- **Option A (chosen)**: normalize product data to `sizes: ['one-size']` and the filter list to a single `'one-size'` entry. The canonical value flows through filter state, variant selection, and cart state; only rendering is localized.
- **Option B**: keep `['Única', 'One size']` in product data and dedupe at display/filter time with alias matching in `getFilteredProducts`.

Option B was rejected: it keeps two values for one concept, requires alias logic in the matcher forever, and leaves the duplication visible in the variant selector. Option A makes the duplication impossible by construction and keeps `getFilteredProducts` untouched — the existing `p.sizes.some((s) => sizes.includes(s))` just works because both sides use `one-size`.

### Canonical values after the change

| Concept | Canonical value | Label (es) | Label (en) |
|---------|-----------------|------------|------------|
| One-size | `one-size` | Talla única | One size |
| Colors | `blue` `black` `white` `gray` `green` `red` `brown` (unchanged) | Azul, Negro, Blanco, Gris, Verde, Rojo, Marrón | Blue, Black, White, Gray, Green, Red, Brown |
| Other sizes | `S` `M` `L` `XL` `28` `30` `32` `34` `36` (unchanged) | — (rendered raw) | — |

`colorHex` keys are unaffected — they are keyed by the unchanged canonical color names.

## 3. i18n foundation

### 3.1 New keys

Added to both `es.js` and `en.js`, grouped under a `// Variant options` comment:

| Key | es | en |
|-----|----|----|
| `variant.size.one-size` | `Talla única` | `One size` |
| `variant.color.blue` | `Azul` | `Blue` |
| `variant.color.black` | `Negro` | `Black` |
| `variant.color.white` | `Blanco` | `White` |
| `variant.color.gray` | `Gris` | `Gray` |
| `variant.color.green` | `Verde` | `Green` |
| `variant.color.red` | `Rojo` | `Red` |
| `variant.color.brown` | `Marrón` | `Brown` |

The i18n completeness test (`i18n.test.js`) enforces parity and non-empty values automatically.

### 3.2 `variantLabel(type, value)` helper

Added to `src/i18n/index.js`:

```js
export function variantLabel(type, value) {
  const key = `variant.${type}.${value}`;
  const label = t(key);
  return label === key ? value : label;
}
```

- `t()` returns the key string when a key is missing, so comparing the output to the key detects "no translation" and falls back to the raw value.
- `variantLabel('size', 'M')` → key `variant.size.M` missing → returns `'M'`. Language-neutral sizes need no keys.
- `variantLabel('color', 'blue')` → `'Azul'` / `'Blue'`.
- `variantLabel('size', 'one-size')` → `'Talla única'` / `'One size'`.

Placed in `i18n/index.js` (not `products.js`) because it is purely a localization concern and `t()` already lives there.

## 4. Data changes

`src/data/products.js` — p007 and p008:

```js
// before
sizes: ['Única', 'One size'],
// after
sizes: ['one-size'],
```

No other product or field changes. `getFilteredProducts` is untouched (§2).

## 5. Filters (`src/components/filters.js`)

```js
const allSizes = ['S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', 'one-size'];
const allColors = ['blue', 'black', 'white', 'gray', 'green', 'red', 'brown']; // unchanged
```

- Checkbox `value`, `onchange` argument, and `filters.sizes`/`filters.colors` state keep **canonical values** (`one-size`, `blue`). Filter matching is unaffected.
- The `<span>` text becomes `${variantLabel('size', size)}` / `${variantLabel('color', color)}`.
- **TR-06 preserved**: the element remains a `<span>` next to an unlabeled checkbox — only its text changes.

## 6. Variant selector (`src/components/variant-selector.js` + `product-detail.js`)

### 6.1 Option markup

```js
// before
`<div data-trap="TR-09" class="variant-option ..."${styleAttr} onclick="...('${type}', '${value}')">${value}</div>`
// after
`<div data-trap="TR-09" class="variant-option ..." data-value="${value}"${styleAttr} onclick="...('${type}', '${value}')">${variantLabel(type, value)}</div>`
```

- `data-value` carries the canonical value for selection matching (§6.2).
- `onclick` still passes the canonical value — selection state and `addToCart` receive `one-size`/`blue`, never a label.
- **TR-09 preserved**: still a `<div>` with `onclick`, no role, no accessible name.

### 6.2 Selection matching fix (`product-detail.js`)

`handleVariantSelected` currently toggles `selected` by comparing rendered text:

```js
// before — breaks once textContent is localized
el.classList.toggle('selected', el.textContent.trim() === value);
// after — matches canonical value regardless of label
el.classList.toggle('selected', el.dataset.value === value);
```

This is a required internal fix: with localized text, `textContent` would be `Rojo` while `value` is `red`. Matching on `dataset.value` is also more robust against whitespace/casing.

## 7. Cart line items (`src/components/cart-item.js`)

```js
// before
<span class="cart-item-variant">${item.size} · ${item.color}</span>
// after
<span class="cart-item-variant">${variantLabel('size', item.size)} · ${variantLabel('color', item.color)}</span>
```

Cart items store canonical values (`item.size === 'one-size'`); only display is localized. `addToCart` dedup (`productId` + `size` + `color`) keeps working on canonical values.

## 8. New structural test: `variant-options-i18n.test.js`

New file `src/tests/variant-options-i18n.test.js` (jsdom, same setup as `cart-add-feedback.test.js`):

```js
describe('Variant options i18n', () => {
  it('renders a single one-size filter option with localized label', () => {
    // renderFilters() in es → exactly one checkbox value="one-size", span text "Talla única"
  });

  it('localizes color filter labels in es and en', () => {
    // es → "Azul"; setLanguage('en') → "Blue"
  });

  it('variant selector shows one localized one-size option for p007', () => {
    // renderVariantSelector(p007, 'size') → one .variant-option, text "Talla única", data-value="one-size"
  });

  it('selection marks the clicked option via data-value', () => {
    // dispatch variant-selected { type:'color', value:'red' } → option with data-value="red" gets .selected
  });

  it('cart line item renders localized variant text', () => {
    // addToCart('p007','one-size','red') → .cart-item-variant text === "Talla única · Rojo"
  });

  it('filtering by one-size returns only p007 and p008', () => {
    // getFilteredProducts('', ['one-size'], []) → ids [p007, p008]
  });
});
```

## 9. Documentation

`docs/verification-checklist.md` — add a short note in the "Product listing" section (after TR-08) noting that variant option labels are now localized and one-size is a single option, so the moderator is not surprised by "Azul" during the demo. No trap sections change.

`src/traps/README.md` and `registry.js` — unchanged (18 traps, no marker edits).

## 10. Files changed

| File | Change |
|------|--------|
| `src/i18n/index.js` | Add `variantLabel(type, value)` helper |
| `src/i18n/es.js` | Add 8 `variant.*` keys |
| `src/i18n/en.js` | Add 8 `variant.*` keys |
| `src/data/products.js` | `['Única','One size']` → `['one-size']` (p007, p008) |
| `src/components/filters.js` | `allSizes` single `one-size`; `<span>` text via `variantLabel` |
| `src/components/variant-selector.js` | Localized option text + `data-value` attribute |
| `src/screens/product-detail.js` | `handleVariantSelected` matches `dataset.value` |
| `src/components/cart-item.js` | Variant text via `variantLabel` |
| `src/tests/variant-options-i18n.test.js` | New test file |
| `docs/verification-checklist.md` | Informational note in Product listing section |

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Localized text breaks `textContent`-based selection matching | `data-value` attribute + `dataset.value` comparison (§6.2); covered by test |
| `one-size` filter matches nothing after data change | Canonical value on both sides of `getFilteredProducts`; dedicated test asserts p007/p008 |
| `variantLabel` leaks raw key strings for unmapped values | Fallback compares `t()` output to the key and returns the raw value (§3.2); 'M' → 'M' |
| Changing option markup weakens TR-06/TR-09 | Keep `<span>`/`<div>`+`onclick` structure and all `data-trap` attributes; trap-registry test unchanged |
| Cart items added pre-change show stale raw values | In-memory cart resets on reload; canonical-only going forward |
| String key typos between tables | `i18n.test.js` enforces exact ES/EN key parity |
