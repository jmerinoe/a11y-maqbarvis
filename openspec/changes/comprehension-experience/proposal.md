# Proposal: Experiencia Comprensión (third workshop experience)

## Why

The workshop covers visual (chromatic) and non-visual (screen-reader) barriers but does not yet address **cognitive/language barriers**: interfaces written in needlessly bureaucratic, convoluted language that forces the user to constantly decode what each element means. This evolution adds a third participant experience — **"Experiencia Comprensión"** — that simulates a private hospital website whose appointment-booking flow is buried behind obfuscated navigation, jargon-heavy buttons, convoluted error messages and negation-laden instructions.

## What Changes

### Scope — new experience `comprehension`

1. **Registry entry** — third card in `#/experiences`, ES name *"Experiencia Comprensión"*. Entry is **locked** (`locked: true`) behind the existing admin-PIN gate (PIN `1809` locally via `VITE_ADMIN_PIN`, `ADMIN_PIN` in Azure).
2. **Instructions** — same shared structured layout as the other experiences (welcome, objective, mission, mission card, Continuar → timer starts).
3. **Hospital website** — a fictional private hospital group site ("Grupo Hospitalario Meridian Salud") with:
   - Marketing home page with **obfuscated navigation**; the appointment entry point is intentionally hard to find (e.g. *"Formalización de encuentros asistenciales programados"*).
   - **Appointment form**: date (next 30 days), hour, specialty and center selects — all labelled in bureaucratic jargon.
4. **Deterministic availability** — slot = 1 hour. A slot is **occupied** when: the day-of-month is odd, OR the date falls on weekend, OR the start hour is odd. Everything else is free. Availability is **per-participant and stateless**: bookings made by other participants do NOT consume slots, and the participant's own attempts do not consume slots either.
5. **Occupied feedback** — requesting an occupied slot shows an obfuscated "not available" message; nothing is booked.
6. **Mission** — book an appointment for a specific pain condition: specialty **Algología**, at a **specific named center** (mission card states it), **in the afternoon** (15:00–20:00, stated in the instructions). Success = booked slot matching specialty + center + start hour in the afternoon window + slot free.
   - Available-but-wrong booking (morning, wrong specialty, wrong center) → booked successfully but a mission-failed dialog explains the mismatch; the timer keeps running.
   - Winner = shortest completion time (standard ranking).
7. **Barrier language engine** — every hospital UI string exists in two registers: **obfuscated** (bureaucratic jargon, negations, convoluted errors) and **plain** (clear Spanish). First attempt always runs obfuscated. Retry from ranking sets a `plainMode` session flag → the whole site renders in plain language ("repeat without barriers").
8. **Completion flow parity** — success shows the shared congrats dialog (experience-specific message), then the ranking window with retry and change-user options.

### Out of scope

- Shared/booked-slot state across participants (explicitly dropped: bookings stay available for everyone).
- New API endpoints — no backend changes needed.
- Kiosk changes (rotation/ranking pick up the new `experienceId` automatically).
- Changes to the two existing experiences.

## How

### Architecture approach

1. **`experiences/comprehension/`** — new folder following the established convention: `data/` (hospital model: specialties, centers, slot rules; copy registers), `screens/` (hospital home, booking form, confirmation), `styles/hospital.css`.
2. **Router/screens** — register `#/hospital` (and sub-routes) in `screens/index.js` + page titles.
3. **Copy registers** — a single dictionary `copy.js` with `{ obf, plain }` string pairs; screens render `copy(plainMode ? 'plain' : 'obf', key)`. Plain mode also simplifies labels, hints and error messages.
4. **Availability** — pure function `isSlotFree(dateIso, hour)` implementing the odd-day/weekend/odd-hour rules; unit-testable.
5. **Mission check** — `isMissionAppointment({specialty, center, hour})` against the experience's `mission` config in `experiences.js` (specialty `Algología`, named center, 15:00–19:00 start hours).
6. **Session** — `plainMode` flag in session state, set by ranking retry for this experience; cleared on user change.
7. **Tests** — `comprehension.test.js` covering: registration/lock, availability rules, booking flow, occupied message, wrong-target fail, mission success + congrats, plain-mode retry, instructions/mission-card content.

### Delivery

Single PR strategy; implementation split across new files plus small touches to `experiences.js`, `screens/index.js`, i18n tables and ranking retry.

## Assumptions

- "Por la tarde" = appointment **start** hour within 15:00–19:00 (last slot ends 20:00); stated in instructions.
- The required center is one named invented center, fixed in mission config and shown on the mission card.
- Booking an available-but-non-mission appointment counts as a failed attempt (dialog), not as a hard failure — same precedent as the metro "too slow" dialog.
- Obfuscated copy is the *product* of the experience; keeping it accessible in structure (real labels, focusable controls) is intentional — the barrier is comprehension, not markup.

## Risks

| Risk | Mitigation |
|------|------------|
| Obfuscated labels could make selects unusable for AT users too | Structural accessibility is preserved (real `<label>`, keyboard); only the *text* is jargon — which is precisely the barrier being taught |
| Participants may brute-force slot combinations | Deterministic rules are discoverable through the obfuscated hints; brute force costs time, which is the ranking metric anyway |
| Plain mode could leak into first attempts | `plainMode` is only set by the ranking retry path and is reset when changing user |
