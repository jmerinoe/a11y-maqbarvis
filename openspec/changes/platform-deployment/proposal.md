# Proposal: Platform deployment — online experience + shared ranking kiosk

## Why

Faro currently runs fully in-browser: users and ranking live in `localStorage`/`sessionStorage`. To run the workshop online — experience app on participant machines, ranking kiosk on a separate big-screen machine — results and the user registry must move to a shared backend, and a new kiosk application must display and administer the ranking.

## What changes

1. **Monorepo restructure** — `apps/experience` (current Faro app), `apps/kiosk` (new), `api/` (new shared backend), `shared/` (contracts).
2. **Shared API** — Azure Function App (Consumption, Node 20): public endpoints for user registration and result submission (guarded by `X-Event-Key`), admin endpoints for CRUD + reset (guarded by `X-Admin-Pin`), read endpoints for ranking and experience list.
3. **Storage** — Azure Table Storage in the existing Storage Account: `users` table (normalized username uniqueness across machines), `results` table partitioned by `experienceId`.
4. **Experience app refactor** — `session.js` calls the API; localStorage becomes fallback queue on POST failure; ranking screen fetches from API; `VITE_API_BASE_URL` per environment.
5. **Kiosk app** — new Vite app at `/kiosko`: presentation mode (fullscreen ranking, auto-rotation between experiences, 15 s polling, Panel branding) and admin mode (PIN gate, results CRUD, per-experience and global reset).
6. **Deployment** — one new SWA (free tier) serving experience at `/` and kiosk at `/kiosko`; GitHub Actions pipelines for SWA and Function App.

## Out of scope

- Server-side session timing verification (elapsedMs is client-computed; documented upgrade path exists)
- Realtime push (SignalR/WebSockets) — polling is sufficient for a ranking display
- Custom domains, EasyAuth, multi-region
- New experiences beyond the existing `screen-reader` registry entry
- Changes to the intentional trap design

## Assumptions

- Audience is technical; `X-Event-Key` embedded in the client bundle is accepted (stops casual tampering, not determined attackers — documented escalation: server-side session tokens)
- Function App cold starts after idle are acceptable (kiosk polling keeps it warm)
- One deploy redeploys both apps (coupled deploys accepted at this size)
- Existing SWA hosts another app → a new SWA is created for this project

## Risks

| Risk | Mitigation |
|------|------------|
| Event key visible in bundle | Accepted; rotation = env change + redeploy; upgrade path to server-side sessions documented |
| Function cold start delays login | Kiosk polling keeps app warm; non-blocking UX on failure |
| API unreachable during a run | Result queued in localStorage, retried on ranking screen load |
| Coupled SWA deploy breaks both apps | GHA runs tests before deploy; apps are independent builds |
| Cross-machine username collisions | Server-side `users` table enforces normalized uniqueness |
