# Tasks: Comprehension — closest appointment wins

- [x] `bestSlotAt` helper in `data/hospital.js` (earliest free mission-valid slot)
- [x] `copy.js`: not-closest dialog title/message + keep-trying/finish buttons (obf + plain)
- [x] `hospital-dialog.js`: support a secondary action button
- [x] `booking.js`: non-optimal booking dialog (keep trying / finish) + `appointmentAt` on the result record
- [x] `experiences.js`: missionIntro updated — closest appointment wins, speed breaks ties
- [x] `session.js`: local ranking sorts by `appointmentAt` first
- [x] `ranking.js` + `i18n`: "Cita" column showing booked date+time
- [x] `shared/contract.js`: document `appointmentAt` in the record shape
- [x] `api/public.js` + `api/admin.js` + `lib/table.js`: accept, store, return and sort by `appointmentAt`
- [x] `apps/kiosk/src/presentation.js`: show appointment date+time for comprehension rows
- [x] Tests: closest-slot detection, keep-trying/finish dialog, sort order, ranking column, kiosk chip
- [x] Run experience + api + kiosk suites and builds
- [x] Write `apply-progress.md` and `verify-report.md`
