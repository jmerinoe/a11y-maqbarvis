# Tasks: Platform deployment

## Phase 1 — Monorepo restructure

- [ ] Move app files to `apps/experience/` (src, public, index.html, package.json, vite.config.js)
- [ ] Create root `package.json` workspaces (`apps/*`)
- [ ] Create `shared/contract.js` (result/user shapes, endpoint paths)
- [ ] Update `.gitignore` for new layout (`apps/*/dist`, `api/local.settings.json`)
- [ ] Verify experience app still builds and tests pass from new location
- [ ] Update openspec/docs paths references if broken

## Phase 2 — Shared API

- [ ] `api/package.json` + `host.json` (Functions v4, Node 20)
- [ ] `api/src/lib/table.js` — TableClient wrapper, ensureTables, entities
- [ ] `api/src/lib/auth.js` — requireEventKey, requireAdminPin
- [ ] `api/src/functions/public.js` — POST users, POST results, GET ranking, GET experiences, GET health
- [ ] `api/src/functions/admin.js` — GET/POST/PATCH/DELETE results, DELETE reset
- [ ] `api/local.settings.json` template (gitignored real one)
- [ ] `api/tests/*.test.js` — Vitest coverage of guards, ranking, reset
- [ ] Local run verified: Azurite + `func start`

## Phase 3 — Experience refactor

- [ ] `apps/experience/src/api/client.js` — fetch wrapper, base URL + event key env
- [ ] `session.js` — registerUser → POST /users; saveResult → POST /results; pending queue
- [ ] `ranking.js` — fetch from API, offline fallback marker
- [ ] `.env.development` / env docs
- [ ] Adapt tests (mock fetch); all tests green
- [ ] E2E local: login → instructions → purchase → congrats → ranking via API

## Phase 4 — Kiosk app

- [ ] `apps/kiosk` scaffold (Vite, base `/kiosko/`, package.json)
- [ ] `src/api.js` — read client + admin client (PIN)
- [ ] `src/screens/presentation.js` — fullscreen ranking, rotation, polling, offline state
- [ ] `src/screens/admin.js` — PIN gate, results table, add/edit/delete, resets with confirm
- [ ] `src/main.js` + router + i18n lite (ES/EN)
- [ ] `src/styles/kiosk.css` — big-screen typography, Panel branding
- [ ] Structural tests
- [ ] Build verified at `/kiosko/` base path

## Phase 5 — Azure provisioning (guided, user executes)

- [ ] Create Function App (Consumption, Node 20, Linux)
- [ ] Set app settings: STORAGE_CONNECTION_STRING, EVENT_KEY, ADMIN_PIN, ALLOWED_ORIGINS
- [ ] Deploy API (func publish or zip)
- [ ] Create new SWA linked to GitHub repo
- [ ] Verify /api/* reachable and CORS OK

## Phase 6 — Pipelines

- [ ] `.github/workflows/swa-deploy.yml` — build both apps, kiosk into dist/kiosko
- [ ] `.github/workflows/api-deploy.yml` — deploy api on api/** changes
- [ ] Configure repo secrets + SWA token
- [ ] Verify push-to-main deploys end to end

## Phase 7 — E2E verification

- [ ] Two machines/browsers: experience flow → kiosk shows result live
- [ ] Admin: PIN gate, CRUD, reset
- [ ] Multi-experience rotation with seeded second experience
- [ ] Cost check: confirm all resources on free/consumption tiers
- [ ] Update README + docs for online operation
