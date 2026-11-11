# Spec: Give up — abandon a run and rank it as DNF

## Purpose

Every experience SHALL offer a "Me rindo" escape hatch while a run is in progress. After an accessible confirmation, the run SHALL be recorded with `result: 'abandoned'`, the participant SHALL see a closing dialog with their elapsed time and a "Ver ranking" action, and the ranking — in the app and on the kiosk — SHALL list abandoned runs after all completed ones, marked as not completed.

## Requirements

### REQ-920-01: Give-up control during the run
While the session timer is running, the app SHALL render a "Me rindo" button next to the timer overlay on every screen of every experience — including the blindfold experience, where it stays visually on screen for moderators and sighted viewers while remaining keyboard/screen-reader reachable for the participant. The control SHALL be a real `<button>` in the tab order with an accessible name, styled as external instrumentation (not as part of the fake experience UIs). It SHALL be removed when the timer stops.

### REQ-920-02: Confirmation before abandoning
Activating "Me rindo" SHALL open a modal confirmation dialog ("¿Seguro que quieres abandonar?") with confirm and cancel actions. Cancelling or pressing Escape SHALL resume the run with no side effects. Confirming SHALL trigger the abandon flow.

### REQ-920-03: Abandon recording
On confirmation, the app SHALL stop the timer and record the run via `submitResult` with `result: 'abandoned'` and the elapsed time (`elapsedMs`, `startedAt`, `endedAt` as usual — no mission metrics). The session SHALL be marked so a page reload does not resurrect the timer. If the session already has a recorded outcome (completed baseline or a previous abandon), the dialogs SHALL still show but no new result SHALL be submitted.

### REQ-920-04: Abandoned dialog
After recording, an accessible dialog (same overlay/focus pattern as the completion dialog) SHALL show the message "Lo sentimos, no has completado la experiencia", the elapsed time, and a "Ver ranking" button that navigates to `#/ranking`. Escape SHALL behave like the button.

### REQ-920-05: DNF ordering
`getRanking` (local) and `GET /api/ranking` (API) SHALL include records with `result === 'abandoned'` **after all completed runs**, ordered among themselves by elapsed time (then earlier end, then username). The relative order of completed runs SHALL NOT change.

### REQ-920-06: DNF marking in the ranking screen
Abandoned rows in `#/ranking` SHALL carry a `DNF` badge and a visually distinct (dimmed) row style, plus a screen-reader-only cue (e.g. "experiencia no completada") — color alone SHALL NOT be the only indicator. The marker SHALL compose with the participant's `ranking-self` highlight and the DNF run SHALL anchor the participant's ranking window when it is their best-positioned record.

### REQ-920-07: API contract
`POST /api/results` SHALL accept an optional `result` field restricted to `'completed'` or `'abandoned'`, defaulting to `'completed'` when absent; other values SHALL be rejected with 400. `GET /api/ranking` SHALL return the `result` field for each row and include abandoned runs at the tail of the list (subject to the existing 20-row cap when `all` is absent).

### REQ-920-08: DNF marking on the kiosk board
The kiosk SHALL render a `DNF` badge and a dimmed style for rows whose `result` is `'abandoned'`. Position labels, times, NEW/delta badges and the record-celebration logic SHALL behave as for any other row.

### REQ-920-09: Retry after abandoning
When the participant retries from the ranking after abandoning, the replay SHALL behave like a post-completion retry: no new result is submitted on completion or on a second abandon — the first recorded outcome stands.

### REQ-920-10: Offline parity
The local fallback path SHALL behave identically: abandoned runs are persisted locally, queued for API retry on failure like any result, and ranked DNF-last in `getRanking`.

## Scenarios

### Scenario: Participant gives up mid-run
- **Given** an active session with the timer running on any experience screen
- **When** the participant activates "Me rindo" and confirms
- **Then** the timer stops, a result with `result: 'abandoned'` and the elapsed time is recorded, and a dialog shows "Lo sentimos, no has completado la experiencia" with the time and "Ver ranking"

### Scenario: Cancel the confirmation
- **Given** the abandon confirmation dialog is open
- **When** the participant chooses "keep trying" or presses Escape
- **Then** the dialog closes, nothing is recorded, and the run continues

### Scenario: Abandoned run in the ranking
- **Given** 3 completed runs (02:00, 05:00, 09:00) and one abandoned run (03:00)
- **When** the ranking renders
- **Then** it shows positions 1–3 for the completed runs and position 4 for the DNF run, dimmed, with the DNF badge and the sr-only cue

### Scenario: DNF anchors the participant window
- **Given** 30 completed runs and a participant whose only run is abandoned at position 31
- **When** the ranking renders for that participant
- **Then** the window is clamped to the last 10 rows with the DNF row highlighted as theirs

### Scenario: Kiosk board shows DNF
- **Given** an experience with completed and abandoned runs within the top-20
- **When** the kiosk paints that board
- **Then** abandoned rows appear at the tail with a DNF badge and dimmed style

### Scenario: Retry after abandoning
- **Given** a session marked `abandoned`
- **When** the participant retries and completes the mission
- **Then** no new result is submitted — the DNF record remains their only standing

### Scenario: API rejects an unknown result value
- **Given** a `POST /api/results` payload with `result: 'cheated'`
- **When** the API validates it
- **Then** it responds 400 and stores nothing
