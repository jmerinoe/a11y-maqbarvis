// retry-mission.test.js — the ranking screen offers "Repetir misión y
// comprobar barreras": the participant repeats the flow sighted, the
// timer restarts, and the new time is NOT submitted — only compared
// against the recorded (baseline) attempt.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderRanking } from '../screens/ranking.js';
import { renderCheckout } from '../experiences/screen-reader/screens/checkout.js';
import { renderConfirmation } from '../experiences/screen-reader/screens/confirmation.js';
import { addToCart, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';
import { setSession, clearSession, getSession } from '../session/session.js';

const VALID_CARD = '4000056655665556';

function fillAndSubmit() {
  document.getElementById('ck-name').value = 'Test User';
  document.getElementById('ck-email').value = 'test@example.com';
  document.getElementById('ck-address').value = 'Calle Mayor 1';
  document.getElementById('ck-num').value = VALID_CARD;
  document.getElementById('ck-fecha').value = '12/28';
  document.getElementById('ck-dig').value = '123';
  document.getElementById('checkout-form').dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('Retry mission (sighted re-run)', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.removeItem('faro-results');
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    clearCart();
    clearSession();
    document.body.innerHTML = '';
  });

  it('restarts the timer and navigates home keeping the baseline', async () => {
    vi.useFakeTimers();
    setSession({
      user: 'Tester',
      experienceId: 'screen-reader',
      startedAt: Date.now() - 300000,
      completedAt: Date.now() - 60000,
      baselineMs: 240000,
    });
    window.location.hash = '#/ranking';
    await renderRanking(document.getElementById('app'));

    const retry = document.getElementById('ranking-retry');
    expect(retry).not.toBeNull();
    expect(retry.textContent).toContain('Repetir misión');

    const before = Date.now();
    retry.click();

    const session = getSession();
    expect(window.location.hash).toBe('#/home');
    expect(session.startedAt).toBeGreaterThanOrEqual(before);
    expect(session.completedAt).toBeUndefined();
    expect(session.baselineMs).toBe(240000);
    expect(document.getElementById('experience-timer')).not.toBeNull();
  });

  it('a retry completion is not submitted and shows the diff vs. baseline', async () => {
    vi.useFakeTimers();
    setSession({
      user: 'Tester',
      experienceId: 'screen-reader',
      startedAt: Date.now() - 100000, // retry run took 1:40
      baselineMs: 240000,             // recorded blind attempt: 4:00
    });
    window.location.hash = '#/checkout';
    addToCart('p001', 'M', 'blue');
    renderCheckout(document.getElementById('app'));
    fillAndSubmit();

    // Not recorded: neither local results nor API submission.
    expect(JSON.parse(localStorage.getItem('faro-results') || '[]')).toHaveLength(0);
    expect(sessionStorage.getItem('faro-pending-baseline')).toBe('240000');

    renderConfirmation(document.getElementById('app'));
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Tiempo anterior');
    expect(dialog.textContent).toContain('04:00');
    expect(dialog.textContent).toContain('Tiempo segunda pasada');
    expect(dialog.textContent).toContain('01:40');
    const diff = dialog.querySelector('.congrats-diff');
    expect(diff.classList.contains('faster')).toBe(true);
    expect(diff.querySelector('.congrats-diff-value').textContent).toBe('−02:20');
  });

  it('the first completion still submits and stores the baseline', () => {
    vi.useFakeTimers();
    setSession({
      user: 'Tester',
      experienceId: 'screen-reader',
      startedAt: Date.now() - 240000,
    });
    window.location.hash = '#/checkout';
    addToCart('p001', 'M', 'blue');
    renderCheckout(document.getElementById('app'));
    fillAndSubmit();

    const results = JSON.parse(localStorage.getItem('faro-results') || '[]');
    expect(results).toHaveLength(1);
    expect(results[0].user).toBe('Tester');
    expect(getSession().baselineMs).toBe(240000);
    expect(sessionStorage.getItem('faro-pending-baseline')).toBeNull();
  });
});
