# Spec: Barrier-free replay — rename retry, drop timer, swap "Me rindo" for "Nuevo participante"

## Purpose

The post-outcome replay SHALL be presented as "Repetir misión sin barreras". While a replay is in progress, the run timer SHALL NOT be displayed and the "Me rindo" control SHALL NOT exist; in its place a "Nuevo participante" control SHALL be shown, which navigates to the experience picker.

## Requirements

### REQ-930-01: Retry action renamed
The ranking-screen retry button SHALL read "Repetir misión sin barreras" in Spanish and "Retry mission without barriers" in English. Its behaviour SHALL NOT change: it restarts the run with barrier-free flags already defined per experience.

### REQ-930-02: No timer during replay
Starting a replay SHALL NOT mount `#experience-timer` or any ticking overlay. The session `startedAt` SHALL still be refreshed so the completion dialog can report the replay's elapsed time and its diff against the recorded baseline.

### REQ-930-03: "Nuevo participante" replaces "Me rindo"
While a replay is in progress, the app SHALL render a replay HUD in the same fixed position previously occupied by the timer + "Me rindo" stack. The HUD SHALL contain a single `<button>` labelled "Nuevo participante" (reusing `ranking.newParticipant`). "Me rindo" and the abandon flow SHALL NOT be reachable during replay.

### REQ-930-04: "Nuevo participante" navigation
Activating the HUD button SHALL navigate to `#/experiences`. The existing router rule (arriving at the picker with an active session stops the HUD and clears the session) SHALL apply — no additional teardown logic is required.

### REQ-930-05: Reload-safe replay mode
After a page reload, an in-progress session (`startedAt && !completedAt`) SHALL restore the replay HUD when the session's first outcome was already recorded (`baselineMs != null || abandoned === true`); otherwise it SHALL restore the normal timer + "Me rindo" HUD.

### REQ-930-06: First run unchanged
A first (non-replay) run SHALL keep the current HUD: visible timer and "Me rindo" button on every screen while the run is in progress.

### REQ-930-07: Replay completion unchanged
Completing a mission during replay SHALL keep current behaviour: timer/HUD teardown, congrats dialog with elapsed time and baseline diff, no result resubmission.

## Scenarios

### Scenario: Replay from the ranking
- **Given** a participant who completed a run and is on `#/ranking`
- **When** they activate "Repetir misión sin barreras"
- **Then** the experience restarts barrier-free, no timer is displayed, and a HUD shows only "Nuevo participante"

### Scenario: Leaving the replay for a new participant
- **Given** an in-progress replay with the "Nuevo participante" HUD
- **When** the participant activates the button
- **Then** the app navigates to `#/experiences` and the session is cleared

### Scenario: Reload mid-replay
- **Given** an in-progress replay (baseline recorded)
- **When** the page reloads
- **Then** the "Nuevo participante" HUD is restored and neither the timer nor "Me rindo" appears

### Scenario: First run still shows timer and give-up
- **Given** a participant starting their first run from `#/instructions`
- **When** the experience begins
- **Then** the timer and "Me rindo" render as before
