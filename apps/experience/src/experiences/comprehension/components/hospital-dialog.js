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
      <button id="hospital-dialog-ok" type="button" class="btn-primary">${pickCopy('btn.ok', plain)}</button>
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
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' && document.activeElement === dialog) {
      e.preventDefault();
      okBtn.click();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )];
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    if (e.shiftKey) {
      e.preventDefault();
      items[idx <= 0 ? items.length - 1 : idx - 1].focus();
    } else {
      e.preventDefault();
      items[idx === -1 || idx === items.length - 1 ? 0 : idx + 1].focus();
    }
  };
  document.addEventListener('keydown', onKeydown);
  okBtn.addEventListener('click', close);

  dialog.focus();
}

// Two-choice variant: "keep trying" closes the dialog and keeps the run
// open; "finish" ends the experience with the slot just booked.
export function showHospitalChoiceDialog(titleKey, messageKey, onKeepTrying, onFinish) {
  previousFocus = document.activeElement;
  const plain = getSession()?.plainMode === true;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog metro-dialog" role="dialog" aria-modal="true"
         aria-labelledby="hospital-dialog-title" tabindex="-1">
      <h2 id="hospital-dialog-title">${pickCopy(titleKey, plain)}</h2>
      <p>${pickCopy(messageKey, plain)}</p>
      <div class="hospital-dialog-actions">
        <button id="hospital-dialog-keep" type="button" class="btn-primary">${pickCopy('btn.keepTrying', plain)}</button>
        <button id="hospital-dialog-finish" type="button" class="btn-secondary">${pickCopy('btn.finish', plain)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');

  const close = (cb) => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    cb?.();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') { close(onKeepTrying); return; }
    if (e.key === 'Enter' && document.activeElement === dialog) {
      e.preventDefault();
      overlay.querySelector('#hospital-dialog-keep').click();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )];
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    if (e.shiftKey) {
      e.preventDefault();
      items[idx <= 0 ? items.length - 1 : idx - 1].focus();
    } else {
      e.preventDefault();
      items[idx === -1 || idx === items.length - 1 ? 0 : idx + 1].focus();
    }
  };
  document.addEventListener('keydown', onKeydown);
  overlay.querySelector('#hospital-dialog-keep').addEventListener('click', () => close(onKeepTrying));
  overlay.querySelector('#hospital-dialog-finish').addEventListener('click', () => close(onFinish));

  dialog.focus();
}
