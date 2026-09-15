// main.js — entry point

import { initRouter, handleRouteChange } from './router.js';
import { getState, subscribe } from './store.js';
import { bindModerator } from './moderator/moderator.js';

// Set default language
document.documentElement.lang = 'es';

// Register the global Ctrl+M moderator listener once
bindModerator();

// Re-render current screen when language changes
let lastLanguage = getState().language;
subscribe((state) => {
  if (state.language !== lastLanguage) {
    lastLanguage = state.language;
    handleRouteChange();
  }
});

// Live cart counter: patch the header's .cart-count text node when the cart
// changes, without a full screen re-render (preserves product detail state
// and moderator overlays).
let lastCartCount = getState().cart.reduce((s, i) => s + i.quantity, 0);
subscribe((state) => {
  const count = state.cart.reduce((s, i) => s + i.quantity, 0);
  if (count !== lastCartCount) {
    lastCartCount = count;
    const badge = document.querySelector('.cart-count');
    if (badge) badge.textContent = String(count);
  }
});

// Initialize the router (renders the initial screen)
initRouter();
