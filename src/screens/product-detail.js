// screens/product-detail.js — TR-09 (variant selector), TR-10 (price disconnected), TR-11 (no add-to-cart feedback)

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
            <span>${name.charAt(0)}</span>
          </div>
        </section>
        <section class="product-detail-info">
          <h1>${name}</h1>
          <p class="product-description">${product.description[language] || product.description.es}</p>
          ${renderVariantSelector(product, 'size', selectedSize)}
          ${renderVariantSelector(product, 'color', selectedColor)}
          <div class="add-to-cart-row">
            <button data-trap="TR-11" class="btn-primary" onclick="window.__faroAddToCart('${product.id}')">${t('detail.addToCart')}</button>
          </div>
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

  // TR-11: add to cart gives NO feedback (no aria-live, no announcement)
  window.__faroAddToCart = (id) => {
    if (!selectedSize || !selectedColor) return;
    addToCart(id, selectedSize, selectedColor);
    // Intentionally no announcement — this is the trap.
    // A sighted user sees the cart count update in the header.
  };
}

function handleVariantSelected(e) {
  const { type, value } = e.detail;
  if (type === 'size') selectedSize = value;
  if (type === 'color') selectedColor = value;

  // Update visual selection state
  document.querySelectorAll('.variant-option').forEach((el) => {
    el.classList.remove('selected');
  });
  // Re-mark selected — simplistic: mark all matching text
  const options = document.querySelectorAll('.variant-option');
  options.forEach((el) => {
    if (el.textContent.trim() === value) {
      el.classList.add('selected');
    }
  });
}
