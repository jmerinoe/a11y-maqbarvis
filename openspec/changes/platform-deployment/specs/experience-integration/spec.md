# Spec: Experience app backend integration

## MODIFIED Requirements

### REQ-EXP-01: Server-side user registration (was: localStorage)
`registerUser` now calls `POST /api/users` with `X-Event-Key`. Duplicate rejection comes from the server (cross-machine uniqueness). On network failure the login shows a connection error — participants should not start a timed run that cannot be recorded.

### REQ-EXP-02: Server-side result persistence (was: localStorage)
On successful order completion, the app calls `POST /api/results`. If the POST fails, the result is queued in `localStorage['faro-pending-results']` and retried when the ranking screen loads, so the run is not lost. The congrats dialog still shows regardless (UX must not block on network).

### REQ-EXP-03: Server-side ranking (was: localStorage getRanking)
The ranking screen fetches `GET /api/ranking?experienceId=` from the API. "Nuevo participante" flow unchanged.

### REQ-EXP-04: API base URL configuration
`VITE_API_BASE_URL` env var selects the API origin: `http://localhost:7071/api` in dev (Azurite + func), the Function App URL in production (injected at build time via GHA).

## Requirements unchanged
- Timer behavior (client-side, `document.body` overlay, sessionStorage restore)
- Session guard on Faro routes
- Completion detection (`isCompletedOrder` exact-item rule)
- Moderator mode and all traps
- i18n ES/EN
