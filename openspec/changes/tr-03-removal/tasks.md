# Tasks: TR-03 Removal — Carousel Without Focus Stealing

Implementation checklist. Tasks are ordered by dependency. Check off items as they are completed during the apply phase.

## Milestone 1: Carousel correction (`home.js`)

- [x] T1.1 Remove `data-trap="TR-03"` from the carousel `<section>` in `src/screens/home.js` (slides keep `tabindex="0"`).
- [x] T1.2 Rewrite `startCarousel()`: guarded `matchMedia('(prefers-reduced-motion: reduce)')` — no interval when `matches` is true; register a `change` listener to stop/resume rotation; keep the first slide activated.
- [x] T1.3 Remove the focus-stealing block from the interval callback (`document.activeElement !== document.body` check + `slides[current].focus()`).
- [x] T1.4 Extend `stopCarousel()` to also remove the `motionQuery` change listener (prevents accumulation across re-renders).
- [x] T1.5 Update comments: remove `// TR-03:` notes, document corrected behavior briefly.

## Milestone 2: Trap registry correction

- [x] T2.1 Remove the `TR-03` entry from `src/traps/registry.js`.
- [x] T2.2 Update the file header comment in `registry.js`: "18 accessibility traps" → "17 accessibility traps".
- [x] T2.3 Update `src/traps/README.md` line 19: "except TR-11 which was corrected" → "except TR-03 and TR-11 which were corrected".
- [x] T2.4 Update `src/tests/trap-registry.test.js`: count 18 → 17; remove `'TR-03'` from `expectedIds`; update test title/comment.
- [x] T2.5 Run `npm test` — registry tests pass with 17 traps.

## Milestone 3: New structural test

- [x] T3.1 Create `src/tests/carousel-motion.test.js` with the 6 cases from design §4 (no focus steal, rotation under no preference, no rotation under reduce, dynamic stop/resume, no `data-trap="TR-03"`, slides focusable). Stub `matchMedia` per test; use `vi.useFakeTimers()`.
- [x] T3.2 Run `npm test` — all tests pass.

## Milestone 4: Documentation

- [x] T4.1 Remove the `#### TR-03 — Carousel steals focus` block from `docs/verification-checklist.md` and add a corrected-behavior note in the Home section (pattern per the TR-11 note).
- [x] T4.2 Write `openspec/changes/tr-03-removal/apply-progress.md`.
- [x] T4.3 Write `openspec/changes/tr-03-removal/verify-report.md`.

## Milestone 5: Final verification

- [x] T5.1 Run `npm run build` — must succeed with no errors.
- [x] T5.2 Run `npm test` — all tests pass.
- [x] T5.3 Verify no `data-trap="TR-03"` remains in `src/` or built output (grep).
- [x] T5.4 Manual in dev: tab through home — focus is never pulled to the carousel; rotation still advances slides; with OS reduced-motion on, carousel is static.

## Notes

- Milestones 1 and 2 are independent; the test in M3 covers both.
- The `change` listener cleanup in T1.4 matters because `renderHome` re-runs `startCarousel` on every home render.
- Do not add pause/prev/next controls — the owner chose no visible control.
