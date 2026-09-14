// screens/checkout.js — TR-15 (color-only errors), TR-16 (no labels), TR-17 (error not associated), TR-18 (no focus to error)

import { t } from '../i18n/index.js';
import { getState, clearCart } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { getProductById } from '../data/products.js';
import { navigate } from '../router.js';
import { bindModerator } from '../moderator/moderator.js';

export function renderCheckout(container) {
  const { cart, language } = getState();
  const total = cart.reduce((sum, item) => {
    const p = getProductById(item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  // TR-16: all fields use placeholder only, no <label>
  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <h1>${t('checkout.title')}</h1>
      <div class="checkout-layout">
        <form id="checkout-form" data-trap="TR-15" class="checkout-form">
          <div class="form-field">
            <input data-trap="TR-16" type="text" id="ck-name" placeholder="${t('checkout.fullName')}" />
            <span data-trap="TR-17" class="field-error" id="err-name"></span>
          </div>
          <div class="form-field">
            <input data-trap="TR-16" type="email" id="ck-email" placeholder="${t('checkout.email')}" />
            <span class="field-error" id="err-email"></span>
          </div>
          <div class="form-field">
            <input data-trap="TR-16" type="text" id="ck-address" placeholder="${t('checkout.address')}" />
            <span class="field-error" id="err-address"></span>
          </div>
          <div class="form-field">
            <input data-trap="TR-16" type="text" id="ck-card" placeholder="${t('checkout.cardNumber')}" />
            <span class="field-error" id="err-card"></span>
          </div>
          <div class="form-field-row">
            <div class="form-field">
              <input data-trap="TR-16" type="text" id="ck-expiry" placeholder="${t('checkout.cardExpiry')}" />
              <span class="field-error" id="err-expiry"></span>
            </div>
            <div class="form-field">
              <input data-trap="TR-16" type="text" id="ck-cvv" placeholder="${t('checkout.cardCvv')}" />
              <span class="field-error" id="err-cvv"></span>
            </div>
          </div>
          <button data-trap="TR-18" type="submit" class="btn-primary">${t('checkout.submit')}</button>
        </form>
        <aside class="checkout-summary">
          <h2>${t('cart.total')}</h2>
          <p class="checkout-total">€${total.toFixed(2)}</p>
        </aside>
      </div>
    </main>
  `;

  bindHeaderEvents();
  bindModerator();

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
}

function handleSubmit(e) {
  e.preventDefault();

  const fields = [
    { id: 'ck-name', errorId: 'err-name', validate: (v) => v.trim() !== '' || t('checkout.error.required') },
    { id: 'ck-email', errorId: 'err-email', validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? true : t('checkout.error.email')) },
    { id: 'ck-address', errorId: 'err-address', validate: (v) => v.trim() !== '' || t('checkout.error.required') },
    { id: 'ck-card', errorId: 'err-card', validate: (v) => (/^\d{13,16}$/.test(v.replace(/\s/g, '')) ? true : t('checkout.error.card')) },
    { id: 'ck-expiry', errorId: 'err-expiry', validate: (v) => (/^\d{2}\/\d{2}$/.test(v) || t('checkout.error.required')) },
    { id: 'ck-cvv', errorId: 'err-cvv', validate: (v) => (/^\d{3,4}$/.test(v) || t('checkout.error.required')) },
  ];

  let hasErrors = false;
  let firstInvalid = null;

  fields.forEach(({ id, errorId, validate }) => {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(errorId);
    const result = validate(input.value);

    if (result !== true) {
      hasErrors = true;
      // TR-15: error indicated only by red border color
      input.classList.add('input-error');
      // TR-17: error message shown but NOT associated with the field (no aria-describedby)
      errorEl.textContent = result;
      errorEl.classList.add('visible');
      if (!firstInvalid) firstInvalid = input;
    } else {
      input.classList.remove('input-error');
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  });

  if (hasErrors) {
    // TR-18: focus is NOT moved to the first invalid field.
    // The focus stays on the submit button — this is the trap.
    // (Intentionally NOT calling firstInvalid.focus())
    return;
  }

  // Valid — proceed to confirmation
  const orderNumber = 'FARO-' + Math.floor(Math.random() * 1000000);
  const { cart } = getState();
  const total = cart.reduce((sum, item) => {
    const p = getProductById(item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  sessionStorage.setItem('faro-last-order', JSON.stringify({ orderNumber, total, items: cart }));
  clearCart();
  navigate('#/confirmation');
}
