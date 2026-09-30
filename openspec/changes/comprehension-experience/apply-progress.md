# Apply Progress: Experiencia Comprensión

| Task | Status | Notes |
|------|--------|-------|
| T1 Registry entry | Done | `experiences.js`: `comprehension` locked, mission { Algología, Hospital Vega Norte, 15–20 }, missionCard 3 rows, ES/EN instructions |
| T2 Hospital model | Done | `data/hospital.js`: 4 centers, 7 specialties, `nextDays(30)`, `isSlotFree` (odd day / weekend / odd hour), `isAfternoon`, `isMissionAppointment` |
| T3 Copy registers | Done | `data/copy.js`: `{obf, plain}` per key, ES-only; `pickCopy(key, plainMode)` |
| T4 Screens | Done | `screens/hospital.js` (home + obfuscated nav, booking link hidden among jargon items, hospital SVG imagery), `screens/hospital-info.js` (nosotros/servicios/contacto pages sharing the chrome via `components/hospital-shell.js`) and `screens/booking.js` (4-select form, required validation, occupied/off-target/mission flows); `components/hospital-dialog.js` (accessible info dialog following the metro-dialog pattern). Services list reveals "Algología" only in plain mode |
| T5 Styles | Done | `styles/hospital.css` — teal hospital palette; linked from `index.html` |
| T6 Wiring | Done | `router.js` (`#/hospital`, `#/hospital/cita`, session-guarded, homeRoute mapping), `screens/index.js` renderers + page titles, i18n keys + `comprehension.congratsMessage` |
| T7 Retry | Done | `ranking.js`: retry sets `session.plainMode = true` for comprehension; `clearSession` (change user) resets it implicitly |
| T8 Tests | Done | `comprehension.test.js`: 10 tests (registry, availability matrix, mission check, obf nav, plain mode, required fields, occupied dialog, off-target keep-trying, mission success, retry→plainMode). Suite: 22 files / 183 tests green |
| T9 Docs | Done | This file + verify-report; `npm run build` OK |
