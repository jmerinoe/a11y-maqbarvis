# Spec: Comprehension — closest appointment wins

## REQ-900-01 — Winner criterion: closest appointment

For the comprehension experience, completed results MUST be ranked by
the booked appointment slot, closest in the calendar first; records
whose slot is identical MUST be ordered by shorter elapsed time, then
earlier end, then username. Records without `appointmentAt` MUST rank
after those that carry it.

### Scenario: two participants

Given Ana booked the 20 Oct 18:00 slot and Bea booked the 16 Oct 16:00
slot, when the ranking renders, then Bea ranks above Ana regardless of
their elapsed times.

### Scenario: same slot

Given both booked the 16 Oct 16:00 slot, when the ranking renders, then
the shorter elapsed time ranks first.

## REQ-900-02 — Non-optimal valid booking offers keep-trying or finish

When a participant books a mission-valid slot that is not the earliest
available one, a dialog MUST offer "keep trying" (mission stays open,
timer keeps running) and "finish the experience" (completes the run
with that slot). Booking the earliest available mission-valid slot MUST
complete the run immediately, as before.

### Scenario: improvable booking

Given the earliest free mission slot is 16 Oct 16:00 and the
participant books 20 Oct 18:00, when the dialog appears, then choosing
"seguir intentándolo" keeps the run open and choosing "terminar"
completes the experience with the 20 Oct slot recorded as
`appointmentAt`.

## REQ-900-03 — `appointmentAt` end to end

The result record MUST include `appointmentAt` (`YYYY-MM-DDTHH:MM`)
for comprehension completions; the API MUST accept, persist and return
it; the ranking endpoint MUST sort by it.

## REQ-900-04 — Appointment shown in ranking and kiosk

The experience ranking table MUST show an appointment date+time column
when at least one row carries `appointmentAt`, and the kiosk MUST
display the appointment date+time on comprehension rows (in the same
slot where chromatic rows show the route chip). Both MUST keep showing
the elapsed test time.

## REQ-900-05 — Instructions updated

The comprehension mission instructions MUST state that the winner is
whoever obtains the closest appointment, with elapsed time breaking
ties.
