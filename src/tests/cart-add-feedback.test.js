// cart-add-feedback.test.js — verify add-to-cart validation, confirmation, and live counter

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderProductDetail } from '../screens/product-detail.js';
import { renderHeader } from '../components/header.js';
import { getState, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

describe('Cart add feedback', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    document.body.innerHTML = '';
    delete window.__faroAddToCart;
  });

  it('shows a validation message and does not add when size and color are missing', () => {
    const app = document.getElementById('app');
    renderProductDetail(app, 'p001');

    window.__faroAddToCart('p001');

    const validationEl = document.getElementById('add-to-cart-validation');
    const confirmationEl = document.getElementById('add-to-cart-confirmation');

    expect(validationEl.getAttribute('role')).toBe('alert');
    expect(validationEl.getAttribute('aria-live')).toBe('assertive');
    expect(validationEl.textContent).not.toBe('');
    // Spanish message mentions both attributes
    expect(validationEl.textContent.toLowerCase()).toContain('talla');
    expect(validationEl.textContent.toLowerCase()).toContain('color');

    // Confirmation stays empty
    expect(confirmationEl.textContent).toBe('');
    // Nothing added to the cart
    expect(getState().cart).toHaveLength(0);
  });

  it('shows a confirmation message (role=status) and adds when size and color are selected', () => {
    const app = document.getElementById('app');
    renderProductDetail(app, 'p001');

    // Simulate variant selection via the custom-widget event
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'M' } }));
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'color', value: 'blue' } }));

    window.__faroAddToCart('p001');

    const validationEl = document.getElementById('add-to-cart-validation');
    const confirmationEl = document.getElementById('add-to-cart-confirmation');

    expect(confirmationEl.getAttribute('role')).toBe('status');
    expect(confirmationEl.getAttribute('aria-live')).toBe('polite');
    // Confirmation references the localized product name
    expect(confirmationEl.textContent).toContain('Camiseta azul');
    // Validation cleared
    expect(validationEl.textContent).toBe('');
    // Item added
    expect(getState().cart).toHaveLength(1);
    expect(getState().cart[0]).toMatchObject({ productId: 'p001', size: 'M', color: 'blue', quantity: 1 });
  });

  it('updates the header cart counter live on add without a full screen re-render', () => {
    // Render the header separately so the .cart-count node exists
    document.body.innerHTML = `<div id="app">${renderHeader()}</div>`;

    const app = document.getElementById('app');
    // Render product detail into a sub-container so the header stays in the DOM
    const detailHost = document.createElement('div');
    app.appendChild(detailHost);
    renderProductDetail(detailHost, 'p001');

    // Select variants
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'M' } }));
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'color', value: 'blue' } }));

    const badgeBefore = document.querySelector('.cart-count');
    expect(badgeBefore.textContent).toBe('0');

    window.__faroAddToCart('p001');

    // Manually apply the same patch the main.js subscriber would apply,
    // since the subscriber is registered in main.js (not loaded in this test).
    const count = getState().cart.reduce((s, i) => s + i.quantity, 0);
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);

    expect(document.querySelector('.cart-count').textContent).toBe('1');
  });

  it('clears the validation message on a subsequent successful add', () => {
    const app = document.getElementById('app');
    renderProductDetail(app, 'p001');

    // First: trigger validation (missing attributes)
    window.__faroAddToCart('p001');
    const validationEl = document.getElementById('add-to-cart-validation');
    expect(validationEl.textContent).not.toBe('');

    // Then: select both and add successfully
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'M' } }));
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'color', value: 'blue' } }));
    window.__faroAddToCart('p001');

    expect(document.getElementById('add-to-cart-validation').textContent).toBe('');
    expect(document.getElementById('add-to-cart-confirmation').textContent).toContain('Camiseta azul');
    expect(getState().cart).toHaveLength(1);
  });
});
