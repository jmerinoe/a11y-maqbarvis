# Design: Experiencia Comprensión

## Registry entry (`src/data/experiences.js`)

```js
{
  id: 'comprehension',
  locked: true,                       // admin PIN gate (reuse existing mechanism)
  name:   { es: 'Experiencia Comprensión', en: 'Comprehension experience' },
  welcome/objective/missionIntro/missionOutro: structured ES/EN copy,
  missionCard: [
    { id: 'specialty', label: Especialidad, value: 'Algología' },
    { id: 'center',    label: Centro,       value: 'Hospital Vega Norte' },
    { id: 'window',    label: Franja,       value: 'Por la tarde (15:00–20:00)' },
  ],
  mission: { specialty: 'Algología', center: 'Hospital Vega Norte',
             afternoonStart: 15, afternoonEnd: 20 },
  homeRoute: '#/hospital',
}
```

## Hospital model (`experiences/comprehension/data/hospital.js`)

- **Centers** (invented): `Hospital Vega Norte`, `Clínica Mirador del Río`, `Centro Médico Fuente Clara`, `Policlínico Las Cumbres`.
- **Specialties**: `Algología` (pain unit — the target), plus ~6 decoys: `Traumatología`, `Dermatología`, `Oftalmología`, `Cardiología`, `Neurología`, `Otorrinolaringología`.
- **Slots**: hourly start times 8:00–19:00 (last ends 20:00); dates = next 30 days generated from "today".
- `isSlotFree(dateIso, hour)` → `false` when `dayOfMonth % 2 === 1`, weekend (Sat/Sun), or `hour % 2 === 1`. Deterministic, no state.
- `isAfternoon(hour)` → `hour >= mission.afternoonStart && hour < mission.afternoonEnd`.

## Copy registers (`experiences/comprehension/data/copy.js`)

Single table: `COPY = { key: { obf, plain } }`. Screens pick the register from `session.plainMode`. Categories:

- **Buttons**: Continuar→"Proceder con la ejecución de la acción previamente configurada", Cancelar→"Interrumpir el proceso actualmente iniciado sin consolidación de los cambios efectuados", Volver→"Retornar al contexto de navegación inmediatamente precedente", Solicitar→"Formalizar la solicitud de provisión asistencial".
- **Nav (obfuscated → the booking entry must be discovered)**: e.g. *"Gestión de encuentros asistenciales programados"* (→ booking), *"Memoria corporativa y estructura organizativa"* (→ about), *"Canalización de requerimientos no asistenciales"* (→ contact). Plain mode: "Pedir cita", "Quiénes somos", "Contacto".
- **Errors**: occupied slot → "El recurso temporal solicitado no dispone de capacidad de asignación en el intervalo seleccionado. Se sugiere la iteración sobre alternativas cronológicas." Plain: "Esa hora está ocupada. Prueba con otro día u otra hora."
- **Availability is NOT disclosed anywhere** — owner decision: participants discover occupied slots by trial and error; an earlier rules notice on the home page was removed.
- **Form labels**: Fecha→"Jornada temporal pretendida", Hora→"Intervalo horario de inicio", Especialidad→"Unidad asistencial de destino", Centro→"Emplazamiento físico de la provisión".

## Screens (`experiences/comprehension/screens/`)

- `hospital.js` — `#/hospital`: topbar + hero + obfuscated nav; the booking link is the least obvious nav item. Same DOM in both modes, only strings change.
- `booking.js` — `#/hospital/cita`: the 4-field form + submit. On submit:
  - `!isSlotFree` → occupied message (obf/plain), no booking.
  - free but not mission → booked (confirmation) + mission-failed dialog, timer keeps running.
  - free and mission → booked + `completeMission()` → congrats dialog (`comprehension` message key: "…has conseguido tu cita!!").
- Confirmation renders inside the form area (booked slot summary), not a popup.

## Session / retry

- `session.plainMode` boolean — `false` on new session/login.
- Ranking retry for `comprehension` sets `plainMode: true` before navigating back to `#/hospital` (parallel to chromatic clearing `tramos`).
- "Cambiar usuario" resets `plainMode`.

## i18n / page titles

- `session.pageTitle.hospital`, `.hospitalBooking` in `es.js`/`en.js`.
- The hospital's *content* strings live in `copy.js` (ES-only, `obf`/`plain` registers). **Decision (owner)**: the whole hospital site is Spanish-only regardless of session language — obfuscation is a Spanish-language exercise; EN i18n keys only cover shared chrome (page titles, congrats message).

## Tests (`src/tests/comprehension.test.js`)

- Registry: `comprehension` exists, locked, mission config values.
- `isSlotFree` matrix: even weekday + even hour → free; odd day / weekend / odd hour → busy.
- `isAfternoon` bounds (14 → false, 15 → true, 19 → true, 20 → false).
- Locked PIN gate reuses existing tests (registry-driven).
- UI: nav renders obfuscated labels; booking page reachable; occupied slot shows message; free non-mission booking → fail dialog + timer continues; mission booking → congrats + timer stops; retry sets `plainMode` → labels render plain.

## File list

- `src/data/experiences.js` (+entry)
- `src/experiences/comprehension/data/{hospital.js,copy.js}`
- `src/experiences/comprehension/screens/{hospital.js,booking.js}`
- `src/experiences/comprehension/styles/hospital.css`
- `src/screens/index.js`, `src/i18n/{es,en}.js`
- `src/screens/ranking.js` (retry sets plainMode for comprehension)
- `src/components/congrats-dialog.js` (message key param — already supports it)
- `src/tests/comprehension.test.js`
