// tests/kiosk.test.js — presentation rendering and admin helpers

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatElapsed } from '../api.js';
import { startPresentation, stopPresentation } from '../presentation.js';

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
    },
  };
});

beforeEach(() => {
  stopPresentation();
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
      expect(document.querySelector('.kiosk-table')).not.toBeNull();
    });
    const rows = document.querySelectorAll('.kiosk-table tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Ana');
    expect(rows[0].textContent).toContain('03:42');
  });

  it('shows an empty state when there are no results', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValueOnce({ status: 200, data: { ranking: [] } });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelector('.kiosk-empty')).not.toBeNull();
    });
  });
});
