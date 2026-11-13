// header.js — site header with TR-02 (logo without alt).
// TR-01 was corrected: the header now leads with a skip link that moves
// focus to #main-content without touching the hash router.

import { t } from '../../../i18n/index.js';
import { getState } from '../../../store.js';
import { navigate } from '../../../router.js';
import { setLanguage } from '../../../i18n/index.js';

export function renderHeader() {
  const { language, cart } = getState();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // TR-02: Logo image without alt attribute.
  return `
    <header>
      <a href="#main-content" class="skip-link" id="skip-link">${t('nav.skipToContent')}</a>
      <div class="header-inner">
        <a href="#/home" class="logo-link">
          <img data-trap="TR-02" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231c1917' rx='20'/%3E%3Ctext x='20' y='20' font-size='28' text-anchor='middle' dominant-baseline='central' font-family='Times New Roman' fill='%23f59e0b'%3Ef%3C/text%3E%3C/svg%3E" />
          <span>Faro</span>
        </a>
        <nav class="main-nav">
          <a href="#/home">${t('nav.home')}</a>
          <a href="#/products">${t('nav.products')}</a>
        </nav>
        <div class="header-right">
          <a href="#/cart" class="cart-link">
            <svg class="cart-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                 role="img" aria-label="${t('nav.cart')}">
              <circle cx="9" cy="20" r="1.5"></circle>
              <circle cx="17" cy="20" r="1.5"></circle>
              <path d="M3 3h2l2.4 12.2a1.5 1.5 0 0 0 1.5 1.3h7.7a1.5 1.5 0 0 0 1.5-1.2L20 8H6"></path>
            </svg>
            <span class="cart-count">${cartCount}</span>
          </a>
          <button class="lang-toggle" id="lang-toggle">${t('lang.toggle')}</button>
        </div>
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const { language } = getState();
      setLanguage(language === 'es' ? 'en' : 'es');
    });
  }

  // The href is only a label for sighted users: following it would change
  // location.hash and hit the app router, so focus is moved manually.
  const skip = document.getElementById('skip-link');
  if (skip) {
    skip.addEventListener('click', (e) => {
      e.preventDefault();
      const main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    });
  }
}
