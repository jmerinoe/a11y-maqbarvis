# Tasks: Kiosk accessibility + trap-free session screens

## Milestone 1: Presentation semantics and live regions

- [x] T1.1 `presentation.js` — `.k-col` → `<ol>` columns (`start` attr on col 2), rows → `<li>`; keep `.k-row`/`data-key` animation contract.
- [x] T1.2 Live region: hidden `role="status"` node announcing board name changes, empty and offline states; `role="status"` on `.record-banner`.
- [x] T1.3 Delta/NEW accessible names (`aria-label` on delta spans and badge).
- [x] T1.4 `prefers-reduced-motion` gate in `canAnimate`.

## Milestone 2: Rotation pause + route focus

- [x] T2.1 Footer pause/resume button (`aria-pressed`, ES label) toggling `rotateTimer` only.
- [x] T2.2 `main.js` — `document.title` per route + focus h1 on route change.

## Milestone 3: Admin accessibility

- [x] T3.1 `admin.js` — labels for all add-form and edit-form fields; `select` label; `aria-invalid` on PIN error.
- [x] T3.2 `scope="col"` headers + named actions column; `aria-pressed` on theme buttons.
- [x] T3.3 Focus restoration to `h1` after re-render.

## Milestone 4: Styles

- [x] T4.1 `styles.css` — raise muted-text contrast (≥4.5:1), add `:focus-visible` outlines, `.sr-only` utility, pause-button styling.

## Milestone 5: Tests and docs

- [x] T5.1 `apps/kiosk/src/tests/kiosk-a11y.test.js` — list semantics, live region, pause, labels, aria-pressed, scope, title/focus.
- [x] T5.2 Experience regression — extend `panel-branding.test.js` (or equivalent) asserting the three session screens remain trap-free.
- [x] T5.3 `npm test` in `apps/kiosk` and `apps/experience` — all green; `npm run build` both apps.
- [x] T5.4 Write `apply-progress.md` and `verify-report.md`; manual check in dev.
