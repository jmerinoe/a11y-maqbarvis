# Design: TR-06 + TR-07 Removal, TR-09 Partial Removal

## 1. Overview

Correct two listing traps fully (TR-06 unlabeled checkboxes, TR-07 generic links) and correct TR-09 partially (semantic radio group for every size **except M** and for all colors; the M option keeps the trapped `<div>`). Registry goes from 17 → 15 traps; TR-09's entry stays with an updated description.

## 2. TR-06 — Filter checkboxes (`src/components/filters.js`)

### 2.1 Markup

```html
<!-- before -->
<div class="filter-option">
  <input data-trap="TR-06" type="checkbox" value="M" onchange="window.__faroFilterSize('M', this.checked)" />
  <span>M</span>
</div>

<!-- after -->
<div class="filter-option">
  <input id="filter-size-m" type="checkbox" value="M" onchange="window.__faroFilterSize('M', this.checked)" />
  <label for="filter-size-m">M</label>
</div>
```

- IDs: `filter-size-${size}` and `filter-color-${color}` — all values in `allSizes`/`allColors` are slug-safe (`S`, `M`, `28`, `one-size`, `blue`, ...).
- The `<span>` becomes `<label for>`. Label text keeps using `variantLabel(type, value)` (localized).
- `data-trap="TR-06"` removed; TR-06 comments removed.
- The existing `<fieldset class="filter-group"><legend>` grouping is kept — it already gives group context.
- `bindFilterEvents` unchanged (canonical values, same `__faroFilter*` handlers).

No CSS change needed: `.filter-option` is a flex row — a `<label>` lays out like the `<span>` did. Label inherits `.filter-option` color/font (labels have no user-agent font override in this stylesheet).

## 3. TR-07 — Buy links (`src/components/product-card.js` + i18n)

### 3.1 Markup

```html
<!-- before -->
<a data-trap="TR-07" href="#/product/p001">Comprar</a>

<!-- after -->
<a href="#/product/p001">Comprar — Camiseta</a>
```

- New i18n key `products.buyNamed`: es `'Comprar — {name}'`, en `'Buy — {name}'` (matches the registry `fix` snippet `Buy — Blue t-shirt`).
- Link text: `t('products.buyNamed', { name })` where `name` is the already-localized product name.
- Visible text (not `aria-label`) — benefits sighted users and voice-control users too, and matches the registry fix.
- `data-trap="TR-07"` and the TR-07 comment removed. TR-08 (`tabindex`, `data-trap` on `<article>`) untouched.

## 4. TR-09 — Variant selector, partial (`src/components/variant-selector.js`, `src/screens/product-detail.js`, `src/styles/main.css`)

### 4.1 Structure

```html
<!-- before -->
<div class="variant-selector" data-variant-type="size">
  <span class="variant-label">Talla</span>
  <div class="variant-options">
    <div data-trap="TR-09" class="variant-option" data-value="S" onclick="...">S</div>
    <div data-trap="TR-09" class="variant-option" data-value="M" onclick="...">M</div>
    ...
  </div>
</div>

<!-- after -->
<fieldset class="variant-selector" data-variant-type="size">
  <legend class="variant-label">Talla</legend>
  <div class="variant-options" role="radiogroup" aria-label="Talla">
    <div class="variant-option" data-value="S" role="radio" aria-checked="false" tabindex="0"
         onclick="window.__faroSelectVariant('size', 'S')"
         onkeydown="window.__faroSelectVariantKey(event, 'size', 'S')">S</div>
    <!-- the trap survives only here: focusable and selectable, but unidentifiable -->
    <div data-trap="TR-09" class="variant-option" data-value="M" tabindex="0"
         onclick="window.__faroSelectVariant('size', 'M')"
         onkeydown="window.__faroSelectVariantKey(event, 'size', 'M')">M</div>
    ...
  </div>
</fieldset>
```

