// screen-titles.test.js — every screen announces an identifying title:
// document.title is updated and focus moves to the h1 so screen readers
// announce it on hash navigation (no page load happens in an SPA).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderScreen } from '../screens/index.js';
import { addToCart, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';
import { clearSession, setSession } from '../session/session.js';

describe('Identifying screen titles', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    clearSession();
    document.body.innerHTML = '';
  });

  const cases = [
    ['home', null, 'Home'],
    ['products', null, 'Productos'],
    ['confirmation', null, 'Confirmación'],
  ];

  cases.forEach(([screen, param, expected]) => {
    it(`sets title and focuses the h1 on ${screen}`, () => {
      renderScreen(screen, param);
      expect(document.title).toBe(`${expected} — Faro`);
      const h1 = document.querySelector('#app h1');
      expect(h1.textContent).toBe(expected);
      expect(document.activeElement).toBe(h1);
    });
  });

  it('sets title and focuses the dialog on cart', () => {
    renderScreen('cart', null);
    expect(document.title).toBe('Carrito — Faro');
    const h1 = document.querySelector('#app h1');
    expect(h1.textContent).toBe('Carrito');
    // TR-12 corrected: focus lands on the dialog itself (its h1 labels it).
    expect(document.activeElement).toBe(document.querySelector('.cart-modal'));
  });

  it('uses the product name as title on product-detail', () => {
    renderScreen('product-detail', 'p001');
    const h1 = document.querySelector('#app h1');
    expect(document.title).toBe(`${h1.textContent} — Faro`);
    expect(document.activeElement).toBe(h1);
  });

  it('sets "Datos y Pago" on checkout with items in the cart', () => {
    addToCart('p001', 'M', 'blue');
    renderScreen('checkout');
    expect(document.title).toBe('Datos y Pago — Faro');
    expect(document.activeElement).toBe(document.querySelector('#app h1'));
  });

  const sessionCases = [
    ['login', 'A11y Experience Center - Login'],
    ['experience-select', 'A11y Experience Center - Selección Experiencia'],
    ['instructions', 'A11y Experience Center - Lector Pantalla - Instrucciones'],
  ];

  sessionCases.forEach(([screen, expected]) => {
    it(`sets "${expected}" on ${screen}`, () => {
      setSession({ user: 'Ana', experienceId: 'screen-reader' });
      renderScreen(screen, null);
      expect(document.title).toBe(expected);
    });
  });

  it('does not steal focus when a dialog is open', () => {
    vi.useFakeTimers();
    sessionStorage.setItem('faro-pending-congrats', '120000');
    renderScreen('confirmation');
    // Before the 5 s delay, no dialog yet — focus is on the h1.
    expect(document.querySelector('.congrats-dialog')).toBeNull();
    vi.advanceTimersByTime(4000);
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(document.activeElement).toBe(dialog);
    vi.useRealTimers();
  });
});
