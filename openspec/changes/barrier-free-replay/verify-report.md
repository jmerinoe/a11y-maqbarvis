# Verify report: Barrier-free replay

## Requirements coverage

| Req | Status | Evidence |
|---|---|---|
| REQ-930-01 Retry renamed | ✅ | `ranking.retry` = "Repetir misión sin barreras" / "Retry mission without barriers"; test asserts the new label |
| REQ-930-02 No timer in replay | ✅ | Retry handler mounts `mountReplayHud()`; test asserts `#experience-timer` absent; `startedAt` still refreshed |
| REQ-930-03 "Nuevo participante" replaces "Me rindo" | ✅ | Replay HUD = single `#replay-new-participant` button; test asserts `#give-up-btn` absent |
| REQ-930-04 Navigation to picker | ✅ | Button → `navigate('#/experiences')`; existing router rule stops HUD + clears session; covered by test |
| REQ-930-05 Reload-safe | ✅ | `restoreSessionHud()` branches on `isReplaySession`; tests cover replay-restore and first-run-restore |
| REQ-930-06 First run unchanged | ✅ | `mountExperienceTimer` untouched; first-run restore test asserts timer + give-up present |
| REQ-930-07 Replay completion unchanged | ✅ | Completion paths not modified; existing diff/no-resubmit tests still green |

## Test run

- `apps/experience`: **23 files / 212 tests — all green** (vitest, jsdom).
- No API or kiosk changes required (behaviour is app-local).

## Known limitations / notes

- `mountReplayHud` imports `navigate` from `router.js`, which already imports this module — circular but safe (both only dereference exports inside function bodies).
- The replay HUD reuses `#experience-hud`, so any code path calling `stopExperienceTimer()` (completion dialogs, ranking render, picker guard) cleans it up with no extra work.
