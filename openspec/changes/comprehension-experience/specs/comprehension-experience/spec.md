# Spec: Experiencia Comprensión (third workshop experience)

## Purpose

A third participant experience simulating **language/comprehension barriers**: a private hospital website written in bureaucratic, convoluted Spanish that forces users to decode navigation, buttons, errors and instructions. Mission: book an appointment in **Algología** at a specific named center, **in the afternoon** (15:00–20:00), under deterministic availability rules.

## Requirements

### REQ-880-01: Third experience entry

The registry SHALL include `comprehension` (ES "Experiencia Comprensión") marked `locked: true`, entering through the existing admin-PIN gate. It SHALL get instructions, timing and ranking automatically via shared flows. The instructions SHALL state the afternoon window (15:00–20:00).

### REQ-880-02: Instructions and timer parity

The instructions screen SHALL reuse the shared structured layout (welcome, objective, mission, mission card, Continuar). The mission card SHALL show the required clinic as **"Consulta del Dolor"** (the specialty name Algología SHALL NOT be revealed — mapping it to the form's specialty is part of the challenge), the required center name, and the afternoon window. The instructions SHALL NOT reveal the availability rules — discovering occupied slots is part of the experience. The timer SHALL start only on Continuar.

### REQ-880-03: Hospital site with obfuscated navigation

`#/hospital` SHALL render a fictional private hospital home page whose main navigation uses non-intuitive, bureaucratic names organised as **two-level menus**: each top-level item opens a dropdown of second-level links to real informational pages. The appointment-booking entry point SHALL be one of those nested links — deliberately hard to identify. The home SHALL display realistic hospital photography, invented branding/logo, quick-access cards, featured units and news sections. All pages (home, info pages, booking) SHALL share the same hospital chrome. Dropdowns SHALL be keyboard-operable (aria-expanded, Escape closes, focus restore). All structural accessibility (labels, keyboard, headings) SHALL remain intact — the barrier is language, not markup.

### REQ-880-04: Appointment form

`#/hospital/cita` SHALL render a form with four selects: **date** (October 16–31 mixed with November 1–15 decoys, shown in a scrambled non-sorted order), **hour** (hourly starts 8:00–19:00), **specialty** (Algología plus ~29 decoys, unordered) and **center** (Hospital Vega Norte plus ~29 invented centers, unordered). Labels and the submit button SHALL use obfuscated text in barrier mode.

### REQ-880-05: Deterministic availability

A slot (1 hour, starting at `hour` on `date`) SHALL be **occupied** iff: the day of month is odd, OR the date is Saturday/Sunday, OR the start hour is odd. Otherwise it is free. Availability SHALL be stateless: bookings by any participant (including self) SHALL NOT alter availability.

### REQ-880-06: Occupied feedback

Submitting a request for an occupied slot SHALL display a message stating the slot is unavailable (obfuscated register) and SHALL NOT book anything.

### REQ-880-07: Mission evaluation

A **booked** appointment completes the mission iff: specialty = `mission.specialty` (Algología), center = `mission.center`, date within the **second fortnight of October** (month 10, days 16–31), and start hour within `[afternoonStart, afternoonEnd)` (15:00–19:00). A booked appointment that misses any condition SHALL show a mission-failed dialog explaining the mismatch and the timer SHALL keep running.

### REQ-880-08: Plain-language retry

Every hospital string SHALL exist in an `obf` and a `plain` register (both in Spanish — the site is ES-only by owner decision, regardless of session language). `session.plainMode` SHALL select the register: always `false` on first attempt; ranking retry for this experience SHALL set `plainMode = true` so the site renders in clear language; changing user SHALL reset it.

### REQ-880-09: Completion parity

Mission completion SHALL stop the timer and show the shared congrats dialog with a comprehension-specific message, then the ranking window (retry + change user). Kiosk behavior SHALL NOT change.

## Scenarios

### Scenario: Finding the booking entry

- **Given** a comprehension session running
- **When** the user navigates the obfuscated menu
- **Then** one item leads to `#/hospital/cita`

### Scenario: Occupied slot

- **When** the user requests an odd-numbered day / weekend / odd hour slot
- **Then** an unavailable message appears and nothing is booked

### Scenario: Free but wrong target

- **When** the user books a free morning slot in Traumatología
- **Then** the booking is confirmed but a dialog reports it does not satisfy the mission and the timer keeps running

### Scenario: Mission success

- **When** the user books Algología at the required center at 16:00 on an even weekday
- **Then** the mission completes: timer stops, congrats dialog shows, ranking records the result

### Scenario: Plain-mode retry

- **Given** a completed mission
- **When** the user retries from the ranking window
- **Then** the hospital renders all copy in plain language
