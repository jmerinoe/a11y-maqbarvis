# Apply progress: Barrier-free replay

## M1 — HUD + detection ✅

- `apps/experience/src/session/session.js` — added `isReplaySession(session)` (`baselineMs != null || abandoned === true`), derived from flags already persisted with the session.
- `apps/experience/src/components/experience-timer.js` — added `mountReplayHud()`: mounts `#experience-hud` with a single `#replay-new-participant` button (`t('ranking.newParticipant')`) → `navigate('#/experiences')`. No interval; `stopExperienceTimer()` removes it via the shared `#experience-hud` id.
- `apps/experience/src/i18n/es.js` / `en.js` — `ranking.retry` → "Repetir misión sin barreras" / "Retry mission without barriers".

## M2 — Wire replay mode ✅

- `apps/experience/src/screens/ranking.js` — retry handler now calls `mountReplayHud()` instead of `mountExperienceTimer(startedAt)`; `startedAt` keeps being refreshed for the completion-dialog diff.
- `apps/experience/src/router.js` — reload-restore extracted into exported `restoreSessionHud()`; it mounts `mountReplayHud()` for replay sessions and `mountExperienceTimer()` otherwise. `initRouter` delegates to it.

## M3 — Tests ✅

- `retry-mission.test.js` updated + extended: replay mounts the HUD (no `#experience-timer`, no `#give-up-btn`), new retry copy asserted, HUD button exits to picker and clears the session, `restoreSessionHud` covers replay vs first-run restore, `isReplaySession` covers the abandoned-session case.
- Suite: 23 files / 212 tests green.

## M4 — Docs ✅

- This file + `verify-report.md`.
