// variant-selector.js — TR-09 partially corrected: options are ARIA radios
// (role="radio" + aria-checked + tabindex="0") inside a fieldset/legend group,
// EXCEPT the M size which keeps the trapped <div>+onclick markup
// (no role, no accessible name).

import { t, variantLabel } from '../i18n/index.js';

export function renderVariantSelector(product, type, selectedValue) {
  const values = type === 'size' ? product.sizes : product.colors;
  const colorHex = product.colorHex || {};

  const options = values
    .map((value) => {
      const isSelected = value === selectedValue;
      // TR-09 kept only on the M size: non-semantic div, no role, no name.
      // tabindex="0" + keydown handler keep it focusable and selectable —
      // but NVDA still cannot identify it as an option of the group.
      if (type === 'size' && value === 'M') {
        return `<div data-trap="TR-09" class="variant-option ${isSelected ? 'selected' : ''}" data-value="${value}" tabindex="0" onclick="window.__faroSelectVariant('${type}', '${value}')" onkeydown="window.__faroSelectVariantKey(event, '${type}', '${value}')">${variantLabel(type, value)}</div>`;
      }
      // tabindex="0" on every option: a native radio group only contributes
      // one Tab stop — ARIA radios give each option its own Tab stop
      // (owner's requirement: all sizes and colors reachable via Tab).
      const styleAttr =
        type === 'color' ? ` style="background-color: ${colorHex[value] || '#ccc'}"` : '';
      return `<div class="variant-option ${isSelected ? 'selected' : ''}" data-value="${value}" role="radio" aria-checked="${isSelected}" tabindex="0"${styleAttr} onclick="window.__faroSelectVariant('${type}', '${value}')" onkeydown="window.__faroSelectVariantKey(event, '${type}', '${value}')">${variantLabel(type, value)}</div>`;
    })
    .join('');

  const label = type === 'size' ? t('detail.size') : t('detail.color');

  return `
    <fieldset class="variant-selector" data-variant-type="${type}">
      <legend class="variant-label">${label}</legend>
      <div class="variant-options" role="radiogroup" aria-label="${label}">${options}</div>
    </fieldset>
  `;
}

export function bindVariantSelectorEvents() {
  window.__faroSelectVariant = (type, value) => {
    const event = new CustomEvent('variant-selected', {
      detail: { type, value },
    });
    document.dispatchEvent(event);
  };

  // Keyboard activation for div-based options: Enter/Space selects.
  // Used by the ARIA radios and by the trapped M div (TR-09).
  window.__faroSelectVariantKey = (event, type, value) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.__faroSelectVariant(type, value);
    }
  };
}
