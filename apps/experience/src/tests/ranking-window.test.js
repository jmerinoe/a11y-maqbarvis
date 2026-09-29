// ranking-window.test.js — the ranking screen shows a 10-row window
// centered on the current participant (4 above + self + 5 below),
// clamped to top-10 / bottom-10, with real positions and a highlighted
// self row; falls back to top-10 when the participant isn't ranked.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderRanking } from '../screens/ranking.js';
import {
  setSession,
  clearSession,
  saveResult,
  rankingWindow,
} from '../session/session.js';
import { setLanguage } from '../i18n/index.js';
import { clearCart } from '../store.js';

function mk(user, ms, i = 0) {
  return {
    user,
    experienceId: 'screen-reader',
    startedAt: '',
    endedAt: `2026-01-01T00:${String(i % 60).padStart(2, '0')}:00Z`,
    elapsedMs: ms,
    result: 'completed',
  };
}

// Deterministic sorted list: u1 best … uN worst (10s apart)
function seed(n) {
  for (let i = 1; i <= n; i++) saveResult(mk(`u${i}`, i * 10000, i));
}

function positions() {
  return [...document.querySelectorAll('.ranking-table tbody tr')].map(
    (tr) => Number(tr.querySelector('td').textContent)
  );
}

describe('Ranking window', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('returns all rows when the list has 10 or fewer entries', () => {
    const sorted = [mk('a', 1), mk('b', 2), mk('c', 3)];
    expect(rankingWindow(sorted, 'a')).toEqual({ rows: sorted, offset: 0 });
  });

  it('centers a mid-ranked participant: 4 above, self, 5 below', async () => {
    seed(25);
    saveResult(mk('Ana', 115000, 26)); // ranks 12th of 26
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    expect(positions()).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const self = document.querySelector('tr.ranking-self');
    expect(self).not.toBeNull();
    expect(self.querySelector('td').textContent).toBe('12');
    expect(self.querySelector('.sr-only').textContent).toBe('— tu posición');
  });

  it('shows the top-10 when the participant ranks inside it', async () => {
    seed(30);
    saveResult(mk('Ana', 55000, 31)); // ranks 6th
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    expect(positions()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(document.querySelector('tr.ranking-self td').textContent).toBe('6');
  });

  it('shows the last 10 when the participant ranks in the bottom 10', async () => {
    seed(30);
    saveResult(mk('Ana', 280000, 31)); // ranks 28th of 31
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    expect(positions()).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
  });

  it('shows the empty state without a session (no experience context)', async () => {
    seed(20);
    await renderRanking(document.getElementById('app'));

    expect(document.querySelector('.ranking-table')).toBeNull();
    expect(document.body.textContent).toContain('Todavía no hay tiempos registrados');
  });

  it('falls back to top-10 when the participant has no completed run', async () => {
    seed(20);
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    expect(positions()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(document.querySelector('tr.ranking-self')).toBeNull();
  });

  it('ranks chromatic results by route duration first, then elapsed time', async () => {
    // Shorter journey beats faster completion time; missing duration goes last.
    saveResult({ ...mk('Lento', 60000, 1), experienceId: 'chromatic', routeMinutes: 58 });
    saveResult({ ...mk('Rapido', 200000, 2), experienceId: 'chromatic', routeMinutes: 50 });
    saveResult({ ...mk('Empate', 100000, 3), experienceId: 'chromatic', routeMinutes: 50 });
    saveResult({ ...mk('Antiguo', 5000, 4), experienceId: 'chromatic' });
    setSession({ user: 'Rapido', experienceId: 'chromatic' });
    await renderRanking(document.getElementById('app'));

    const rows = [...document.querySelectorAll('.ranking-table tbody tr')];
    // Read the first text node only: the self row carries an sr-only suffix.
    expect(
      rows.map((tr) => tr.querySelectorAll('td')[1].childNodes[0].textContent)
    ).toEqual([
      'Empate',
      'Rapido',
      'Lento',
      'Antiguo',
    ]);

    const headers = [...document.querySelectorAll('.ranking-table thead th')].map(
      (th) => th.textContent
    );
    expect(headers).toEqual([
      'Posición',
      'Usuario',
      'Duración trayecto',
      'Tiempo',
    ]);
    expect(rows[0].textContent).toContain('50 min');
    expect(rows[3].textContent).toContain('—');
  });

  it('anchors on the best run and highlights every self row in the window', async () => {
    seed(25);
    saveResult(mk('Ana', 115000, 26)); // 12th
    saveResult(mk('Ana', 135000, 27)); // 14th
    saveResult(mk('Ana', 290000, 28)); // 26th, outside the window
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    const selfRows = document.querySelectorAll('tr.ranking-self');
    expect(selfRows.length).toBe(2);
    expect(selfRows[0].querySelector('td').textContent).toBe('12');
    expect(selfRows[1].querySelector('td').textContent).toBe('15');
  });
});
