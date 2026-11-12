# Design: Barrier-free replay

## Current state

- `ranking.js` retry handler: refreshes `startedAt`, sets `plainMode` for comprehension, clears `tramos`, calls `mountExperienceTimer(startedAt)`, navigates to the experience home. The mounted HUD is `#experience-hud` = timer badge + `#give-up-btn`.
- `initRouter` (router.js:129): after reload, `session.startedAt && !session.completedAt` → `mountExperienceTimer(session.startedAt)`.
- `handleRouteChange` (router.js:81): landing on `#/experiences` with a session → `stopExperienceTimer()` + `clearSession()`.
- Replays never resubmit: completion paths guard on `baselineMs == null && !abandoned`; the abandon path has the same guard.
- Barrier-free flags already exist: chromatic lifts grayscale when `completedAt || baselineMs != null`; comprehension switches to plain copy when `plainMode`.

## Changes file by file

### `apps/experience/src/components/experience-timer.js`

Add `mountReplayHud()`:

```js
export function mountReplayHud() {
  stopExperienceTimer();
  const hud = document.createElement('div');
  hud.id = 'experience-hud';
  const btn = document.createElement('button');
  btn.id = 'replay-new-participant';
  btn.type = 'button';
  btn.textContent = t('ranking.newParticipant');
  btn.addEventListener('click', () => navigate('#/experiences'));
  hud.appendChild(btn);
  document.body.appendChild(hud);
}
```

- Reuses `#experience-hud` (same fixed position/style) so `stopExperienceTimer()` removes it for free — including from the completion paths that already call it.
- No interval is started.

### `apps/experience/src/session/session.js`

Add `isReplaySession(session)`:

```js
export function isReplaySession(session) {
  return session != null && (session.baselineMs != null || session.abandoned === true);
}
```

Derived, not stored — the flags already persist in localStorage with the session.

### `apps/experience/src/screens/ranking.js`

- Retry handler: replace `mountExperienceTimer(startedAt)` with `mountReplayHud()`. Keep `setSession({ ...session, startedAt, completedAt: undefined, plainMode })` — `startedAt` still feeds the elapsed/diff shown by the congrats dialog.
- Update the code comment (timer no longer mounts; replay HUD does).

### `apps/experience/src/router.js`

- `initRouter` restore branch:

```js
if (session?.startedAt && !session.completedAt) {
  if (isReplaySession(session)) mountReplayHud();
  else mountExperienceTimer(session.startedAt);
}
```

### `apps/experience/src/i18n/es.js` / `en.js`

- `ranking.retry`: `'Repetir misión sin barreras'` / `'Retry mission without barriers'`.
- HUD button reuses `ranking.newParticipant` — no new key needed.

## Accessibility

- The HUD button is a real `<button>` in the tab order with a text label — same posture "Me rindo" had (visible for moderators, keyboard/screen-reader reachable in BLIND BUY).
- No timer means no live-updating region during replay — strictly less noise for screen readers.
- The HUD keeps the dark-badge external-instrumentation look so it is not mistaken for part of the fake UIs.

## Edge cases

| Case | Behaviour |
|---|---|
| Retry after completion | `baselineMs` set → replay HUD; reload-safe |
| Retry after abandon | `abandoned` set → replay HUD; completion still cannot resubmit |
| Replay finished again | `completedAt` set → no HUD on reload; ranking reachable |
| "Nuevo participante" during replay | `#/experiences` → existing rule stops HUD + clears session |
| First run | unchanged: timer + "Me rindo" |

## Test plan

- `retry-mission.test.js`: update — retry mounts the replay HUD, no `#experience-timer`, no `#give-up-btn`; button label assertions still match the new copy.
- New cases: replay HUD button navigates to `#/experiences` and clears the session; `initRouter`-style restore mounts replay HUD when `baselineMs`/`abandoned` is set and the normal timer otherwise.
- i18n text: the retry button contains "Repetir misión sin barreras".
