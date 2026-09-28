# Apply progress: Experiencia cromática

## Status: implemented

### Directory reorganization (M1)

- All Faro-specific code moved to `apps/experience/src/experiences/screen-reader/`
  (screens, components, data/products, traps, moderator, styles/moderator.css).
- Shared instrumentation remains at `src/`: session, router, store, i18n,
  panel-shell, timer, dialogs, session screens, main.css.
- `index.html` updated for moved CSS; `metro.css` added.

### New experience (M2–M3)

- `experiences/chromatic/data/metro.js` — L4 (restricted ×3), L6 (interrupted,
  circular), L8, L10, L12 (circular) with official station lists from the
  plano; `tramoOptions` returns all usable lines for a pair (cheapest
  first); `optimalRouteMinutes` = Dijkstra → **44 min**
  (L12 1 + L10 15 + L8 6 stops).
- `experiences/chromatic/data/metro-map-data.js` — generated; normalized
  hotspot rects for all 109 modelled stations over the official map raster
  (`public/metro/metro-map.png`, rendered from the supplied plano PDF).
  Positions extracted by `tools/extract-metro-map.mjs` (pdfjs-dist render +
  tesseract.js OCR, normal + inverted passes) with manual overrides for
  black-box labels and names duplicated in the bottom-left line index.
- `experiences/chromatic/components/metro-map.js` — official plano image +
  absolute-positioned transparent `<button>` hotspots; every station is
  click + Enter/Space operable, with visible focus and selected-origin
  outline.
- `experiences/chromatic/screens/metro.js` — `#/metro` screen: header,
  interactive map (click origin → click destination adds the tramo if
  possible), legend (tone swatch + textual status), tramo list with ×
  removal per leg and total, "Comprobar ruta", plano PDF link.
- `experiences/chromatic/components/metro-dialog.js` — accessible info
  dialog for validation popups + `showLineChoiceDialog` modal when several
  usable lines serve the same pair.
- Grayscale: `.chromatic-scope { filter: grayscale(1) }` wraps the metro app
  and its dialogs; monochrome palette.
- Registry: `chromatic` entry with localized instructions content,
  `homeRoute: '#/metro'` and generic `missionCard` rows (screen-reader's
  card converted to the same shape; copy button via `copyable` flag).
- Instructions Continuar → `experience.homeRoute`; router resolves
  session home per experience and guards `#/metro`.
- Completion: optimal route → `stopExperienceTimer` + `submitResult` +
  congrats dialog → `#/ranking` (window already per-experience).
- i18n: `metro.*` keys ES/EN + `session.pageTitle.metro`.

### Verification (M4)

- `src/tests/chromatic.test.js` — 18 cases, all green; suite 138/138; build OK.
- Kiosk untouched (no code changes).
