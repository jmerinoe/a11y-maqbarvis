# Verify report: Give up — abandon a run and rank it as DNF

## Commands

```powershell
npm --prefix apps/experience test   # 208 passed (23 files) — incl. abandon-experience.test.js (10)
npm --prefix apps/experience run build   # OK
npm --prefix apps/kiosk test        # 25 passed (2 files) — incl. DNF badge + admin chip
npm --prefix apps/kiosk run build   # OK
npm --prefix api test               # 9 passed — incl. result persistence
```

(Environment note: no system Node on PATH — tests/builds were run via the Electron-bundled Node, `ELECTRON_RUN_AS_NODE=1 Devin.exe <vitest|vite>`; API tests ran with the kiosk's vitest since `api/node_modules` is not installed — `@azure/data-tables` is mocked anyway.)

## Requirement coverage

| Req | Verified by |
|-----|-------------|
| REQ-920-01 give-up control during the run | `mounts the give-up button with the timer and removes both on stop` — real `<button>`, label "Me rindo", lifecycle bound to the timer |
| REQ-920-02 confirmation before abandoning | `cancelling… records nothing and keeps the run alive` + `Escape… also cancels` — session/results untouched, run continues |
| REQ-920-03 abandon recording | `confirming records an abandoned result…` — `result: 'abandoned'` + elapsedMs persisted, session `abandoned` + `completedAt`, timer stopped |
| REQ-920-04 abandoned dialog | closing dialog asserts the message + "Tiempo empleado"; `"Ver ranking"… navigates to the ranking` |
| REQ-920-05 DNF ordering | `ranks abandoned runs after every completed one, ordered by elapsed time` — Fast, Slow, DNF-fast, DNF-slow |
| REQ-920-06 DNF marking in app | `marks DNF rows with a badge and a screen-reader cue` — `ranking-dnf` class, badge text, sr-only label, real position; `anchors… on their DNF record` — window clamps to tail with `ranking-self` + `ranking-dnf` combined |
| REQ-920-07 API contract | `results` accepts `result` ∈ {completed, abandoned} else 400; `ranking` includes DNF at the tail and maps `result` into the payload; `table.test.js` asserts `result` persistence + default |
| REQ-920-08 DNF on kiosk | `marks abandoned runs with a dimmed DNF badge` — `.k-row.dnf` + `.k-dnf` text badge; admin list shows the chip |
| REQ-920-09 retry after abandoning | `a post-abandon replay completion is not resubmitted` — standing DNF only, no `faro-pending-baseline` leak |
| REQ-920-10 offline parity | same `submitResult`/`faro-results-pending` path — no API-specific code in the abandon flow |

## Manual check

On any experience screen with the timer running, press "Me rindo" → confirm → dialog "Lo sentimos, no has completado la experiencia" + time → "Ver ranking" → the run appears at the tail of the table, dimmed, with the DNF badge. The kiosk board shows the same row with a DNF badge once the next poll lands.
