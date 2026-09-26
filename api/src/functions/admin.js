// functions/admin.js — admin endpoints (PIN-guarded CRUD + reset)

import { app } from '@azure/functions';
import { requireAdminPin } from '../lib/auth.js';
import {
  listResults,
  createResult,
  updateResult,
  deleteResult,
  resetResults,
  ensureTables,
} from '../lib/table.js';

app.http('adminResultsList', {
  methods: ['GET'],
  route: 'ops/results',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireAdminPin(request);
    if (denied) return denied;

    await ensureTables();
    const experienceId = request.query.get('experienceId');
    const entities = await listResults(experienceId || undefined);
    const results = entities
      .map((e) => ({
        partitionKey: e.partitionKey,
        rowKey: e.rowKey,
        user: e.user,
        experienceId: e.partitionKey,
        elapsedMs: e.elapsedMs,
        startedAt: e.startedAt,
        endedAt: e.endedAt,
        result: e.result,
      }))
      .sort((a, b) => a.elapsedMs - b.elapsedMs);
    return { jsonBody: { results } };
  },
});

app.http('adminResultsAdd', {
  methods: ['POST'],
  route: 'ops/results',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireAdminPin(request);
    if (denied) return denied;

    const body = await request.json().catch(() => ({}));
    const { user, experienceId, startedAt, endedAt, elapsedMs } = body;
    if (!user || !experienceId || !endedAt || typeof elapsedMs !== 'number' || elapsedMs <= 0) {
      return { status: 400, jsonBody: { ok: false, error: 'invalid result payload' } };
    }

    await ensureTables();
    const keys = await createResult({
      user: String(user),
      experienceId: String(experienceId),
      startedAt: startedAt || endedAt,
      endedAt,
      elapsedMs,
      result: body.result || 'completed',
    });
    return { status: 201, jsonBody: { ok: true, ...keys } };
  },
});

app.http('adminResultsUpdate', {
  methods: ['PATCH'],
  route: 'ops/results/{pk}/{rk}',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireAdminPin(request);
    if (denied) return denied;

    const { pk, rk } = request.params;
    const body = await request.json().catch(() => ({}));
    const allowed = {};
    if (body.user !== undefined) allowed.user = String(body.user);
    if (body.elapsedMs !== undefined) {
      const v = Number(body.elapsedMs);
      if (!Number.isFinite(v) || v <= 0) {
        return { status: 400, jsonBody: { ok: false, error: 'invalid elapsedMs' } };
      }
      allowed.elapsedMs = v;
    }
    if (body.startedAt !== undefined) allowed.startedAt = String(body.startedAt);
    if (body.endedAt !== undefined) allowed.endedAt = String(body.endedAt);
    if (body.result !== undefined) allowed.result = String(body.result);
    if (Object.keys(allowed).length === 0) {
      return { status: 400, jsonBody: { ok: false, error: 'no fields to update' } };
    }

    await ensureTables();
    try {
      await updateResult(pk, rk, allowed);
      return { jsonBody: { ok: true } };
    } catch (e) {
      if (e.statusCode === 404) {
        return { status: 404, jsonBody: { ok: false, error: 'not found' } };
      }
      throw e;
    }
  },
});

app.http('adminResultsDelete', {
  methods: ['DELETE'],
  route: 'ops/results/{pk}/{rk}',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireAdminPin(request);
    if (denied) return denied;

    const { pk, rk } = request.params;
    await ensureTables();
    try {
      await deleteResult(pk, rk);
      return { jsonBody: { ok: true } };
    } catch (e) {
      if (e.statusCode === 404) {
        return { status: 404, jsonBody: { ok: false, error: 'not found' } };
      }
      throw e;
    }
  },
});

app.http('adminResultsReset', {
  methods: ['DELETE'],
  route: 'ops/results',
  authLevel: 'anonymous',
  handler: async (request) => {
    const denied = requireAdminPin(request);
    if (denied) return denied;

    await ensureTables();
    const experienceId = request.query.get('experienceId');
    const deleted = await resetResults(experienceId || undefined);
    return { jsonBody: { ok: true, deleted } };
  },
});
