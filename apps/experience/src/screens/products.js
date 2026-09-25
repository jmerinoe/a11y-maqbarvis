// screens/products.js — product listing with filters and search

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderSearchBar, bindSearchBarEvents } from '../components/search-bar.js';
import { renderFilters, bindFilterEvents } from '../components/filters.js';
import { renderProductCard } from '../components/product-card.js';
import { getFilteredProducts } from '../data/products.js';
import { bindModerator } from '../moderator/moderator.js';

export function renderProducts(container) {
  const { searchQuery, filters } = getState();
  const filtered = getFilteredProducts(searchQuery, filters.sizes, filters.colors);
  const productCards = filtered.map((p, i) => renderProductCard(p, i)).join('');

  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      ${renderSearchBar()}
      <div class="products-layout">
        ${renderFilters()}
        <section class="products-main">
          <h1>${t('products.title')}</h1>
          <p class="results-count">${filtered.length} ${t('products.results')}</p>
          ${filtered.length === 0 ? `<p>${t('products.noResults')}</p>` : `<div class="product-grid">${productCards}</div>`}
        </section>
      </div>
    </main>
  `;

  bindHeaderEvents();
  bindSearchBarEvents();
  bindFilterEvents();
  bindModerator();
}
