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

export function registerUser(rawName) {
  const name = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, reason: 'empty' };

  const users = loadJson(localStorage, USERS_KEY, []);
  const normalized = normalize(name);
  if (users.some((u) => u.normalized === normalized)) {
    return { ok: false, reason: 'duplicate' };
  }

  users.push({ name, normalized });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return { ok: true, name };
}

// API-backed registration with local fallback: a network failure must not
// block the workshop, so if the API is unreachable we register locally.
export async function registerUserAsync(rawName) {
  if (!apiEnabled()) return registerUser(rawName);

  const name = (rawName || '').trim().replace(/\s+/g, ' ');
  if (!name) return { ok: false, reason: 'empty' };

  try {
    const { data } = await apiRegisterUser(name);
    return data;
  } catch {
    return registerUser(rawName);
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

// Ascending by elapsed time; deterministic ties: earlier end, then username.
export function getRanking(experienceId, limit = 10) {
  return loadJson(localStorage, RESULTS_KEY, [])
    .filter((r) => r.experienceId === experienceId && r.result === 'completed')
    .sort(
      (a, b) =>
        a.elapsedMs - b.elapsedMs ||
        a.endedAt.localeCompare(b.endedAt) ||
        a.user.localeCompare(b.user)
    )
    .slice(0, limit);
}

// API-backed ranking with local fallback.
export async function fetchRanking(experienceId, limit = 10) {
  await flushPendingResults();
  if (apiEnabled()) {
    try {
      const { status, data } = await apiFetchRanking(experienceId);
      if (status === 200 && Array.isArray(data.ranking)) {
        return data.ranking.slice(0, limit);
      }
    } catch {
      // fall back to local data
    }
  }
  return getRanking(experienceId, limit);
}

export function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
