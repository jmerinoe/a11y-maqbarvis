# Tasks: Faro — Accessibility Awareness Ecommerce

Implementation checklist. Tasks are ordered by dependency — each milestone builds on the previous. Check off items as they are completed during the apply phase.

## Milestone 1: Project scaffolding

- [x] T1.1 Initialize `package.json` with project name, type module, scripts (dev, build, preview, test)
- [x] T1.2 Install Vite as devDependency
- [x] T1.3 Create `vite.config.js` (minimal config, root: project dir)
- [x] T1.4 Create `index.html` app shell with `<div id="app">` and `<script type="module" src="/src/main.js">`
- [x] T1.5 Create the `src/` directory structure per design (screens, components, traps, moderator, i18n, data, styles)
- [x] T1.6 Verify `npm run dev` starts and serves a blank page without errors

## Milestone 2: Core infrastructure

- [x] T2.1 Implement `src/store.js` — in-memory state object (route, language, moderatorMode, cart, filters, searchQuery) with pub/sub (subscribe/notify)
- [x] T2.2 Implement `src/router.js` — hash-based router with routes: `#/home`, `#/products`, `#/product/:id`, `#/cart`, `#/checkout`, `#/confirmation`. Parse hash, update store.route, render screen.
- [x] T2.3 Implement `src/i18n/index.js` — `t(key)` function reading active language, `setLanguage(lang)` that updates store + `document.documentElement.lang` + notifies subscribers
- [x] T2.4 Implement `src/i18n/es.js` — Spanish string table (all UI keys)
- [x] T2.5 Implement `src/i18n/en.js` — English string table (mirrors es.js keys)
- [x] T2.6 Implement `src/main.js` — entry point: init store (default language 'es'), init router, render initial screen, register global Ctrl+M listener (stub for now)
- [x] T2.7 Verify navigation between empty screen stubs works via hash routing

## Milestone 3: Data layer

- [x] T3.1 Implement `src/data/products.js` — static catalog of 8+ products with localized name/description (es/en), price, sizes, colors. Use CSS placeholder approach (no image files needed).
- [x] T3.2 Verify product data loads and is accessible from screens

## Milestone 4: Trap registry

- [x] T4.1 Implement `src/traps/registry.js` — metadata for all 19 traps (TR-01 through TR-19). Each entry: id, screen, wcag, description {es, en}, fix (HTML string), selector.
- [x] T4.2 Write `src/traps/README.md` documenting the trap metadata structure and how `data-trap` attributes link components to registry entries

## Milestone 5: Screens and components (with traps embedded)

### 5a: Home screen
- [x] T5.1 Implement `src/components/header.js` — site header with logo (TR-02: img without alt), nav, language toggle, and NO skip link (TR-01)
- [x] T5.2 Implement `src/components/search-bar.js` — search input with placeholder only (TR-05: no label) and div-onclick button (TR-04)
- [x] T5.3 Implement `src/screens/home.js` — hero area, auto-rotating carousel that steals focus (TR-03), featured products grid, search bar. Wires search to filter + navigate to listing.

### 5b: Product listing screen
- [x] T5.4 Implement `src/components/filters.js` — size and color checkboxes without associated labels (TR-06)
- [x] T5.5 Implement `src/components/product-card.js` — card with generic "Comprar" link (TR-07: no product context) and positive tabindex (TR-08: broken tab order)
- [x] T5.6 Implement `src/screens/products.js` — product grid using product-card, filters sidebar, search query filtering. Selecting a card navigates to product detail.

### 5c: Product detail screen
- [x] T5.7 Implement `src/components/variant-selector.js` — custom div-based size/color selector with no role or accessible name (TR-09)
- [x] T5.8 Implement `src/screens/product-detail.js` — product name, price in separate DOM region from name (TR-10), variant selectors, add-to-cart button with no aria-live feedback (TR-11). Add-to-cart updates store.cart.

### 5d: Cart screen
- [x] T5.9 Implement `src/components/cart-item.js` — item row with icon-only remove button (TR-13: no text/aria-label) and quantity stepper without aria-live (TR-14)
- [x] T5.10 Implement `src/screens/cart.js` — cart opens as modal with no focus management (TR-12), lists cart items, shows total, checkout button. Quantity changes update total silently.

### 5e: Checkout screen
- [x] T5.11 Implement `src/screens/checkout.js` — form with fields (name, email, address, card number, expiry, CVV), no labels (TR-16: placeholder only), validation errors shown only by red border (TR-15), error messages not associated via aria-describedby (TR-17), focus not moved to first error on submit (TR-18). Valid submit navigates to confirmation.

### 5f: Confirmation screen
- [x] T5.12 Implement `src/screens/confirmation.js` — "Order confirmed" message without role="status" (TR-19), order summary, back-to-home action.

## Milestone 6: Moderator mode

- [x] T6.1 Implement `src/moderator/moderator.js` — Ctrl+M handler toggling store.moderatorMode. When ON: query all `[data-trap]` on current screen, look up registry metadata, inject absolutely-positioned overlay annotations (id, wcag, description in active lang, fix HTML). When OFF: remove all overlays. No trapped element DOM mutation.
- [x] T6.2 Implement mode-active badge indicator (fixed top-right, "Moderator mode: ON") per REQ-MM-06
- [x] T6.3 Verify overlays re-render correctly when language toggles while moderator mode is ON
- [x] T6.4 Verify overlays appear/disappear on screen navigation (re-query on each screen render)

## Milestone 7: Styling

- [x] T7.1 Implement `src/styles/main.css` — base layout, typography, product grid, forms, cart. Clean but simple visual design (the focus is accessibility, not aesthetics).
- [x] T7.2 Implement `src/styles/moderator.css` — overlay callout styling (absolute position, z-index, annotation card look), mode badge styling.
- [x] T7.3 Add CSS-generated product image placeholders (colored blocks with product name) so no image files are needed and broken-image issues don't mask the alt-text trap.

## Milestone 8: Structural tests

- [x] T8.1 Install Vitest as devDependency
- [x] T8.2 Write trap registry integrity test — all 19 IDs present, unique, required fields (wcag, description.es, description.en, fix, selector) populated
- [x] T8.3 Write i18n completeness test — every key in es.js exists in en.js and vice versa
- [x] T8.4 Write moderator overlay test — toggling ON injects overlays for all `[data-trap]` elements; toggling OFF removes them; trapped element DOM unchanged
- [x] T8.5 Run `npm test` and ensure all structural tests pass

## Milestone 9: Manual verification checklist

- [x] T9.1 Write `docs/verification-checklist.md` — step-by-step NVDA verification for each of the 19 traps (what to do, what broken behavior to expect, what the moderator annotation should show)
- [x] T9.2 Write `docs/stand-setup.md` — instructions for setting up the stand (NVDA install, browser config, how to run the site, how to use Ctrl+M)

## Milestone 10: Final integration and build

- [x] T10.1 Run full purchase flow manually (sighted, mouse) to confirm no crashes and all 6 screens work
- [x] T10.2 Run `npm run build` and verify `dist/` is produced with no errors
- [x] T10.3 Run `npm run preview` and verify the built site works offline (no network calls)
- [x] T10.4 Verify all 19 `data-trap` attributes are present in the built output

## Notes

- Tasks in Milestone 5 embed traps as the components are built — there is no separate "add traps" pass. This is intentional: the traps ARE the components.
- The `data-trap="TR-XX"` attribute is added to each broken element as it is written. This is the link to the moderator registry.
- Traps must be tested with NVDA on the actual stand configuration before the event (part of T9.1 checklist).
