// variant-options-i18n.test.js — verify localized variant labels and single one-size option

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderFilters } from '../components/filters.js';
import { renderVariantSelector } from '../components/variant-selector.js';
import { renderCartItem } from '../components/cart-item.js';
import { renderProductDetail } from '../screens/product-detail.js';
import { getFilteredProducts, getProductById } from '../data/products.js';
import { setState, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

function mount(html) {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

describe('Variant options i18n', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    setState({ filters: { sizes: [], colors: [] } });
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    setState({ filters: { sizes: [], colors: [] } });
    document.body.innerHTML = '';
  });

  it('renders a single one-size filter option with localized label', () => {
    const host = mount(renderFilters());

    const oneSizeInputs = host.querySelectorAll('input[value="one-size"]');
    expect(oneSizeInputs).toHaveLength(1);
    expect(oneSizeInputs[0].nextElementSibling.textContent).toBe('Talla única');

    // The old duplicated raw values are gone
    expect(host.querySelector('input[value="Única"]')).toBeNull();
    expect(host.querySelector('input[value="One size"]')).toBeNull();
  });

  it('localizes color filter labels in es and en', () => {
    const host = mount(renderFilters());
    const labelFor = (value) =>
      host.querySelector(`input[value="${value}"]`).nextElementSibling.textContent;

    expect(labelFor('blue')).toBe('Azul');
    expect(labelFor('red')).toBe('Rojo');

    setLanguage('en');
    const hostEn = mount(renderFilters());
    const labelForEn = (value) =>
      hostEn.querySelector(`input[value="${value}"]`).nextElementSibling.textContent;

    expect(labelForEn('blue')).toBe('Blue');
    expect(labelForEn('red')).toBe('Red');
    expect(
      hostEn.querySelector('input[value="one-size"]').nextElementSibling.textContent
    ).toBe('One size');
  });

  it('variant selector shows one localized one-size option for p007', () => {
    const product = getProductById('p007');
    const host = mount(renderVariantSelector(product, 'size', null));

    const options = host.querySelectorAll('.variant-option');
    expect(options).toHaveLength(1);
    expect(options[0].dataset.value).toBe('one-size');
    expect(options[0].textContent).toBe('Talla única');
  });

  it('marks the clicked option as selected via data-value, not localized text', () => {
    const app = document.getElementById('app');
    renderProductDetail(app, 'p007');

    document.dispatchEvent(
      new CustomEvent('variant-selected', { detail: { type: 'color', value: 'red' } })
    );

    const redOption = document.querySelector('.variant-option[data-value="red"]');
    expect(redOption.classList.contains('selected')).toBe(true);
    // Localized label, canonical value underneath
    expect(redOption.textContent).toBe('Rojo');
    expect(redOption.dataset.value).toBe('red');
  });

  it('cart line item renders localized variant text', () => {
    const host = mount(
      `<table><tbody>${renderCartItem({ productId: 'p007', size: 'one-size', color: 'red', quantity: 1 }, 0)}</tbody></table>`
    );

    expect(host.querySelector('.cart-item-variant').textContent).toBe('Talla única · Rojo');
  });

  it('filtering by one-size returns only p007 and p008', () => {
    const result = getFilteredProducts('', ['one-size'], []);
    expect(result.map((p) => p.id).sort()).toEqual(['p007', 'p008']);
  });

  it('filtering by canonical color key still works', () => {
    const result = getFilteredProducts('', [], ['blue']);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => expect(p.colors).toContain('blue'));
  });
});
