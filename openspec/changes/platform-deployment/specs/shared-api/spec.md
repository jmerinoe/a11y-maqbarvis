# Spec: Shared ranking API

## ADDED Requirements

### REQ-API-01: User registration endpoint
`POST /api/users` with `{name}` and header `X-Event-Key`. Returns `{ok: true, name}` or `{ok: false, reason: 'duplicate'|'empty'}`. Usernames are normalized (trim, collapse whitespace, lowercase) and stored in the `users` table for cross-machine uniqueness.

### REQ-API-02: Result submission endpoint
`POST /api/results` with `{user, experienceId, startedAt, endedAt, elapsedMs}` and header `X-Event-Key`. Validates required fields and `elapsedMs > 0`. Stores entity in `results` table: `PartitionKey = experienceId`, `RowKey = inverted-timestamp + guid`.

### REQ-API-03: Ranking read endpoint
`GET /api/ranking?experienceId=X` returns top-10 completed results ascending by `elapsedMs` (deterministic ties: earlier `endedAt`, then `user`). No auth required (read-only).

### REQ-API-04: Experience list endpoint
`GET /api/experiences` returns distinct `experienceId` values that have at least one result. Used by the kiosk rotation.

### REQ-API-05: Admin list endpoint
`GET /api/ops/results?experienceId=X` returns ALL results (not capped at 10). Requires `X-Admin-Pin` header matching `ADMIN_PIN` app setting. Without `experienceId`, returns all results across experiences.

### REQ-API-06: Admin add endpoint
`POST /api/ops/results` creates a result record with provided fields. Requires `X-Admin-Pin`.

### REQ-API-07: Admin update endpoint
`PATCH /api/ops/results/{pk}/{rk}` updates fields of an existing result. Requires `X-Admin-Pin`.

### REQ-API-08: Admin delete endpoint
`DELETE /api/ops/results/{pk}/{rk}` removes a result. Requires `X-Admin-Pin`.

### REQ-API-09: Admin reset endpoint
`DELETE /api/ops/results?experienceId=X` deletes all results in the partition. Without param, deletes ALL results (global reset). Requires `X-Admin-Pin`.

### REQ-API-10: Event key guard
Public write endpoints (`/api/users`, `/api/results`) reject requests without a valid `X-Event-Key` header matching the `EVENT_KEY` app setting → `401`.

### REQ-API-11: CORS
API allows origins from `ALLOWED_ORIGINS` app setting (SWA hostname + localhost dev origins).

### REQ-API-12: Health endpoint
`GET /api/health` returns `{status: 'ok'}` — used for warm-up and monitoring.
