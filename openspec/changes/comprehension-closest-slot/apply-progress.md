# Apply progress: Comprehension — closest appointment wins

## What was done

- `data/hospital.js`: `slotAt(date, hour)` (`YYYY-MM-DDTHH:00`) and
  `bestSlotAt(days, mission)` — earliest free mission-valid slot.
- `data/copy.js`: `dialog.notClosestTitle/Msg`, `btn.keepTrying`,
  `btn.finish` in obf + plain registers.
- `components/hospital-dialog.js`: `showHospitalChoiceDialog` —
  two-button variant (keep trying / finish).
- `screens/booking.js`: mission-valid booking that is not the earliest
  available opens the choice dialog; `completeMission` now stores
  `appointmentAt` on the submitted record.
- `data/experiences.js`: `missionIntro` states the closest-appointment
  criterion and the elapsed-time tie-break.
- `session/session.js`: `getRanking` sorts `appointmentAt` (missing →
  last) → `routeMinutes` → `elapsedMs` → `endedAt` → `user`.
- `screens/ranking.js` + i18n: "Cita" column rendered when a row carries
  `appointmentAt` (`vie, 16 oct · 16:00`).
- `shared/contract.js`: `appointmentAt` documented on the record shape.
- `api/public.js` + `api/admin.js` + `api/lib/table.js`: accept, store,
  return and rank by `appointmentAt`.
- `apps/kiosk/src/presentation.js`: comprehension rows show a
  `CITA 16 OCT · 16:00` chip where chromatic shows the route chip.
- `styles/hospital.css`: `.hospital-dialog-actions` equal-width buttons.
- `tests/comprehension.test.js`: bestSlotAt, keep-trying/finish dialog,
  immediate completion on the closest slot, ranking order + column.

## Status

- REQ-900-01 closest-appointment ranking: implemented
- REQ-900-02 keep-trying / finish dialog: implemented
- REQ-900-03 `appointmentAt` end to end: implemented
- REQ-900-04 appointment in ranking + kiosk: implemented
- REQ-900-05 instructions updated: implemented
