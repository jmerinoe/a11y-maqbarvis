# Faro — NVDA Verification Checklist

Manual checklist for verifying each accessibility trap with NVDA on the stand configuration (Windows + Firefox/Edge). Run this before the event on the exact hardware that will be used.

## Setup

1. Install NVDA (nvaccess.org)
2. Open the site in Firefox or Edge
3. Turn on NVDA (Ctrl+Alt+N or launch)
4. Ensure NVDA is in browse mode (default) and focus mode works with Insert+Space

## How to verify each trap

For each trap:
- **Action**: what to do with keyboard/NVDA
- **Expected broken behavior**: what the attendee experiences (the trap working)
- **Moderator check**: press Ctrl+M and verify the annotation appears with correct WCAG reference and fix

---

### Home screen

#### TR-01 — No skip link
- **Action**: Press Tab from the top of the page
- **Expected**: No "skip to content" link is announced. You tab through logo, nav links, language toggle before reaching main content.
- **Moderator**: Annotation shows SC 2.4.1 Bypass Blocks

#### TR-02 — Logo without alt
- **Action**: Tab to the logo image
- **Expected**: NVDA announces "image" or the image filename, not "Faro logo" or similar
- **Moderator**: Annotation shows SC 1.1.1 Non-text Content

#### TR-03 — Carousel steals focus
- **Action**: Start tabbing through the home page. Wait 3 seconds.
- **Expected**: Focus jumps to a carousel slide unexpectedly, interrupting your navigation
- **Moderator**: Annotation shows SC 2.2.2 Pause, Stop, Hide

#### TR-04 — Search button is a div
- **Action**: Tab to the search "button" (the magnifying glass). Press Enter or Space.
- **Expected**: NVDA does not announce it as a button (announces as generic/clickable). Enter and Space do NOT trigger the search.
- **Moderator**: Annotation shows SC 4.1.2 Name, Role, Value

#### TR-05 — Search input no label
- **Action**: Tab to the search input field
- **Expected**: NVDA announces the field with no meaningful name (just "edit" or reads the placeholder as a faint hint, but no proper label)
- **Moderator**: Annotation shows SC 1.3.1 / SC 3.3.2

---

### Product listing

#### TR-06 — Filters without labels
- **Action**: Navigate to the filter checkboxes (#/products)
- **Expected**: NVDA announces "checkbox" with no name — you cannot tell which size/color each checkbox filters
- **Moderator**: Annotation shows SC 1.3.1 / SC 3.3.2

#### TR-07 — Generic "Buy" links
- **Action**: Open the links list (Insert+F7 in NVDA) on the products page
- **Expected**: All product action links are listed as "Comprar" / "Buy" with no product context — you cannot tell which product each opens
- **Moderator**: Annotation shows SC 2.4.4 Link Purpose

#### TR-08 — Broken tab order
- **Action**: Tab through the product cards
- **Expected**: Focus jumps in a non-visual, illogical order due to positive tabindex values
- **Moderator**: Annotation shows SC 1.3.2 / SC 2.4.3 Focus Order

> **Note (variant options localized):** Filter and variant option labels are now
> rendered in the active page language — color options read Azul/Negro/… in
> Spanish, Blue/Black/… in English, and the size list has a single "Talla
> única"/"One size" option instead of the old duplicated `Única` + `One size`.
> This is a functional fix, not a trap change: TR-06 and TR-09 still apply
> (checkboxes remain unlabeled; the selector remains a custom div widget).

---

### Product detail

#### TR-09 — Custom variant selector
- **Action**: Navigate to a product detail page. Try to select a size.
- **Expected**: The size options are announced as generic clickable divs with no role. You cannot determine they are selectable options, and keyboard activation is unreliable.
- **Moderator**: Annotation shows SC 4.1.2 Name, Role, Value

#### TR-10 — Price disconnected from name
- **Action**: Navigate through the product detail page
- **Expected**: The product name and price are in separate DOM regions. NVDA reads them disconnected — you hear the name, then later the price, without clear association.
- **Moderator**: Annotation shows SC 1.3.1 Info and Relationships

> **Note (TR-11 corrected):** The "Add to cart" button now announces feedback
> accessibly. When size and color are selected, a `role="status"` message
> confirms the product was added; when either is missing, a `role="alert"`
> message names the missing attribute. The cart counter in the header also
> updates live. This is the **reference (corrected) implementation** — the
> moderator can contrast it with the remaining traps (e.g. TR-14, where the
> cart total is still not announced).

---

### Cart

#### TR-12 — Modal no focus management
- **Action**: Navigate to the cart (#/cart)
- **Expected**: Focus is not moved into the cart dialog. There is no focus trap. You may end up tabbing through header elements behind the cart overlay.
- **Moderator**: Annotation shows SC 2.4.3 Focus Order

#### TR-13 — Remove button no label
- **Action**: Tab to the remove button (trash icon) in a cart item
- **Expected**: NVDA announces "button" with no name — you cannot tell it removes a product
- **Moderator**: Annotation shows SC 1.1.1 / SC 4.1.2

#### TR-14 — Quantity change no announcement
- **Action**: Change the quantity of a cart item (press + or -)
- **Expected**: The total updates visually but NVDA does not announce the new total
- **Moderator**: Annotation shows SC 4.1.3 Status Messages

---

### Checkout

#### TR-15 — Color-only errors
- **Action**: Submit the checkout form with empty fields
- **Expected**: Invalid fields get a red border, but NVDA does not announce the error. Colorblind users and SR users cannot perceive the error via color alone.
- **Moderator**: Annotation shows SC 1.4.1 Use of Color

#### TR-16 — Fields without labels
- **Action**: Tab through the checkout form fields
- **Expected**: NVDA announces fields with no meaningful name (only placeholder hints, which are not proper labels)
- **Moderator**: Annotation shows SC 1.3.1 / SC 3.3.2

#### TR-17 — Error not associated with field
- **Action**: Submit with errors. Navigate to a field that has an error.
- **Expected**: NVDA may announce that an error exists somewhere, but does not associate it with the specific field (no aria-describedby)
- **Moderator**: Annotation shows SC 3.3.1 / SC 4.1.3

#### TR-18 — Focus not moved to error
- **Action**: Submit the form with errors
- **Expected**: After submission fails, focus stays on the submit button. It is NOT moved to the first invalid field.
- **Moderator**: Annotation shows SC 2.4.3 / SC 3.3.1

---

### Confirmation

#### TR-19 — Confirmation not announced
- **Action**: Complete a valid checkout and arrive at the confirmation screen
- **Expected**: NVDA does not announce "Order confirmed." The message appears visually but has no role="status", so the SR user does not know the order succeeded.
- **Moderator**: Annotation shows SC 4.1.3 Status Messages

---

## Moderator mode verification

- [ ] Press Ctrl+M on each screen — overlays appear for all traps on that screen
- [ ] Each overlay shows: trap ID, WCAG SC reference, description (in active language), corrected HTML
- [ ] Press Ctrl+M again — all overlays disappear, page returns to original broken state
- [ ] Toggle language (ES/EN) while moderator mode is ON — annotation text switches language
- [ ] Moderator badge appears in top-right corner when mode is ON
