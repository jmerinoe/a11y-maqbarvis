# Proposal: Comprehension — closest appointment wins

## Why

The comprehension experience currently ranks purely by elapsed time:
any mission-valid booking ends the run, so grabbing the first free slot
found is optimal. The intended challenge is subtler — participants must
discover the availability pattern and reach for the **earliest possible
appointment**, not just any valid one.

## What changes

- **New winner criterion (comprehension only)**: the participant whose
  booked appointment is closest in the calendar wins; ties are broken
  by shorter elapsed time, then earlier end, then username.
- **Non-optimal valid booking**: a mission-valid slot that is NOT the
  earliest available opens a dialog offering two choices —
  "keep trying" (mission stays open, timer keeps running) or "finish"
  (the run completes with that slot). The earliest available
  mission-valid slot completes immediately, as today.
- **Result record**: gains `appointmentAt` (ISO `YYYY-MM-DDTHH:00`) for
  comprehension completions; API validation/storage/ranking pass it
  through, exactly like `routeMinutes` for chromatic.
- **Ranking (experience app)**: rows with `appointmentAt` show the
  appointment date+time column and are ordered closest-first.
- **Kiosk**: comprehension rows show the appointment date+time in place
  of the chromatic "RUTA x MINS" chip, plus the elapsed time.
- **Instructions**: mission text updated to say the goal is booking the
  closest possible appointment, with speed as the tie-breaker.

## Out of scope

- Availability rules, mission targets (Algología, Vega Norte,
  afternoon, second fortnight of October) and dialogs stay as they are.
- Legacy comprehension results without `appointmentAt` rank after
  records that carry it.
- Other experiences unchanged.
