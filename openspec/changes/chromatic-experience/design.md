# Design: Experiencia cromática

## 1. Directory reorganization

```
apps/experience/src/
  experiences/
    screen-reader/
      screens/   home.js products.js product-detail.js cart.js checkout.js confirmation.js
      components/ header.js filters.js product-card.js cart-item.js carousel.js
                  variant-selector.js (faro-only components)
      data/products.js
      traps/registry.js  traps/* (all trap components/markup)
      styles/faro.css  (faro-specific rules extracted, or keep main.css shared)
    chromatic/
      screens/metro.js
      components/metro-map.js metro-dialog.js
      data/metro.js
      styles/metro.css
  screens/   login.js experience-select.js instructions.js ranking.js  (shared)
  components/ panel-shell.js experience-timer.js congrats-dialog.js
             mission-failed-dialog.js  (shared)
  session/ router.js store.js i18n/ api/ styles/main.css
```

- All current Faro imports rewritten mechanically; tests updated to new paths.
- `store.js` is Faro-shaped (cart, filters, searchQuery) → moves under `screen-reader/`; shared state (route, language, moderatorMode) stays in a small shared store.
- `screens/index.js` dispatcher: screen name → renderer; experience-owned screens resolved from the registry (`getExperienceById(session.experienceId).homeRoute` or a screens map).

## 2. Metro data model

```js
// data/metro.js
export const metroLines = [
  { id: 'L12', status: 'operative',  minutesPerStop: 2, circular: true,
    stations: [ 'Puerta del Sur', 'Parque Lisboa', ..., 'San Nicasio' /* circle */ ] },
  { id: 'L10', status: 'operative',  minutesPerStop: 2,
    stations: [ 'Puerta del Sur', 'Joaquín Vilumbrales', ..., 'Nuevos Ministerios', ... ] },
  { id: 'L8',  status: 'operative',  minutesPerStop: 2,
    stations: [ 'Nuevos Ministerios', 'Colombia', 'Mar de Cristal',
                'Feria de Madrid', 'Aeropuerto T1-T2-T3', 'Barajas', 'Aeropuerto T4' ] },
  { id: 'L4',  status: 'restricted', multiplier: 3, minutesPerStop: 2, stations: [ ... ] },
  { id: 'L6',  status: 'interrupted', minutesPerStop: 2, stations: [ ... ] },
];
export const TRAMO_ERROR_SAME_LINE = 'different-lines';
export function tramoMinutes(lineId, from, to) { /* stops × minutesPerStop × multiplier; shortest arc if circular */ }
export function optimalRoute(from, to) { /* Dijkstra over non-interrupted edges → { minutes } */ }
```

Station lists encoded from the official plano (L4/L6/L8/L10/L12). Shared station names across lines = implicit transfer nodes in the graph.

## 3. Metro screen

Single screen `#/metro` (post-instructions landing for chromatic sessions):

- **Header strip** (metro web look, grayscale).
- **Mapa interactivo**: el plano oficial rasterizado (`public/metro/metro-map.png`, generado del PDF con `tools/extract-metro-map.mjs` + pdfjs-dist) como imagen de fondo con hotspots invisibles por estación (`data/metro-map-data.js`, posiciones normalizadas extraídas por OCR tesseract.js + overrides manuales para etiquetas en caja negra y duplicadas del índice de líneas). Cada hotspot es `<button>` absoluto (click + Enter/Espacio). Enlace a `/metro/plano-metro.pdf` como referencia.
- **Legend**: each line — swatch + `L<n>` + status text (`operativa` / `restricciones ×3` / `interrumpida`). Real `ul/li`, statuses as text (not color-only!) — the trap the participant lives is that line *tones* can't be matched to the map; statuses are still textual.
- **Selección por clicks**: click en estación de origen → click en estación de destino. `tramoOptions` resuelve la(s) línea(s) no interrumpida(s) que sirven el par.
  - Una sola línea usable → append tramo `{lineId, from, to, minutes}`.
  - Varias líneas usables → modal accesible (`showLineChoiceDialog`) para elegir línea; cada opción muestra su tiempo.
  - Ninguna línea sirve el par (p. ej. San Nicasio → Joaquín Vilumbrales) o misma estación → popup "selecciona tramos de la misma línea".
  - Solo líneas interrumpidas sirven el par → popup "línea interrumpida".
- **Tramo list**: `ol` with `L12 · San Nicasio → Puerta del Sur — 2 min`, botón `×` por fila (`aria-label` con el tramo) para eliminarla, y total.
- **Comprobar ruta** button → validation → popups (accessible dialog pattern, reused styles).
  - contiguous & total == optimal → `stopExperienceTimer()` + `submitResult` + congrats flag → congrats dialog → `#/ranking`.
  - contiguous but slower → "hay rutas más rápidas" popup, timer continues.
  - not contiguous / doesn't reach Barajas → route-invalid popup.

## 4. Shared completion plumbing

`checkout.js` keeps the Faro completion; chromatic completion lives in the metro screen calling the same helpers (`submitResult`, `stopExperienceTimer`, `faro-pending-congrats`). Generalize: small `completeMission(elapsedMs)` helper in `session/mission.js` used by both — avoids duplicating the record-write.

## 5. Router & registry

- `experiences.js` entries gain `homeRoute: '#/home' | '#/metro'`.
- Instructions Continuar → `navigate(experience.homeRoute)`.
- Faro routes still session-guarded; `#/metro` added to the guarded set.
- Grayscale scope: metro screen root gets `.chromatic-scope`; document.body class toggled while on chromatic routes so the whole page (including panel-less chrome) stays monochrome.

## 6. Grayscale

```css
.chromatic-scope { filter: grayscale(1); }
/* + monochrome palette vars scoped to the metro screen */
```

## 7. i18n

New `metro.*` keys: title, legend, statuses, map selection hints, popups (different-lines, interrupted, faster-exists, route-invalid, line choice), tramo list labels incl. remove button. ES/EN parity.

## 8. Mission content (draft ES)

- welcome: "Bienvenido a la experiencia cromática."
- objective: ponerse en la piel de una persona que no percibe los colores; la información codificada solo por color se vuelve inaccesible.
- mission card: Origen San Nicasio · Destino Barajas · Línea 6 interrumpida · Línea 4 restricciones (metros el triple de tiempo).
- missionIntro/Outro: tu vuelo sale pronto; encuentra la ruta más rápida por tramos de una sola línea; el tiempo corre desde Continuar.

## 9. Test plan

`src/tests/chromatic.test.js` + updated import paths in the whole suite:
- `tramoMinutes` per line/arc (circular shortest path), multiplier on L4.
- `optimalRouteMinutes('San Nicasio','Barajas')` returns 44 (L12→L10→L8: 1+15+6 stops × 2 min).
- Interactive map: click origin+destination adds tramo; different-line popup, interrupted popup; × removes a tramo; multi-line pair → line-choice modal (exercised via injected line).
- Comprobar: optimal route → congrats flag + timer stopped; slower route → faster-exists popup + timer running; broken route → invalid popup.
- Grayscale class present on metro screen.
- Regression: all existing tests pass with new paths.
