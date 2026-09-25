# A11y Experience Center

Accessibility awareness platform for event stands. Attendees complete a realistic ecommerce purchase using only a keyboard and screen reader (NVDA), hitting real WCAG traps — then a moderator debriefs each barrier. A shared ranking tracks completion times across machines.

## Monorepo layout

```
apps/experience/  → Faro ecommerce + workshop session layer (deployed at /)
apps/kiosk/       → ranking kiosk, presentation + admin modes (deployed at /kiosko/)
api/              → shared ranking API (Azure Functions + Table Storage)
shared/           → shared API contract (paths, record shapes)
```

## Quick start (local, offline)

```bash
cd apps/experience && npm install && npm run dev   # http://localhost:5173
```

The experience app runs fully standalone — with no `VITE_API_BASE_URL` configured it uses localStorage, exactly like before.

## The workshop flow

```
#/login → #/experiences → #/instructions → [timer starts] → Faro → congrats → #/ranking
```

Participants must buy the **Camiseta azul, sin rayas (talla M)** with test card `4000056655665556`. The session layer (login, instructions, ranking) is fully accessible — the contrast with the intentionally broken Faro flow is part of the lesson.

## Accessibility traps

15 active traps across home, listing, detail, cart, checkout, and confirmation — see `apps/experience/src/traps/registry.js`. Moderator mode (`Ctrl+M`) annotates each trap with its WCAG SC and corrected HTML; click a `TR-XX` badge to expand its explanation.

## Kiosk

Fullscreen ranking display with automatic rotation across experiences (poll ~15 s) plus a PIN-gated admin mode at `#/admin` (add/edit/delete records, reset per experience or globally).

## Shared API

Azure Function App (Flex Consumption, Node 22) on Azure Table Storage:

- Public (event-key guarded writes): `POST /api/users`, `POST /api/results`, `GET /api/ranking`, `GET /api/experiences`, `GET /api/health`
- Admin (PIN guarded): `GET|POST|PATCH|DELETE /api/admin/results`, `DELETE /api/admin/results?experienceId=` (reset)

## Deployment

See [`docs/azure-deployment.md`](docs/azure-deployment.md) for the full step-by-step Azure provisioning guide (Function App, new SWA, secrets, GitHub Actions). Estimated cost: **< €0.50/month**.

## Testing

```bash
npm test    # all three suites: experience (94), kiosk (3), api (6)
npm run build
```

## Running the demo at an event

See [`docs/stand-setup.md`](docs/stand-setup.md) and [`docs/verification-checklist.md`](docs/verification-checklist.md).

## License

MIT
