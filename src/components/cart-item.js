// cart-item.js — TR-13 (icon-only remove button) and TR-14 (no aria-live on total)

import { t, variantLabel } from '../i18n/index.js';
import { getState, updateCartQuantity, removeFromCart } from '../store.js';
import { getProductById } from '../data/products.js';
import { renderCart } from '../screens/cart.js';

export function renderCartItem(item, index) {
  const { language } = getState();
  const product = getProductById(item.productId);
  if (!product) return '';
  const name = product.name[language] || product.name.es;
  const lineTotal = (product.price * item.quantity).toFixed(2);

  return `
    <tr class="cart-item">
      <td class="cart-item-name">
        ${name}
        <span class="cart-item-variant">${variantLabel('size', item.size)} · ${variantLabel('color', item.color)}</span>
      </td>
      <td class="cart-item-quantity">
        <button onclick="window.__faroCartQty(${index}, ${item.quantity - 1})">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button onclick="window.__faroCartQty(${index}, ${item.quantity + 1})">+</button>
      </td>
      <td class="cart-item-price">€${lineTotal}</td>
      <td class="cart-item-remove">
        <button data-trap="TR-13" class="remove-btn" onclick="window.__faroCartRemove(${index})">🗑</button>
      </td>
    </tr>
  `;
}

// Refreshes the cart UI after a quantity/remove operation. When the cart
// becomes empty the whole screen re-renders so the empty state shows and
// the checkout button disappears — an empty cart must not reach checkout.
function refreshCart() {
  const { cart } = getState();
  if (cart.length === 0) {
    renderCart(document.getElementById('app'));
    return;
  }
  // TR-14: total updates in DOM but is NOT announced (no aria-live on total element)
  // The total element lacks role="status" — this is the trap.
  const totalEl = document.getElementById('cart-total');
  if (totalEl) {
    const total = cart.reduce((sum, item) => {
      const p = getProductById(item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);
    totalEl.textContent = `€${total.toFixed(2)}`;
  }
  // Re-render cart items to reflect quantity changes
  const tbody = document.getElementById('cart-items-body');
  if (tbody) {
    tbody.innerHTML = cart.map((item, i) => renderCartItem(item, i)).join('');
  }
}

export function bindCartItemEvents() {
  window.__faroCartQty = (index, quantity) => {
    updateCartQuantity(index, quantity);
    refreshCart();
  };

  window.__faroCartRemove = (index) => {
    removeFromCart(index);
    refreshCart();
  };
}
