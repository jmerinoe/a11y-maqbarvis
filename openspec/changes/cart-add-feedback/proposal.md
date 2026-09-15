# Proposal: Cart Add Feedback — Live Counter & Validation Messages

## Why

The Faro ecommerce demo currently has an "Add to cart" button that gives **no feedback whatsoever**: when the attendee adds a product, nothing announces the action, and if they forgot to pick a size or color the button silently does nothing. This is intentional as the **TR-11** accessibility trap ("add-to-cart with no `aria-live` feedback").

However, the project owner has decided to evolve the product detail screen so that adding to cart produces clear, accessible feedback:

- The **cart counter** next to the shopping bag icon in the header must increment by 1 **immediately** (in real time, without navigating away).
- A **confirmation message** must announce that the product was added.
- Adding to cart must **require** a selected size AND color. If either is missing, a **validation message** must tell the attendee what is missing.

This evolution **corrects the TR-11 trap**: the trap is removed from the registry and replaced with accessible behavior. The demo loses one trap but gains a correct, reference implementation of add-to-cart feedback that the moderator can contrast against the remaining traps.

## What Changes

### Scope — Product detail screen (add-to-cart flow)

1. **Live cart counter** — the header's cart badge updates in real time when an item is added, without a full screen re-render. The header subscribes to store cart changes.
2. **Add-to-cart confirmation message** — after a successful add, a visible and screen-reader-announced message confirms the product was added (via `aria-live` / `role="status"`).
3. **Size + color validation** — pressing "Add to cart" without a selected size and/or color shows a validation message (also announced) telling the attendee which attribute is missing. The product is NOT added to the cart in this case.

### Scope — Trap registry correction

4. **Remove TR-11** from the trap registry (`src/traps/registry.js`), remove its `data-trap="TR-11"` marker from `product-detail.js`, and update the trap count (19 → 18). Update the structural test that asserts "19 traps" to assert "18 traps". Update the verification checklist and any docs that reference TR-11.

### Out of scope

- Changes to the cart screen, checkout, or confirmation flow
- Changes to other traps (TR-01 through TR-10, TR-12 through TR-19 remain intact)
- Persisting the cart across reloads (still in-memory only)
- Modifying the variant selector widget itself (TR-09 remains a trap — the selector is still a broken custom div; the validation message is announced separately and does not fix TR-09)

## How

### Architecture approach

The evolution builds on the existing layered architecture:

1. **Store** — `addToCart` already updates state and notifies subscribers. No change to the cart helper itself; the change is in *who listens*.
2. **Header** — currently re-renders only on screen navigation and language change. The header will subscribe to store changes so the cart counter re-renders live when the cart mutates, without a full screen re-render.
3. **Product detail screen** — the `__faroAddToCart` handler will be rewritten to:
   - Validate `selectedSize` and `selectedColor`.
   - If either is missing → render an announced validation message (with `role="alert"` / `aria-live="assertive"`), do NOT add to cart.
   - If both are present → call `addToCart`, render an announced confirmation message (with `role="status"` / `aria-live="polite"`).
4. **i18n** — new string keys for the confirmation and validation messages, in both ES and EN.
5. **Trap registry** — remove the TR-11 entry; update the structural test's expected count.

### Testing strategy

- Update the trap registry integrity test to expect 18 traps and to no longer reference TR-11.
- Add a structural test for the new feedback behavior: validation message appears when size/color missing; confirmation message appears (with `role="status"`) on successful add; cart counter increments.
- i18n completeness test continues to enforce ES/EN key parity (new keys added to both tables).

### Delivery

Single PR strategy. The change is small and localized to: `product-detail.js`, `header.js`, `main.js` (header subscription), `registry.js`, `es.js`, `en.js`, and the trap registry test. If the implementation exceeds ~400 lines, a `size:exception` is recorded before apply.

## Assumptions

- The moderator is informed that TR-11 is no longer a trap and will adjust the demo debrief accordingly.
- The remaining 18 traps continue to demonstrate accessibility failures; removing one does not undermine the pedagogical goal.
- The cart counter in the header is the single source of truth for "how many items are in the cart".
- Real-time header re-render on cart change does not conflict with the moderator overlay (overlays are re-applied on screen render, not on every store notification — the header update is a targeted DOM patch, not a full re-render).

## Risks

| Risk | Mitigation |
|------|------------|
| Removing TR-11 reduces the demo's trap count and weakens the "no feedback" lesson | The moderator can still *describe* the original failure and show the corrected implementation as a positive contrast; the remaining 18 traps keep the demo strong |
| Live header re-render on every cart change could disturb moderator overlays | Header update is a targeted patch of the `.cart-count` text node, not a full screen re-render; overlays are not affected |
| Validation message could be confused with TR-09 (broken variant selector) | The validation message is a separate announced region; it does not modify or fix the variant selector widget itself |
| `aria-live` regions added dynamically may not announce in some NVDA/browser combos | Pre-declare the live region in the initial DOM (empty) and only update its text content, so the region exists before the announcement — standard reliable pattern |
