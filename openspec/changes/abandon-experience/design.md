# Design: Give up — abandon a run and rank it as DNF

## Current state

- The run timer (`#experience-timer`) is a fixed badge mounted on `document.body` by `mountExperienceTimer(startedAt)` and removed by `stopExperienceTimer()`. It exists exactly while a run is in progress — including after a page reload (`initRouter` remounts when `startedAt && !completedAt`).
- Completion paths (`checkout.js`, `metro.js`, `booking.js`) call `submitResult({ ..., result: 'completed' })` only when `session.baselineMs == null`; retries set `baselineMs` and replay without submitting.
- `getRanking` / `GET /api/ranking` filter `result === 'completed'` and sort `appointmentAt → routeMinutes → elapsedMs → endedAt → user`. The API handler does **not** return `result` in the payload today.
- `createResult` (table layer) already persists `record.result || 'completed'`; `PATCH /api/ops/results` already accepts `result`; the ops listing already returns it.
- `congrats-dialog.js` / `mission-failed-dialog.js` establish the accessible dialog pattern: `.congrats-overlay` + `.congrats-dialog`, `role="dialog"`, `aria-modal`, `aria-labelledby`, `tabindex="-1"`, managed focus, Escape.

## Changes by file

### `apps/experience/src/components/experience-timer.js`

- `mountExperienceTimer` creates a sibling `<button id="give-up-btn" type="button">` with `textContent = t('giveup.button')`, appended to `document.body` after the timer badge (fixed, below/right of it via CSS). Click → `requestAbandon()` (imported from `abandon-dialog.js`).
- `stopExperienceTimer` removes `#give-up-btn` too — the control's lifecycle is literally "while the run is live".
- After a mid-run reload the router remounts the timer → the button reappears for free.

### `apps/experience/src/components/abandon-dialog.js` (new)

Exports `requestAbandon()` plus the two dialogs. Same overlay pattern as `congrats-dialog.js`.

```js
export function requestAbandon() {
  showAbandonConfirm({
    onConfirm: () => finalizeAbandon(),
  });
}

function finalizeAbandon() {
  const session = getSession();
  if (!session?.startedAt) return;
  const endedAt = Date.now();
  const elapsedMs = endedAt - session.startedAt;
  stopExperienceTimer();
  // First recorded outcome only: a retry replay never resubmits.
  if (session.baselineMs == null && !session.abandoned) {
    submitResult({
      user: session.user,
      experienceId: session.experienceId,
      startedAt: new Date(session.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      elapsedMs,
      result: 'abandoned',
    });
  }
  setSession({ ...session, completedAt: endedAt, abandoned: true });
  showAbandonedDialog(elapsedMs);
}
```

- `showAbandonConfirm({ onConfirm })` — `.congrats-overlay` + `.congrats-dialog`, `aria-labelledby="giveup-title"`, two buttons in a `.metro-dialog-actions` row: confirm (`btn-primary`, `giveup.confirmYes`) and cancel (`btn-secondary`, `giveup.confirmNo`). Cancel/Escape removes the overlay and restores focus — nothing else.
- `showAbandonedDialog(elapsedMs)` — congrats-style dialog: `giveup.title` heading, `giveup.message`, `<p class="congrats-time">` with `congrats.time` + `formatElapsed`, one `btn-primary` (`congrats.close`, already "Ver ranking") → `navigate('#/ranking')`. Escape runs the same handler.

### `apps/experience/src/session/session.js`

- `getRanking` — filter widens to `r.result === 'completed' || r.result === 'abandoned'`; sort gains a leading weight term:

```js
const weight = (r) => (r.result === 'abandoned' ? 1 : 0);
.sort((a, b) =>
  weight(a) - weight(b) ||
  (a.appointmentAt ?? NO_SLOT).localeCompare(b.appointmentAt ?? NO_SLOT) ||
  (a.routeMinutes ?? NO_ROUTE) - (b.routeMinutes ?? NO_ROUTE) ||
  a.elapsedMs - b.elapsedMs ||
  a.endedAt.localeCompare(b.endedAt) ||
  a.user.localeCompare(b.user)
);
```

- `rankingWindow` needs no change — it anchors on the participant's best-positioned record whatever its result.
- The pending-results queue already resends the full record, so `result` survives offline retries for free.

### `apps/experience/src/screens/ranking.js`

- Row render: `const dnf = r.result === 'abandoned'` → `<tr class="${self ? 'ranking-self ' : ''}${dnf ? 'ranking-dnf' : ''}">`; user cell appends `<span class="ranking-dnf-badge">DNF</span>` + `<span class="sr-only">${t('ranking.dnfLabel')}</span>` when `dnf`.
- Retry button stays visible — a DNF session can replay (REQ-920-09). No new i18n needed there.

