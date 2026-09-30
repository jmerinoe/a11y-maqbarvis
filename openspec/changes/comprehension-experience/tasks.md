# Tasks: Experiencia Comprensión

- [ ] T1 — Registry: `comprehension` entry in `experiences.js` (locked, name, welcome/objective/mission texts, missionCard, mission config, homeRoute `#/hospital`)
- [ ] T2 — Model: `experiences/comprehension/data/hospital.js` — centers, specialties, date/hour generation, `isSlotFree`, `isAfternoon`, `isMissionAppointment`
- [ ] T3 — Copy: `experiences/comprehension/data/copy.js` — obf/plain registers for all hospital strings
- [ ] T4 — Screens: `screens/hospital.js` (home + obfuscated nav) and `screens/booking.js` (form, occupied/booked/mission flows)
- [ ] T5 — Styles: `styles/hospital.css` (hospital look, distinct from Faro/metro)
- [ ] T6 — Wiring: routes + page titles in `screens/index.js` and `i18n/{es,en}.js`
- [ ] T7 — Retry: `session.plainMode`, ranking retry sets it for comprehension, change-user resets it
- [ ] T8 — Tests: `comprehension.test.js` (model rules + full UI flow) + run full suite
- [ ] T9 — Docs: `apply-progress.md`, `verify-report.md`; build check
