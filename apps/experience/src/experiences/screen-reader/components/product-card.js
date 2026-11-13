// product-card.js — TR-07 corrected: the buy link text includes the
// product name. TR-08 corrected: no positive tabindex — cards follow
// DOM order and are not tab stops themselves (their link is).

import { t } from '../../../i18n/index.js';
import { getState } from '../../../store.js';

export function renderProductCard(product, index) {
  const { language } = getState();
  const name = product.name[language] || product.name.es;
  const colorHex = product.colorHex[product.colors[0]] || '#ccc';

  return `
    <article class="product-card">
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
