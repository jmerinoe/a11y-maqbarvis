# Design: TR-03 Removal — Carousel Without Focus Stealing

## 1. Overview

Correct the home hero carousel (remove focus stealing, respect `prefers-reduced-motion`) and remove TR-03 from the trap registry, following the TR-11 removal precedent.

## 2. Carousel changes (`src/screens/home.js`)

### 2.1 Markup

```html
<!-- before -->
<section data-trap="TR-03" class="carousel" id="hero-carousel">
<!-- after -->
<section class="carousel" id="hero-carousel">
```

Slides keep `tabindex="0"` (REQ-T3R-04) — manual focus still works.

### 2.2 `startCarousel()` rewrite

```js
let carouselTimer = null;
let motionQuery = null;
let motionQueryListener = null;

function startCarousel() {
  stopCarousel();
  const slides = document.querySelectorAll('#hero-carousel .carousel-slide');
  if (slides.length === 0) return;
  let current = 0;

  const startRotation = () => {
    if (carouselTimer) return;
    carouselTimer = setInterval(() => {
      slides.forEach((s) => s.classList.remove('active'));
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
      // TR-03 corrected: rotation never moves focus.
    }, 3000);
  };

  // Interval-only stop: keeps the change listener alive so rotation can
  // resume when the preference flips back to no-preference.
  const stopRotation = () => {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  };

  // REQ-T3R-02/03: respect prefers-reduced-motion; degrade gracefully
  // when matchMedia is unavailable (e.g. jsdom).
  motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: null, removeEventListener: null };

  if (!motionQuery.matches) startRotation();

  motionQueryListener = (e) => {
    if (e.matches) stopRotation();
    else startRotation();
  };
  motionQuery.addEventListener?.('change', motionQueryListener);

  if (slides[0]) slides[0].classList.add('active');
}
```

Key points:

- **Focus block deleted** — the `document.activeElement !== document.body` / `slides[current].focus()` code is gone entirely.
- **Guarded `matchMedia`** — optional chaining so jsdom (no `matchMedia`) degrades to "no preference" (REQ-T3R-03).
- **`change` listener** — dynamic stop/resume when the OS preference toggles. The listener calls the interval-only `stopRotation()` (not `stopCarousel()`), so the listener stays alive and rotation can resume on `no-preference`.

### 2.3 `stopCarousel()` unchanged semantics

Keeps clearing the interval. The `motionQueryListener` cleanup is added for hygiene:

```js
function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  if (motionQuery && motionQueryListener) {
    motionQuery.removeEventListener?.('change', motionQueryListener);
    motionQueryListener = null;
  }
}
```

This prevents listener accumulation across re-renders (home re-renders call `startCarousel` → `stopCarousel` first).

### 2.4 Comments

Remove `// TR-03: ...` comments; replace with a short note that rotation no longer steals focus and honors `prefers-reduced-motion`.

## 3. Trap registry correction (REQ-T3R-05)

### 3.1 `src/traps/registry.js`
- Remove the `TR-03` entry (lines 36–44).
- Header comment "metadata for all 18 accessibility traps" → "17 accessibility traps".

### 3.2 `src/tests/trap-registry.test.js`
- Header comment + `should have exactly 18 traps` → `17`.
- ID test: remove `'TR-03'` from `expectedIds`; rename test title to `should have IDs TR-01, TR-02, TR-04..TR-10, TR-12..TR-19 (TR-03, TR-11 corrected)`.

### 3.3 `src/traps/README.md`
- Line 19: "TR-01 .. TR-19, except TR-11 which was corrected" → "except TR-03 and TR-11 which were corrected".

### 3.4 `docs/verification-checklist.md`
- Remove the `#### TR-03 — Carousel steals focus` block.
- Add a note in the Home section (pattern follows the existing TR-11 note): carousel still auto-rotates but never steals focus and respects `prefers-reduced-motion` — moderator can contrast with remaining traps.

## 4. New structural test: `carousel-motion.test.js`

New file `src/tests/carousel-motion.test.js` (jsdom + `vi.useFakeTimers()`). `matchMedia` is stubbed per test:

```js
function stubMatchMedia(matches) {
  const listeners = [];
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    addEventListener: (_e, fn) => listeners.push(fn),
    removeEventListener: (_e, fn) => listeners.splice(listeners.indexOf(fn), 1),
    dispatchChange: (m) => listeners.forEach((fn) => fn({ matches: m })),
  }));
}
```

Cases:

1. **Rotation does not move focus** — render home, focus the search input, advance 3s+ → active slide changed, `document.activeElement` still the input.
2. **Auto-rotation runs under no preference** — `matches: false`; advance timers → second slide gets `.active`.
3. **No rotation under reduce** — `matches: true`; advance timers → slide 0 still `.active`, no rotation.
4. **Preference change stops/resumes** — start with `matches: false`, dispatch change to `true` → timer stops (further advance doesn't rotate); dispatch back → resumes.
5. **No `data-trap="TR-03"`** — rendered markup has no `data-trap="TR-03"` element.
6. **Slides still focusable** — `.carousel-slide` has `tabindex="0"`.

## 5. Moderator mode interaction

`bindModerator` / overlays query `[data-trap]` — removing the attribute removes the annotation automatically, same as TR-11. No `moderator.js` change; `moderator.test.js` unaffected (it does not reference TR-03 — verified).

## 6. Files changed

| File | Change |
|------|--------|
| `src/screens/home.js` | Remove `data-trap`; rewrite `startCarousel` (no focus steal, reduced-motion guard + change listener); extend `stopCarousel`; update comments |
| `src/traps/registry.js` | Remove TR-03 entry; header comment 18 → 17 |
| `src/tests/trap-registry.test.js` | 17 traps; ID list without TR-03 |
| `src/traps/README.md` | "except TR-11" → "except TR-03 and TR-11" |
| `docs/verification-checklist.md` | Remove TR-03 block; add corrected-behavior note |
| `src/tests/carousel-motion.test.js` | New — 6 tests |

## 7. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| `matchMedia` absent in jsdom crashes render | Optional-chained access; tests stub it explicitly (REQ-T3R-03) |
| Listener accumulation across home re-renders | `stopCarousel` removes the change listener before re-registering (§2.3) |
| Fake timers + interval interplay in tests | `vi.useFakeTimers()` + explicit `vi.advanceTimersByTime`; pattern proven in vitest |
| Moderator checklist mentions TR-03 | Section replaced with corrected-behavior note (§3.4) |
| Rotation without pause control seen as insufficient vs 2.2.2 | Owner's confirmed choice; spec documents it; reduced-motion opt-out is the motion mitigation |
