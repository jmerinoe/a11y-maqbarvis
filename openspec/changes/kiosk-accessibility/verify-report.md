# Verify report: Kiosk accessibility + trap-free session screens

## Verdict: PASS

## Automated verification

| Requirement | Evidence |
|-------------|----------|
| REQ-820-01 list semantics | Test: 12 rows → 2 `<ol class="k-col">` with `start` 1/7, all rows are `<li>` |
| REQ-820-02 live announcements | `.sr-status[role="status"]` announces "Esperando jugadores…"; `.record-banner[role="status"]`; dedupe prevents poll noise |
| REQ-820-03 pause control | `#k-rotate-toggle` toggles `aria-pressed`; only rotation stops, polling continues |
| REQ-820-04 reduced motion | `canAnimate` gates all Web Animations on `matchMedia('(prefers-reduced-motion)')` |
| REQ-820-05 admin labels | Test: `add-user`, `add-exp`, `add-exp-new`, `add-time` all have `label[for]`; edit form labelled; PIN uses `aria-describedby` + `aria-invalid` |
| REQ-820-06 table/toggles | Test: all `th` have `scope="col"`, actions column named; theme buttons expose `aria-pressed` |
| REQ-820-07 focus/title | `document.title` per route; `h1` focus on admin render and presentation mount; `:focus-visible` outlines added |
| REQ-820-08 contrast | `--muted` and admin hardcoded muted colors raised to `#93a5c7` (≥4.5:1 on `#05060f`) |
| REQ-820-09 glyph names | `aria-label` on ▲/▼/— deltas and NEW badge |
| REQ-820-10 session screens | Extended `panel-branding.test.js`: labels, live error, links, labelled sections — no `data-trap`; Faro traps untouched |

## Test results

```
apps/kiosk:      13 tests, 2 files — all pass
apps/experience: 106 tests, 16 files — all pass
```

`npm run build` (kiosk): OK.

## Manual review notes

- Two-column `<ol start="N">` keeps list numbering correct without aria hacks.
- Live region announces only board-level events (board name, empty, offline, record) — row repaints stay silent by design.
- Pause button keeps polling so the display stays fresh while static.

## Known limitations / notes

- `confirm()` native dialogs retained in admin (accessible by platform).
- Arcade-theme English strings ("HI-SCORE", "INSERT COIN") are decorative flavor; informative deltas have Spanish accessible names.
- Kiosk is designed as a big-screen display; keyboard interaction is exercised mainly in admin mode and via the footer controls.
