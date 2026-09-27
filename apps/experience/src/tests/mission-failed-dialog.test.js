// mission-failed-dialog.test.js — finishing the purchase with the wrong
// items during a workshop session must warn the participant on the
// confirmation screen and offer to start over (timer keeps running).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderCheckout } from '../screens/checkout.js';
import { renderConfirmation } from '../screens/confirmation.js';
import { addToCart, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';
import { setSession, clearSession } from '../session/session.js';

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

describe('Mission failed dialog', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    setSession({ user: 'Tester', experienceId: 'screen-reader', startedAt: Date.now() });
    setLanguage('es');
    window.location.hash = '#/checkout';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    clearSession();
    document.body.innerHTML = '';
  });

  it('flags a wrong order and shows the retry dialog on confirmation', () => {
    // p002 is not the required item (p001 / M / blue)
    addToCart('p002', 'M', 'white');
    renderCheckout(document.getElementById('app'));
    fillAndSubmit();

    expect(sessionStorage.getItem('faro-pending-failed')).toBe('1');
    expect(sessionStorage.getItem('faro-pending-congrats')).toBeNull();
    expect(window.location.hash).toBe('#/confirmation');

    renderConfirmation(document.getElementById('app'));

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Misión no completada');

    document.getElementById('failed-retry').click();
    expect(document.querySelector('.congrats-overlay')).toBeNull();
    expect(window.location.hash).toBe('#/home');
  });

  it('does not flag the dialog when the order matches the required item', () => {
    addToCart('p001', 'M', 'blue'); // required item — mission fulfilled
    renderCheckout(document.getElementById('app'));
    fillAndSubmit();

    expect(sessionStorage.getItem('faro-pending-failed')).toBeNull();
    expect(sessionStorage.getItem('faro-pending-congrats')).not.toBeNull();
  });
});
