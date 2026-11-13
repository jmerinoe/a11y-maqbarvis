# Design: BLIND BUY — fix the five keyboard traps

## TR-01 — skip link

`header.js` renders the shared chrome for every screen-reader screen; all screens already have `<main id="main-content">`.

```html
<a href="#main-content" class="skip-link" id="skip-link">Saltar al contenido</a>
```

as the first child inside `<header>` (replacing `data-trap="TR-01"`). `bindHeaderEvents` binds a click handler: `preventDefault()` (otherwise `location.hash` changes and the hash-router navigates), then `main.setAttribute('tabindex','-1'); main.focus()`.

New `.skip-link` rule in `main.css` next to `.sr-only`: standard pattern — absolute, `top:-9999px` clipped, and on `:focus`/`:focus-visible` repositioned visibly with app styling (dark bg, light text, high z-index).

i18n: new `nav.skipToContent` key (ES: "Saltar al contenido", EN: "Skip to content").

## TR-04 — real search button

`search-bar.js`: `<div data-trap="TR-04" class="search-button-div" onclick>` → `<button type="button" class="search-button-div" aria-label="…" onclick="window.__faroSearch()">🔍</button>`. Keeps the class so `.search-button-div` styles carry over (add `border/background` resets only if the native button chrome leaks). aria-label = `t('search.button')` if the key exists, else new `search.button` key ("Buscar"/"Search").

## TR-08 — product-card tabindex

`product-card.js`: drop `tabindex="${5 - (index % 5)}"` and `data-trap="TR-08"` — the `<article>` simply isn't a tab stop (its inner link is).

## TR-12 — cart dialog

`cart.js` overlay stays; `.cart-modal` gains `role="dialog" aria-modal="true" aria-labelledby="cart-title"` (give the `<h1>` that id, `tabindex="-1"` on the dialog for programmatic focus). In `renderCart`, after render: save `document.activeElement`, focus the dialog, and add a keydown trap on the overlay — Tab wraps between first/last focusable, Escape calls `navigate('#/products')`. A `beforeunload`-style cleanup isn't needed: every `#/cart` render re-runs this bind, and the overlay node dies with the screen. Focus restore happens on navigation away — store `previousFocus` module-level and `.focus()` it in the close path(s): the back link and Escape both go through `navigate`; the checkout button navigates too — restoring focus only makes sense when returning to products; keep it simple: restore whenever the cart closes via Escape/back (the checkout flow ends the screen anyway — restoring before navigating is still correct behaviour).

## TR-18 — focus first invalid

`checkout.js` validation already iterates `fields` marking errors. After the loop, `document.getElementById(firstInvalidId)?.focus()` when any failed. `data-trap="TR-18"` removed from the submit button.

## Registry + docs

- `registry.js`: delete TR-01/04/08/12/18 entries → 10 traps.
- `traps/README.md`: corrected list → "TR-01, TR-03, TR-04, TR-06, TR-07, TR-08, TR-11, TR-12 and TR-18 corrected; TR-09 partially".
- Trap-specific comments in touched files updated/removed (they documented intentional breakage).

## Test plan

- `trap-registry.test.js`: count 10, new expected-ID list.
- `moderator.test.js`: fixture `data-trap="TR-04"` → `"TR-05"` (both still trap-free to duplicate — pick any surviving id).
- `checkout-card-validation.test.js` (extend): after failed submit, `document.activeElement` is the first invalid input.
- New cases in the screen-reader test files: skip link → `activeElement === #main-content` + `location.hash` unchanged; `search-button-div` is a `BUTTON`; product cards `tabindex` ≤ 0/absent; cart overlay exposes `role="dialog"`/`aria-modal` and Escape navigates to `#/products`.
