// user-experience-timer.test.js — workshop session flow: unique-username
// login, experience selection, instructions, session timer overlay,
// exact-purchase completion, congrats dialog, and top-10 ranking.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderLogin } from '../screens/login.js';
import { renderExperienceSelect } from '../screens/experience-select.js';
import { renderInstructions } from '../screens/instructions.js';
import { renderRanking } from '../screens/ranking.js';
import { renderCheckout } from '../screens/checkout.js';
import { renderConfirmation } from '../screens/confirmation.js';
import { handleRouteChange } from '../router.js';
import {
  registerUser,
  getSession,
  setSession,
  clearSession,
  getRanking,
  saveResult,
} from '../session/session.js';
import { isCompletedOrder, getExperienceById } from '../data/experiences.js';
import { stopExperienceTimer } from '../components/experience-timer.js';
import { addToCart, clearCart, setState } from '../store.js';
import { setLanguage } from '../i18n/index.js';

function startSession() {
  setSession({ user: 'Ana', experienceId: 'screen-reader' });
}

function fillCheckoutForm() {
  document.getElementById('ck-name').value = 'Ana';
  document.getElementById('ck-email').value = 'ana@test.dev';
  document.getElementById('ck-address').value = 'Calle Mayor 1';
  document.getElementById('ck-num').value = '4000056655665556';
  document.getElementById('ck-fecha').value = '12/28';
  document.getElementById('ck-dig').value = '123';
}

