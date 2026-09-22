# Design: Products listing sorted in reverse alphabetical order

## 1. Overview

One-line behavioral change concentrated in `getFilteredProducts` (`src/data/products.js`): the filtered product list is sorted by localized name, descending (Z → A), before being returned. No UI, i18n, CSS, or trap changes.

## 2. Current state

```js
export function getFilteredProducts(query, sizes, colors) {
  return products.filter((p) => {
    const lang = document.documentElement.lang || 'es';
    const name = p.name[lang] || p.name.es;
    const matchesQuery = !query || name.toLowerCase().includes(query.toLowerCase());
    const matchesSize = sizes.length === 0 || p.sizes.some((s) => sizes.includes(s));
    const matchesColor = colors.length === 0 || p.colors.some((c) => colors.includes(c));
    return matchesQuery && matchesSize && matchesColor;
  });
}
```

Caller: `renderProducts` in `src/screens/products.js` maps the returned array to `renderProductCard` — DOM order follows array order. The card's positive `tabindex` (TR-08) is index-based, so it adapts to whatever order arrives.

## 3. Change

```js
export function getFilteredProducts(query, sizes, colors) {
  const lang = document.documentElement.lang || 'es';
  return products
    .filter((p) => {
      const name = p.name[lang] || p.name.es;
      const matchesQuery =
        !query || name.toLowerCase().includes(query.toLowerCase());
      const matchesSize = sizes.length === 0 || p.sizes.some((s) => sizes.includes(s));
      const matchesColor = colors.length === 0 || p.colors.some((c) => colors.includes(c));
      return matchesQuery && matchesSize && matchesColor;
    })
    .sort((a, b) =>
      (b.name[lang] || b.name.es).localeCompare(a.name[lang] || a.name.es, lang, {
        sensitivity: 'base',
      })
    );
}
```

Decisions:

- **Sort inside `getFilteredProducts`, not in the screen** — keeps "the filtered product list" definition in one place; any current/future caller inherits the order.
- **Localized name, active language** — matches what the user reads on the card; consistent with the search predicate's name resolution (`|| p.name.es` fallback kept).
- **`localeCompare` with `lang` + `sensitivity: 'base'`** — locale-aware, case/accent-insensitive, deterministic across V8 engines.
- **No catalog mutation** — `.filter()` produces a fresh array; `.sort()` on it never reorders `products`.

## 4. Expected sequences (8 products)

ES (`name.es`): `Bufanda de lana, Camisa a cuadros, Camiseta, Camiseta de rayas, Chaqueta de cuero, Gorra negra, Sudadera gris, Vaqueros slim`

→ Z→A: `Vaqueros slim, Sudadera gris, Gorra negra, Chaqueta de cuero, Camiseta de rayas, Camiseta, Camisa a cuadros, Bufanda de lana`

EN (`name.en`): `Black cap, Gray hoodie, Leather jacket, Plaid shirt, Slim jeans, Striped t-shirt, T-shirt, Wool scarf`

→ Z→A: `Wool scarf, T-shirt, Striped t-shirt, Slim jeans, Plaid shirt, Leather jacket, Gray hoodie, Black cap`

## 5. Tests — `src/tests/products-reverse-alpha-sort.test.js`

| # | Case |
|---|------|
| 1 | `getFilteredProducts('', [], [])` (ES) returns ids in the expected Z→A name sequence |
| 2 | Same for EN (`document.documentElement.lang = 'en'`) — different expected sequence |
| 3 | Rendered `#/products` DOM: card order matches the sorted sequence |
| 4 | With an active size/color filter or search query, the filtered subset stays Z→A |
| 5 | `products` catalog array order is unchanged after calling `getFilteredProducts` |

## 6. Files changed

| File | Change |
|------|--------|
| `src/data/products.js` | `getFilteredProducts` sorts by localized name, descending |
| `src/tests/products-reverse-alpha-sort.test.js` | New — 5 tests |
| `openspec/changes/products-reverse-alpha-sort/` | proposal, design, spec, tasks, apply-progress, verify-report |

No changes to: screens, components, i18n, styles, registry, checklist (functional change — no trap involved).
