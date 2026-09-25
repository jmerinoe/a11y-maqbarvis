// api/client.js — thin client for the shared ranking API.
// Base URL and event key come from build-time env vars:
//   VITE_API_BASE_URL — e.g. https://<func>.azurewebsites.net
//   VITE_EVENT_KEY    — shared event key baked into the bundle
// With no base URL configured the app runs fully local (offline dev/tests).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const EVENT_KEY = import.meta.env.VITE_EVENT_KEY || '';
const TIMEOUT_MS = 6000;

export function apiEnabled() {
  return Boolean(BASE_URL);
}

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(EVENT_KEY ? { 'X-Event-Key': EVENT_KEY } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

export async function apiRegisterUser(name) {
  return request('POST', '/api/users', { name });
}

export async function apiSubmitResult(record) {
  return request('POST', '/api/results', record);
}

export async function apiFetchRanking(experienceId) {
  const qs = experienceId ? `?experienceId=${encodeURIComponent(experienceId)}` : '';
  return request('GET', `/api/ranking${qs}`);
}
