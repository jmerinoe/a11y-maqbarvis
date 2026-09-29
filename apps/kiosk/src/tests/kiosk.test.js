// tests/kiosk.test.js — presentation rendering and admin helpers

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatElapsed, setAdminPin, clearAdminPin } from '../api.js';
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

beforeEach(() => {
  stopPresentation();
  clearAdminPin();
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
    // First option is chromatic (from results) → route field enabled
    expect(addRoute.disabled).toBe(false);
    expSelect.value = 'screen-reader';
    expSelect.dispatchEvent(new Event('change'));
    expect(addRoute.disabled).toBe(true);

    const edits = [...document.querySelectorAll('.admin-edit')];
    edits[1].click();
    expect(document.querySelector('#edit-route').disabled).toBe(true);
  });
});
