// tests/table.test.js — tests for the table storage layer and request handlers
// Uses an in-memory fake of @azure/data-tables so no Azurite is needed.

import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map(); // key: `${pk}|${rk}` → entity

const fakeTable = {
  createTable: vi.fn(async () => {}),
  createEntity: vi.fn(async (entity) => {
    const key = `${entity.partitionKey}|${entity.rowKey}`;
    if (store.has(key)) {
      const err = new Error('entity exists');
      err.statusCode = 409;
      throw err;
    }
    store.set(key, { ...entity });
  }),
  getEntity: vi.fn(async (pk, rk) => {
    const key = `${pk}|${rk}`;
    if (!store.has(key)) {
      const err = new Error('not found');
      err.statusCode = 404;
      throw err;
    }
    return store.get(key);
  }),
  updateEntity: vi.fn(async (entity) => {
    const key = `${entity.partitionKey}|${entity.rowKey}`;
    if (!store.has(key)) {
      const err = new Error('not found');
      err.statusCode = 404;
      throw err;
    }
    store.set(key, { ...store.get(key), ...entity });
  }),
  deleteEntity: vi.fn(async (pk, rk) => {
    const key = `${pk}|${rk}`;
    if (!store.has(key)) {
      const err = new Error('not found');
      err.statusCode = 404;
      throw err;
    }
    store.delete(key);
  }),
  listEntities: vi.fn(async function* ({ queryOptions } = {}) {
    const m = queryOptions?.filter?.match(/PartitionKey eq '([^']+)'/);
    for (const e of store.values()) {
      if (m && e.partitionKey !== m[1]) continue;
      yield e;
    }
  }),
};

vi.mock('@azure/data-tables', () => ({
  TableClient: {
    fromConnectionString: () => fakeTable,
  },
}));

// force module reload per test is not needed — table.js caches clients, fine.
const { createUser, userExists, createResult, listResults, updateResult, deleteResult, resetResults } =
  await import('../src/lib/table.js');

beforeEach(() => {
  store.clear();
  vi.clearAllMocks();
});

describe('users', () => {
  it('registers a user and detects duplicates', async () => {
    await createUser('Jorge', 'jorge');
    expect(await userExists('jorge')).toBe(true);
    expect(await userExists('belen')).toBe(false);
  });
});

describe('results', () => {
  it('creates a result partitioned by experienceId', async () => {
    const keys = await createResult({
      user: 'jorge',
      experienceId: 'voice-reader',
      startedAt: '2025-01-01T10:00:00Z',
      endedAt: '2025-01-01T10:05:00Z',
      elapsedMs: 300000,
    });
    expect(keys.partitionKey).toBe('voice-reader');
    expect(keys.rowKey).toBeTruthy();
  });

  it('lists results filtered by experienceId', async () => {
    await createResult({ user: 'a', experienceId: 'exp1', startedAt: '2025-01-01T10:00:00Z', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 100 });
    await createResult({ user: 'b', experienceId: 'exp2', startedAt: '2025-01-01T10:00:00Z', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 200 });
    const exp1 = await listResults('exp1');
    expect(exp1).toHaveLength(1);
    expect(exp1[0].user).toBe('a');
    const all = await listResults();
    expect(all).toHaveLength(2);
  });

  it('updates a result', async () => {
    const keys = await createResult({ user: 'a', experienceId: 'exp1', startedAt: 'x', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 100 });
    await updateResult(keys.partitionKey, keys.rowKey, { elapsedMs: 250, user: 'a2' });
    const list = await listResults('exp1');
    expect(list[0].elapsedMs).toBe(250);
    expect(list[0].user).toBe('a2');
  });

  it('deletes a result', async () => {
    const keys = await createResult({ user: 'a', experienceId: 'exp1', startedAt: 'x', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 100 });
    await deleteResult(keys.partitionKey, keys.rowKey);
    expect(await listResults('exp1')).toHaveLength(0);
  });

  it('resets per-experience', async () => {
    await createResult({ user: 'a', experienceId: 'exp1', startedAt: 'x', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 100 });
    await createResult({ user: 'b', experienceId: 'exp2', startedAt: 'x', endedAt: '2025-01-01T10:05:00Z', elapsedMs: 200 });
    const deleted = await resetResults('exp1');
    expect(deleted).toBe(1);
    expect(await listResults()).toHaveLength(1);
  });
});
