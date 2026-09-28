# Design: Kiosk accessibility + trap-free session screens

## Audit findings

### `apps/kiosk/src/presentation.js`

1. `.k-row` elements are `<div>`s — ranking has no list semantics for AT.
2. `.record-banner` toggles `hidden` without a live role — "NEW RECORD" is never announced.
3. `boardEl` (experience name) and status messages (`.k-empty`) update silently.
4. `rotate()` every 12 s with no pause mechanism (WCAG 2.2.2).
5. `canAnimate()` never checks `matchMedia('(prefers-reduced-motion)')` — FLIP/entrance animations run regardless.
6. ▲/▼/— deltas and NEW badge rely on glyphs alone for position-change info.
7. Header `img`s carry `tabindex="-1"` (harmless) and correct `alt`.

### `apps/kiosk/src/admin.js`

8. `#add-user`, `#add-exp`, `#add-exp-new`, `#add-time`, `#edit-user`, `#edit-time` have placeholder-only or no label.
9. Theme buttons show `.active` visually only — no `aria-pressed`.
10. Results table `<th>`s lack `scope="col"`; the actions column header is empty.
11. Every action re-renders the whole view — keyboard focus is lost (no focus restore; `role="status"` notice exists but focus lands on `<body>`).
12. Route changes (`#/` ↔ `#/admin`) do not move focus or update `document.title`.

### `apps/kiosk/src/styles.css`

13. `--muted: #5a6b8c` on `#05060f` ≈ 3.9:1 — below 4.5:1 for normal-size text (admin labels, footer, `.k-pos`, `.admin-back`, `.admin-theme-note`).
14. No `:focus-visible` styling anywhere in the kiosk.

### Experience session screens

15. `login.js`, `experience-select.js`, `instructions.js` are already trap-free (real labels, `role="alert"`, `aria-labelledby`, focus-to-h1 on navigation, `dl` cards). Guard with tests; fix only if a regression is found.

## Fixes per file

### `presentation.js`

- **List semantics**: `.k-col` becomes `<ol class="k-col">` per column with `<li class="k-row">` rows; the second column gets a `start` attribute (`<ol start="N">`) so numbering stays correct across two columns. `list-style: none` preserves layout. `buildRow()` creates `li`; `paintRows` unchanged otherwise (ARIA `role="list"`/`listitem` was the alternative — real `<ol>`/`<li>` is more robust and free).
- **Live region**: `.k-main` gets `aria-live="polite"`? Too noisy for 15 s polls. Instead: a dedicated `<p class="sr-status" role="status">` (visually hidden) that receives text only on (a) board/experience change, (b) empty/offline states, (c) NEW RECORD. `record-banner` also gets `role="status"`.
- **Pause control**: footer button `⏸/▶` toggling `rotateTimer` (label i18n-free Spanish: "Pausar rotación" / "Reanudar rotación", `aria-pressed`). Poll continues — only rotation pauses.
- **Reduced motion**: `const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;` gate inside `canAnimate`.
- **Deltas**: `aria-label` on `.k-delta` spans (`sube N`, `baja N`, `sin cambio`); NEW badge `aria-label="nuevo"`.

### `admin.js`

- All inputs get `<label for>` (add-form visible labels; inline edit gets visually-hidden labels via `.sr-only` to keep the row compact).
- `select#add-exp` gets a label; `#add-exp-new` gets a label + `aria-hidden` sync? — keep `hidden` toggling, add `<label>`.
- `<th scope="col">` on all headers; last column = "Acciones".
- Theme buttons: `aria-pressed` + keep `.active` class.
- After `renderAdmin` re-render: move focus to the `h1` (mirrors experience-app h1-focus pattern) unless a specific element requested focus.
- PIN gate already OK (`label`, `role="alert"`, autofocus); add `aria-invalid` on error.
- `confirm()` kept (native, accessible).

### `main.js` (kiosk router)

- On route change: set `document.title` (`Ranking — Kiosko` / `Administración — Kiosko`) and focus the rendered `h1` (`tabindex="-1"`).

### `styles.css`

- `--muted` → `#8fa3c8` (≥4.5:1 on `#05060f`); also fix `.admin-card label`, `.admin-back`, `.admin-theme-note`, `.kiosk-footer`, `.k-pos` usages.
- Global `:focus-visible { outline: 2px solid var(--cyan, #22e6ff); outline-offset: 2px; }` scoped to kiosk elements.
- `.sr-only` utility class.
- Pause button styling consistent with footer links.

### Experience session screens

- Extend `panel-branding.test.js` (or new `session-a11y.test.js`) asserting: labelled field + `role="alert"` on login, real links on select, `h1`/`aria-labelledby`/mission `dl` on instructions, zero `data-trap`.

## Test plan (`apps/kiosk/src/tests/kiosk-a11y.test.js`)

1. Ranking rows are `li` inside `ol[role or implicit list]` with correct `start` on second column.
2. `role="status"` region exists and announces offline/empty states.
3. Pause button toggles `aria-pressed` and stops rotation.
4. Admin: every input/select in add-form and edit-form has an associated label or `aria-label`.
5. Theme buttons expose `aria-pressed`.
6. `th[scope="col"]` on all result-table headers.
7. Route to `#/admin` focuses `h1` and sets `document.title`.
8. Experience session screens: no `data-trap`, labels present (regression).

Existing `kiosk.test.js` must stay green (`.k-row` selector kept, `start` attributes added).
