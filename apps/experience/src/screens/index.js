// screens/index.js — screen dispatcher

import { renderHome } from '../experiences/screen-reader/screens/home.js';
import { renderProducts } from '../experiences/screen-reader/screens/products.js';
import { renderProductDetail } from '../experiences/screen-reader/screens/product-detail.js';
import { renderCart } from '../experiences/screen-reader/screens/cart.js';
import { renderCheckout } from '../experiences/screen-reader/screens/checkout.js';
import { renderConfirmation } from '../experiences/screen-reader/screens/confirmation.js';
import { renderMetro } from '../experiences/chromatic/screens/metro.js';
import { renderMetroDesign } from '../experiences/chromatic/screens/metro-design.js';
import { renderLogin } from './login.js';
import { renderExperienceSelect } from './experience-select.js';
import { renderInstructions } from './instructions.js';
import { renderRanking } from './ranking.js';
import { applyModeratorOverlays, removeModeratorOverlays } from '../experiences/screen-reader/moderator/moderator.js';
import { getState } from '../store.js';
import { t } from '../i18n/index.js';
import { getProductById } from '../experiences/screen-reader/data/products.js';

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
  metro: renderMetro,
  'metro-design': renderMetroDesign,
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

// Session screens belong to the A11y Experience Center chrome, not Faro —
// their document.title carries the platform brand instead.
const SESSION_TITLE_KEYS = {
  login: 'session.pageTitle.login',
  'experience-select': 'session.pageTitle.experiences',
  instructions: 'session.pageTitle.instructions',
  metro: 'session.pageTitle.metro',
  'metro-design': 'session.pageTitle.metroDesign',
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
  if (SESSION_TITLE_KEYS[name]) {
    document.title = t(SESSION_TITLE_KEYS[name]);
  } else {
    document.title = title ? `${title} — Faro` : 'Faro';
  }

  // Hash navigation never triggers a page load, so screen readers don't
  // announce the new document.title. Moving focus to the screen's h1 makes
  // them announce it ("Datos y Pago, heading level 1") and gives keyboard
  // users a predictable starting point. Skipped when a dialog just opened —
  // it manages its own focus.
  if (!document.querySelector('[role="dialog"]')) {
    const h1 = app.querySelector('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }
  window.scrollTo(0, 0);

  // After any screen renders, apply moderator overlays if mode is ON
  const { moderatorMode } = getState();
  if (moderatorMode) {
    applyModeratorOverlays();
  } else {
    removeModeratorOverlays();
  }
}
