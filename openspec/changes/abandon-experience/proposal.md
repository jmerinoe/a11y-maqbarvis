# Proposal: Give up — abandon a run and rank it as DNF

## Why

Today a participant who gets stuck mid-run has no way out: the only exits are finishing the mission or walking away leaving a dangling session (the timer keeps running, nothing is recorded). For a workshop experience, abandoning is a legitimate outcome — it happens, and it should be acknowledged the same way a completion is: with feedback, a recorded time, and a place in the ranking.

This change adds a "Me rindo" escape hatch to the three experiences. Abandoning opens a confirmation step, records the run as `abandoned`, shows a closing dialog ("Lo sentimos, no has completado la experiencia" + elapsed time + "Ver ranking"), and lands the participant on the ranking — where DNF rows appear after every completed run, marked as not completed, on the app screen and on the kiosk board.

## What Changes

### Scope

1. **"Me rindo" button** — a real `<button>` mounted/unmounted together with the session timer overlay (`#experience-timer`). Same "external instrumentation" look (dark, monospace, high z-index): it is workshop chrome, not part of the fake inaccessible UIs. Present on every screen while a run is in progress — covers all three experiences with a single implementation.
2. **Confirmation dialog** — "¿Seguro que quieres abandonar?" (owner decision: prevent accidental taps, especially in the blindfold experience). Confirm proceeds; cancel / Escape resumes the run untouched. Same accessible dialog pattern as `congrats-dialog` (role/aria-modal/focus management).
3. **Abandon recording** — on confirm: timer stops, `submitResult({ ..., result: 'abandoned' })` (no `routeMinutes`/`appointmentAt`), session marked `abandoned: true` + `completedAt` so a reload does not resurrect the timer.
4. **Abandoned dialog** — congrats-style overlay: message "Lo sentimos, no has completado la experiencia", the elapsed time, and a "Ver ranking" button that navigates to `#/ranking`. Escape behaves like the button.
5. **DNF ranking rows** — `getRanking` and `GET /api/ranking` include `result === 'abandoned'` records **after all completed runs** (owner decision), ordered among themselves by `elapsedMs`, `endedAt`, `user`. The app table marks them visually (dimmed row + `DNF` badge + sr-only cue); the kiosk board shows a `DNF` badge and dims the row.
6. **API** — `POST /api/results` accepts `result` ∈ `{'completed','abandoned'}` (defaults to `'completed'`); `GET /api/ranking` returns `result` per row and includes abandoned runs at the tail (they may fill the bottom of the top-20). Backward-compatible: old payloads without `result` keep working.
7. **Retry guard** — the three completion paths only submit when no outcome was recorded yet (`baselineMs == null && !abandoned`): once a run has a recorded outcome, retries are non-submitted replays — same rule as today, extended to DNF.
8. **i18n + a11y** — es/en keys for button, confirm, final dialog, and DNF badge/sr cue. The button is in the regular tab order so screen-reader users can reach it.

### Out of scope

- No changes to how completed runs are recorded, timed, or sorted among themselves — completed ordering is untouched.
- No changes to the mission-failed dialog ("reintentar") flow — abandoning is a different path.
- No admin UI for editing `result` beyond what `PATCH /api/ops/results` already allows (admin list may display the mark).
- No changes to the kiosk promo video, rotation, or record-celebration logic (a DNF row may still trigger "NEW" like any fresh entry — no special-casing).

## How

### Architecture approach

- `apps/experience/src/components/experience-timer.js` — `mountExperienceTimer` also mounts `#give-up-btn` next to the timer badge; `stopExperienceTimer` removes it. Click → `requestAbandon()`.
- `apps/experience/src/components/abandon-dialog.js` (new) — `requestAbandon()` orchestrates confirm → record → final dialog; `showAbandonConfirm` / `showAbandonedDialog` reuse `.congrats-overlay` / `.congrats-dialog` markup and focus pattern.
- `apps/experience/src/session/session.js` — `getRanking` filters `result ∈ {completed, abandoned}` and sorts with a result-weight term first (abandoned last). `clearSession` drops nothing new; `abandoned` lives on the session object.
- `apps/experience/src/screens/ranking.js` — `ranking-dnf` row class, `DNF` badge + sr-only cue in the user cell; combines cleanly with `ranking-self`.
- `apps/experience/src/i18n/{es,en}.js` — `giveup.*` and `ranking.dnf*` keys.
- `api/src/functions/public.js` — `results` handler validates/passes `result` through (table layer already stores it); `ranking` handler includes abandoned at the tail and returns `result` per row.
- `apps/kiosk/src/presentation.js` — `updateRow` adds `.dnf` class + `DNF` badge for `r.result === 'abandoned'`; `styles.css` dims it.
- `apps/kiosk/src/admin.js` — DNF chip in the records table (minor, data already returned).

### Ordering rule (owner decision)

```
rankWeight = r.result === 'abandoned' ? 1 : 0
sort: rankWeight ASC, then existing comparators
      (appointmentAt → routeMinutes → elapsedMs → endedAt → user)
```

Completed rows keep their exact current relative order; abandoned rows land at the tail sorted by elapsed time.

### Testing strategy

- Unit: `getRanking` DNF ordering (abandoned last, elapsed ties); `rankingWindow` anchoring when the participant's only run is abandoned; `abandonRun` record shape + no double-submit on retry.
- Render: give-up button mounts/unmounts with the timer; confirm cancels cleanly; final dialog navigates to `#/ranking`; ranking marks DNF rows (visual + sr-only) and combines with `ranking-self`.
- Kiosk: `updateRow` renders the DNF badge for abandoned records.
- API: `results` accepts/rejects `result` values; `ranking` ordering + payload field (extend `api/tests/table.test.js` patterns where applicable).

### Delivery

Single commit. ~10 files + tests + openspec docs.

## Assumptions

- The button is visually on screen in all three experiences (BLIND BUY included — moderators can see and press it); for the blindfolded participant it is additionally reachable by Tab/screen-reader element lists.
- Abandoning a **retry** run (baseline or DNF already recorded) shows the same dialogs but submits nothing — the first recorded outcome stands.
- Abandoned rows show the real elapsed time in the time column; only the mission metrics (`routeMinutes`/`appointmentAt`) are absent — they never existed for a DNF.
- `result` values other than `completed`/`abandoned` are rejected by `POST /api/results` and ignored by ranking filters (no other values exist today).
- Final ES/EN copy is adjustable at review; defaults: "Me rindo", "¿Seguro que quieres abandonar?", "Lo sentimos, no has completado la experiencia", badge "DNF".
- The kiosk keeps its 20-row cap — abandoned runs simply occupy tail positions when the board isn't full of completions.

## Risks

| Risk | Mitigation |
|------|------------|
| Accidental taps (especially blindfolded) | Mandatory confirmation dialog; Escape/cancel resumes untouched |
| Double-counted participants (DNF + completed) | `abandoned` session flag blocks resubmission; first outcome wins |
| Old clients/APIs without `result` field | Filter and defaults treat missing `result` as `completed` — behavior unchanged |
| Kiosk row diffing keyed on `user`+`endedAt` | Unchanged; DNF rows are just rows with a badge |
| Blindfolded users can't see the fixed button | Real `<button>` in tab order with accessible name; moderators can verbalize it |
