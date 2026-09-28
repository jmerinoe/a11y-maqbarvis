// tests/kiosk-a11y.test.js — accessibility coverage for the kiosk:
// presentation semantics, live regions, rotation pause, admin labels,
// toggle/table semantics, focus and document titles.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startPresentation, stopPresentation } from '../presentation.js';
import { renderAdminMode } from '../admin.js';
import { setAdminPin, clearAdminPin } from '../api.js';

const MANY_ROWS = Array.from({ length: 12 }, (_, i) => ({
  user: `User ${i + 1}`,
  elapsedMs: 200000 + i * 1000,
  endedAt: `2026-01-01T00:${String(i).padStart(2, '0')}:00Z`,
}));

vi.mock('../api.js', async (importOriginal) => {
  const orig = await importOriginal();
  return {
    ...orig,
    api: {
      experiences: vi.fn(async () => ({ status: 200, data: { experiences: ['screen-reader'] } })),
      ranking: vi.fn(async () => ({ status: 200, data: { ranking: [] } })),
      adminResults: vi.fn(async () => ({
        status: 200,
        data: {
          results: [
            {
              partitionKey: 'screen-reader',
              rowKey: 'rk1',
              user: 'Ana',
              experienceId: 'screen-reader',
              elapsedMs: 222000,
              endedAt: '2026-01-01T00:00:00Z',
            },
          ],
        },
      })),
      adminAdd: vi.fn(async () => ({ status: 201 })),
      adminUpdate: vi.fn(async () => ({ status: 200 })),
      adminDelete: vi.fn(async () => ({ status: 204 })),
      adminReset: vi.fn(async () => ({ status: 204 })),
    },
  };
});

beforeEach(() => {
  stopPresentation();
  clearAdminPin();
  document.body.innerHTML = '<div id="app"></div>';
  location.hash = '#/';
  vi.useRealTimers();
});

async function renderAdmin() {
  const app = document.getElementById('app');
  renderAdminMode(app);
  await vi.waitFor(() => {
    expect(document.querySelector('.admin-table')).not.toBeNull();
  });
}

describe('presentation accessibility', () => {
  it('renders rows as list items inside ordered lists', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValue({ status: 200, data: { ranking: MANY_ROWS } });
    startPresentation();
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.k-row')).toHaveLength(12);
    });

    const cols = document.querySelectorAll('ol.k-col');
    expect(cols).toHaveLength(2); // ≥10 rows → two columns
    expect(cols[0].getAttribute('start')).toBe('1');
    expect(cols[1].getAttribute('start')).toBe('7');
    expect(document.querySelectorAll('li.k-row')).toHaveLength(12);
  });

  it('announces status changes via a polite live region', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValue({ status: 200, data: { ranking: [] } });
    startPresentation();
    await vi.waitFor(() => {
      const status = document.querySelector('.sr-status');
      expect(status).not.toBeNull();
      expect(status.getAttribute('role')).toBe('status');
      expect(status.textContent).toContain('Esperando jugadores');
    });
  });

  it('marks the record banner as a status region', async () => {
    const { api } = await import('../api.js');
    api.ranking.mockResolvedValue({ status: 200, data: { ranking: [] } });
    startPresentation();
    await vi.waitFor(() => {
      const banner = document.querySelector('.record-banner');
      expect(banner.getAttribute('role')).toBe('status');
    });
  });

  it('lets the operator pause the experience rotation', async () => {
    startPresentation();
    await vi.waitFor(() => {
      expect(document.getElementById('k-rotate-toggle')).not.toBeNull();
    });
    const btn = document.getElementById('k-rotate-toggle');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    btn.click();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.textContent).toContain('Reanudar');
    btn.click();
    expect(btn.getAttribute('aria-pressed')).toBe('false');
  });
});

describe('admin accessibility', () => {
  beforeEach(() => setAdminPin('1234'));

  it('every add-form control has an accessible name', async () => {
    await renderAdmin();
    for (const id of ['add-user', 'add-exp', 'add-exp-new', 'add-time']) {
      const el = document.getElementById(id);
      expect(el).not.toBeNull();
      const label = document.querySelector(`label[for="${id}"]`);
      expect(label || el.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('results table headers have scope and the actions column is named', async () => {
    await renderAdmin();
    const headers = document.querySelectorAll('.admin-table th');
    headers.forEach((th) => expect(th.getAttribute('scope')).toBe('col'));
    expect(headers[4].textContent.trim()).not.toBe('');
  });

  it('theme buttons expose pressed state', async () => {
    await renderAdmin();
    const btns = document.querySelectorAll('.theme-btn');
    expect(btns.length).toBeGreaterThan(0);
    btns.forEach((b) => expect(['true', 'false']).toContain(b.getAttribute('aria-pressed')));
    expect(document.querySelector('.theme-btn[aria-pressed="true"]')).not.toBeNull();
  });

  it('moves focus to the screen h1 after rendering', async () => {
    await renderAdmin();
    expect(document.activeElement).toBe(document.querySelector('.admin-header h1'));
  });

  it('row actions are labelled per record', async () => {
    await renderAdmin();
    expect(document.querySelector('.admin-edit').getAttribute('aria-label')).toContain('Ana');
    expect(document.querySelector('.admin-del').getAttribute('aria-label')).toContain('Ana');
  });
});
