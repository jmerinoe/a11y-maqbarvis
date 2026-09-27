// mission-failed-dialog.js — accessible retry dialog (no traps here)
// role="dialog" + aria-modal + labelled title + managed focus + Escape.
// Shown when the purchase flow ends but the order does not match the
// required item — the timer keeps running and the participant starts over.

import { t } from '../i18n/index.js';
import { navigate } from '../router.js';

let previousFocus = null;

export function showMissionFailedDialog() {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="failed-title" tabindex="-1">
      <h2 id="failed-title">${t('failed.title')}</h2>
      <p>${t('failed.message')}</p>
      <p class="failed-hint">${t('failed.hint')}</p>
      <button id="failed-retry" class="btn-primary">${t('failed.retry')}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const retryBtn = overlay.querySelector('#failed-retry');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    navigate('#/home');
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  retryBtn.addEventListener('click', close);

  dialog.focus();
}
