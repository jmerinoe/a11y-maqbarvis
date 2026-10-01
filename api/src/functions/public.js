// functions/public.js — public API endpoints (event-key guarded writes,
// open reads for ranking/experiences, health check)

import { app } from '@azure/functions';
import { requireEventKey } from '../lib/auth.js';
import { createUser, userExists, createResult, listResults, ensureTables } from '../lib/table.js';

function normalize(name) {
  return (name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

app.http('health', {
  methods: ['GET'],
  route: 'health',
  authLevel: 'anonymous',
  handler: async () => ({ jsonBody: { status: 'ok' } }),
});

app.http('users', {
  methods: ['POST'],
  route: 'users',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireEventKey(request);
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    const name = (body.name || '').trim().replace(/\s+/g, ' ');
    if (!name) {
      return { status: 200, jsonBody: { ok: false, reason: 'empty' } };
    }
    // Registration is per experience: the same name may join each
    // experience once. Bundles from before that change post only {name} —
    // keep them working under the legacy global 'users' partition.
    const experienceId = (body.experienceId || '').trim() || 'users';

    const normalized = normalize(name);
    await ensureTables();
    if (await userExists(experienceId, normalized)) {
      return { status: 200, jsonBody: { ok: false, reason: 'duplicate' } };
    }
    await createUser(name, normalized, experienceId);
    return { status: 200, jsonBody: { ok: true, name } };
  },
});

app.http('results', {
  methods: ['POST'],
  route: 'results',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireEventKey(request);
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    const { user, experienceId, startedAt, endedAt, elapsedMs, routeMinutes, appointmentAt } = body;
    if (
      !user || !experienceId || !startedAt || !endedAt ||
      typeof elapsedMs !== 'number' || elapsedMs <= 0 ||
      (routeMinutes != null && typeof routeMinutes !== 'number') ||
      (appointmentAt != null && typeof appointmentAt !== 'string')
    ) {
      return { status: 400, jsonBody: { ok: false, error: 'invalid result payload' } };
    }

    await ensureTables();
    const keys = await createResult({
      user: String(user),
      experienceId: String(experienceId),
      startedAt,
      endedAt,
      elapsedMs,
      routeMinutes,
      appointmentAt,
      result: 'completed',
    });
    return { status: 201, jsonBody: { ok: true, ...keys } };
  },
});

app.http('ranking', {
  methods: ['GET'],
  route: 'ranking',
  authLevel: 'anonymous',
  handler: async (request) => {
    const experienceId = request.query.get('experienceId');
    await ensureTables();
    const entities = await listResults(experienceId || undefined);

    // Comprehension: closest booked appointment first. Chromatic:
    // shorter journeys first. Records without the per-experience metric
    // rank last. Ties fall back to elapsed time, earlier end, username.
    const noSlot = '9999';
    const noRoute = Number.MAX_SAFE_INTEGER;
    const sorted = entities
      .filter((e) => e.result === 'completed')
      .sort(
        (a, b) =>
          String(a.appointmentAt ?? noSlot).localeCompare(String(b.appointmentAt ?? noSlot)) ||
          (a.routeMinutes ?? noRoute) - (b.routeMinutes ?? noRoute) ||
          a.elapsedMs - b.elapsedMs ||
          String(a.endedAt).localeCompare(String(b.endedAt)) ||
          String(a.user).localeCompare(String(b.user))
      );

    // Without `all`, cap at 20 — the kiosk board only shows 2 columns of 10.
    // `all=1` returns the full list so the experience app can window the
    // ranking around the current participant's position.
    const capped = request.query.get('all') === '1' ? sorted : sorted.slice(0, 20);

    return {
      jsonBody: {
        ranking: capped.map((e) => ({
          user: e.user,
          experienceId: e.partitionKey,
          elapsedMs: e.elapsedMs,
          routeMinutes: e.routeMinutes,
          appointmentAt: e.appointmentAt,
          startedAt: e.startedAt,
          endedAt: e.endedAt,
        })),
      },
    };
  },
});

app.http('experiences', {
  methods: ['GET'],
  route: 'experiences',
  authLevel: 'anonymous',
  handler: async () => {
    await ensureTables();
    const entities = await listResults();
    const ids = [...new Set(entities.map((e) => e.partitionKey))];
    return { jsonBody: { experiences: ids } };
  },
});
