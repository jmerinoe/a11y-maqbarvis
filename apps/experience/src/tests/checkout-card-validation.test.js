// checkout-card-validation.test.js — payment fields carry autocomplete="off"
// (suppresses the browser's insecure-form autofill warning) and the card
// number must be exactly 4000056655665556 to complete the purchase.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderCheckout } from '../screens/checkout.js';
import { clearCart, addToCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

const VALID_CARD = '4000056655665556';

function submitForm() {
  const form = document.getElementById('checkout-form');
  form.dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('Checkout card validation and autofill warning', () => {
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

  it('neutralizes autofill detection on the payment fields', () => {
    renderCheckout(document.getElementById('app'));

    // autocomplete="off" (ignored for cc fields but kept for other
    // browsers' generic autofill) + neutral ids + obfuscated placeholders
    ['ck-num', 'ck-fecha', 'ck-dig'].forEach((id) => {
      const input = document.getElementById(id);
      expect(input.getAttribute('autocomplete')).toBe('off');
      expect(input.placeholder).toContain('\u200B');
      // The raw attribute carries no detectable keyword — the zero-width
      // spaces break the regexes while the visible text stays identical
      expect(id + input.placeholder).not.toMatch(/card|cc-|cvv|csc|expiry|tarjeta|caducidad/i);
    });
  });

  it('rejects a card number different from the accepted test card', () => {
    renderCheckout(document.getElementById('app'));

    const card = document.getElementById('ck-num');
    const errCard = document.getElementById('err-card');

    card.value = '4111111111111111';
    submitForm();
    expect(errCard.classList.contains('visible')).toBe(true);
    expect(errCard.textContent).toBe('Número de tarjeta no válido');
    expect(card.classList.contains('input-error')).toBe(true);

    // A well-formed 16-digit number is still rejected — only the test card passes
    card.value = '4000056655665557';
    submitForm();
    expect(errCard.classList.contains('visible')).toBe(true);
  });

  it('accepts the test card 4000056655665556', () => {
    renderCheckout(document.getElementById('app'));

    const card = document.getElementById('ck-num');
    const errCard = document.getElementById('err-card');

    card.value = VALID_CARD;
    submitForm();
    // Other fields are empty so no navigation happens; assert the card error clears
    expect(errCard.classList.contains('visible')).toBe(false);
    expect(errCard.textContent).toBe('');
    expect(card.classList.contains('input-error')).toBe(false);
  });

  it('accepts the test card typed with spaces', () => {
    renderCheckout(document.getElementById('app'));

    const card = document.getElementById('ck-num');
    const errCard = document.getElementById('err-card');

    card.value = '4000 0566 5566 5556';
    submitForm();
    expect(errCard.classList.contains('visible')).toBe(false);
  });
});
