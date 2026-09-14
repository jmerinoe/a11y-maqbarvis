// variant-selector.js — TR-09 (custom div widget, no role/name)

import { t } from '../i18n/index.js';

export function renderVariantSelector(product, type, selectedValue) {
  const values = type === 'size' ? product.sizes : product.colors;
  const colorHex = product.colorHex || {};

  const options = values
    .map((value) => {
      const isSelected = value === selectedValue;
      const styleAttr =
        type === 'color' ? ` style="background-color: ${colorHex[value] || '#ccc'}"` : '';
      // TR-09: custom div widget with onclick, no role, no accessible name
      return `<div data-trap="TR-09" class="variant-option ${isSelected ? 'selected' : ''}"${styleAttr} onclick="window.__faroSelectVariant('${type}', '${value}')">${value}</div>`;
    })
    .join('');

  const label = type === 'size' ? t('detail.size') : t('detail.color');

  return `
    <div class="variant-selector">
      <span class="variant-label">${label}</span>
      <div class="variant-options">${options}</div>
    </div>
  `;
}

export function bindVariantSelectorEvents() {
  window.__faroSelectVariant = (type, value) => {
    const event = new CustomEvent('variant-selected', {
      detail: { type, value },
    });
    document.dispatchEvent(event);
  };
}
