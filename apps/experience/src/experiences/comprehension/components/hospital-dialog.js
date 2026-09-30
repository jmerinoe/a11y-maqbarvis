// hospital-dialog.js — accessible informational dialog for the
// comprehension experience (same pattern as congrats/metro dialogs:
// role="dialog", aria-modal, labelled title, managed focus, Escape).

import { getSession } from '../../../session/session.js';
import { pickCopy } from '../data/copy.js';

let previousFocus = null;

// titleKey/messageKey are copy.js keys; the register follows
// session.plainMode so retry-without-barriers shows plain language.
export function showHospitalDialog(titleKey, messageKey, onClose) {
  previousFocus = document.activeElement;
  const plain = getSession()?.plainMode === true;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog metro-dialog" role="dialog" aria-modal="true"
         aria-labelledby="hospital-dialog-title" tabindex="-1">
      <h2 id="hospital-dialog-title">${pickCopy(titleKey, plain)}</h2>
      <p>${pickCopy(messageKey, plain)}</p>
      <button id="hospital-dialog-ok" class="btn-primary">${pickCopy('btn.ok', plain)}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const okBtn = overlay.querySelector('#hospital-dialog-ok');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    onClose?.();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  okBtn.addEventListener('click', close);

  dialog.focus();
}
