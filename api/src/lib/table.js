// lib/table.js — Table Storage access layer
// Two tables: 'users' (username registry) and 'results' (ranking records,
// partitioned by experienceId).

import { TableClient } from '@azure/data-tables';

const RESULTS_TABLE = 'results';
const USERS_TABLE = 'users';

let clients = null;

function getConnectionString() {
  return process.env.STORAGE_CONNECTION_STRING || 'UseDevelopmentStorage=true';
}

export function getTableClients() {
  if (!clients) {
    const conn = getConnectionString();
    clients = {
      results: TableClient.fromConnectionString(conn, RESULTS_TABLE),
      users: TableClient.fromConnectionString(conn, USERS_TABLE),
    };
  }
  return clients;
}

// Test hook — inject fake clients.
export function _setClientsForTests(injected) {
  clients = injected;
}

export async function ensureTables() {
  const { results, users } = getTableClients();
  await Promise.all([
    results.createTable().catch(() => {}),
    users.createTable().catch(() => {}),
  ]);
}

// --- Users ---

export async function createUser(name, normalized) {
  const { users } = getTableClients();
  await users.createEntity({
    partitionKey: 'users',
    rowKey: normalized,
    name,
    createdAt: new Date().toISOString(),
  });
}

export async function userExists(normalized) {
  const { users } = getTableClients();
  try {
    await users.getEntity('users', normalized);
    return true;
  } catch (e) {
    if (e.statusCode === 404) return false;
    throw e;
  }
}

// --- Results ---

export async function createResult(record) {
  const { results } = getTableClients();
  const endedEpoch = new Date(record.endedAt).getTime();
  const rowKey = `${String(9999999999999 - endedEpoch)}-${crypto.randomUUID().slice(0, 8)}`;
  const entity = {
    partitionKey: record.experienceId,
    rowKey,
    user: record.user,
    elapsedMs: record.elapsedMs,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    result: record.result || 'completed',
  };
  await results.createEntity(entity);
  return { partitionKey: entity.partitionKey, rowKey: entity.rowKey };
}

export async function listResults(experienceId) {
  const { results } = getTableClients();
  const filter = experienceId
    ? `PartitionKey eq '${experienceId.replace(/'/g, "''")}'`
    : undefined;
  const entities = [];
  for await (const e of results.listEntities({ queryOptions: { filter } })) {
    entities.push(e);
  }
  return entities;
}

export async function updateResult(pk, rk, fields) {
  const { results } = getTableClients();
  await results.updateEntity({ partitionKey: pk, rowKey: rk, ...fields }, 'Merge');
}

export async function deleteResult(pk, rk) {
  const { results } = getTableClients();
  await results.deleteEntity(pk, rk);
}

export async function resetResults(experienceId) {
  const { results } = getTableClients();
  const entities = await listResults(experienceId);
  for (const e of entities) {
    await results.deleteEntity(e.partitionKey, e.rowKey);
  }
  return entities.length;
}
