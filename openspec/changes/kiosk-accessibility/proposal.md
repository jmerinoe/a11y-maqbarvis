# Proposal: Kiosk accessibility + trap-free session screens

## Why

After the platform-deployment restructure the repo has two apps: `apps/experience` (Faro, the deliberately inaccessible product under test) and `apps/kiosk` (the ranking display/admin for the event). The kiosk was built fast with an arcade look and carries real accessibility defects — it is not a demo artifact, it is event tooling, so it must be fully accessible. The three workshop session screens (login, experience selection, instructions) must also be verified trap-free; the rest of the Faro flow keeps its intentional traps.

## Scope

### In scope

**Kiosk (`apps/kiosk`)** — make presentation and admin modes accessible:

| Area | Fix |
|------|-----|
| Ranking semantics | Rows become real list/table semantics (`<ol>`/`<li>` or ARIA list roles) instead of bare `<div>`s |
| Live updates | `role="status"`/`aria-live="polite"` on the board-name/messages area and the NEW RECORD banner |
| Auto-rotation | Pause/resume control for the 12 s experience rotation (WCAG 2.2.2) |
| Motion | Honor `prefers-reduced-motion` in JS-driven FLIP animations (CSS already partially covered) |
| Delta/delta badges | Accessible names for ▲/▼/NEW (e.g. `aria-label` "sube 2 puestos") |
| Focus | `:focus-visible` styles; focus moved to `h1` + `document.title` update on `#/`/`#/admin` route change |
| Admin forms | Real `<label>` (or `aria-label`) on every input/select — add-form, new-experience field, inline edit form |
| Theme buttons | `aria-pressed` reflecting the active theme |
| Table | `scope="col"` on headers; named "Acciones" column header |
| Contrast | Raise `--muted`-family text to ≥4.5:1 in admin and footer contexts |

**Experience (`apps/experience`)** — verify and lock in trap-free status of `login`, `experience-select`, `instructions` via tests (already built accessible; the recent remote changes — nav-keys card, h1-focus announcements — keep them compliant).

### Out of scope

- The rest of the Faro flow (home, products, detail, cart, checkout, confirmation) — **intentional traps are preserved**.
- The `#experience-timer` badge, congrats and mission-failed dialogs.
- New kiosk features; this is an accessibility pass only.
- The `api/` backend and `shared/` contracts.

## Assumptions

1. "Completely accessible" means: perceivable, operable and understandable for keyboard + screen-reader users (WCAG 2.x AA orientation), while keeping the visual arcade/themes look — aesthetics do not change beyond focus/contrast fixes.
2. The pause control for rotation may be a small footer button next to the admin link.
3. Kiosk copy stays Spanish; arcade English strings ("HI-SCORE", "INSERT COIN") are decorative flavor, but information-bearing deltas get Spanish accessible names.

## Risks

- The FLIP/diff animation system mutates row DOM continuously — semantic markup must not break `paintRows()` keying (`.k-row`/`data-key` contract kept; only the element tag/roles change).
- Live-region announcements could become noisy during 15 s polls — scope announcements to board changes and status messages, not every row.
