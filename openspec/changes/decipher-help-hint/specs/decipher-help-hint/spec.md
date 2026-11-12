# Spec: DECIPHER MODE — six-minute help hint

## Purpose

A comprehension run that reaches six minutes without completing SHALL trigger a one-time help dialog pointing the participant toward the suffix *-ALGIA* (pain-related specialties) — the clue that unlocks the correct specialty — while keeping the run, timer and scoring untouched.

## Requirements

### REQ-960-01: Timed trigger
When `Date.now() - session.startedAt >= 360000` (6 min) in an unfinished comprehension session, the hint dialog SHALL appear on the current hospital screen. If a screen renders while the session is already past six minutes, the dialog SHALL appear immediately on that screen.

### REQ-960-02: Dialog content and pattern
The dialog SHALL use the shared overlay/dialog classes (`congrats-overlay`, `congrats-dialog metro-dialog`), `role="dialog"`, `aria-modal="true"`, a labelled title (`Veo que necesitas ayuda.`), the hint body with `ALGIA` emphasised, and a single dismiss button (`btn.ok`). Focus SHALL move into the dialog on open and return to the previously focused element on close; Escape SHALL close it.

### REQ-960-03: Once per run
The hint SHALL fire at most once per session. A persisted `hintShown` flag SHALL prevent repeats across screen navigations and page reloads.

### REQ-960-04: Non-interference
The hint SHALL NOT pause the timer, end or alter the run, or affect the recorded result. It SHALL NOT fire during a replay session (`isReplaySession`), after the run has completed/abandoned, or outside the comprehension experience.

## Scenarios

### Scenario: Participant stuck past six minutes
- **Given** an active comprehension session started 6+ minutes ago
- **When** any hospital screen renders (or the threshold passes while on one)
- **Then** the dialog `Veo que necesitas ayuda.` appears once with the `lumbALGIA` hint

### Scenario: Fast participant
- **Given** a participant who completes the mission at 4 minutes
- **Then** no hint dialog ever appears

### Scenario: Reload at minute seven
- **Given** a session past six minutes where the hint was already shown
- **When** the page reloads and a hospital screen renders
- **Then** the dialog does not reappear
