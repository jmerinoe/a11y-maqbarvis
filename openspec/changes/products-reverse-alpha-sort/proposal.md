# Proposal: Products listing sorted in reverse alphabetical order

## Why

The product listing (`#/products`) currently renders products in catalog-array order — effectively arbitrary from the user's point of view. The owner wants the full product listing displayed in **reverse alphabetical order (Z → A)** so the listing has a deterministic, predictable presentation order.

This is a functional evolution, not an accessibility trap correction: no `data-trap` marker, registry entry, or checklist trap is touched.

## What Changes

### Scope

1. **Reverse alphabetical sorting in `getFilteredProducts`** (`src/data/products.js`) — after applying the search/size/color filters, the returned array is sorted by the product's **localized name** (`name[lang]`, same resolution already used for search matching) in **descending** order using `localeCompare` with the active document language.

### Out of scope

- The home screen: featured products (`products.slice(0, 4)`) and carousel slides keep their current order — they are not "the listing of all products".
- Product detail, cart, checkout, confirmation, header, search bar, filters UI.
- No sort selector/UI control: the order is fixed (reverse alphabetical), not user-switchable.
- No i18n changes: sorting uses existing localized names; no new keys.
- All traps and the moderator remain untouched.

## How

### Architecture approach

`getFilteredProducts` already filters by query (against the localized name), sizes, and colors, and already resolves `document.documentElement.lang` for the localized name. Sorting inside it keeps a single source of truth — every caller of "the filtered product list" gets the same deterministic order without screen-level changes.

```js
export function getFilteredProducts(query, sizes, colors) {
  const lang = document.documentElement.lang || 'es';
  return products
    .filter((p) => { /* existing query/size/color predicates, unchanged */ })
    .sort((a, b) => b.name[lang].localeCompare(a.name[lang], lang, { sensitivity: 'base' }));
}
```

- `sensitivity: 'base'` makes the comparison case- and accent-insensitive (predictable ordering for names like "Camiseta" vs "camisa").
- `.filter()` already returns a new array, so `.sort()` mutates only that copy — the `products` catalog order is never mutated (home featured/carousel unaffected).
- Ties cannot occur today (all names are unique); if they ever did, `Array.prototype.sort` stability keeps catalog order between equal names.

### Testing strategy

New structural test `src/tests/products-reverse-alpha-sort.test.js` (jsdom, same render pattern as `tr-06-07-09-removal.test.js`):

- `getFilteredProducts` returns names in reverse alphabetical order (ES and EN — the expected sequences differ per language).
- Rendering `#/products` shows cards in that order (card order in DOM).
- Search and size/color filters still apply, and the filtered subset keeps reverse-alpha order.
- The `products` array itself is not mutated by the sort.

### Delivery

Single commit. Files: `src/data/products.js`, new test file, openspec docs. Very small diff.

## Assumptions

- "Orden alfabético inverso" means **Z → A by the localized product name** shown on the card — not by id, price, or catalog order.
- Applies to the products listing screen (`#/products`) only; home featured/carousel are unaffected.
- Fixed order — no UI to change direction is required.
- Language switch re-sorts by the new locale's names automatically because `getFilteredProducts` re-resolves `document.documentElement.lang` on every render.

## Risks

| Risk | Mitigation |
|------|------------|
| `localeCompare` ordering differs across engines/locales | `sensitivity: 'base'` + test asserts the exact expected sequence per language |
| Sort mutates the shared `products` array, reordering home featured | `.sort()` runs on the `.filter()` copy; test asserts `products` order unchanged |
| Different order in ES vs EN surprises attendees | Intentional — alphabetical order is inherently per-locale; documented in spec |
