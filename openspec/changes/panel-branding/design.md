# Design: Panel branding on session screens

## Architecture

A shared chrome is applied to the four session screens. Two implementation options were considered:

| Option | Verdict |
|--------|---------|
| Use `panel-background.png` as a fixed `background-image` | Rejected — the bitmap's ring positions are fixed pixels; `cover` crops them differently per viewport, and the embedded logo has no `alt` for screen readers |
| CSS `radial-gradient` rings + real `<img>` logo | **Chosen** — responsive, accessible (`alt`), and the logo file the owner provided is actually used |

## Changes per file

### `public/images/panel-logo.jpg`
Copied from the provided asset.

### `src/styles/main.css`
- `.panel-shell` — `min-height: 100vh`, white background, `position: relative`, `overflow: hidden`; rings via two `radial-gradient` backgrounds (pale blue, e.g. `#d9f0f8`) anchored right-top and right-bottom, plus `::before`/`::after` ring shapes if cleaner.
- `.panel-logo` — `position: absolute; top/right` inside the shell; ~140px wide.
- `.panel-screen` (replaces `.session-screen` / `.ranking-screen` usage on these four screens) — centered column, `max-width: 560px`, no dashed border, transparent background.
- Accent overrides scoped to `.panel-shell`: `.btn-primary` and links use Panel cyan; keep readable focus styles (`:focus-visible` outline).
- Old `.session-screen` / `.ranking-screen` rules removed (no other consumer exists).

### `src/components/panel-shell.js` (new)
`panelShell(innerHtml)` helper returning the wrapper markup:

```html
<div class="panel-shell">
  <img class="panel-logo" src="/images/panel-logo.jpg" alt="Panel" />
  <main class="panel-screen">…</main>
</div>
```

Keeps the four screens consistent and makes future session screens branded by default.

### Screens
Each of `login.js`, `experience-select.js`, `instructions.js`, `ranking.js` wraps its existing `<main>` content in `panelShell(...)` and swaps `session-screen`/`ranking-screen` for `panel-screen`. The logo `alt` uses `t('panel.logoAlt')`.

### `src/i18n/es.js` / `src/i18n/en.js`
- `panel.logoAlt`: `Panel` (proper noun — same in both locales).

## Accessibility

- Logo: `<img alt="Panel">` — announced once, does not intercept tab order (not focusable).
- Rings: pure CSS background — decorative, invisible to AT.
- Focus order unchanged: logo is outside the `<main>` landmark and non-interactive.
- Contrast: Panel cyan on white for text/links must keep ≥ 4.5:1 — buttons use cyan background with white text (check contrast; if below 4.5:1, darken to `#0085a8` for text-on-white or keep white-on-cyan only for large/bold button text ≥ 3:1).
- No `data-trap` attributes anywhere in the new markup.

## Test plan (`src/tests/panel-branding.test.js`)

1. Each of the four screens renders `.panel-shell` and `.panel-logo` with `src="/images/panel-logo.jpg"` and a non-empty `alt`.
2. No `data-trap` attributes in any of the four screens' markup.
3. Existing `user-experience-timer.test.js` cases still pass (markup restructure must not break selectors: `#login-form`, `#login-username`, `.experience-list a`, `#instructions-continue`, `#ranking-new-participant`).

## Out of scope reminder

Timer badge and congrats dialog styles unchanged; Faro chrome unchanged.
