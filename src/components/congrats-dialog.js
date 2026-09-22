// congrats-dialog.js — accessible completion dialog (no traps here)
// role="dialog" + aria-modal + labelled title + managed focus + Escape.

import { t } from '../i18n/index.js';
import { navigate } from '../router.js';
import { formatElapsed } from '../session/session.js';

let previousFocus = null;

export function showCongratsDialog(elapsedMs) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="congrats-title" tabindex="-1">
      <h2 id="congrats-title">${t('congrats.title')}</h2>
      <p>${t('congrats.message')}</p>
      <p class="congrats-time"><strong>${t('congrats.time')}:</strong> ${formatElapsed(elapsedMs)}</p>
      <button id="congrats-close" class="btn-primary">${t('congrats.close')}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const closeBtn = overlay.querySelector('#congrats-close');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    navigate('#/ranking');
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  closeBtn.addEventListener('click', close);

  dialog.focus();
}