### `apps/experience/src/i18n/{es,en}.js`

| Key | es | en |
|-----|----|----|
| `giveup.button` | `Me rindo` | `I give up` |
| `giveup.confirmTitle` | `¿Seguro que quieres abandonar?` | `Are you sure you want to give up?` |
| `giveup.confirmMsg` | `Tu tiempo quedará registrado y la experiencia se marcará como no completada.` | `Your time will be recorded and the experience marked as not completed.` |
| `giveup.confirmYes` | `Sí, me rindo` | `Yes, I give up` |
| `giveup.confirmNo` | `Seguir intentándolo` | `Keep trying` |
| `giveup.title` | `Experiencia no completada` | `Experience not completed` |
| `giveup.message` | `Lo sentimos, no has completado la experiencia.` | `Sorry, you did not complete the experience.` |
| `ranking.dnfLabel` | `— experiencia no completada` | `— experience not completed` |

### `apps/experience/src/styles/main.css`

- `#experience-hud` — fixed column container (top-right, `z-index: 9999`) holding timer + `#give-up-btn` stacked with a gap — the button can never overlap the counter; same badge size/look; visible `:focus-visible` ring (critical for the blindfold flow).
- `.ranking-dnf td` — muted/dimmed (`opacity: .6` or muted color, keeps readability); `.ranking-dnf-badge` — small uppercase chip.

### `api/src/functions/public.js`

- `results` handler: read `body.result`; validate `undefined | 'completed' | 'abandoned'` else 400; pass `result: body.result || 'completed'` into `createResult`.
- `ranking` handler: filter `e.result === 'completed' || e.result === 'abandoned'` (missing `result` → excluded as today); sort gains the same leading `weight` term; map `result: e.result` into the payload.

### `apps/kiosk/src/presentation.js`

- `updateRow`: `const dnf = r.result === 'abandoned'` → `el.className` gains ` dnf`; user cell gets `<span class="k-dnf">DNF</span>`. No other logic touched — NEW/delta/celebration keep working on `user`+`endedAt` keys.

### `apps/kiosk/src/styles.css`

- `.k-row.dnf` dimmed; `.k-dnf` badge chip consistent with each theme (single neutral style is fine).

### `apps/kiosk/src/admin.js` (minor)

- Records table: append a `DNF` chip in the user cell when `r.result === 'abandoned'` — the ops listing already returns the field.

### Completion-path guards (3 files, one line each)

`checkout.js`, `metro.js`, `booking.js`: the submit branch becomes `session.baselineMs == null && !session.abandoned` — a post-DNF replay never converts the standing DNF into a completed record.

## Accessibility

- Give-up is a real button in document order (appended to `<body>` — last in tab order): visually on screen for moderators in every experience (BLIND BUY included), reachable by Tab and listed by SR element dialogs for the blindfolded participant. `aria-label` unnecessary — visible text is the name.
- Both dialogs copy the congrats pattern exactly: focus into the dialog on open, back to the invoker on close, Escape wired.
- DNF state is never color-only: badge text `DNF` + sr-only phrase in the app; text badge on the kiosk.
- `prefers-reduced-motion` untouched — no animations added.

## Edge cases

| Case | Result |
|------|--------|
| Reload mid-run | Router remounts the timer → button reappears |
| Abandon during retry (baseline or DNF recorded) | Dialogs show; nothing resubmitted |
| API offline on confirm | `submitResult` saves locally + queues to `faro-results-pending`; flushed on next ranking load |
| Old records without `result` | Treated as before (completed-only filter unchanged for missing values) |
| `result` field in ops PATCH | Already supported — no work |
| Ranking window anchor with only a DNF run | DNF record anchors the window like any record |
| DNF session → "Repetir misión" | Replays sighted/barrier-free as today; completion shows congrats diff-less (`baselineMs` stays `null` → single-time dialog) |

## Test plan

- `src/tests/abandon-experience.test.js` (new):
  - `getRanking`: DNF rows last, ordered by `elapsedMs`; completed order untouched.
  - `requestAbandon`: confirm → `submitResult` called with `result: 'abandoned'` shape + session flagged + timer stopped; cancel → no-op.
  - Replay after abandon → completion path does not resubmit.
  - `renderRanking`: DNF row has badge + sr-only cue; combined with `ranking-self`.
  - `mountExperienceTimer` mounts `#give-up-btn`; `stopExperienceTimer` removes it.
  - Final dialog navigates to `#/ranking`.
- `apps/kiosk/src/tests/kiosk.test.js` — `updateRow` renders DNF badge on abandoned rows.
- `api/tests` — `results` accepts `abandoned`, rejects unknown values; `ranking` ordering + `result` in payload (follow `table.test.js` fakes).
- Green: `npm test` (all three workspaces) + `npm run build`.
