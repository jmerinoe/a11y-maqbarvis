// screens/product-detail.js — TR-09 (variant selector), TR-10 (price disconnected)
// TR-11 (add-to-cart no feedback) has been corrected: add-to-cart now announces
// validation and confirmation messages via aria-live regions.

import { t } from '../i18n/index.js';
import { getState, addToCart } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderVariantSelector, bindVariantSelectorEvents } from '../components/variant-selector.js';
import { getProductById } from '../data/products.js';
import { navigate } from '../router.js';
import { bindModerator } from '../moderator/moderator.js';

let selectedSize = null;
let selectedColor = null;

export function renderProductDetail(container, productId) {
  const { language } = getState();
  const product = getProductById(productId);
  if (!product) {
    container.innerHTML = `<main><p>Product not found</p></main>`;
    return;
  }

  selectedSize = null;
  selectedColor = null;
  const name = product.name[language] || product.name.es;
  const colorHex = product.colorHex[product.colors[0]] || '#ccc';

  // TR-10: price is in a separate DOM region from the product name.
  // The name is in the <h1> inside the info section, the price is in a
  // separate <aside> — screen readers read them disconnected.
  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <div class="product-detail-layout">
        <section class="product-detail-image">
          <div class="product-image-placeholder large" style="background-color: ${colorHex}">
            <img src="${product.image}" alt="" />
          </div>
        </section>
        <section class="product-detail-info">
          <h1>${name}</h1>
          <p class="product-description">${product.description[language] || product.description.es}</p>
          ${renderVariantSelector(product, 'size', selectedSize)}
          ${renderVariantSelector(product, 'color', selectedColor)}
          <div class="add-to-cart-row">
            <button class="btn-primary" onclick="window.__faroAddToCart('${product.id}')">${t('detail.addToCart')}</button>
          </div>
          <p id="add-to-cart-validation" class="validation-message" role="alert" aria-live="assertive"></p>
          <p id="add-to-cart-confirmation" class="confirmation-message" role="status" aria-live="polite"></p>
          <a href="#/products" class="back-link">${t('detail.back')}</a>
        </section>
        <aside data-trap="TR-10" class="product-detail-price-box">
          <p class="price-label">${t('detail.price')}</p>
          <p class="price-value">€${product.price.toFixed(2)}</p>
        </aside>
      </div>
    </main>
  `;

  bindHeaderEvents();
  bindVariantSelectorEvents();
  bindModerator();

  // Listen for variant selection from the custom widget
  document.addEventListener('variant-selected', handleVariantSelected);

  // Add-to-cart with accessible feedback (TR-11 corrected).
  // Validation message (role="alert") when size/color missing; confirmation
  // message (role="status") on successful add. Both via pre-declared live regions.
  window.__faroAddToCart = (id) => {
    const validationEl = document.getElementById('add-to-cart-validation');
    const confirmationEl = document.getElementById('add-to-cart-confirmation');

    const missing = [];
    if (!selectedSize) missing.push(t('detail.size').toLowerCase());
    if (!selectedColor) missing.push(t('detail.color').toLowerCase());

    if (missing.length > 0) {
      // Do NOT add: announce which attributes are missing.
      confirmationEl.textContent = '';
      validationEl.textContent = t('detail.validationMissing', { attrs: missing.join(', ') });
      return;
    }

    addToCart(id, selectedSize, selectedColor);
    validationEl.textContent = '';
    const product = getProductById(id);
    const name = product ? (product.name[getState().language] || product.name.es) : '';
    confirmationEl.textContent = t('detail.addedToCart', { name });
  };
}

function handleVariantSelected(e) {
  const { type, value } = e.detail;
  if (type === 'size') selectedSize = value;
  if (type === 'color') selectedColor = value;

  // Update visual selection state ONLY within the matching variant group,
  // so selecting a size does not unselect a previously chosen color (and
  // vice versa). The group is identified by data-variant-type on the
  // .variant-selector wrapper.
  const group = document.querySelector(`.variant-selector[data-variant-type="${type}"]`);
  if (!group) return;

  group.querySelectorAll('.variant-option').forEach((el) => {
    el.classList.toggle('selected', el.dataset.value === value);
  });
}
