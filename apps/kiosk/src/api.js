// api.js — kiosk client for the shared ranking API.
//   VITE_API_BASE_URL — e.g. https://<func>.azurewebsites.net
// Admin calls send the PIN entered in admin mode (sessionStorage only).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TIMEOUT_MS = 8000;
const PIN_KEY = 'kiosk-admin-pin';

export function getAdminPin() {
  return sessionStorage.getItem(PIN_KEY) || '';
}

export function setAdminPin(pin) {
  sessionStorage.setItem(PIN_KEY, pin);
}

export function clearAdminPin() {
  sessionStorage.removeItem(PIN_KEY);
}

async function request(method, path, { body, admin } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (admin) headers['X-Admin-Pin'] = getAdminPin();
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  ranking: (experienceId) =>
    request('GET', `/api/ranking${experienceId ? `?experienceId=${encodeURIComponent(experienceId)}` : ''}`),
  experiences: () => request('GET', '/api/experiences'),
  adminResults: (experienceId) =>
    request('GET', `/api/ops/results${experienceId ? `?experienceId=${encodeURIComponent(experienceId)}` : ''}`, { admin: true }),
  adminAdd: (record) => request('POST', '/api/ops/results', { body: record, admin: true }),
  adminUpdate: (pk, rk, fields) =>
    request('PATCH', `/api/ops/results/${encodeURIComponent(pk)}/${encodeURIComponent(rk)}`, { body: fields, admin: true }),
  adminDelete: (pk, rk) =>
    request('DELETE', `/api/ops/results/${encodeURIComponent(pk)}/${encodeURIComponent(rk)}`, { admin: true }),
  adminReset: (experienceId) =>
    request('DELETE', `/api/ops/results${experienceId ? `?experienceId=${encodeURIComponent(experienceId)}` : ''}`, { admin: true }),
};

export function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
