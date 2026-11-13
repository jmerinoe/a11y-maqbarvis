# Tasks: BLIND BUY — fix the five keyboard traps

## M1 — Home/search fixes

- [ ] `header.js`: skip link first in header (drop `data-trap="TR-01"`); `bindHeaderEvents` wires preventDefault + focus `#main-content`
- [ ] `main.css`: `.skip-link` hidden-until-focus styles
- [ ] i18n `nav.skipToContent` (ES+EN); `search.button` label if missing
- [ ] `search-bar.js`: `<button>` replacing the div (drop `data-trap="TR-04"`)

## M2 — Products/cart/checkout fixes

- [ ] `product-card.js`: drop `tabindex` + `data-trap="TR-08"`
- [ ] `cart.js`: `role="dialog"`/`aria-modal`/`aria-labelledby`, focus in, trap, Escape→`#/products`, restore focus (drop `data-trap="TR-12"`)
- [ ] `checkout.js`: focus first invalid input on failed submit (drop `data-trap="TR-18"`)

## M3 — Registry, docs, tests

- [ ] `registry.js`: remove 5 entries; `traps/README.md` corrected list
- [ ] `trap-registry.test.js` (10 traps), `moderator.test.js` fixture id, checkout/cart/search/skip-link assertions
- [ ] Full suite green
- [ ] `apply-progress.md` + `verify-report.md`
