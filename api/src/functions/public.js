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

    const normalized = normalize(name);
    await ensureTables();
    if (await userExists(normalized)) {
      return { status: 200, jsonBody: { ok: false, reason: 'duplicate' } };
    }
    await createUser(name, normalized);
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
    const { user, experienceId, startedAt, endedAt, elapsedMs } = body;
    if (
      !user || !experienceId || !startedAt || !endedAt ||
      typeof elapsedMs !== 'number' || elapsedMs <= 0
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

    const sorted = entities
      .filter((e) => e.result === 'completed')
      .sort(
        (a, b) =>
          a.elapsedMs - b.elapsedMs ||
          String(a.endedAt).localeCompare(String(b.endedAt)) ||
          String(a.user).localeCompare(String(b.user))
      )
      .slice(0, 10)
      .map((e) => ({
        user: e.user,
        experienceId: e.partitionKey,
        elapsedMs: e.elapsedMs,
        startedAt: e.startedAt,
        endedAt: e.endedAt,
      }));

    return { jsonBody: { ranking: sorted } };
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
