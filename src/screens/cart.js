// screens/cart.js — TR-12 (modal no focus management), TR-13 (icon remove), TR-14 (no aria-live total)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderCartItem, bindCartItemEvents } from '../components/cart-item.js';
import { getProductById } from '../data/products.js';
import { navigate } from '../router.js';
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

  // TR-12: cart is rendered as a modal dialog with no focus management.
  // No focus is moved to the dialog, no focus trapping, no return on close.
  // The role="dialog" is deliberately omitted too.
  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <div data-trap="TR-12" class="cart-modal-overlay">
        <div class="cart-modal">
          <h1>${t('cart.title')}</h1>
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
}
