# Proposal: Barrier-free replay — rename retry, drop timer, swap "Me rindo" for "Nuevo participante"

## Why

The ranking screen offers a post-outcome replay ("Repetir misión y comprobar barreras") so participants can re-run the experience with the accessibility barrier lifted — colour in the metro, plain language in the hospital — and compare against their recorded time. Three things about that replay mode are wrong:

1. **The name is misleading.** "Comprobar barreras" suggests inspecting barriers; the actual product is a barrier-*free* re-run ("sin barreras").
2. **The timer is still shown.** A replay records nothing — `baselineMs`/`abandoned` guards already prevent resubmission — so a ticking clock only pressures the participant for no reason. The run should feel relaxed and exploratory.
3. **"Me rindo" makes no sense in a replay.** There is nothing to abandon: the outcome was already recorded. The useful escape hatch is leaving for the next participant — a "Nuevo participante" action that returns to the experience picker.

## What Changes

### Scope

1. **Rename the retry action** — `ranking.retry` becomes "Repetir misión sin barreras" (es) / "Retry mission without barriers" (en). Behaviour unchanged: same handler, same barrier-free flags (`plainMode` for comprehension, revealed colours for chromatic).
2. **No timer during replay** — the retry handler stops mounting `#experience-timer`. The session `startedAt` is still refreshed internally so the completion dialog can keep showing the elapsed time and the diff vs the baseline run.
3. **Replay HUD** — a new body-level HUD (`#experience-hud`, same fixed dark-badge look) replaces the timer+give-up stack during replay. It contains a single "Nuevo participante" button which navigates to `#/experiences`. Reaching the picker already stops the HUD and clears the session via the existing router rule, so no extra teardown is needed.
4. **Reload-safe replay mode** — `initRouter` resurrects the run HUD after a reload when `startedAt && !completedAt`. It now branches: a session whose outcome was already recorded (`baselineMs != null || abandoned`) mounts the replay HUD; a first-run session mounts the timer as today.
5. **i18n** — update `ranking.retry` (es/en). The HUD button reuses the existing `ranking.newParticipant` key ("Nuevo participante" / "New participant").

### Out of scope

- No changes to the first run: timer + "Me rindo" stay exactly as they are.
- No changes to the ranking screen itself — its "Nuevo participante" primary button already exists and is untouched.
- No changes to what "barrier-free" means per experience (colours revealed, plain language) — that logic already exists.
- No changes to results, ranking order, DNF handling, the kiosk, or the API.
- The mission-failed "Volver a empezar" flow is a different path and keeps its current behaviour.

## How

### Replay detection (no new session field)

A session in replay mode is already identifiable: its first outcome was recorded.

```js
// session.js
export function isReplaySession(session) {
  return session != null && (session.baselineMs != null || session.abandoned === true);
}
```

- First run: neither flag set → timer HUD.
- Retry after completing: `baselineMs` set → replay HUD.
- Retry after abandoning: `abandoned` set → replay HUD.
- Replay completed again: `completedAt` set → nothing mounts (terminal state).

### Component changes

- `apps/experience/src/components/experience-timer.js` — add `mountReplayHud()`: builds `#experience-hud` with one button (`#replay-new-participant`, label `t('ranking.newParticipant')`) → `navigate('#/experiences')`. No interval. `stopExperienceTimer()` already removes `#experience-hud`, so cleanup is free — it also covers the completion dialogs that call it.
- `apps/experience/src/screens/ranking.js` — retry handler calls `mountReplayHud()` instead of `mountExperienceTimer(startedAt)`; `startedAt` keeps being refreshed for the dialog diff.
- `apps/experience/src/router.js` — the reload-restore branch picks `mountReplayHud()` when `isReplaySession(session)`, else `mountExperienceTimer`.
- `apps/experience/src/i18n/{es,en}.js` — new `ranking.retry` copy.

## Assumptions

- The replay HUD button reads "Nuevo participante" and lands on `#/experiences`, mirroring the ranking button (which clears the session through the router rule). No confirmation step — it is a navigation, not a destructive record.
- The timer still runs internally (`startedAt` refreshed on retry) so the replay completion dialog can show elapsed + diff vs baseline; it is simply not displayed.
- The replay HUD keeps the same fixed top-right dark-badge position so moderators notice the mode change at a glance.

## Risks

- **Reload during replay**: covered by the `isReplaySession` branch in `initRouter`; without it the timer+give-up would resurrect.
- **Abandoned-then-retry**: `abandoned` survives on the session → correctly detected as replay; completing still cannot resubmit (existing guard).
- **Blindfold experience**: the HUD button is visually present for moderators and keyboard/screen-reader reachable, same posture as "Me rindo" had.
