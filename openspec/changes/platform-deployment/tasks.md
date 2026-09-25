# Tasks: Platform deployment

## Phase 1 — Monorepo restructure

- [x] Move app files to `apps/experience/` (src, public, index.html, package.json, vite.config.js)
- [x] Create root `package.json` (scripts with `--prefix`; no workspaces — keeps per-app lockfiles for Oryx/GHA)
- [x] Create `shared/contract.js` (result/user shapes, endpoint paths)
- [x] Update `.gitignore` for new layout (`apps/*/dist`, `api/local.settings.json`)
- [x] Verify experience app still builds and tests pass from new location (94/94)
- [x] Update openspec/docs paths references if broken

## Phase 2 — Shared API

- [x] `api/package.json` + `host.json` (Functions v4, Node 20)
- [x] `api/src/lib/table.js` — TableClient wrapper, ensureTables, entities
- [x] `api/src/lib/auth.js` — requireEventKey, requireAdminPin
- [x] `api/src/functions/public.js` — POST users, POST results, GET ranking, GET experiences, GET health
- [x] `api/src/functions/admin.js` — GET/POST/PATCH/DELETE results, DELETE reset
- [x] `api/local.settings.example.json` template (gitignored real one)
- [x] `api/tests/*.test.js` — Vitest coverage of table layer with in-memory fake
- [ ] Local run verified: Azurite + `func start` (pending user environment)

## Phase 3 — Experience refactor

- [x] `apps/experience/src/api/client.js` — fetch wrapper, base URL + event key env
- [x] `session.js` — registerUserAsync → POST /users; submitResult → POST /results; pending queue
- [x] `ranking.js` — fetch from API, local fallback
- [x] `.env.example` env docs
- [x] Adapt tests; all tests green (94/94)
- [ ] E2E local: login → instructions → purchase → congrats → ranking via API (pending Azurite)

## Phase 4 — Kiosk app

- [x] `apps/kiosk` scaffold (Vite, base `/kiosko/`, package.json)
- [x] `src/api.js` — read client + admin client (PIN)
- [x] `src/presentation.js` — fullscreen ranking, rotation, polling, offline state
- [x] `src/admin.js` — PIN gate, results table, add/edit/delete, resets with confirm
- [x] `src/main.js` + hash router (ES-first UI)
- [x] `src/styles.css` — big-screen typography, Panel branding
- [x] Structural tests (3/3)
- [x] Build verified at `/kiosko/` base path

## Phase 5 — Azure provisioning (guided, user executes)

- [ ] Create Function App (Consumption, Node 20, Linux)
- [ ] Set app settings: STORAGE_CONNECTION_STRING, EVENT_KEY, ADMIN_PIN, ALLOWED_ORIGINS
- [ ] Deploy API (func publish or zip)
- [ ] Create new SWA linked to GitHub repo
- [ ] Verify /api/* reachable and CORS OK

## Phase 6 — Pipelines

- [x] `.github/workflows/swa-deploy.yml` — build both apps, kiosk into dist/kiosko
- [x] `.github/workflows/api-deploy.yml` — deploy api on api/** changes
- [ ] Configure repo secrets + SWA token (user executes in GitHub/Azure)
- [ ] Verify push-to-main deploys end to end

## Phase 7 — E2E verification

- [ ] Two machines/browsers: experience flow → kiosk shows result live
- [ ] Admin: PIN gate, CRUD, reset
- [ ] Multi-experience rotation with seeded second experience
- [ ] Cost check: confirm all resources on free/consumption tiers
- [ ] Update README + docs for online operation
