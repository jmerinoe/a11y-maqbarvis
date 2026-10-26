// tests/kiosk.test.js — presentation rendering and admin helpers

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatElapsed, setAdminPin, clearAdminPin, getVideoConfig, setVideoConfig, DEFAULT_VIDEO_URL } from '../api.js';
import { startPresentation, stopPresentation } from '../presentation.js';
import { renderAdminMode } from '../admin.js';

vi.mock('../api.js', async (importOriginal) => {
  const orig = await importOriginal();
  return {
    ...orig,
    api: {
      experiences: vi.fn(async () => ({ status: 200, data: { experiences: ['screen-reader'] } })),
      ranking: vi.fn(async () => ({
        status: 200,
        data: {
          ranking: [
            { user: 'Ana', elapsedMs: 222000, endedAt: '2026-01-01T00:00:00Z' },
            { user: 'Belén', elapsedMs: 240000, endedAt: '2026-01-01T00:01:00Z' },
          ],
        },
      })),
      adminResults: vi.fn(async () => ({ status: 200, data: { results: [] } })),
      adminAdd: vi.fn(async () => ({ status: 201, data: {} })),
      adminUpdate: vi.fn(async () => ({ status: 200, data: { ok: true } })),
      adminDelete: vi.fn(async () => ({ status: 200, data: { ok: true } })),
      adminReset: vi.fn(async () => ({ status: 200, data: { ok: true } })),
    },
  };
});

// jsdom runs on an opaque origin here and Node 22's experimental localStorage
// stub shadows the global — provide a minimal in-memory window.localStorage.
if (!window.localStorage) {
  const store = new Map();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => void store.set(k, String(v)),
      removeItem: (k) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
}

beforeEach(() => {
  stopPresentation();
  clearAdminPin();
  window.localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  vi.useRealTimers();
});

describe('formatElapsed', () => {
  it('formats MM:SS', () => {
    expect(formatElapsed(222000)).toBe('03:42');
    expect(formatElapsed(0)).toBe('00:00');
  });
});

describe('presentation mode', () => {
  it('renders the ranking table from the API', async () => {
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.k-row')).toHaveLength(2);
    });
    const rows = document.querySelectorAll('.k-row');
    expect(rows[0].textContent).toContain('Ana');
    expect(rows[0].textContent).toContain('03:42');
  });

  it('renders the route duration with an emphasized number', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValueOnce({
      status: 200,
      data: {
        ranking: [
          { user: 'Ana', elapsedMs: 222000, routeMinutes: 50, endedAt: '2026-01-01T00:00:00Z' },
        ],
      },
    });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.k-row')).toHaveLength(1);
    });
    const route = document.querySelector('.k-route');
    expect(route.textContent).toContain('RUTA');
    expect(route.querySelector('.k-route-num').textContent).toBe('50');
    expect(route.textContent).toContain('MINS.');
  });

  it('shows an empty state when there are no results', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValueOnce({ status: 200, data: { ranking: [] } });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelector('.k-empty')).not.toBeNull();
    });
  });

  it('clears the offline message when the API recovers', async () => {
    const { api } = await import('../api.js');
    api.experiences.mockRejectedValueOnce(new Error('cold start'));
    vi.useFakeTimers();
    startPresentation();
    await vi.advanceTimersByTimeAsync(0); // settle the failed poll + paint
    expect(document.querySelector('.k-empty')).not.toBeNull();
    await vi.advanceTimersByTimeAsync(5000); // offline fast-retry
    expect(document.querySelectorAll('.k-row')).toHaveLength(2);
    expect(document.querySelector('.k-empty')).toBeNull();
    vi.useRealTimers();
  });
});

describe('manual board navigation', () => {
  it('steps circularly and pauses auto-rotation', async () => {
    const { api } = await import('../api.js');
    api.experiences.mockResolvedValueOnce({
      status: 200,
      data: { experiences: ['screen-reader', 'chromatic'] },
    });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.k-row')).toHaveLength(2);
    });
    const next = document.getElementById('k-next');
    const prev = document.getElementById('k-prev');
    next.click();
    expect(document.querySelector('.k-index').textContent).toBe('2/2');
    next.click(); // wraps around to the first board
    expect(document.querySelector('.k-index').textContent).toBe('1/2');
    prev.click();
    expect(document.querySelector('.k-index').textContent).toBe('2/2');
    expect(document.getElementById('k-rotate-toggle').textContent).toBe('Reanudar rotación');
  });
});

