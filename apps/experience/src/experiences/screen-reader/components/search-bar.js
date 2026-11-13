// search-bar.js — TR-05 (no label). TR-04 was corrected: the search
// control is now a real <button>, reachable and activatable by keyboard.

import { t } from '../../../i18n/index.js';
import { setState } from '../../../store.js';
import { navigate } from '../../../router.js';

export function renderSearchBar() {
  // TR-05: input with placeholder only, no <label>
  return `
    <div class="search-bar">
      <input data-trap="TR-05" type="text" placeholder="${t('search.placeholder')}" id="search-input" />
      <button type="button" class="search-button-div" aria-label="${t('search.button')}" id="search-btn">🔍</button>
    </div>
  `;
}

export function bindSearchBarEvents() {
  // Expose the search handler globally for the moderator/tests, and bind
  // it to the real button — Enter/Space activation comes for free.
  window.__faroSearch = () => {
    const input = document.getElementById('search-input');
    const query = input ? input.value : '';
    setState({ searchQuery: query });
    navigate('#/products');
  };
  document.getElementById('search-btn')?.addEventListener('click', window.__faroSearch);

  // The input itself can still submit on Enter (native behavior), giving
  // a second working path on top of the now-real button.
  const input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.__faroSearch();
      }
    });
  }
}
