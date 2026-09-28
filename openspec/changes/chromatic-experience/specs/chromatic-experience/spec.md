# Spec: Experiencia cromática (second workshop experience)

## Purpose

A second participant experience simulating color-vision absence: a grayscale transport-info web where metro line tones are indistinguishable, plus a tramo-based journey calculator. Mission: find the fastest route San Nicasio → Barajas knowing L6 is interrupted and L4 runs at triple time. The evolution also reorganizes `src/` so each experience owns its files under `src/experiences/<id>/`.

## Requirements

### REQ-840-01: Directory reorganization
Experience-specific code SHALL live under `apps/experience/src/experiences/<experienceId>/` (`screen-reader` for the Faro experience, `chromatic` for the new one). Shared instrumentation (session, router, i18n, shared components, session screens) SHALL stay shared. Existing Faro behavior, traps and tests SHALL NOT change semantically.

### REQ-840-02: Second experience entry
The registry SHALL include `chromatic` (ES "Experiencia cromática") so it appears in `#/experiences`, gets instructions, timing and its own ranking automatically via existing shared flows.

### REQ-840-03: Grayscale presentation
All chromatic screens SHALL render in black/white/grays only (`filter: grayscale(1)` scope + monochrome palette). The metro screen SHALL include an interactive schematic map plus a link to the provided plano PDF.

### REQ-840-04: Instructions and timer parity
The chromatic instructions screen SHALL reuse the shared structured layout (welcome, objective, mission, mission card, Continuar). The timer SHALL start only on Continuar and behave exactly as in the screen-reader experience.

### REQ-840-05: Line states and legend
Lines SHALL have a status: operative, restricted (time ×3) or interrupted. The legend SHALL show each line with its tone swatch, identifier and textual status. Grayscale SHALL make tones indistinguishable; status text SHALL remain accessible.

### REQ-840-06: Interactive map and tramo builder
The map SHALL render every modelled station as a clickable (and keyboard-operable) target. A tramo = origin + destination selected by clicking two stations; if a pair is served by usable lines the tramo SHALL be added to a list. If more than one usable line serves the pair, a modal SHALL ask which line to use. Picking a pair not on the same line SHALL show a popup asking for same-line tramos. Picking a pair only served by interrupted lines SHALL show a popup and not be added. Tramo duration = station span × line minutes-per-stop × status multiplier; on circular lines the shorter arc applies. Each listed tramo SHALL show line, endpoints and time, SHALL be removable via an × button, and the accumulated total SHALL be displayed.

### REQ-840-07: Route validation and mission completion
On "Comprobar ruta" the tramo list SHALL be validated: first tramo starts at San Nicasio, each tramo starts where the previous ended (transfer = same station name), last ends at Barajas.
- Connected route with total equal to the computed optimum → mission completed: timer stops, congrats dialog, ranking window.
- Connected but slower → popup informing faster routes exist; timer continues.
- Not connected or not reaching Barajas → popup indicating the route is not valid.

### REQ-840-08: Data-driven optimum
The optimal route SHALL be computed from the line/station graph (Dijkstra over operative+restricted edges; interrupted lines excluded) — not hardcoded.

### REQ-840-09: No kiosk impact
Kiosk code and behavior SHALL NOT change. Experiences listed dynamically keep working.

## Scenarios

### Scenario: Valid tramo
- **Given** the chromatic session is running
- **When** the user clicks San Nicasio then Puerta del Sur on the map
- **Then** the tramo appears with its line and minutes and the total updates

### Scenario: Removing a tramo
- **Given** two tramos in the list
- **When** the user clicks the × button on the first
- **Then** it is removed and the total recalculates

### Scenario: Multi-line choice
- **Given** an origin→destination pair served by more than one usable line
- **When** the user clicks both stations
- **Then** a modal lists the candidate lines and only adds the tramo after the user picks one (or nothing on cancel)

### Scenario: Different lines rejected
- **When** the user clicks San Nicasio then Joaquín Vilumbrales
- **Then** a popup asks to select same-line tramos and nothing is added

### Scenario: Interrupted line blocked
- **When** the user tries to add a tramo on L6
- **Then** a popup reports the interruption and nothing is added

### Scenario: Slower route
- **When** the user submits a connected San Nicasio→Barajas route via L4 (restricted)
- **Then** a popup says faster routes exist and the timer keeps running

### Scenario: Optimal route
- **When** the user submits the optimal route (L12 → L10 → L8)
- **Then** the mission completes, the timer stops and the congrats dialog leads to the ranking window
