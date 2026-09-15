# Proposal: Product Rename & Image Update

## Why

The Faro ecommerce demo uses placeholder product names ("Camiseta azul", "Camiseta blanca") and generic JPG placeholders. The project owner has provided real product mockup images and wants the two t-shirt products renamed to match their new photos, plus all 8 product images replaced with the supplied PNG mockups. This makes the catalog visually coherent with the demo's narrative.

## What Changes

### Scope — Product renames (2 products, ES + EN)

1. **p001**: "Camiseta azul" / "Blue t-shirt" → **"Camiseta" / "T-shirt"** (paired with `CamisetaBásica.png`)
2. **p002**: "Camiseta blanca" / "White t-shirt" → **"Camiseta de rayas" / "Striped t-shirt"** (paired with `CamisetaRayas.png`)

### Scope — Image replacement (all 8 products)

Replace the current JPG placeholders in `public/images/` with the supplied PNG mockups. The filename of each supplied image matches the product it belongs to:

| Product ID | Current name (ES) | New image file | New image path |
|------------|-------------------|----------------|----------------|
| p001 | Camiseta (renamed) | CamisetaBásica.png | `/images/p001.png` |
| p002 | Camiseta de rayas (renamed) | CamisetaRayas.png | `/images/p002.png` |
| p003 | Vaqueros slim | Vaqueros.png | `/images/p003.png` |
| p004 | Sudadera gris | Sudadera.png | `/images/p004.png` |
| p005 | Chaqueta de cuero | Chaqueta de Cuero.png | `/images/p005.png` |
| p006 | Camisa a cuadros | Camisa de Cuadros.png | `/images/p006.png` |
| p007 | Gorra negra | Gorra.png | `/images/p007.png` |
| p008 | Bufanda de lana | Bufanda de lana.png | `/images/p008.png` |

Images are copied into `public/images/` using the existing `p00X` naming convention (normalized to `p00X.png`) to keep URLs clean (no spaces, no accents) and consistent with the current scheme.

### Out of scope

- Renaming the other 6 products (only their photo changes)
- Changing prices, sizes, colors, or descriptions
- Changing the hero background image
- Modifying the i18n string tables (product names live in `products.js`, not in `es.js`/`en.js`)
- Changing the product image alt text behavior (TR-02 is about the logo, not product images; product images currently use `alt=""` which is a separate intentional pattern for decorative product imagery within a named card context)

## How

### Architecture approach

The change is localized to the data layer and the static assets:

1. **`src/data/products.js`** — update the `name` field for p001 and p002 (both `es` and `en`), and update the `image` field for all 8 products from `.jpg` to `.png`.
2. **`public/images/`** — copy the 8 supplied PNG files from `ImagenesMaqueta/` into `public/images/` renamed as `p001.png` through `p008.png`. The old `p00X.jpg` files are removed (they are no longer referenced).
3. **No code logic changes** — `getFilteredProducts` already searches by localized name, so the new names are searchable automatically. Screens render `product.image` directly, so the new paths just work.

### Testing strategy

- The existing i18n completeness test is unaffected (product names are not i18n keys).
- The trap registry test is unaffected.
- No structural test asserts specific product names or image paths, so no test updates are required.
- A build check (`npm run build`) confirms the new PNG images are copied to `dist/` and referenced correctly.
- Manual verification: navigate the product listing and detail screens to confirm names and images render correctly in both ES and EN.

### Delivery

Single PR strategy. The change is small and localized to `products.js` and `public/images/`.

## Assumptions

- The supplied PNG images are final and correctly represent each product.
- The `p00X.png` naming convention is acceptable (the supplied filenames have spaces/accents that are URL-unfriendly; normalizing to `p00X.png` avoids encoding issues).
- Removing the old `p00X.jpg` files is acceptable (they are no longer referenced after the change).
- Product image `alt=""` (empty alt) is intentional for the demo's card layout where the product name is in an adjacent heading; this change does not alter that pattern.

## Risks

| Risk | Mitigation |
|------|------------|
| PNG files are larger than the old JPGs, slowing the stand load | The 8 PNGs total ~3.3 MB; the site is local (file:// or localhost), so network latency is zero. Acceptable for a demo. |
| Renaming p001/p002 breaks a saved bookmark or external link to the old names | The site is a local demo with no external links; product detail routes use the product ID (`#/product/p001`), not the name, so routes are unaffected |
| Old JPG files linger and confuse the build | Old `p00X.jpg` files are deleted as part of the change |
| Image filenames with spaces/accents cause URL issues | Files are normalized to `p00X.png` when copied to `public/images/` |
