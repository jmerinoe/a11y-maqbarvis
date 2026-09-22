# Proposal: User identification, experience selection, and purchase-flow timing

## Why

Faro needs to support moderated usability sessions: each participant identifies with a unique username, selects an experience (currently only "screen-reader experience"), reads its instructions, and then performs the purchase flow while an external-looking timer measures how long it takes. Completed runs feed a top-10 ranking of best times.

Today the app opens directly on `#/home`. This evolution inserts a pre-Faro flow — **username → experience selection → instructions → (timer starts) → Faro home → purchase → congrats → ranking** — so the facilitator can measure per-user completion time.

The new screens are instrumentation for the workshop: they are **fully accessible and contain no traps** — they contrast with the intentionally broken Faro screens.

## What Changes

### Scope

1. **Login screen** (`#/login`) — unique-username registration before anything else.
2. **Experience selection screen** (`#/experiences`) — data-driven list from an experiences registry; currently one: "Experiencia con lectores de voz".
3. **Instructions screen** (`#/instructions`) — task text + "Continuar" that starts the timer and opens `#/home`.
4. **Session timer overlay** — fixed top-right, external-looking badge, updates continuously from a start timestamp, survives hash navigation (mounted on `document.body`, outside `#app`).
5. **Completion detection** — a successful order **containing camiseta + azul + talla M** (p001 + blue + M, paid with the enforced test card) stops the timer and records the result.
6. **Congrats dialog** — accessible modal (`role="dialog"`, `aria-modal`, labelled title, focus managed) showing elapsed time; closing it opens `#/ranking`.
7. **Ranking screen** (`#/ranking`) — top-10 best times (position, user, time), recomputed from stored results on every render.
8. **Flow guard** — Faro routes require an active session; without one the user is sent to `#/login`. App entry now lands on `#/login` unless a session is already active.

### Out of scope

- No new traps and no changes to existing ones (TR-01…TR-19, registry, moderator, checklist).
- No changes to the purchase flow internals beyond the completion hook (order success path).
- Multiple experiences UI beyond a data-driven list (registry supports future additions, but only one ships).
- Server-side storage — everything is client-side (localStorage/sessionStorage), appropriate for a local workshop demo.

## How

### Architecture approach

- `src/data/experiences.js` — experience registry: `{ id, name: {es,en}, instructions: {es,en}, requiredItem: {productId, size, color} }`. Adding a future experience = adding an entry; the flow doesn't change.
- `src/session/session.js` — session + persistence:
  - `localStorage['faro-users']`: normalized usernames (trim + inner-whitespace collapse + `toLocaleLowerCase` for comparison; display name stored trimmed).
  - `localStorage['faro-results']`: run records `{user, experienceId, startedAt, endedAt, elapsedMs, result:'completed'}`.
  - `sessionStorage['faro-session']`: `{user, experienceId, startedAt}` — timer survives reload within the tab.
- `src/components/experience-timer.js` — overlay div appended to `document.body` (outside `#app` — screen re-renders can't remove it); `setInterval` (~250ms) recomputes `Date.now() - startedAt`; `role="timer"` + `aria-label` (visible, not live-announced). Styled as an external widget (dark monospace badge) per the "not part of Faro" requirement.
- `src/components/congrats-dialog.js` — accessible modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus moves to it on open, close button + Escape, focus restored on close.
- `src/screens/` — `login.js`, `experience-select.js`, `instructions.js`, `ranking.js` — all semantic and trap-free.
- `src/router.js` — new routes; `getCurrentRoute`/init default to `#/login` without session, `#/home` with one; `handleRouteChange` redirects sessionless users away from Faro routes.
- `src/screens/checkout.js` — on successful submit, when a session is active and `order.items` contains the required item, call `session.completeExperience(elapsedMs)` (stops timer, saves record, sets a pending-congrats flag); navigation to `#/confirmation` unchanged.
- `src/screens/confirmation.js` — renders normally; if the pending-congrats flag is set, opens the congrats dialog; closing it navigates to `#/ranking`.
- `src/i18n/{es,en}.js` — new keys (`session.*`, `experience.*`, `timer.*`, `congrats.*`, `ranking.*`).

### Testing strategy

New test `src/tests/user-experience-timer.test.js` covering: username normalization/uniqueness/empty rejection; registry-driven experience list; timer starts only on Continuar (not on render); overlay exists on `document.body` and updates; completion requires the exact item (wrong variant doesn't complete); result record saved; congrats dialog semantics; ranking sorts asc with deterministic tie-break and caps at 10.

### Delivery

Single commit. ~10 new/changed files + i18n + CSS + tests + openspec docs.

## Assumptions

- "Usuario único" compares normalized names (trim + case-insensitive); "Ana" and " ana " collide. Display keeps the trimmed original.
- The required purchase is **exactly** p001+blue+M as the single order line — extra items in the order **invalidate** completion (owner decision).
- Completion is evaluated on successful submit (order created) — not on cart add, checkout entry, or confirmation visit.
- Ranking persists in `localStorage` across sessions/machines' restarts on the same browser profile — intended for the workshop machine.
- Mid-experience page reload restores the running timer from `sessionStorage` (per-tab); closing the tab ends the session.
- After finishing, the ranking screen offers a "Nuevo participante" action that clears the session and returns to `#/login` for the next participant.

## Risks

| Risk | Mitigation |
|------|------------|
| Timer overlay detached from `#app` leaks after experience ends | `stopTimer()` removes the node; re-created on each session start |
| Reload mid-flow loses context | Session persisted in `sessionStorage`; router restores timer overlay on load if active |
| Hash navigation to Faro screens without session | Central guard in `handleRouteChange` redirects to `#/login` |
| Tie in elapsed times | Deterministic ordering: elapsedMs → earlier `endedAt` → username |
| Congrats dialog accessibility | Real `role="dialog"` + `aria-modal` + focus management — tested structurally |
