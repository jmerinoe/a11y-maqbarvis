// abandon-experience.test.js — "Me rindo" flow: give-up button lifecycle
// with the session timer, confirmation + abandoned dialogs, DNF result
// recording (always ranked after completed runs), DNF marks on the
// ranking screen, and no resubmission on post-abandon replays.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderRanking } from '../screens/ranking.js';
import { renderCheckout } from '../experiences/screen-reader/screens/checkout.js';
import {
  getSession,
  setSession,
  clearSession,
  getRanking,
  saveResult,
} from '../session/session.js';
import { mountExperienceTimer, stopExperienceTimer } from '../components/experience-timer.js';
import { requestAbandon } from '../components/abandon-dialog.js';
import { addToCart, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

const VALID_CARD = '4000056655665556';

function mk(user, ms, i = 0, result = 'completed') {
  return {
    user,
    experienceId: 'screen-reader',
    startedAt: '',
    endedAt: `2026-01-01T00:${String(i % 60).padStart(2, '0')}:00Z`,
    elapsedMs: ms,
    result,
  };
}

function localResults() {
  return JSON.parse(localStorage.getItem('faro-results') || '[]');
}

function fillCheckoutForm() {
  document.getElementById('ck-name').value = 'Ana';
  document.getElementById('ck-email').value = 'ana@test.dev';
  document.getElementById('ck-address').value = 'Calle Mayor 1';
  document.getElementById('ck-num').value = VALID_CARD;
  document.getElementById('ck-fecha').value = '12/28';
  document.getElementById('ck-dig').value = '123';
}

describe('Give up — abandon a run', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    window.location.hash = '#/home';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    clearSession();
    stopExperienceTimer();
    localStorage.clear();
    sessionStorage.clear();
    document.querySelectorAll('.congrats-overlay').forEach((el) => el.remove());
    document.body.innerHTML = '';
  });

  it('mounts the give-up button with the timer and removes both on stop', () => {
    mountExperienceTimer(Date.now());
    expect(document.getElementById('experience-timer')).not.toBeNull();
    const btn = document.getElementById('give-up-btn');
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.textContent).toBe('Me rindo');

    stopExperienceTimer();
    expect(document.getElementById('experience-timer')).toBeNull();
    expect(document.getElementById('give-up-btn')).toBeNull();
  });

  it('cancelling the confirmation records nothing and keeps the run alive', () => {
    setSession({ user: 'Ana', experienceId: 'screen-reader', startedAt: Date.now() - 60000 });
    mountExperienceTimer(getSession().startedAt);

    document.getElementById('give-up-btn').click();
    expect(document.querySelector('.congrats-dialog')).not.toBeNull();

    document.getElementById('giveup-no').click();
    expect(document.querySelector('.congrats-overlay')).toBeNull();
    expect(localResults()).toHaveLength(0);
    // The run is still live: session untouched, timer + button still mounted.
    expect(getSession().completedAt).toBeUndefined();
    expect(document.getElementById('give-up-btn')).not.toBeNull();
  });

  it('Escape on the confirmation dialog also cancels', () => {
    setSession({ user: 'Ana', experienceId: 'screen-reader', startedAt: Date.now() - 60000 });
    requestAbandon();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.congrats-overlay')).toBeNull();
    expect(localResults()).toHaveLength(0);
  });

  it('confirming records an abandoned result, flags the session and shows the closing dialog', () => {
    const startedAt = Date.now() - 90000;
    setSession({ user: 'Ana', experienceId: 'screen-reader', startedAt });
    mountExperienceTimer(startedAt);

    document.getElementById('give-up-btn').click();
    document.getElementById('giveup-yes').click();

    const results = localResults();
    expect(results).toHaveLength(1);
    expect(results[0].result).toBe('abandoned');
    expect(results[0].user).toBe('Ana');
    expect(results[0].elapsedMs).toBeGreaterThanOrEqual(90000);

    const session = getSession();
    expect(session.abandoned).toBe(true);
    expect(session.completedAt).toBeTypeOf('number');

    // Timer + button are gone; the closing dialog is up.
    expect(document.getElementById('give-up-btn')).toBeNull();
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.textContent).toContain('Lo sentimos, no has completado la experiencia');
    expect(dialog.textContent).toContain('Tiempo empleado');
  });

  it('"Ver ranking" on the closing dialog navigates to the ranking', () => {
    setSession({ user: 'Ana', experienceId: 'screen-reader', startedAt: Date.now() - 5000 });
    requestAbandon();
    document.getElementById('giveup-yes').click();
    document.getElementById('abandoned-ranking').click();
    expect(window.location.hash).toBe('#/ranking');
  });

  it('does not abandon a session that is not running', () => {
    setSession({ user: 'Ana', experienceId: 'screen-reader' }); // no startedAt
    requestAbandon();
    expect(document.querySelector('.congrats-overlay')).toBeNull();
  });

  it('a post-abandon replay completion is not resubmitted', () => {
    setSession({
      user: 'Ana',
      experienceId: 'screen-reader',
      startedAt: Date.now() - 30000,
      abandoned: true,
    });
    saveResult(mk('Ana', 30000, 0, 'abandoned'));

    addToCart('p001', 'M', 'blue'); // required item — mission fulfilled
    renderCheckout(document.getElementById('app'));
    fillCheckoutForm();
    document.getElementById('checkout-form').dispatchEvent(new Event('submit', { cancelable: true }));

    // Still a single standing record: the DNF. No completed run was added.
    const results = localResults();
    expect(results).toHaveLength(1);
    expect(results[0].result).toBe('abandoned');
    // The congrats shows a plain single time — no pending baseline NaN.
    expect(sessionStorage.getItem('faro-pending-baseline')).toBeNull();
    expect(sessionStorage.getItem('faro-pending-congrats')).not.toBeNull();
  });
});

