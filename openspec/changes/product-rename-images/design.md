# Design: Product Rename & Image Update

## 1. Overview

This is a data-layer and static-asset change. No application logic is modified. Three concrete edits:

1. **`src/data/products.js`** — rename p001/p002 (ES+EN) and update the `image` field for all 8 products from `.jpg` to `.png`.
2. **`public/images/`** — copy 8 PNG files from `ImagenesMaqueta/` normalized as `p00X.png`, and delete the 8 old `p00X.jpg` files.
3. **No code changes** elsewhere — screens render `product.image` directly and `getFilteredProducts` searches by localized name, so the new names/images work without code edits.

## 2. Product data changes (`src/data/products.js`)

### 2.1 Renames (p001, p002)

| ID | Field | Before | After |
|----|-------|--------|-------|
| p001 | `name.es` | `Camiseta azul` | `Camiseta` |
| p001 | `name.en` | `Blue t-shirt` | `T-shirt` |
| p002 | `name.es` | `Camiseta blanca` | `Camiseta de rayas` |
| p002 | `name.en` | `White t-shirt` | `Striped t-shirt` |

### 2.2 Image path updates (all 8 products)

Each product's `image` field changes from `/images/p00X.jpg` to `/images/p00X.png`:

| ID | Before | After |
|----|--------|------|
| p001 | `/images/p001.jpg` | `/images/p001.png` |
| p002 | `/images/p002.jpg` | `/images/p002.png` |
| p003 | `/images/p003.jpg` | `/images/p003.png` |
| p004 | `/images/p004.jpg` | `/images/p004.png` |
| p005 | `/images/p005.jpg` | `/images/p005.png` |
| p006 | `/images/p006.jpg` | `/images/p006.png` |
| p007 | `/images/p007.jpg` | `/images/p007.png` |
| p008 | `/images/p008.jpg` | `/images/p008.png` |

### 2.3 Unchanged fields

For all 8 products: `id`, `price`, `sizes`, `colors`, `colorHex`, `description` remain exactly as they are. Only `name` (p001, p002) and `image` (all 8) change.

## 3. Image file operations

### 3.1 Source files (in `ImagenesMaqueta/`)

| Source filename | Target filename | Product |
|-----------------|-----------------|---------|
| `CamisetaBásica.png` | `public/images/p001.png` | p001 (Camiseta) |
| `CamisetaRayas.png` | `public/images/p002.png` | p002 (Camiseta de rayas) |
| `Vaqueros.png` | `public/images/p003.png` | p003 (Vaqueros slim) |
| `Sudadera.png` | `public/images/p004.png` | p004 (Sudadera gris) |
| `Chaqueta de Cuero.png` | `public/images/p005.png` | p005 (Chaqueta de cuero) |
| `Camisa de Cuadros.png` | `public/images/p006.png` | p006 (Camisa a cuadros) |
| `Gorra.png` | `public/images/p007.png` | p007 (Gorra negra) |
| `Bufanda de lana.png` | `public/images/p008.png` | p008 (Bufanda de lana) |

### 3.2 Copy commands (PowerShell)

```powershell
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\CamisetaBásica.png"   "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p001.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\CamisetaRayas.png"     "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p002.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Vaqueros.png"          "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p003.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Sudadera.png"          "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p004.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Chaqueta de Cuero.png" "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p005.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Camisa de Cuadros.png" "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p006.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Gorra.png"             "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p007.png"
Copy-Item "D:\1. Cellst\Eventos\2026VLC\ImagenesMaqueta\Bufanda de lana.png"   "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p008.png"
```

### 3.3 Delete old JPGs

```powershell
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p001.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p002.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p003.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p004.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p005.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p006.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p007.jpg"
Remove-Item "D:\1. Cellst\Eventos\2026VLC\a11y-maqbarvis\public\images\p008.jpg"
```

Note: `hero-bg.jpg` is NOT deleted — it is the home hero background and is unrelated to this change.

## 4. Why no code logic changes

- **`getFilteredProducts`** reads `p.name[lang]` at filter time, so the new names ("Camiseta", "Camiseta de rayas") are searchable immediately with no code change.
- **Screens** (`products.js`, `product-detail.js`, `home.js`) render `product.image` and `product.name[lang]` directly from the data, so the new paths and names render automatically.
- **`product-card.js`** uses `product.image` for the card thumbnail; no hardcoded paths.
- **i18n tables** (`es.js`, `en.js`) do not contain product names — those live in `products.js`. So the i18n completeness test is unaffected.

## 5. Testing impact

| Test file | Impact |
|-----------|--------|
| `i18n.test.js` | None — product names are not i18n keys |
| `trap-registry.test.js` | None — traps unchanged |
| `moderator.test.js` | None — moderator logic unchanged |
| `cart-add-feedback.test.js` | None — uses `p001` by ID; the test asserts the confirmation message contains the localized name. **This test WILL need its assertion updated**: it currently asserts `confirmationEl.textContent` contains `'Camiseta azul'`, but after the rename the name is `'Camiseta'`. The assertion must change to `'Camiseta'`. |

### 5.1 `cart-add-feedback.test.js` assertion update

The test currently has:
```js
expect(confirmationEl.textContent).toContain('Camiseta azul');
```
After the rename, p001's ES name is "Camiseta", so this becomes:
```js
expect(confirmationEl.textContent).toContain('Camiseta');
```

There are two such assertions in the file (test 2 and test 4). Both must be updated. Since "Camiseta" is a substring of "Camiseta de rayas", the assertion `toContain('Camiseta')` is still valid and unambiguous for p001.

## 6. Build verification

- `npm run build` must succeed and copy the 8 PNG files into `dist/images/`.
- `dist/images/` must contain `p001.png` through `p008.png` and NO `p00X.jpg` files.
- `npm test` must pass with the updated assertion in `cart-add-feedback.test.js`.

## 7. Files changed

| File | Change |
|------|--------|
| `src/data/products.js` | Rename p001/p002 (ES+EN); update `image` field for all 8 products (`.jpg` → `.png`) |
| `public/images/p001.png` … `p008.png` | New files (copied from `ImagenesMaqueta/`) |
| `public/images/p001.jpg` … `p008.jpg` | Deleted (no longer referenced) |
| `src/tests/cart-add-feedback.test.js` | Update 2 assertions: `'Camiseta azul'` → `'Camiseta'` |

## 8. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| PNG files are larger than JPGs (~3.3 MB total) | Site runs locally (file:// or localhost); no network latency. Acceptable for a demo. |
| `cart-add-feedback.test.js` fails on the old name assertion | Updated in the same change (§5.1) |
| Accented source filename `CamisetaBásica.png` causes copy issues | PowerShell `Copy-Item` handles accented paths; target is ASCII `p001.png` |
| Old JPGs linger in `dist/` from a previous build | `npm run build` recreates `dist/` from `public/`; stale JPGs in an old `dist/` are overwritten on next build. A clean rebuild (`Remove-Item dist -Recurse` then `npm run build`) is recommended if any doubt. |
| Renaming p001/p002 breaks a trap that references the name | No trap references product names by string; traps use `data-trap` attributes and selectors, not product names. |