describe('User experience timer flow', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    window.location.hash = '#/login';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    stopExperienceTimer();
    localStorage.clear();
    sessionStorage.clear();
    document.querySelector('.congrats-overlay')?.remove();
    document.body.innerHTML = '';
    delete window.__faroCartQty;
    delete window.__faroCartRemove;
    delete window.__faroFilterSize;
    delete window.__faroFilterColor;
    delete window.__faroSearch;
  });

  it('validates unique usernames with normalized comparison', () => {
    expect(registerUser('   ').ok).toBe(false);
    expect(registerUser('Ana').ok).toBe(true);
    // Same name, different case + surrounding whitespace → duplicate
    const dup = registerUser('  ana  ');
    expect(dup.ok).toBe(false);
    expect(dup.reason).toBe('duplicate');
    expect(registerUser('Ana María').ok).toBe(true);
  });

  it('login screen blocks duplicates and registers valid users', async () => {
    registerUser('Ana');
    renderLogin(document.getElementById('app'));

    const input = document.getElementById('login-username');
    const errorEl = document.getElementById('login-error');
    const form = document.getElementById('login-form');
    const flush = () => new Promise((r) => setTimeout(r, 0));

    input.value = ' ana ';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();
    expect(errorEl.textContent).toContain('ya está registrado');
    expect(getSession()).toBeNull();

    input.value = 'Belén';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();
    expect(getSession().user).toBe('Belén');
  });

  it('renders the experience list from the registry', () => {
    startSession();
    renderExperienceSelect(document.getElementById('app'));

    const link = document.querySelector('.experience-list a[data-experience-id="screen-reader"]');
    expect(link).not.toBeNull();
    expect(link.textContent).toBe('Experiencia con lectores de voz');

    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(getSession().experienceId).toBe('screen-reader');
  });

  it('renders the full instructions content and mission card', () => {
    startSession();
    renderInstructions(document.getElementById('app'));

    const screen = document.querySelector('.instructions-screen');
    expect(screen.querySelector('h1').textContent).toContain('Bienvenido');
    expect(screen.querySelector('#instructions-objective').textContent).toBe('Objetivo');
    expect(screen.querySelector('#instructions-mission').textContent).toBe(
      'Tu misión en esta experiencia'
    );

    const card = screen.querySelector('.mission-card');
    expect(card).not.toBeNull();
    expect(card.textContent).toContain('Camiseta azul, sin rayas');
    expect(card.textContent).toContain('M');
    expect(card.textContent).toContain('4000056655665556');

    // Highlighted phrases
    const highlights = screen.querySelectorAll('strong');
    expect(highlights.length).toBe(3);
    expect(highlights[0].textContent).toContain('cómo cambia la forma de interactuar');
    expect(highlights[1].textContent).toContain('experiencia digital accesible');
    expect(highlights[2].textContent).toContain('menor tiempo se llevará un pequeño regalo');
  });

  it('starts the timer only when Continuar is pressed', () => {
    startSession();
    renderInstructions(document.getElementById('app'));

    // Rendering must NOT start the timer
    expect(document.getElementById('experience-timer')).toBeNull();
    expect(getSession().startedAt).toBeUndefined();

    document.getElementById('instructions-continue').click();
    expect(typeof getSession().startedAt).toBe('number');
    const timer = document.getElementById('experience-timer');
    expect(timer).not.toBeNull();
    expect(timer.parentElement).toBe(document.body);
    expect(timer.textContent).toMatch(/⏱ \d{2}:\d{2}/);
  });

  it('keeps the timer overlay when the app screen re-renders', () => {
    startSession();
    renderInstructions(document.getElementById('app'));
    document.getElementById('instructions-continue').click();

    document.getElementById('app').innerHTML = '<p>new screen</p>';
    expect(document.getElementById('experience-timer')).not.toBeNull();
  });

  it('completes only with the exact required purchase', () => {
    const exp = getExperienceById('screen-reader');
    const required = { productId: 'p001', size: 'M', color: 'blue', quantity: 1 };
    const wrongSize = { productId: 'p001', size: 'L', color: 'blue', quantity: 1 };
    const other = { productId: 'p003', size: '30', color: 'blue', quantity: 1 };

    expect(isCompletedOrder([required], exp)).toBe(true);
    expect(isCompletedOrder([wrongSize], exp)).toBe(false);
    expect(isCompletedOrder([other], exp)).toBe(false);
    // Extra items invalidate (owner decision)
    expect(isCompletedOrder([required, other], exp)).toBe(false);
  });

  it('records the result and flags congrats on exact checkout success', () => {
    startSession();
    const session = getSession();
    session.startedAt = Date.now() - 5000;
    setSession(session);

    addToCart('p001', 'M', 'blue');
    renderCheckout(document.getElementById('app'));
    fillCheckoutForm();
    document.getElementById('checkout-form').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(sessionStorage.getItem('faro-pending-congrats')).not.toBeNull();
    const results = JSON.parse(localStorage.getItem('faro-results'));
    expect(results.length).toBe(1);
    expect(results[0].user).toBe('Ana');
    expect(results[0].result).toBe('completed');
    expect(results[0].elapsedMs).toBeGreaterThan(0);
  });

  it('does not complete when the order has extra items', () => {
    startSession();
    const session = getSession();
    session.startedAt = Date.now() - 5000;
    setSession(session);

    addToCart('p001', 'M', 'blue');
    addToCart('p003', '30', 'blue');
    renderCheckout(document.getElementById('app'));
    fillCheckoutForm();
    document.getElementById('checkout-form').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(sessionStorage.getItem('faro-pending-congrats')).toBeNull();
    expect(localStorage.getItem('faro-results')).toBeNull();
  });

  it('shows an accessible congrats dialog and navigates to ranking', () => {
    startSession();
    sessionStorage.setItem('faro-pending-congrats', '387000');
    sessionStorage.setItem(
      'faro-last-order',
      JSON.stringify({ orderNumber: 'FARO-1', total: 19.99, items: [] })
    );
    renderConfirmation(document.getElementById('app'));

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.textContent).toContain('¡Enhorabuena!');
    expect(dialog.textContent).toContain('06:27');

    document.getElementById('congrats-close').click();
    expect(window.location.hash).toBe('#/ranking');
    expect(document.querySelector('.congrats-dialog')).toBeNull();
  });

  it('ranks the 10 best times with deterministic ordering', () => {
    startSession();
    const mk = (user, ms, endedAt) =>
      saveResult({ user, experienceId: 'screen-reader', startedAt: '', endedAt, elapsedMs: ms, result: 'completed' });
    for (let i = 0; i < 12; i++) mk(`u${i}`, 60000 + i * 1000, `2026-01-01T00:${String(i).padStart(2, '0')}:00Z`);
    // Tie: same elapsed → earlier endedAt wins
    mk('tie-b', 30000, '2026-01-02T00:00:00Z');
    mk('tie-a', 30000, '2026-01-01T00:00:00Z');

    const top = getRanking('screen-reader');
    expect(top.length).toBe(10);
    expect(top[0].user).toBe('tie-a');
    expect(top[1].user).toBe('tie-b');
    expect(top[2].elapsedMs).toBe(60000);
  });

  it('renders the ranking table and resets session for a new participant', async () => {
    startSession();
    saveResult({ user: 'Ana', experienceId: 'screen-reader', startedAt: '', endedAt: '2026-01-01T00:00:00Z', elapsedMs: 222000, result: 'completed' });
    await renderRanking(document.getElementById('app'));

    const rows = document.querySelectorAll('.ranking-table tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Ana');
    expect(rows[0].textContent).toContain('03:42');
    expect(document.getElementById('ranking-new-participant').textContent).toBe('Nuevo participante');

    document.getElementById('ranking-new-participant').click();
    expect(getSession()).toBeNull();
    expect(window.location.hash).toBe('#/login');
  });

  it('redirects Faro routes to login without a session', () => {
    window.location.hash = '#/products';
    handleRouteChange();
    expect(window.location.hash).toBe('#/login');
  });
});
