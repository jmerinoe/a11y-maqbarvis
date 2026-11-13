// screens/cart.js — TR-13 (icon remove), TR-14 (no aria-live total).
// TR-12 corrected: the cart dialog now manages focus — it grabs focus on
// open, traps Tab inside, Escape continues shopping, and closing returns
// focus to the element that had it before.

import { t } from '../../../i18n/index.js';
import { getState } from '../../../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderCartItem, bindCartItemEvents } from '../components/cart-item.js';
import { getProductById } from '../data/products.js';
import { navigate } from '../../../router.js';
import { bindModerator } from '../moderator/moderator.js';

export function renderCart(container) {
  const { cart, language } = getState();

  const total = cart.reduce((sum, item) => {
    const p = getProductById(item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  const cartItemsHtml =
    cart.length === 0
      ? `<p class="cart-empty">${t('cart.empty')}</p>`
      : `<table class="cart-table">
          <thead>
            <tr>
              <th>${t('cart.product')}</th>
              <th>${t('cart.quantity')}</th>
              <th>${t('cart.price')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="cart-items-body">
            ${cart.map((item, i) => renderCartItem(item, i)).join('')}
          </tbody>
        </table>`;

  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <div class="cart-modal-overlay">
        <div class="cart-modal" role="dialog" aria-modal="true"
             aria-labelledby="cart-title" tabindex="-1">
          <h1 id="cart-title">${t('cart.title')}</h1>
          ${cartItemsHtml}
          ${cart.length > 0 ? `
            <div class="cart-total-row">
              <span>${t('cart.total')}:</span>
              <span data-trap="TR-14" id="cart-total">€${total.toFixed(2)}</span>
            </div>
            <button class="btn-primary" onclick="window.location.hash='#/checkout'">${t('cart.checkout')}</button>
          ` : ''}
          <a href="#/products" class="back-link">${t('cart.continueShopping')}</a>
        </div>
      </div>
    </main>
  `;

  bindHeaderEvents();
  bindCartItemEvents();
  bindModerator();
  bindCartDialog(container);
}

// Focus management for the cart dialog: focus moves into it on open,
// Tab/Shift+Tab cycle inside, Escape = "seguir comprando", and leaving
// the dialog returns focus to whatever held it before.
function bindCartDialog(container) {
  const overlay = container.querySelector('.cart-modal-overlay');
  const dialog = container.querySelector('.cart-modal');
  if (!overlay || !dialog) return;

  const previousFocus = document.activeElement;
  const focusables = () =>
    [...dialog.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')];

  const close = () => {
    previousFocus?.focus?.();
    navigate('#/products');
  };

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Leaving the modal via the "seguir comprando" link restores focus too;
  // hash navigation to checkout/product detail replaces the screen anyway.
  container.querySelector('.back-link')?.addEventListener('click', () => {
    previousFocus?.focus?.();
  });

  dialog.focus();
}
