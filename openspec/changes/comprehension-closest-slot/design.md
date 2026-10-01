# Design: Comprehension — closest appointment wins

## Data model

New optional field on the result record, mirroring `routeMinutes`:

```
appointmentAt: string — "YYYY-MM-DDTHH:MM" local time of the booked slot
```

Carried end to end: `submitResult` → `apiSubmitResult` →
`POST /api/results` (validate optional string) → `table.js` entity →
`GET /api/ranking` response → kiosk/experience rows. The local-storage
path stores it verbatim.

## Booking flow (booking.js)

After `isMissionAppointment` passes and the slot is free:

1. Compute `bestSlotAt` — the minimum `date+hour` combination among all
   mission-valid slots that are also free
   (`isMissionDate ∧ isAfternoon ∧ isSlotFree`, iterate
   `appointmentDays() × HOURS` and pick the smallest ISO string).
2. If the booked slot **equals** `bestSlotAt` → `completeMission` as
   today, with `appointmentAt` on the record.
3. If the booked slot is mission-valid but later → new dialog with two
   buttons: "Seguir intentándolo" (closes the dialog, timer keeps
   running) and "Terminar la experiencia" (completes with that slot).
   Reuses `showHospitalDialog`-style chrome extended with an action
   row; copy exists in obf + plain registers.

Because bookings are stateless, re-booking an improved slot simply
replaces the pending completion — nothing is undone.

## Ranking sort

Both the local `getRanking` and the API ranking comparator gain a
`appointmentAt` primary key for records that carry it:

```
(a.appointmentAt ?? ∞) - (b.appointmentAt ?? ∞)   // closest first
|| (a.routeMinutes ?? ∞) - (b.routeMinutes ?? ∞)   // chromatic unchanged
|| a.elapsedMs - b.elapsedMs
|| endedAt, user
```

Strings compare correctly since the format is fixed-width ISO. A record
with `appointmentAt` and one without never mix within a single
experienceId — comprehension rows always carry it after this change.

## Display

- **Experience ranking table**: new column "Fecha y hora de la cita"
  rendered when any row has `appointmentAt` (same conditional pattern
  as `routeMinutes`). Format: `jue, 16 oct · 16:00` via `fmtDate` +
  hour; elapsed time column stays.
- **Kiosk row**: comprehension rows show `CITA 16/10 16:00` where
  chromatic shows `RUTA n MINS`; elapsed time stays at the end.

## Instructions

`missionIntro` updated: the goal is now the **closest** appointment —
"Gana quien consiga la cita más próxima; a igual fecha y hora, quien la
reserve más rápido." The mission card is unchanged (it still lists the
mission constraints).

## i18n keys

- `ranking.appointment` — "Cita" / "Appointment" column header.
- `comprehension.congratsMessage` unchanged.
- New dialog copy `dialog.notClosestTitle`/`notClosestMsg` +
  `dialog.keepTrying`/`dialog.finish` buttons in `copy.js` (obf/plain).

## Files

- `apps/experience/src/experiences/comprehension/data/hospital.js` —
  `bestSlotAt(days, mission)` helper.
- `apps/experience/src/experiences/comprehension/data/copy.js` — dialog
  copy.
- `apps/experience/src/experiences/comprehension/components/hospital-dialog.js`
  — optional action buttons support.
- `apps/experience/src/experiences/comprehension/screens/booking.js` —
  non-optimal dialog + `appointmentAt` on the record.
- `apps/experience/src/session/session.js` — local ranking sort.
- `apps/experience/src/screens/ranking.js` — appointment column.
- `apps/experience/src/i18n/es.js`, `en.js` — header label.
- `shared/contract.js` — record shape doc.
- `api/src/functions/public.js` — accept + return `appointmentAt`,
  sort by it.
- `api/src/functions/admin.js` — pass-through + PATCH support.
- `api/src/lib/table.js` — store the field.
- `apps/kiosk/src/presentation.js` — appointment chip.
- Tests: comprehension booking outcomes, ranking sort, kiosk row.
