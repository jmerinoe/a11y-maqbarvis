// header.js — site header with TR-01 (no skip link) and TR-02 (logo without alt)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { navigate } from '../router.js';
import { setLanguage } from '../i18n/index.js';

export function renderHeader() {
  const { language, cart } = getState();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // TR-01: No skip-to-content link. The data-trap marker sits on the header
  // to show where a skip link should appear but does not.
  // TR-02: Logo image without alt attribute.
  return `
    <header data-trap="TR-01">
      <div class="header-inner">
        <a href="#/home" class="logo-link">
          <img data-trap="TR-02" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%231c1917' rx='20'/%3E%3Ctext x='20' y='28' font-size='22' text-anchor='middle' font-family='serif' fill='%23f59e0b'%3EF%3C/text%3E%3C/svg%3E" />
          <span>Faro</span>
        </a>
        <nav class="main-nav">
          <a href="#/home">${t('nav.home')}</a>
          <a href="#/products">${t('nav.products')}</a>
        </nav>
        <div class="header-right">
          <a href="#/cart" class="cart-link">
            <span>🛍</span>
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
}
