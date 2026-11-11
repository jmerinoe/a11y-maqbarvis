// abandon-dialog.js — "Me rindo" flow: confirmation + closing dialogs.
// Same accessible overlay pattern as congrats-dialog: role="dialog",
// aria-modal, labelled title, managed focus, Escape.
// The run is recorded with result 'abandoned' and always ranks after
// every completed run (DNF).

import { t } from '../i18n/index.js';
import { navigate } from '../router.js';
import { getSession, setSession, submitResult, formatElapsed } from '../session/session.js';
import { stopExperienceTimer } from './experience-timer.js';

let previousFocus = null;

export function requestAbandon() {
  const session = getSession();
  if (!session?.startedAt || session.completedAt) return;
  showAbandonConfirm(() => finalizeAbandon());
}

function finalizeAbandon() {
  const session = getSession();
  if (!session?.startedAt) return;
  const endedAt = Date.now();
  const elapsedMs = endedAt - session.startedAt;
  stopExperienceTimer();
  // First recorded outcome only: replaying after a completed or abandoned
  // run never resubmits — the standing record stays.
  if (session.baselineMs == null && !session.abandoned) {
    submitResult({
      user: session.user,
      experienceId: session.experienceId,
      startedAt: new Date(session.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      elapsedMs,
      result: 'abandoned',
    });
  }
  setSession({ ...session, completedAt: endedAt, abandoned: true });
  showAbandonedDialog(elapsedMs);
}

function showAbandonConfirm(onConfirm) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="giveup-title" tabindex="-1">
      <h2 id="giveup-title">${t('giveup.confirmTitle')}</h2>
      <p>${t('giveup.confirmMsg')}</p>
      <div class="metro-dialog-actions">
        <button id="giveup-no" class="btn-secondary">${t('giveup.confirmNo')}</button>
        <button id="giveup-yes" class="btn-primary">${t('giveup.confirmYes')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
  };
  const confirm = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    onConfirm();
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  overlay.querySelector('#giveup-no').addEventListener('click', close);
  overlay.querySelector('#giveup-yes').addEventListener('click', confirm);

  dialog.focus();
}

function showAbandonedDialog(elapsedMs) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog" role="dialog" aria-modal="true"
         aria-labelledby="abandoned-title" tabindex="-1">
      <h2 id="abandoned-title">${t('giveup.title')}</h2>
      <p>${t('giveup.message')}</p>
      <p class="congrats-time"><strong>${t('congrats.time')}:</strong> ${formatElapsed(elapsedMs)}</p>
      <button id="abandoned-ranking" class="btn-primary">${t('congrats.close')}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const rankingBtn = overlay.querySelector('#abandoned-ranking');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    navigate('#/ranking');
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  rankingBtn.addEventListener('click', close);

  dialog.focus();
}
