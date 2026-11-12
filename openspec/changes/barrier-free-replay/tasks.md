# Tasks: Barrier-free replay

## M1 — HUD + detection

- [ ] `session.js`: add `isReplaySession(session)`
- [ ] `experience-timer.js`: add `mountReplayHud()` (single "Nuevo participante" button in `#experience-hud`, navigates to `#/experiences`)
- [ ] `i18n es/en`: `ranking.retry` → "Repetir misión sin barreras" / "Retry mission without barriers"

## M2 — Wire replay mode

- [ ] `ranking.js`: retry handler mounts `mountReplayHud()` instead of `mountExperienceTimer()`; update comment
- [ ] `router.js`: `initRouter` restore branch → `isReplaySession(session) ? mountReplayHud() : mountExperienceTimer(...)`

## M3 — Tests

- [ ] Update `retry-mission.test.js` (replay HUD, no timer/give-up, new button copy)
- [ ] Add: HUD button → `#/experiences` + session cleared; reload-restore picks replay HUD for recorded sessions
- [ ] Full `apps/experience` suite green

## M4 — Docs

- [ ] `apply-progress.md` + `verify-report.md` in this change folder
