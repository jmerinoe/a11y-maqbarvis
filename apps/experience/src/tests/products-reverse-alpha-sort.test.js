// products-reverse-alpha-sort.test.js — the products listing renders in
// reverse alphabetical order (Z → A) by the localized product name,
// after search/size/color filters are applied.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderProducts } from '../screens/products.js';
import { getFilteredProducts, products } from '../data/products.js';
import { clearCart, setState } from '../store.js';
import { setLanguage } from '../i18n/index.js';

// Expected Z→A sequences by localized name (8 products).
const ES_ORDER = [
  'Vaqueros slim',
  'Sudadera gris',
  'Gorra negra',
  'Chaqueta de cuero',
  'Camiseta de rayas',
  'Camiseta',
  'Camisa a cuadros',
  'Bufanda de lana',
];
const EN_ORDER = [
  'Wool scarf',
  'T-shirt',
  'Striped t-shirt',
  'Slim jeans',
  'Plaid shirt',
  'Leather jacket',
  'Gray hoodie',
  'Black cap',
];

describe('Products listing — reverse alphabetical order', () => {
  beforeEach(() => {
    clearCart();
    setState({ searchQuery: '', filters: { sizes: [], colors: [] } });
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    setState({ searchQuery: '', filters: { sizes: [], colors: [] } });
    setLanguage('es');
    document.body.innerHTML = '';
    delete window.__faroFilterSize;
    delete window.__faroFilterColor;
    delete window.__faroSearch;
  });

  it('returns products in reverse alphabetical order (es)', () => {
    const names = getFilteredProducts('', [], []).map((p) => p.name.es);
    expect(names).toEqual(ES_ORDER);
  });

  it('returns products in reverse alphabetical order (en)', () => {
    setLanguage('en');
    const names = getFilteredProducts('', [], []).map((p) => p.name.en);
    expect(names).toEqual(EN_ORDER);
  });

  it('renders the listing cards in the sorted order', () => {
    renderProducts(document.getElementById('app'));

    const names = [...document.querySelectorAll('.product-card .product-card-name')].map((el) =>
      el.textContent.trim()
    );
    expect(names).toEqual(ES_ORDER);
  });

  it('keeps reverse alphabetical order on filtered subsets', () => {
    // Sizes S and M match p001, p002, p004, p005, p006
    const names = getFilteredProducts('', ['S'], []).map((p) => p.name.es);
    expect(names).toEqual(['Sudadera gris', 'Chaqueta de cuero', 'Camiseta de rayas', 'Camiseta', 'Camisa a cuadros']);

    // Search also stays sorted
    const searched = getFilteredProducts('camiseta', [], []).map((p) => p.name.es);
    expect(searched).toEqual(['Camiseta de rayas', 'Camiseta']);
  });

  it('does not mutate the products catalog array', () => {
    const before = products.map((p) => p.id);
    getFilteredProducts('', [], []);
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
