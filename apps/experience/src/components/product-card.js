// product-card.js — TR-08 (broken tab order)
// TR-07 corrected: the buy link text includes the product name.

import { t } from '../i18n/index.js';
import { getState } from '../store.js';

export function renderProductCard(product, index) {
  const { language } = getState();
  const name = product.name[language] || product.name.es;
  const colorHex = product.colorHex[product.colors[0]] || '#ccc';

  // TR-08: positive tabindex breaks tab order (cards get tabindex 5,4,3,2,1...)
  return `
    <article class="product-card" data-trap="TR-08" tabindex="${5 - (index % 5)}">
      <div class="product-image-placeholder" style="background-color: ${colorHex}">
        <img src="${product.image}" alt="" loading="lazy" />
      </div>
      <div class="product-card-info">
        <p class="product-card-name">${name}</p>
        <p class="product-card-price">€${product.price.toFixed(2)}</p>
        <a href="#/product/${product.id}">${t('products.buyNamed', { name })}</a>
      </div>
    </article>
  `;
}
