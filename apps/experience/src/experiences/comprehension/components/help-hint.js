// help-hint.js — one-time facilitator hint for comprehension runs that
// pass six minutes without completing. Armed from bindHospitalNav on
// every hospital screen so it fires wherever the participant is; a
// persisted session flag keeps it single-shot across navigation and
// reloads. Same accessible overlay pattern as the other dialogs
// (role="dialog", aria-modal, managed focus, Escape). The hint is
// plain-language help in every register and never pauses the timer.

import { getSession, setSession, isReplaySession } from '../../../session/session.js';
import { pickCopy } from '../data/copy.js';

const HINT_AFTER_MS = 6 * 60 * 1000;
let pendingTimer = null;
let previousFocus = null;

function hintEligible(session) {
  return (
    session?.experienceId === 'comprehension' &&
    session.startedAt &&
    !session.completedAt &&
    !session.hintShown &&
    !isReplaySession(session)
  );
}

export function armHelpHint() {
  clearTimeout(pendingTimer);
  pendingTimer = null;
  const session = getSession();
  if (!hintEligible(session)) return;

  const fire = () => {
    pendingTimer = null;
    const s = getSession(); // re-check: the run may have ended or navigated away
    if (!hintEligible(s)) return;
    setSession({ ...s, hintShown: true });
    showHelpHint();
  };

  const remaining = HINT_AFTER_MS - (Date.now() - session.startedAt);
  if (remaining <= 0) fire();
  else pendingTimer = setTimeout(fire, remaining);
}

function showHelpHint() {
  previousFocus = document.activeElement;
  const plain = getSession()?.plainMode === true;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay';
  overlay.innerHTML = `
    <div class="congrats-dialog metro-dialog" role="dialog" aria-modal="true"
         aria-labelledby="hint-dialog-title" tabindex="-1">
      <h2 id="hint-dialog-title">${pickCopy('hint.title', plain)}</h2>
      <p>${pickCopy('hint.msg', plain)}</p>
      <button id="hint-dialog-ok" class="btn-primary">${pickCopy('hint.ok', plain)}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const okBtn = overlay.querySelector('#hint-dialog-ok');

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
