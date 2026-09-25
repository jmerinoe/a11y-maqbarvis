// cart-empty-checkout.test.js — an empty cart must not reach checkout:
// removing the last item hides the checkout button, and navigating to
// #/checkout with an empty cart redirects back to the cart.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderCart } from '../screens/cart.js';
import { renderCheckout } from '../screens/checkout.js';
import { addToCart, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

describe('Empty cart cannot checkout', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    window.location.hash = '#/cart';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    document.body.innerHTML = '';
    delete window.__faroCartQty;
    delete window.__faroCartRemove;
  });

  it('hides the checkout button when the last item is removed', () => {
    addToCart('p001', 'S', 'blue');
    renderCart(document.getElementById('app'));

    // Checkout button exists while the cart has items
    expect(document.body.innerHTML).toContain('#/checkout');

    window.__faroCartRemove(0);

    // The screen re-renders the empty state: no checkout button, no total
    expect(document.querySelector('.cart-empty')).not.toBeNull();
    expect(document.body.innerHTML).not.toContain('#/checkout');
    expect(document.getElementById('cart-total')).toBeNull();
  });

  it('hides the checkout button when quantity is decremented to zero', () => {
    addToCart('p001', 'S', 'blue');
    renderCart(document.getElementById('app'));

    window.__faroCartQty(0, 0);

    expect(document.querySelector('.cart-empty')).not.toBeNull();
    expect(document.body.innerHTML).not.toContain('#/checkout');
  });

  it('keeps the checkout button while items remain', () => {
    addToCart('p001', 'S', 'blue');
    addToCart('p002', 'M', 'white');
    renderCart(document.getElementById('app'));

    window.__faroCartRemove(0);

    expect(document.querySelector('.cart-empty')).toBeNull();
    expect(document.body.innerHTML).toContain('#/checkout');
  });

  it('redirects to the cart when checkout renders with an empty cart', () => {
    renderCheckout(document.getElementById('app'));

    expect(window.location.hash).toBe('#/cart');
    expect(document.getElementById('checkout-form')).toBeNull();
  });
});
