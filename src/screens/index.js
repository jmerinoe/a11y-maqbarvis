// screens/index.js — screen dispatcher

import { renderHome } from './home.js';
import { renderProducts } from './products.js';
import { renderProductDetail } from './product-detail.js';
import { renderCart } from './cart.js';
import { renderCheckout } from './checkout.js';
import { renderConfirmation } from './confirmation.js';
import { applyModeratorOverlays, removeModeratorOverlays } from '../moderator/moderator.js';
import { getState } from '../store.js';

const screenRenderers = {
  home: renderHome,
  products: renderProducts,
  'product-detail': renderProductDetail,
  cart: renderCart,
  checkout: renderCheckout,
  confirmation: renderConfirmation,
};

export function renderScreen(name, param) {
  const app = document.getElementById('app');
  const renderer = screenRenderers[name] || screenRenderers.home;
  renderer(app, param);

  // After any screen renders, apply moderator overlays if mode is ON
  const { moderatorMode } = getState();
  if (moderatorMode) {
    applyModeratorOverlays();
  } else {
    removeModeratorOverlays();
  }
}
