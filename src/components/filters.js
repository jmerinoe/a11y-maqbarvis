// filters.js — filter checkboxes with associated labels (TR-06 corrected)

import { t, variantLabel } from '../i18n/index.js';
import { getState, setState } from '../store.js';
import { getFilteredProducts } from '../data/products.js';
import { renderProducts } from '../screens/products.js';

const allSizes = ['S', 'M', 'L', 'XL', '28', '30', '32', '34', '36', 'one-size'];
const allColors = ['blue', 'black', 'white', 'gray', 'green', 'red', 'brown'];

export function renderFilters() {
  const { filters } = getState();

  const sizeCheckboxes = allSizes
    .map(
      (size) =>
        `<div class="filter-option">
          <input id="filter-size-${size}" type="checkbox" value="${size}" ${filters.sizes.includes(size) ? 'checked' : ''} onchange="window.__faroFilterSize('${size}', this.checked)" />
          <label for="filter-size-${size}">${variantLabel('size', size)}</label>
        </div>`
    )
    .join('');

  const colorCheckboxes = allColors
    .map(
      (color) =>
        `<div class="filter-option">
          <input id="filter-color-${color}" type="checkbox" value="${color}" ${filters.colors.includes(color) ? 'checked' : ''} onchange="window.__faroFilterColor('${color}', this.checked)" />
          <label for="filter-color-${color}">${variantLabel('color', color)}</label>
        </div>`
    )
    .join('');

  return `
    <aside class="filters">
      <h2>${t('products.filters')}</h2>
      <fieldset class="filter-group">
        <legend>${t('products.filters.size')}</legend>
        ${sizeCheckboxes}
      </fieldset>
      <fieldset class="filter-group">
        <legend>${t('products.filters.color')}</legend>
        ${colorCheckboxes}
      </fieldset>
    </aside>
  `;
}

export function bindFilterEvents() {
  window.__faroFilterSize = (size, checked) => {
    const { filters } = getState();
    const sizes = checked
      ? [...filters.sizes, size]
      : filters.sizes.filter((s) => s !== size);
    setState({ filters: { ...filters, sizes } });
    renderProducts(document.getElementById('app'), null);
  };

  window.__faroFilterColor = (color, checked) => {
    const { filters } = getState();
    const colors = checked
      ? [...filters.colors, color]
      : filters.colors.filter((c) => c !== color);
    setState({ filters: { ...filters, colors } });
    renderProducts(document.getElementById('app'), null);
  };
}
