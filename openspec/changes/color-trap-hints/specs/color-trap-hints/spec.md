# Spec: COLOR TRAP — progressive route hints every 3 minutes

## Purpose

An unfinished chromatic first run SHALL reveal one leg of the optimal route every three minutes (at 3, 6, 9, 12, 15 and 18 elapsed minutes), in order, through the shared accessible dialog — helping stuck participants without pausing the timer or touching the result.

## Requirements

### REQ-970-01: Hint schedule
Hint *n* (n = 1…6) SHALL fire when `Date.now() - session.startedAt >= n × 180000`. If a screen renders while a hint's threshold already passed, that hint SHALL fire immediately; subsequent hints still follow the 3-minute cadence from `hintCount`.

### REQ-970-02: Legs come from the optimal route
Hint *n* SHALL display leg *n* of the optimal route San Nicasio → Aeropuerto T4, computed by `optimalRouteLegs` from the live metro graph (Dijkstra, same rules as `optimalRouteMinutes`: interrupted lines and cut stations excluded, restricted-line multiplier applied). Expected result today: 6 legs / 50 min.

### REQ-970-03: Dialog pattern
Each hint SHALL use `congrats-overlay chromatic-scope` + `congrats-dialog metro-dialog`, `role="dialog"`, `aria-modal`, labelled title (`Veo que necesitas ayuda.`), the numbered leg in `<strong>`, one dismiss button, focus moved in on open and restored on close, Escape closes.

### REQ-970-04: Ordering and persistence
A persisted `hintCount` on the session SHALL record how many hints were shown; hints SHALL always appear in leg order and at most once each, across navigation and reloads.

### REQ-970-05: Non-interference
Hints SHALL NOT pause the timer, end the run, add tramos to the participant's route, or affect the result. They SHALL NOT fire during replay, after completion/abandonment, or outside the chromatic experience; while another dialog is open the hint SHALL wait rather than stack.

## Scenarios

### Scenario: Stuck participant
- **Given** an active chromatic session started 3+ minutes ago with no hints shown
- **When** the metro screen renders or the threshold passes mid-screen
- **Then** a dialog shows `L12 · San Nicasio → Puerta del Sur` once; at minute 6 the next leg appears

### Scenario: Fast participant
- **Given** a participant who completes at 4 minutes having seen one hint
- **Then** exactly one hint was shown and the result is unaffected

### Scenario: Reload at minute seven
- **Given** `hintCount = 1` persisted and the page reloaded
- **When** the metro screen renders
- **Then** hint 2 fires immediately (its 6-minute threshold already passed)
