# Spec: Ranking window centered on the participant

## Purpose

After finishing the mission, the ranking screen SHALL show the participant's own position instead of always the global top-10: a 10-row window with the 4 participants ranked directly above and the 5 ranked directly below, clamped at both ends of the table.

## Requirements

### REQ-830-01: Window centered on the participant
When the active session's user has completed runs in the experience ranking, the ranking screen SHALL display a window of 10 rows containing their position: the 4 rows immediately above their best run and the 5 rows immediately below. If the participant's best run is in the top-10, the screen SHALL show rows 1–10. If it is among the last 10 positions, the screen SHALL show the last 10 rows. If the ranking has 10 or fewer runs, all rows SHALL be shown.

### REQ-830-02: Real positions
The position column SHALL display each row's real rank in the full ranking — never re-indexed within the window.

### REQ-830-03: Anchor on best run
When a participant has multiple completed runs, the window SHALL be centered on their best-ranked run. Every row belonging to that participant inside the window SHALL be visually highlighted.

### REQ-830-04: Accessible self indication
The participant's own row(s) SHALL carry a non-visual cue (screen-reader-only text, e.g. "tu posición") in addition to the visual highlight — color alone SHALL NOT be the only indicator.

### REQ-830-05: Fallback to top-10
With no active session, or when the participant has no completed run in the ranking, the screen SHALL keep the current top-10 behavior.

### REQ-830-06: Full ranking access
`GET /api/ranking` SHALL accept an optional `all=1` query parameter returning the complete sorted ranking. Requests without it SHALL return the identical payload as today (top-20 for the kiosk). The local fallback path (`getRanking`) SHALL expose the same `all` option.

### REQ-830-07: Kiosk untouched
No kiosk code, kiosk API usage, or the default `/api/ranking` response SHALL change.

## Scenarios

### Scenario: Mid-ranked participant
- **Given** 25 completed runs and participant "Ana" whose best run ranks 12th
- **When** the ranking screen renders
- **Then** it shows positions 8–17, with Ana's row highlighted and marked for screen readers

### Scenario: Top-10 participant
- **Given** participant ranked 6th of 30
- **When** the ranking renders
- **Then** it shows positions 1–10

### Scenario: Bottom-ranked participant
- **Given** participant ranked 28th of 30
- **When** the ranking renders
- **Then** it shows positions 21–30 with real numbers

### Scenario: Visitor without a run
- **Given** no session or a participant with no completed run
- **When** the ranking renders
- **Then** it shows the top-10 as before
