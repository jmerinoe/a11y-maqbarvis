// session.js — workshop session state and persistence
// localStorage['faro-users']:           registered usernames (local fallback)
// localStorage['faro-results']:         completed runs (local fallback)
// localStorage['faro-results-pending']: runs not yet confirmed by the API
// sessionStorage['faro-session']:       active session per tab (survives reload)

import { apiEnabled, apiRegisterUser, apiSubmitResult, apiFetchRanking } from '../api/client.js';

const USERS_KEY = 'faro-users';
const RESULTS_KEY = 'faro-results';
const PENDING_KEY = 'faro-results-pending';
const SESSION_KEY = 'faro-session';

function normalize(name) {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function loadJson(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

// --- Users ---

// Uniqueness is scoped to the experience: the same name may participate
// once per experience, so duplicates are checked per experienceId.
export function registerUser(rawName, experienceId) {
  const name = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, reason: 'empty' };

  const users = loadJson(localStorage, USERS_KEY, []);
  const normalized = normalize(name);
  if (users.some((u) => u.normalized === normalized && u.experienceId === experienceId)) {
    return { ok: false, reason: 'duplicate' };
  }

  users.push({ name, normalized, experienceId });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, name };
}

// API-backed registration with local fallback: a network failure must not
// block the workshop, so if the API is unreachable we register locally.
export async function registerUserAsync(rawName, experienceId) {
  if (!apiEnabled()) return registerUser(rawName, experienceId);

  const name = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, reason: 'empty' };

  try {
    const { data } = await apiRegisterUser(name, experienceId);
    return data;
  } catch {
    return registerUser(rawName, experienceId);
  }
}

// --- Active session ---

export function getSession() {
  return loadJson(sessionStorage, SESSION_KEY, null);
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem('faro-pending-congrats');
  sessionStorage.removeItem('faro-pending-baseline');
  sessionStorage.removeItem('faro-pending-failed');
}

export function markTimerStarted() {
  const session = getSession();
  if (session && !session.startedAt) {
    session.startedAt = Date.now();
    setSession(session);
  }
  return session;
}

// --- Results / ranking ---

export function saveResult(record) {
  const results = loadJson(localStorage, RESULTS_KEY, []);
  results.push(record);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

function getPendingResults() {
  return loadJson(localStorage, PENDING_KEY, []);
}

function setPendingResults(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

// Submit a completed run: always recorded locally; when the API is
// configured it is also sent to the server and queued for retry on failure.
export async function submitResult(record) {
  saveResult(record);
  if (!apiEnabled()) return { ok: true, queued: false };

  try {
    const { status } = await apiSubmitResult(record);
    if (status >= 200 && status < 300) return { ok: true, queued: false };
  } catch {
    // fall through to queue
  }
  setPendingResults([...getPendingResults(), record]);
  return { ok: true, queued: true };
}

// Retry pending submissions; called when the ranking screen loads.
export async function flushPendingResults() {
  if (!apiEnabled()) return;
  const pending = getPendingResults();
  if (pending.length === 0) return;

  const remaining = [];
  for (const record of pending) {
    try {
      const { status } = await apiSubmitResult(record);
      if (status < 200 || status >= 300) remaining.push(record);
    } catch {
      remaining.push(record);
    }
  }
  setPendingResults(remaining);
}

// Shorter journeys first; records without routeMinutes rank last. Ties:
// elapsed time, then earlier end, then username.
const NO_ROUTE = Number.MAX_SAFE_INTEGER;
export function getRanking(experienceId, { limit = 10, all = false } = {}) {
  const sorted = loadJson(localStorage, RESULTS_KEY, [])
    .filter((r) => r.experienceId === experienceId && r.result === 'completed')
    .sort(
      (a, b) =>
        (a.routeMinutes ?? NO_ROUTE) - (b.routeMinutes ?? NO_ROUTE) ||
        a.elapsedMs - b.elapsedMs ||
        a.endedAt.localeCompare(b.endedAt) ||
        a.user.localeCompare(b.user)
    );
  return all ? sorted : sorted.slice(0, limit);
}

// API-backed ranking with local fallback.
export async function fetchRanking(experienceId, { limit = 10, all = false } = {}) {
  await flushPendingResults();
  if (apiEnabled()) {
    try {
      const { status, data } = await apiFetchRanking(experienceId, all);
      if (status === 200 && Array.isArray(data.ranking)) {
        return all ? data.ranking : data.ranking.slice(0, limit);
      }
    } catch {
      // fall back to local data
    }
  }
  return getRanking(experienceId, { limit, all });
}

// 10-row slice of the full sorted ranking centered on the participant:
// 4 rows above + their best run + 5 rows below, clamped at both ends.
// offset = number of rows skipped, so callers render real positions.
export function rankingWindow(sorted, user) {
  if (sorted.length <= 10) return { rows: sorted, offset: 0 };
  const selfIdx = sorted.findIndex((r) => r.user === user);
  if (selfIdx === -1) return { rows: sorted.slice(0, 10), offset: 0 };
  const rank = selfIdx + 1;
  let start = 1;
  if (rank > sorted.length - 10) start = sorted.length - 9;
  else if (rank > 10) start = rank - 4;
  return { rows: sorted.slice(start - 1, start + 9), offset: start - 1 };
}

export function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
