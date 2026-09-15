// screens/confirmation.js — TR-19 (no role="status" on confirmation message)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { getProductById } from '../data/products.js';
import { bindModerator } from '../moderator/moderator.js';

export function renderConfirmation(container) {
  const orderData = sessionStorage.getItem('faro-last-order');
  const order = orderData ? JSON.parse(orderData) : { orderNumber: 'FARO-000000', total: 0, items: [] };
  const { language } = getState();

  const itemsHtml = order.items
    .map((item) => {
      const p = getProductById(item.productId);
      const name = p ? p.name[language] || p.name.es : item.productId;
      return `<li>${name} — ${item.size}/${item.color} ×${item.quantity}</li>`;
    })
    .join('');

  // TR-19: the confirmation message has NO role="status".
  // The screen reader does not announce it — the user never hears that
  // the order was confirmed.
  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <div class="confirmation">
        <div data-trap="TR-19" class="order-confirmation-message">
          <h1>${t('confirmation.title')}</h1>
          <p>${t('confirmation.message')}</p>
        </div>
        <div class="order-summary">
          <p><strong>${t('confirmation.orderNumber')}:</strong> ${order.orderNumber}</p>
          ${itemsHtml ? `<ul class="order-items">${itemsHtml}</ul>` : ''}
          <p><strong>${t('confirmation.total')}:</strong> €${order.total.toFixed(2)}</p>
        </div>
        <a href="#/home" class="btn-primary">${t('confirmation.backHome')}</a>
      </div>
    </main>
  `;

  bindHeaderEvents();
  bindModerator();
}