describe('new record arrival', () => {
  it('jumps to the board that received the new record', async () => {
    const { api } = await import('../api.js');
    api.experiences.mockResolvedValue({
      status: 200,
      data: { experiences: ['screen-reader', 'chromatic'] },
    });
    const base = [{ user: 'Ana', elapsedMs: 222000, endedAt: '2026-01-01T00:00:00Z' }];
    api.ranking.mockImplementation(async (id) => ({ status: 200, data: { ranking: base } }));
    vi.useFakeTimers();
    startPresentation();
    await vi.advanceTimersByTimeAsync(0);
    const boardEl = document.querySelector('.kiosk-board');
    const before = boardEl.textContent;
    // The new record lands on the board that is NOT being displayed.
    const target = before.includes('BLIND') ? 'chromatic' : 'screen-reader';
    api.ranking.mockImplementation(async (id) => ({
      status: 200,
      data: {
        ranking:
          id === target
            ? [...base, { user: 'Belén', elapsedMs: 240000, endedAt: '2026-01-01T00:05:00Z' }]
            : base,
      },
    }));
    await vi.advanceTimersByTimeAsync(15000);
    expect(boardEl.textContent).not.toBe(before);
    expect(boardEl.textContent).toContain(target === 'chromatic' ? 'COLOR TRAP' : 'BLIND BUY');
    vi.useRealTimers();
  });
});

describe('video config', () => {
  it('defaults to ranking mode, 1 cycle and the local server URL', () => {
    expect(getVideoConfig()).toEqual({ mode: 'ranking', cycles: 1, url: DEFAULT_VIDEO_URL });
  });

  it('persists mode, cycles and url; sanitizes invalid cycles', () => {
    setVideoConfig({ mode: 'ranking+video', cycles: 3, url: 'http://localhost:8090/x.mp4' });
    expect(getVideoConfig()).toEqual({ mode: 'ranking+video', cycles: 3, url: 'http://localhost:8090/x.mp4' });
    setVideoConfig({ mode: 'video', cycles: 0, url: '' });
    expect(getVideoConfig().cycles).toBe(1);
  });
});

describe('video overlay', () => {
  it('stays hidden when the source never becomes playable', async () => {
    setVideoConfig({ mode: 'video', cycles: 1, url: 'http://localhost:8090/v.mp4' });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelector('.video-overlay')).not.toBeNull();
    });
    // jsdom never fires 'canplay' — after the timeout the overlay gives up.
    vi.useFakeTimers();
    await vi.advanceTimersByTimeAsync(4500);
    expect(document.querySelector('.video-overlay').hidden).toBe(true);
    vi.useRealTimers();
  });
});

describe('admin mode', () => {
  const rec = (over = {}) => ({
    partitionKey: 'chromatic',
    rowKey: 'rk1',
    user: 'Ana',
    experienceId: 'chromatic',
    elapsedMs: 222000,
    routeMinutes: 50,
    endedAt: '2026-01-01T00:00:00Z',
    ...over,
  });

  async function openAdmin(results) {
    const { api } = await import('../api.js');
    api.adminResults.mockResolvedValueOnce({ status: 200, data: { results } });
    setAdminPin('1234');
    renderAdminMode(document.getElementById('app'));
    await vi.waitFor(() => {
      expect(document.querySelector('.admin-table')).not.toBeNull();
    });
  }

  it('opens the edit form for an existing record', async () => {
    await openAdmin([rec()]);
    document.querySelector('.admin-edit').click();
    expect(document.querySelector('.edit-form')).not.toBeNull();
    expect(document.querySelector('#edit-route').value).toBe('50');
  });

  it('enables the route field only for the chromatic experience', async () => {
    await openAdmin([
      rec(),
      rec({ partitionKey: 'screen-reader', rowKey: 'rk2', experienceId: 'screen-reader', routeMinutes: undefined }),
    ]);
    const addRoute = document.getElementById('add-route');
    const expSelect = document.getElementById('add-exp');
    // Fixed list: first option is screen-reader → route field disabled
    expect(addRoute.disabled).toBe(true);
    expSelect.value = 'chromatic';
    expSelect.dispatchEvent(new Event('change'));
    expect(addRoute.disabled).toBe(false);

    const edits = [...document.querySelectorAll('.admin-edit')];
    edits[1].click();
    expect(document.querySelector('#edit-route').disabled).toBe(true);
  });

  it('enables the cycles input only in ranking+video mode', async () => {
    await openAdmin([]);
    const cycles = document.getElementById('video-cycles');
    expect(cycles.disabled).toBe(true); // default mode is 'ranking'
    const radio = document.querySelector('input[name="video-mode"][value="ranking+video"]');
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    expect(cycles.disabled).toBe(false);
  });
});
