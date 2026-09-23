# Spec: User identification, experience selection, and purchase-flow timing

## Purpose

Defines the pre-Faro session flow: unique-username login, experience selection, instructions, a persistent session timer during the purchase flow, completion detection for the required purchase, an accessible congrats dialog, and a top-10 best-times ranking. The new screens are workshop instrumentation and SHALL be fully accessible — no traps.

## Requirements

### REQ-800-01: Unique-username identification precedes the app
Before any Faro screen, the user SHALL see a login screen with a titled username field (real `<label for>`) and a continue button. The username is mandatory and SHALL be unique: normalized (`trim` + inner-whitespace collapse + case-insensitive) comparison against all previously registered users. Duplicates show "Este nombre de usuario ya está registrado. Introduce otro nombre." in an associated error element and block continuation. Valid names are registered and the session is created.

### REQ-800-02: Experience selection
After login, the user SHALL see the list of available experiences, rendered from the experience registry (`src/data/experiences.js`) — currently only "Experiencia con lectores de voz". Selecting it stores the `experienceId` in the session and opens `#/instructions`. The registry SHALL allow adding future experiences without changing the flow.

### REQ-800-03: Instructions and explicit timer start
The instructions screen SHALL present the experience's localized structured content (`welcome`, `objective`, `missionIntro`, `missionOutro` in `src/data/experiences.js`) with the required purchase shown as a mission card (`dl`): product "Camiseta azul, sin rayas", size M, card 4000056655665556. Key phrases SHALL be highlighted via `<strong>`; the layout SHALL be justified and wider than the other session screens. The timer SHALL NOT start on screen render or experience selection — only on the Continuar button, which SHALL record `startedAt` and navigate to `#/home`.

### REQ-800-04: Persistent session timer
A timer overlay SHALL be visible in the top-right corner, styled as external instrumentation (not Faro chrome), showing elapsed time and updating continuously. Elapsed time SHALL be computed from the `startedAt` timestamp, not a visual counter. It SHALL persist across hash navigation (mounted on `document.body`, outside `#app`) and SHALL stop only when the required purchase completes.

### REQ-800-05: Completion requires the exact purchase
The experience SHALL complete only when a successful order contains **exactly one line item**: `{productId: 'p001', size: 'M', color: 'blue'}` (camiseta azul talla M) paid with the enforced card. Extra items in the order SHALL invalidate completion. Adding to cart, visiting checkout, entering the card, partial progress, or buying any other item/variant SHALL NOT complete the experience.

### REQ-800-06: Result record
Each completed run SHALL store at minimum: user, experienceId, start timestamp, end timestamp, elapsed time (ms precision), and result ("completed").

### REQ-800-07: Accessible congrats dialog
On completion, a dialog SHALL announce "¡Enhorabuena! Has completado correctamente la experiencia." with the elapsed time. It SHALL use `role="dialog"`, `aria-modal="true"`, an accessible name, managed focus, and a close action that navigates to `#/ranking`. No traps in this dialog.

### REQ-800-08: Top-10 ranking
The ranking screen SHALL list the 10 completed runs with lowest elapsed time for the experience: position, user, time. Ordering: `elapsedMs` ascending; ties by earlier `endedAt`; further ties by username — fully deterministic. It SHALL update automatically on each completion and offer a "Nuevo participante" action that clears the session and returns to `#/login`.

### REQ-800-09: Session guard and entry point
Without an active session, Faro routes SHALL redirect to `#/login`. App entry SHALL land on `#/login` when no session exists, or `#/home` (with restored timer) when one does. Session state SHALL persist in `sessionStorage` so a mid-experience reload restores the timer.

### REQ-800-10: Accessibility of new screens
All new screens SHALL be semantic and operable: labeled fields, real links/buttons, keyboard access, visible focus, announced errors. No `data-trap` markers SHALL be added, and existing traps SHALL remain unchanged.

## Scenarios

### Scenario: Duplicate username rejected
- **Given** "Ana" is registered
- **When** a new participant types " ana " (spaces, different case)
- **Then** the duplicate error is announced and they cannot continue

### Scenario: Timer lifecycle
- **Given** the participant selected the screen-reader experience
- **When** they view instructions, then press Continuar
- **Then** the timer starts only at Continuar, stays visible through products/detail/cart/checkout, and stops when the order with p001+blue+M succeeds

### Scenario: Wrong purchase does not complete
- **Given** a running session
- **When** the participant buys camiseta azul talla L, or camiseta azul M plus another item
- **Then** the experience does NOT complete; the timer keeps running

### Scenario: Completion and ranking
- **Given** a running session
- **When** the order containing p001+blue+M is confirmed
- **Then** the result is recorded, the congrats dialog announces the time, and closing it shows the ranking including the new run
