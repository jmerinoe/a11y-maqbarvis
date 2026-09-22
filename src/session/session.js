// session.js — workshop session state and persistence
// localStorage['faro-users']:    registered usernames (persist across restarts)
// localStorage['faro-results']:  completed experience runs (ranking source)
// sessionStorage['faro-session']: active session per tab (survives reload)

const USERS_KEY = 'faro-users';
const RESULTS_KEY = 'faro-results';
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

export function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
