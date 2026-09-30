# Verify Report: Experiencia Comprensión

## Verification steps

- `npm --prefix apps/experience test` → **22 files, 183 tests, all green**
- `npm --prefix apps/experience run build` → **OK** (Vite, 322 ms)

## Requirement coverage

| REQ | Covered by |
|-----|------------|
| REQ-880-01 registry + lock | `experiences.js` entry `locked: true`; existing pin-gate tests still pass (test now locks chromatic artificially); `comprehension.test.js` registry assertions |
| REQ-880-02 instructions parity | Shared `instructions.js` unchanged; missionCard rows = specialty/center/afternoon window; EN/ES copy in registry |
| REQ-880-03 obfuscated nav | `hospital.js` screen; test asserts the booking link text is the obfuscated label and href is `#/hospital/cita` |
| REQ-880-04 appointment form | `booking.js`: 30-day date select, 8:00–19:00 hourly select, specialty and center selects |
| REQ-880-05 availability | `isSlotFree` matrix test (odd day / weekend / odd hour busy) — stateless, no shared consumption |
| REQ-880-06 occupied message | Dialog test asserts "Indisponibilidad del recurso temporal", nothing booked |
| REQ-880-07 mission eval | `isMissionAppointment` unit test + UI test: off-mission booking confirms + keep-trying dialog + `completedAt` unset; mission booking completes |
| REQ-880-08 plain retry | `plainMode` session flag; test asserts retry sets it and the home renders "Pedir cita" instead of the obfuscated label; ES-only copy per owner decision |
| REQ-880-09 completion parity | Same `completeMission` pattern as metro (submitResult + baselineMs + congrats dialog `comprehension.congratsMessage`); no kiosk changes |

## Notes

- PIN for local dev: `VITE_ADMIN_PIN` (currently `1809` in `.env.development`, gitignored).
- Hospital site copy is Spanish-only (owner decision): the barrier is Spanish jargon, not translatable; EN i18n covers only shared chrome (page titles, congrats message).
- Booked slots stay available for everyone — availability is a pure function of date/hour.
