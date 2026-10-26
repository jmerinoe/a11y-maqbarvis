/* global __KIOSK_BUILD__ */
// api.js — kiosk client for the shared ranking API.
//   VITE_API_BASE_URL — e.g. https://<func>.azurewebsites.net
// Admin calls send the PIN entered in admin mode (sessionStorage only).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TIMEOUT_MS = 8000;
const PIN_KEY = 'kiosk-admin-pin';
const THEME_KEY = 'kiosk-theme';
const VIDEO_KEY = 'kiosk-video';

export const KIOSK_THEMES = ['arcade-clean', 'arcade', 'classic', 'glass'];
export const DEFAULT_THEME = 'arcade-clean';

// Promo video config. Unlike the theme, this is NOT build-scoped: a redeploy
// must not silently disable the video mid-event.
export const VIDEO_MODES = ['ranking', 'video', 'ranking+video'];
export const DEFAULT_VIDEO_URL = 'http://localhost:8090/ally_1.mp4';

export function getVideoConfig() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(VIDEO_KEY));
    return {
      mode: VIDEO_MODES.includes(saved?.mode) ? saved.mode : 'ranking',
      cycles: Number.isInteger(saved?.cycles) && saved.cycles >= 1 ? saved.cycles : 1,
      url: typeof saved?.url === 'string' ? saved.url : DEFAULT_VIDEO_URL,
    };
  } catch {
    return { mode: 'ranking', cycles: 1, url: DEFAULT_VIDEO_URL };
  }
}

export function setVideoConfig({ mode, cycles, url }) {
  if (!VIDEO_MODES.includes(mode)) return;
  window.localStorage.setItem(
    VIDEO_KEY,
    JSON.stringify({
      mode,
      cycles: Number.isInteger(cycles) && cycles >= 1 ? cycles : 1,
      url: String(url ?? '').trim(),
    })
  );
}

// Theme persists across reloads but resets to the default on every deploy:
// the stored value is only honoured if it was saved under this build.
export function getKioskTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY));
    if (saved?.build === __KIOSK_BUILD__ && KIOSK_THEMES.includes(saved.theme)) {
      return saved.theme;
    }
  } catch { /* corrupted or missing */ }
  return DEFAULT_THEME;
}

export function setKioskTheme(theme) {
  if (!KIOSK_THEMES.includes(theme)) return;
  localStorage.setItem(THEME_KEY, JSON.stringify({ theme, build: __KIOSK_BUILD__ }));
}

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