- `<fieldset>` + `<legend>` name the group; `role="radiogroup"` on `.variant-options` declares the widget type explicitly. `data-variant-type` moves to the fieldset — `handleVariantSelected` keeps working unchanged.
- Each non-M option: `<div class="variant-option" data-value="..." role="radio" aria-checked="..." tabindex="0" onclick onkeydown>`. **ARIA radios, not native inputs** — a native radio group contributes only one Tab stop (arrow-key navigation between options), and `tabindex="0"` on native radios does not override that behavior (verified in-browser by the owner). ARIA radios give **every option its own Tab stop** while keeping radio semantics (role + checked state announced).
- `aria-checked` reflects `selectedValue` on render (survives re-renders e.g. language switch).
- Color options: `style="background-color: ..."` stays on the option; `.variant-option[style*="background-color"]` keeps the round swatch look (text already hidden via `text-indent`).
- **M exception:** `type === 'size' && value === 'M'` renders the old trapped markup — `<div>` + `data-trap="TR-09"` + `onclick`, no role, no name — **plus `tabindex="0"` and an `onkeydown`** so keyboard users land on it (owner's requirement: the tab sequence must not skip M) and can select it with Enter/Space (owner's follow-up: all sizes must be selectable). The trap persists in semantics only: no role, no accessible name — NVDA announces a generic clickable inside a proper radio group. Only this element carries the marker, so the moderator annotates only M.
- Selection still flows through `window.__faroSelectVariant` → `variant-selected` CustomEvent; every option uses `onclick` + `onkeydown`.
- `bindVariantSelectorEvents` gains `window.__faroSelectVariantKey(event, type, value)` — activates on Enter/Space (with `preventDefault` to stop Space scrolling) and delegates to `__faroSelectVariant`.

### 4.2 `handleVariantSelected` (`product-detail.js`)

Current code toggles `.selected` by `dataset.value` — works for all options since they carry `.variant-option` + `data-value`. With ARIA radios there is no native exclusivity, so the handler also syncs `aria-checked`:

```js
group.querySelectorAll('.variant-option').forEach((el) => {
  const isSelected = el.dataset.value === value;
  el.classList.toggle('selected', isSelected);
  // Real options are ARIA radios; the trapped M div has no role.
  if (el.getAttribute('role') === 'radio') el.setAttribute('aria-checked', String(isSelected));
});
```

This keeps `aria-checked` coherent in both directions (radio → M and M → radio).

### 4.3 CSS (`src/styles/main.css`)

```css
/* fieldset reset (legend/fieldset UA styles) */
fieldset.variant-selector {
  border: 0;
  padding: 0;
  margin: 0 0 1.5rem; /* replaces .variant-selector margin-bottom */
  min-width: 0;
}

/* focus indicator for the ARIA radio options and the focusable M div */
.variant-option:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

`.variant-option` rules already styled `<div>`s — they apply unchanged (padding, border, cursor, `.selected`).

## 5. Registry and docs

### 5.1 `src/traps/registry.js`
- Remove TR-06 and TR-07 entries.
- Keep TR-09; update `description.es`/`.en` to state the partial correction (only the M option remains a non-semantic div; all other sizes and all colors are ARIA radios). `fix` snippet updated to the `role="radio"` pattern. `selector` unchanged — `[data-trap="TR-09"]` still matches the M divs.
- Header comment: "17 accessibility traps" → "15".

### 5.2 `src/tests/trap-registry.test.js`
- 17 → 15; `expectedIds` drops `'TR-06'`, `'TR-07'`; title → `(TR-03, TR-06, TR-07, TR-11 corrected)`.

### 5.3 `src/traps/README.md`
- "except TR-03 and TR-11 which were corrected" → "except TR-03, TR-06, TR-07 and TR-11 which were corrected, and TR-09 which is partially corrected (only the M size option keeps the trap)".

### 5.4 `docs/verification-checklist.md`
- Remove `#### TR-06` and `#### TR-07` blocks; add a corrected-behavior note in the Product listing section (pattern per the TR-03/TR-11 notes).
- Rewrite `#### TR-09` block: expected broken behavior now applies **only to the M option**; S/L/XL/… and all colors announce as radio buttons (ARIA radios, each Tab-focusable); the moderator badge appears on M only.

