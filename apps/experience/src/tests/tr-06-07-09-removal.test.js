// tr-06-07-09-removal.test.js — verify TR-06/TR-07 corrections and the
// TR-09 partial correction (all sizes except M + all colors are ARIA radios
// with their own Tab stop; the M option keeps the trapped div)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderProducts } from '../screens/products.js';
import { renderProductDetail } from '../screens/product-detail.js';
import { clearCart, getState } from '../store.js';
import { setLanguage } from '../i18n/index.js';
import { traps, getTrapById } from '../traps/registry.js';

describe('TR-06/TR-07 removal and TR-09 partial removal', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    document.body.innerHTML = '';
    delete window.__faroSelectVariant;
    delete window.__faroSelectVariantKey;
    delete window.__faroFilterSize;
    delete window.__faroFilterColor;
    delete window.__faroAddToCart;
  });

  it('associates a label with every filter checkbox', () => {
    renderProducts(document.getElementById('app'));

    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    // 10 sizes + 7 colors
    expect(checkboxes.length).toBe(17);

    checkboxes.forEach((input) => {
      expect(input.id).toBeTruthy();
      const label = document.querySelector(`label[for="${input.id}"]`);
      expect(label).not.toBeNull();
      expect(label.textContent.trim()).not.toBe('');
    });

    // The M filter checkbox is labeled too — the exception applies only to
    // the product-detail variant selector.
    const mInput = document.getElementById('filter-size-M');
    expect(mInput).not.toBeNull();
    expect(document.querySelector('label[for="filter-size-M"]').textContent).toBe('M');

    expect(document.querySelector('[data-trap="TR-06"]')).toBeNull();
  });

  it('renders unique buy links that identify each product', () => {
    renderProducts(document.getElementById('app'));

    const links = [...document.querySelectorAll('.product-card .product-card-info a')];
    expect(links.length).toBeGreaterThan(0);

    const texts = links.map((a) => a.textContent.trim());
    expect(new Set(texts).size).toBe(texts.length);
    // Spanish: "Comprar — {name}"; the listing is sorted Z→A, so the
    // first card is "Vaqueros slim" (products-reverse-alpha-sort).
    expect(texts[0]).toBe('Comprar — Vaqueros slim');
    texts.forEach((text) => expect(text).toMatch(/^Comprar — .+/));

    expect(document.querySelector('[data-trap="TR-07"]')).toBeNull();
  });

  it('renders the variant selector as a fieldset/legend group of ARIA radios', () => {
    renderProductDetail(document.getElementById('app'), 'p001');

    const sizeGroup = document.querySelector('.variant-selector[data-variant-type="size"]');
    expect(sizeGroup.tagName).toBe('FIELDSET');
    expect(sizeGroup.querySelector('legend').textContent).toBe('Talla');
    expect(sizeGroup.querySelector('.variant-options').getAttribute('role')).toBe('radiogroup');

    // p001 sizes: S, M, L, XL → S/L/XL are ARIA radios, each Tab-focusable
    const radios = sizeGroup.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(3);
    radios.forEach((radio) => {
      expect(radio.classList.contains('variant-option')).toBe(true);
      expect(radio.getAttribute('aria-checked')).toBe('false');
      // Each option is its own Tab stop
      expect(radio.getAttribute('tabindex')).toBe('0');
      expect(radio.getAttribute('onkeydown')).toContain('__faroSelectVariantKey');
    });

    // p001 colors: blue, black, white → all ARIA radios, all Tab-focusable
    const colorGroup = document.querySelector('.variant-selector[data-variant-type="color"]');
    const colorRadios = colorGroup.querySelectorAll('[role="radio"]');
    expect(colorRadios.length).toBe(3);
    colorRadios.forEach((radio) => {
      expect(radio.getAttribute('tabindex')).toBe('0');
    });
  });

  it('keeps the trapped div only on the M size option', () => {
    renderProductDetail(document.getElementById('app'), 'p001');

    const trapped = document.querySelectorAll('[data-trap="TR-09"]');
    expect(trapped.length).toBe(1);

    const mOption = trapped[0];
    expect(mOption.tagName).toBe('DIV');
    expect(mOption.dataset.value).toBe('M');
    expect(mOption.getAttribute('onclick')).toContain('__faroSelectVariant');
    expect(mOption.getAttribute('onkeydown')).toContain('__faroSelectVariantKey');
    expect(mOption.querySelector('input')).toBeNull();
    expect(mOption.getAttribute('role')).toBeNull();
    // Focusable in the tab order, but still a non-semantic div
    expect(mOption.getAttribute('tabindex')).toBe('0');
  });

  it('keeps selection state coherent across ARIA radios and the trapped M div', () => {
    renderProductDetail(document.getElementById('app'), 'p001');

    // Select L via the variant-selected event (inline onclick/onkeydown
    // handlers run in jsdom's own window scope, so dispatch the CustomEvent
    // directly — same pattern as cart-add-feedback.test.js).
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'L' } }));

    const sizeGroup = document.querySelector('.variant-selector[data-variant-type="size"]');
    const lOption = sizeGroup.querySelector('.variant-option[data-value="L"]');
    expect(lOption.classList.contains('selected')).toBe(true);
    expect(lOption.getAttribute('aria-checked')).toBe('true');

    // Select M via the trapped div's selection path
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'M' } }));

    const mOption = sizeGroup.querySelector('.variant-option[data-value="M"]');
    expect(mOption.classList.contains('selected')).toBe(true);
    // The ARIA radios must return to aria-checked="false"
    sizeGroup.querySelectorAll('[role="radio"]').forEach((r) => {
      expect(r.getAttribute('aria-checked')).toBe('false');
    });
  });

  it('lets the trapped M div be selected via its keyboard handler', () => {
    renderProductDetail(document.getElementById('app'), 'p001');
    const sizeGroup = document.querySelector('.variant-selector[data-variant-type="size"]');
    const mOption = sizeGroup.querySelector('.variant-option[data-value="M"]');

    // Enter selects M through the div's keydown path
    const preventDefault = vi.fn();
    window.__faroSelectVariantKey({ key: 'Enter', preventDefault }, 'size', 'M');
    expect(preventDefault).toHaveBeenCalled();
    expect(mOption.classList.contains('selected')).toBe(true);

    // Non-activation keys do nothing
    document.dispatchEvent(new CustomEvent('variant-selected', { detail: { type: 'size', value: 'L' } }));
    window.__faroSelectVariantKey({ key: 'Tab', preventDefault }, 'size', 'M');
    expect(mOption.classList.contains('selected')).toBe(false);
  });

  it('announces localized names for color options', () => {
    setLanguage('en');
    renderProductDetail(document.getElementById('app'), 'p001');

    const colorGroup = document.querySelector('.variant-selector[data-variant-type="color"]');
    const options = [...colorGroup.querySelectorAll('.variant-option[role="radio"]')];
    const texts = options.map((o) => o.textContent.trim());
    expect(texts).toEqual(['Blue', 'Black', 'White']);
    // Swatch styling stays on the option
    expect(options[0].getAttribute('style')).toContain('background-color');
  });

  it('has 15 traps in the registry, with TR-09 kept as partial', () => {
    expect(traps).toHaveLength(15);
    expect(getTrapById('TR-06')).toBeUndefined();
    expect(getTrapById('TR-07')).toBeUndefined();

    const tr09 = getTrapById('TR-09');
    expect(tr09).toBeTruthy();
    expect(tr09.selector).toBe('[data-trap="TR-09"]');
    // Description documents the partial correction (M keeps the trap)
    expect(tr09.description.es).toContain('M');
  });
});
