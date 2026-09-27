// screens/index.js — screen dispatcher

import { renderHome } from './home.js';
import { renderProducts } from './products.js';
import { renderProductDetail } from './product-detail.js';
import { renderCart } from './cart.js';
import { renderCheckout } from './checkout.js';
import { renderConfirmation } from './confirmation.js';
import { renderLogin } from './login.js';
import { renderExperienceSelect } from './experience-select.js';
import { renderInstructions } from './instructions.js';
import { renderRanking } from './ranking.js';
import { applyModeratorOverlays, removeModeratorOverlays } from '../moderator/moderator.js';
import { getState } from '../store.js';
import { t } from '../i18n/index.js';
import { getProductById } from '../data/products.js';

const screenRenderers = {
  login: renderLogin,
  'experience-select': renderExperienceSelect,
  instructions: renderInstructions,
  ranking: renderRanking,
  home: renderHome,
  products: renderProducts,
  'product-detail': renderProductDetail,
  cart: renderCart,
  checkout: renderCheckout,
  confirmation: renderConfirmation,
};

// Each screen announces an identifying title — the h1 in the markup and
// document.title, which is what a screen reader speaks first on navigation.
const SCREEN_TITLE_KEYS = {
  home: 'home.title',
  products: 'products.title',
  cart: 'cart.title',
  checkout: 'checkout.title',
  confirmation: 'confirmation.title',
};

export function renderScreen(name, param) {
  const app = document.getElementById('app');
  const renderer = screenRenderers[name] || screenRenderers.login;
  renderer(app, param);

  let titleKey = SCREEN_TITLE_KEYS[name];
  let title = titleKey ? t(titleKey) : null;
  if (name === 'product-detail') {
    const { language } = getState();
    const p = getProductById(param);
    title = p ? p.name[language] || p.name.es : null;
  }
  document.title = title ? `${title} — Faro` : 'Faro';

  // After any screen renders, apply moderator overlays if mode is ON
  const { moderatorMode } = getState();
  if (moderatorMode) {
    applyModeratorOverlays();
  } else {
    removeModeratorOverlays();
  }
}
