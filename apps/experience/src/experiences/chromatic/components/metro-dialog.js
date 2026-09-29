// metro-dialog.js — accessible informational dialog for the chromatic
// experience (same pattern as congrats/mission-failed: role="dialog",
// aria-modal, labelled title, managed focus, Escape).

import { t } from '../../../i18n/index.js';
import { getSession } from '../../../session/session.js';

let previousFocus = null;

// Dialogs follow the mission scope: grayscale until the first completion,
// full colour afterwards (baselineMs survives retries).
function scopeClass() {
  const s = getSession();
  const revealed = s?.completedAt || s?.baselineMs != null;
  return revealed ? 'congrats-overlay' : 'congrats-overlay chromatic-scope';
}

export function showMetroDialog(titleKey, messageKey, params) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = scopeClass();
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

// Modal shown when the submitted route is valid but not optimal: the
// participant may keep improving it (dialog closes, timer keeps running)
// or finish the experience with this duration.
export function showSuboptimalDialog(minutes, onFinish) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = scopeClass();
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="metro-dialog-title" aria-describedby="metro-dialog-desc" tabindex="-1">
      <h2 id="metro-dialog-title">${t('metro.dialog.suboptimalTitle')}</h2>
      <p id="metro-dialog-desc">${t('metro.dialog.suboptimalMsg', { minutes })}</p>
      <div class="metro-dialog-actions">
        <button type="button" id="metro-keep-trying" class="btn-primary">${t('metro.dialog.keepTrying')}</button>
        <button type="button" id="metro-finish" class="btn-secondary">${t('metro.dialog.finish')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const close = (finish) => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    if (finish) onFinish();
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') close(false);
  };
  document.addEventListener('keydown', onKeydown);
  dialog
    .querySelector('#metro-keep-trying')
    .addEventListener('click', () => close(false));
  dialog
    .querySelector('#metro-finish')
    .addEventListener('click', () => close(true));

  dialog.querySelector('#metro-keep-trying').focus();
}

// Modal shown when the same origin→destination pair is served by more than
// one usable line — the participant must pick which one the tramo uses.
// options: [{ line: {id}, minutes }]; onPick(lineId|null) is called with the
// chosen line id or null on cancel.
export function showLineChoiceDialog(from, to, options, onPick) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = scopeClass();
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
