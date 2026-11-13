// keyboard-trap-fixes.test.js — verify the five corrected keyboard traps:
// TR-01 (skip link), TR-04 (real search button), TR-08 (natural tab order),
// TR-12 (cart modal focus management), TR-18 (focus first invalid field).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHome } from '../experiences/screen-reader/screens/home.js';
import { renderProducts } from '../experiences/screen-reader/screens/products.js';
import { renderCart } from '../experiences/screen-reader/screens/cart.js';
import { renderCheckout } from '../experiences/screen-reader/screens/checkout.js';
import { clearCart, setState } from '../store.js';
import { setLanguage } from '../i18n/index.js';
import { navigate } from '../router.js';

describe('Keyboard trap fixes (TR-01, TR-04, TR-08, TR-12, TR-18)', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    window.location.hash = '#/home';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    document.body.innerHTML = '';
    delete window.__faroSearch;
  });

  const app = () => document.getElementById('app');

  it('TR-01: skip link is the first header element and focuses #main-content without touching the hash', () => {
    renderHome(app());
    const skip = document.getElementById('skip-link');
    expect(skip).not.toBeNull();
    expect(skip.closest('header').querySelector('a,button')).toBe(skip);
    expect(document.querySelector('[data-trap="TR-01"]')).toBeNull();

    const hashBefore = window.location.hash;
    skip.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(window.location.hash).toBe(hashBefore);
    const main = document.getElementById('main-content');
    expect(document.activeElement).toBe(main);
    expect(main.getAttribute('tabindex')).toBe('-1');
  });

  it('TR-04: the search control is a real labelled button that triggers the search', () => {
    renderHome(app());
    const btn = app().querySelector('.search-button-div');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('aria-label')).toBe('Buscar');
    expect(document.querySelector('[data-trap="TR-04"]')).toBeNull();

    btn.click();
    expect(window.location.hash).toBe('#/products');
  });

  it('TR-08: product cards carry no positive tabindex', () => {
    renderProducts(app());
    const cards = [...app().querySelectorAll('.product-card')];
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      const ti = card.getAttribute('tabindex');
      expect(ti === null || Number(ti) <= 0).toBe(true);
    });
    expect(document.querySelector('[data-trap="TR-08"]')).toBeNull();
  });

  it('TR-12: the cart is a modal that grabs focus, traps Tab and closes with Escape', () => {
    setState({
      cart: [{ productId: 'camiseta-basica-azul', size: 'M', color: 'azul', quantity: 1 }],
    });
    renderCart(app());

    const dialog = app().querySelector('.cart-modal');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(dialog);
    expect(document.querySelector('[data-trap="TR-12"]')).toBeNull();

    // Shift+Tab on the first focusable wraps to the last one.
    const backLink = app().querySelector('.back-link');
    backLink.focus();
    app().querySelector('.cart-modal-overlay').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
    );
    const focusables = [...dialog.querySelectorAll('a[href], button')];
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);

    // Escape = continue shopping.
    app().querySelector('.cart-modal-overlay').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    expect(window.location.hash).toBe('#/products');
  });

  it('TR-18: a failed submit moves focus to the first invalid field', () => {
    // Checkout redirects to the cart when it is empty — put an item in.
    setState({
      cart: [{ productId: 'p001', size: 'M', color: 'blue', quantity: 1 }],
    });
    renderCheckout(app());
    document.getElementById('checkout-form').dispatchEvent(
      new Event('submit', { cancelable: true })
    );
    expect(document.activeElement).toBe(document.getElementById('ck-name'));
    expect(document.querySelector('[data-trap="TR-18"]')).toBeNull();
  });
});
