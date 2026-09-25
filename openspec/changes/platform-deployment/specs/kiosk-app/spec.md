# Spec: Kiosk application

## ADDED Requirements

### REQ-KIOSK-01: Presentation mode
The kiosk default view (`/kiosko`) shows a fullscreen ranking: large typography, Panel branding, position/user/elapsed-time columns, last-updated indicator.

### REQ-KIOSK-02: Automatic experience rotation
When multiple experiences have results, the kiosk rotates through their rankings every ~10 seconds. With a single experience, it stays on it. With zero results, it shows an empty state.

### REQ-KIOSK-03: Polling refresh
The kiosk fetches `GET /api/experiences` and `GET /api/ranking?experienceId=` every ~15 seconds and re-renders without user interaction.

### REQ-KIOSK-04: Admin mode entry
`#/admin` inside the kiosk shows a PIN gate. Correct PIN stores a flag in `sessionStorage` and opens the admin panel. Wrong PIN shows an error. Subsequent visits skip the gate while the session persists.

### REQ-KIOSK-05: Admin results management
Admin shows all results (across experiences, or filtered). Each row: position fields (user, experienceId, elapsed time, endedAt), edit and delete actions. Add-record form creates manual entries.

### REQ-KIOSK-06: Ranking reset
Admin offers "Reset this experience" (clears one partition) and "Reset all" (global). Both require a confirmation step.

### REQ-KIOSK-07: Accessibility
The kiosk app is fully accessible — no intentional traps. It is operated by facilitators and viewed on a big screen.

### REQ-KIOSK-08: Offline/API-failure resilience
If the API is unreachable, presentation mode shows a visible "connection lost" state and keeps retrying; it does not show stale data as fresh (last-updated timestamp ages visibly).
