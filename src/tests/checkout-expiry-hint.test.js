// checkout-expiry-hint.test.js — verify the expiry placeholder communicates the input format

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderCheckout } from '../screens/checkout.js';
import { clearCart, addToCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

function submitForm() {
  const form = document.getElementById('checkout-form');
  form.dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('Checkout expiry format in placeholder', () => {
  beforeEach(() => {
    clearCart();
    addToCart('p001', 'S', 'blue'); // checkout redirects to cart when empty
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    document.body.innerHTML = '';
  });

  it('shows the format notation in the Spanish placeholder', () => {
    renderCheckout(document.getElementById('app'));

    // Placeholder words carry a zero-width space (\u200B) so the browser's
    // credit-card autofill heuristic cannot match its keywords — strip it
    // before asserting the visible text.
    const input = document.getElementById('ck-fecha');
    expect(input.placeholder.replace(/\u200B/g, '')).toBe('Fecha de caducidad (MM/AA)');
  });

  it('shows MM/YY notation in English', () => {
    setLanguage('en');
    renderCheckout(document.getElementById('app'));

    const input = document.getElementById('ck-fecha');
    expect(input.placeholder.replace(/\u200B/g, '')).toBe('Expiry date (MM/YY)');
  });

  it('keeps the field without a label (TR-16 preserved)', () => {
    renderCheckout(document.getElementById('app'));

    const input = document.getElementById('ck-fecha');
    expect(input.getAttribute('data-trap')).toBe('TR-16');
    expect(input.getAttribute('aria-label')).toBeNull();
    expect(document.querySelector('label[for="ck-fecha"]')).toBeNull();
  });

  it('still validates MM/YY format', () => {
    renderCheckout(document.getElementById('app'));

    const expiry = document.getElementById('ck-fecha');
    const errExpiry = document.getElementById('err-expiry');

    // Invalid formats rejected
    expiry.value = '12-28';
    submitForm();
    expect(errExpiry.classList.contains('visible')).toBe(true);
    expect(errExpiry.textContent).not.toBe('');

    expiry.value = '12/2028';
    submitForm();
    expect(errExpiry.classList.contains('visible')).toBe(true);

    // Valid MM/YY accepted (other fields left empty so no navigation happens;
    // we only assert the expiry error clears)
    expiry.value = '12/28';
    submitForm();
    expect(errExpiry.classList.contains('visible')).toBe(false);
    expect(errExpiry.textContent).toBe('');
  });
});