describe('DNF ordering and marking', () => {
  beforeEach(() => {
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('ranks abandoned runs after every completed one, ordered by elapsed time', () => {
    saveResult(mk('Fast', 60000, 1));
    saveResult(mk('DNF-fast', 30000, 2, 'abandoned')); // quicker but DNF
    saveResult(mk('Slow', 120000, 3));
    saveResult(mk('DNF-slow', 90000, 4, 'abandoned'));

    expect(getRanking('screen-reader', { all: true }).map((r) => r.user)).toEqual([
      'Fast',
      'Slow',
      'DNF-fast',
      'DNF-slow',
    ]);
  });

  it('marks DNF rows with a badge and a screen-reader cue', async () => {
    saveResult(mk('Ana', 60000, 1));
    saveResult(mk('Belén', 90000, 2, 'abandoned'));
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    const rows = [...document.querySelectorAll('.ranking-table tbody tr')];
    expect(rows[0].querySelector('td').textContent).toBe('1');
    expect(rows[1].classList.contains('ranking-dnf')).toBe(true);
    expect(rows[1].querySelector('.ranking-dnf-badge').textContent).toBe('DNF');
    expect(rows[1].textContent).toContain('experiencia no completada');
    expect(rows[1].querySelector('td').textContent).toBe('2'); // real position
  });

  it('anchors the participant window on their DNF record', async () => {
    for (let i = 1; i <= 30; i++) saveResult(mk(`u${i}`, i * 10000, i));
    saveResult(mk('Ana', 50000, 31, 'abandoned')); // ranks 31st — tail
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
    await renderRanking(document.getElementById('app'));

    const positions = [...document.querySelectorAll('.ranking-table tbody tr')].map(
      (tr) => Number(tr.querySelector('td').textContent)
    );
    expect(positions).toEqual([22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
    const self = document.querySelector('tr.ranking-self');
    expect(self.classList.contains('ranking-dnf')).toBe(true);
    expect(self.querySelector('td').textContent).toBe('31');
  });
});
