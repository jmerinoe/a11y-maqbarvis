# Proposal: TR-03 Removal — Carousel Without Focus Stealing, Respecting Reduced Motion

## Why

The home hero carousel is the **TR-03** trap (SC 2.2.2 Pause, Stop, Hide): a `setInterval` rotates slides every 3 seconds and **steals keyboard focus** to the active slide whenever the user has focus anywhere on the page (`document.activeElement !== document.body`). Keyboard and screen reader users get yanked back to the carousel mid-navigation.

The project owner has decided to remove this trap, following the TR-11 precedent: the trap is **corrected** with a proper implementation, removed from the registry, and documented as a reference fix the moderator can contrast against the remaining traps.

Chosen correction (confirmed): the carousel **keeps auto-rotating but never steals focus**, and it **does not auto-rotate when the user prefers reduced motion** (`prefers-reduced-motion: reduce`). No visible pause/play control is added.

## What Changes

### Scope — Home hero carousel

1. **No focus stealing** — the rotation timer updates the `.active` class only; the `slides[current].focus()` call is removed entirely. Rotation never moves focus, regardless of where it is.
2. **Respects `prefers-reduced-motion`** — on render, if the media query matches `reduce`, the interval does not start (static first slide). A `change` listener stops/restarts rotation if the OS-level preference changes while the page is open.
3. **Trap registry correction** — remove the TR-03 entry from `registry.js` (18 → 17 traps), remove `data-trap="TR-03"` from the carousel `<section>`, update the structural test's count and expected ID list, update `src/traps/README.md` and `docs/verification-checklist.md`.

### Out of scope

- Pause/play or prev/next controls (user opted for no visible control; existing `home.carousel.*` i18n keys stay unused).
- The `tabindex="0"` on slides — slides remain keyboard-focusable on purpose; only *automatic* focus movement is removed.
- Slide-to-slide CSS transitions (visual motion of the swap) — out of scope; reduced-motion handling covers the auto-rotation mechanism.
- `stopHomeCarousel` export (currently unused — the timer already survives navigation today; behavior unchanged).
- Any other trap (TR-01, TR-02, TR-04…TR-19 remain intact).

## How

### Architecture approach

1. `home.js` — `startCarousel()` guards on `window.matchMedia('(prefers-reduced-motion: reduce)')` (jsdom-safe optional chaining); skips starting the interval when reduced. Registers a `change` listener to stop/start rotation dynamically. The interval callback drops the focus-stealing block.
2. `registry.js` — delete the TR-03 entry; header comment "18 accessibility traps" → "17".
3. `trap-registry.test.js` — `18 traps` → `17`; expected ID list drops `TR-03`.
4. `src/traps/README.md` — "except TR-11" → "except TR-03 and TR-11".
5. `docs/verification-checklist.md` — remove the TR-03 verification block; add a corrected-behavior note in the Home section (same pattern as the TR-11 note).
6. New test `carousel-motion.test.js` — stubs `matchMedia`, uses fake timers to assert no focus movement under rotation and no rotation under `reduce`.

### Testing strategy

- New structural test file covering: rotation advances slides without moving focus; reduced-motion prevents rotation; `data-trap="TR-03"` absent; registry count/ID assertions updated to 17.
- `i18n.test.js`, `moderator.test.js` unaffected (moderator overlays query `[data-trap]` — TR-03 simply stops appearing, same as TR-11 did).

### Delivery

Single PR. Files: `home.js`, `registry.js`, `trap-registry.test.js`, `README.md`, `verification-checklist.md`, new test. Small diff.

## Assumptions

- Auto-rotation itself is kept — the owner accepts rotation without a pause control as the corrected behavior (relying on reduced-motion opt-out as the motion mitigation).
- `matchMedia` may be absent (jsdom); code must degrade gracefully (absence ⇒ treat as "no preference" ⇒ auto-rotate).
- Removing `data-trap` automatically removes the moderator annotation — no `moderator.js` change needed (same mechanism as TR-11 removal).

## Risks

| Risk | Mitigation |
|------|------------|
| Auto-rotation without pause control is weaker against SC 2.2.2 than a pause button | Owner's explicit choice; documented in spec. Reduced-motion opt-out covers the primary motion-sensitivity risk; no focus stealing removes the keyboard disruption |
| `matchMedia` missing in test environment | Optional-chained guard + tests stub it explicitly |
| Interval keeps running after navigation (pre-existing) | Unchanged behavior; out of scope |
| Registry ID-list test becomes stale | Explicit expected-ID array updated (TR-01, TR-02, TR-04…TR-10, TR-12…TR-19) |
