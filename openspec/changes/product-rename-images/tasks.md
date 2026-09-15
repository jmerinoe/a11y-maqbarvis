# Tasks: Product Rename & Image Update

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Copy product images

- [x] T1.1 Copy `ImagenesMaqueta/CamisetaBásica.png` to `public/images/p001.png`
- [x] T1.2 Copy `ImagenesMaqueta/CamisetaRayas.png` to `public/images/p002.png`
- [x] T1.3 Copy `ImagenesMaqueta/Vaqueros.png` to `public/images/p003.png`
- [x] T1.4 Copy `ImagenesMaqueta/Sudadera.png` to `public/images/p004.png`
- [x] T1.5 Copy `ImagenesMaqueta/Chaqueta de Cuero.png` to `public/images/p005.png`
- [x] T1.6 Copy `ImagenesMaqueta/Camisa de Cuadros.png` to `public/images/p006.png`
- [x] T1.7 Copy `ImagenesMaqueta/Gorra.png` to `public/images/p007.png`
- [x] T1.8 Copy `ImagenesMaqueta/Bufanda de lana.png` to `public/images/p008.png`
- [x] T1.9 Verify all 8 PNG files exist in `public/images/` with the correct names

## Milestone 2: Remove old JPG placeholders

- [x] T2.1 Delete `public/images/p001.jpg` through `p008.jpg` (8 files). Do NOT delete `hero-bg.jpg`.
- [x] T2.2 Verify `public/images/` contains only `hero-bg.jpg` and `p001.png`…`p008.png`

## Milestone 3: Update product data

- [x] T3.1 In `src/data/products.js`, rename p001: `name.es` → `'Camiseta'`, `name.en` → `'T-shirt'`
- [x] T3.2 In `src/data/products.js`, rename p002: `name.es` → `'Camiseta de rayas'`, `name.en` → `'Striped t-shirt'`
- [x] T3.3 In `src/data/products.js`, update the `image` field for all 8 products from `/images/p00X.jpg` to `/images/p00X.png`
- [x] T3.4 Verify no other fields (id, price, sizes, colors, colorHex, description) were modified for any product

## Milestone 4: Update test assertions

- [x] T4.1 In `src/tests/cart-add-feedback.test.js`, update the assertion in test 2 ("shows a confirmation message") from `toContain('Camiseta azul')` to `toContain('Camiseta')`
- [x] T4.2 In `src/tests/cart-add-feedback.test.js`, update the assertion in test 4 ("clears the validation message") from `toContain('Camiseta azul')` to `toContain('Camiseta')`

## Milestone 5: Verification

- [x] T5.1 Run `npm test` — all 22 tests must pass (including the 2 updated assertions)
- [x] T5.2 Run `npm run build` — must succeed with no errors
- [x] T5.3 Verify `dist/images/` contains `p001.png` through `p008.png` and no `p00X.jpg` files
- [x] T5.4 Verify no reference to `.jpg` remains in `src/data/products.js` for products p001–p008

## Milestone 6: Documentation

- [x] T6.1 Write `openspec/changes/product-rename-images/apply-progress.md` documenting what was changed and verification results
- [x] T6.2 Write `openspec/changes/product-rename-images/verify-report.md` with the verification outcome

## Notes

- Milestone 1 (copy images) comes first so the files exist before the data layer references them.
- Milestone 2 (delete old JPGs) can run in parallel with Milestone 3, but is listed second to keep image operations together.
- Milestone 4 (test assertions) depends on Milestone 3 (the rename), since the test asserts the new name.
- No i18n table changes are needed (product names live in `products.js`, not in `es.js`/`en.js`).
- `hero-bg.jpg` is intentionally preserved — it is the home hero background, unrelated to this change.