## 6. New test: `src/tests/tr-06-07-09-removal.test.js`

jsdom, same render pattern as `cart-add-feedback.test.js` (`document.body.innerHTML = '<div id="app">'`, `renderProducts`/`renderProductDetail`).

| # | Case |
|---|------|
| 1 | Every filter checkbox has `id` + matching `label[for]` (all 10 sizes incl. M, all 7 colors); no `[data-trap="TR-06"]` in DOM |
| 2 | Every product card link's text contains the localized product name; link texts are unique; no `[data-trap="TR-07"]` |
| 3 | Variant selector renders `fieldset` + `legend` + `role="radiogroup"`; non-M sizes and all colors are `role="radio"` options with `aria-checked` + `tabindex="0"` + `onkeydown` — each option is its own Tab stop |
| 4 | The M size option is still `div[data-trap="TR-09"]` with `onclick` + `onkeydown` (Enter/Space selects), `tabindex="0"` (focusable) and no role/name; it is the **only** `data-trap="TR-09"` element in the size group |
| 5 | Dispatching `variant-selected` for a radio value selects it (`.selected` + `aria-checked="true"`); then dispatching it for `M` selects the M div and resets the radios' `aria-checked` (jsdom evaluates inline `onclick`/`onkeydown` in its own window scope, so tests dispatch the CustomEvent directly — same pattern as `cart-add-feedback.test.js`) |
| 6 | Color options announce localized names (`variantLabel` still used; swatch `style` on the option) |
| 7 | Registry: 15 traps; TR-06/TR-07 absent; TR-09 present |

## 7. Moderator mode interaction

Removing `data-trap` removes annotations automatically (TR-06, TR-07). TR-09 keeps annotating — now only on the M option — which is the intended demo behavior. No `moderator.js` change; `moderator.test.js` unaffected.

## 8. Files changed

| File | Change |
|------|--------|
| `src/components/filters.js` | `<label for>` + input ids; drop `data-trap="TR-06"` |
| `src/components/product-card.js` | Named link via `products.buyNamed`; drop `data-trap="TR-07"` |
| `src/components/variant-selector.js` | fieldset/legend + ARIA radios (`role="radio"`, `tabindex="0"`); M keeps trapped div |
| `src/screens/product-detail.js` | `handleVariantSelected` syncs `aria-checked` |
| `src/styles/main.css` | `:focus-visible` ring on `.variant-option`, fieldset reset |
| `src/i18n/es.js`, `src/i18n/en.js` | new `products.buyNamed` key |
| `src/traps/registry.js` | remove TR-06/TR-07; TR-09 description updated; 17 → 15 |
| `src/tests/trap-registry.test.js` | 15 traps; ID list; title |
| `src/traps/README.md` | corrected-traps list updated |
| `docs/verification-checklist.md` | TR-06/TR-07 notes; TR-09 rewritten |
| `src/tests/tr-06-07-09-removal.test.js` | New — 7 tests |

## 9. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| M div leaves `aria-checked` state stale | Handler syncs `aria-checked` (§4.2); test 5 covers it |
| ARIA radios lack native exclusivity/arrow-keys | Acceptable — Tab + Enter/Space covers the owner's requirement; `aria-checked` synced by handler |
| M skipped by keyboard Tab order | `tabindex="0"` on the trapped div keeps it in the tab order |
| M not selectable by keyboard (owner follow-up: all sizes selectable) | `onkeydown` handler activates on Enter/Space while keeping the div role/name-less — trap persists semantically |
| Only first radio Tab-reachable (owner follow-up: Tab must reach every option) | ARIA radios (`role="radio"` + `tabindex="0"`) — every option is its own Tab stop; native `input[type=radio]` groups can't provide this |
| Fieldset UA styles shift layout | Reset rule scoped to `fieldset.variant-selector` |
| Moderator badge expected on whole selector | Now annotates M only — documented in checklist; TR-09 description updated |
| i18n parity failure on new key | `products.buyNamed` added to both tables; `i18n.test.js` enforces parity |
