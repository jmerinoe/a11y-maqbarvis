# Proposal: BLIND BUY — fix the five keyboard traps

## Why

The workshop needs BLIND BUY completable with keyboard + screen reader alone. Five of the 15 registered traps are keyboard/focus barriers — including two that can block the mission outright (the un-activatable search button and the focusless cart modal). Following the established convention (TR-03/06/07/11 already corrected), we fix them and drop them from the registry; the remaining 10 traps (labels, semantics, status messages, colour-only errors) stay as barriers.

## What Changes

### Scope — five traps fixed, registry shrinks 15 → 10

| Trap | Today | Fix |
|---|---|---|
| **TR-01** home | No skip link — must tab whole header | `<a class="skip-link">` before the logo inside the header; click is `preventDefault`ed (a hash href would hit the router) and moves focus to `<main id="main-content" tabindex="-1">`. New `.skip-link` CSS: visually hidden until `:focus` |
| **TR-04** home | Search "button" is `<div onclick>` — dead to keyboard | Real `<button type="button">` with `aria-label`, same class/styles and `__faroSearch` call |
| **TR-08** products | Cards carry `tabindex="5,4,3…"` — scrambled focus order | Remove the positive `tabindex` attribute; DOM order rules |
| **TR-12** cart | Modal with no focus management | `role="dialog" aria-modal="true" aria-labelledby`, focus into the dialog on open, Tab/Shift+Tab trapped inside, Escape = "seguir comprando" (`#/products`), focus restored to the pre-modal element |
| **TR-18** checkout | After failed submit, focus stays on the button | `focus()` the first invalid input after validation |

### Also

- Remove the five `data-trap` attributes and their `registry.js` entries → 10 traps remain: TR-02, TR-05, TR-09, TR-10, TR-13, TR-14, TR-15, TR-16, TR-17, TR-19.
- Update `traps/README.md` corrected list.
- Moderator overlay picks it up automatically.
- Update stale trap comments in the touched files.

### Out of scope

- TR-09 (M size): stays — deliberate design (the mission size keeps the only broken option).
- TR-16/17 (labels/`aria-describedby`), TR-15 (colour-only errors), TR-19, TR-02, TR-05, TR-10, TR-13, TR-14: untouched.
- No changes to copy, mission, scoring.

## Test plan

- `trap-registry.test.js`: 15 → 10, expected ID list updated.
- `moderator.test.js` fixture: replace removed `TR-04` id with a surviving one.
- New assertions: skip link focuses main without changing `location.hash`; search button is a `<button>` and works via click; product cards have no positive tabindex; cart dialog has role/aria-modal, traps focus, Escape navigates, restores focus; failed checkout focuses first invalid input.
