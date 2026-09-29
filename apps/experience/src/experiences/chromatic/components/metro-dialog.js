// metro-dialog.js — accessible informational dialog for the chromatic
// experience (same pattern as congrats/mission-failed: role="dialog",
// aria-modal, labelled title, managed focus, Escape).

import { t } from '../../../i18n/index.js';

let previousFocus = null;

export function showMetroDialog(titleKey, messageKey, params) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay chromatic-scope';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="metro-dialog-title" tabindex="-1">
      <h2 id="metro-dialog-title">${t(titleKey)}</h2>
      <p>${t(messageKey, params)}</p>
      <button id="metro-dialog-ok" class="btn-primary">${t('metro.dialog.ok')}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const okBtn = overlay.querySelector('#metro-dialog-ok');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  okBtn.addEventListener('click', close);

  dialog.focus();
}

// Modal shown when the same origin→destination pair is served by more than
// one usable line — the participant must pick which one the tramo uses.
// options: [{ line: {id}, minutes }]; onPick(lineId|null) is called with the
// chosen line id or null on cancel.
export function showLineChoiceDialog(from, to, options, onPick) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay chromatic-scope';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="metro-dialog-title" aria-describedby="metro-dialog-desc" tabindex="-1">
      <h2 id="metro-dialog-title">${t('metro.dialog.choiceTitle')}</h2>
      <p id="metro-dialog-desc">${t('metro.dialog.choiceMsg', { from, to })}</p>
      <div class="line-choice-list">
        ${options
          .map(
            (o) => `<button type="button" class="line-choice-btn" data-line="${o.line.id}">
                <strong>${o.line.id}</strong> — ${o.minutes} ${t('metro.minutes')}</button>`
          )
          .join('')}
      </div>
      <button type="button" class="btn-secondary" id="metro-choice-cancel">${t(
        'metro.dialog.cancel'
      )}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const finish = (lineId) => {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
    previousFocus?.focus?.();
    onPick(lineId);
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') finish(null);
  };
  document.addEventListener('keydown', onKeydown);
  dialog.querySelectorAll('.line-choice-btn').forEach((btn) =>
    btn.addEventListener('click', () => finish(btn.dataset.line))
  );
  dialog
    .querySelector('#metro-choice-cancel')
    .addEventListener('click', () => finish(null));

  dialog.querySelector('.line-choice-btn').focus();
}
