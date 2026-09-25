// search-bar.js — TR-04 (div onclick instead of button) and TR-05 (no label)

import { t } from '../i18n/index.js';
import { setState } from '../store.js';
import { navigate } from '../router.js';

export function renderSearchBar() {
  // TR-05: input with placeholder only, no <label>
  // TR-04: search "button" is a <div> with onclick — not a real button
  return `
    <div class="search-bar">
      <input data-trap="TR-05" type="text" placeholder="${t('search.placeholder')}" id="search-input" />
      <div data-trap="TR-04" class="search-button-div" onclick="window.__faroSearch()">🔍</div>
    </div>
  `;
}

export function bindSearchBarEvents() {
  // Expose the search handler globally so the broken div onclick can call it.
  // This is intentional: the div onclick works with a mouse but NOT with
  // keyboard (Enter/Space), which is exactly the trap.
  window.__faroSearch = () => {
    const input = document.getElementById('search-input');
    const query = input ? input.value : '';
    setState({ searchQuery: query });
    navigate('#/products');
  };

  // The input itself can still submit on Enter (native behavior), which
  // gives a sighted mouse user a working path — but the "button" is broken.
  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.__faroSearch();
      }
    });
  }
}
