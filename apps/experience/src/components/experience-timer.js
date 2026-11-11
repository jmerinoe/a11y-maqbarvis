// experience-timer.js — global session timer overlay
// Mounted on document.body (NOT inside #app): every screen rewrites
// #app.innerHTML, so an in-screen timer would be destroyed on navigation.

import { t } from '../i18n/index.js';
import { formatElapsed } from '../session/session.js';
import { requestAbandon } from './abandon-dialog.js';

let intervalId = null;

export function mountExperienceTimer(startedAt) {
  stopExperienceTimer();

  // Timer + give-up live inside a shared fixed HUD — flex layout keeps
  // them stacked with a gap, no overlapping offsets.
  const hud = document.createElement('div');
  hud.id = 'experience-hud';

  const el = document.createElement('div');
  el.id = 'experience-timer';
  el.setAttribute('role', 'timer');
  el.setAttribute('aria-label', t('timer.label'));
  hud.appendChild(el);

  // The give-up control lives and dies with the timer — it only exists
  // while a run is in progress, on every screen of every experience.
  const giveUp = document.createElement('button');
  giveUp.id = 'give-up-btn';
  giveUp.type = 'button';
  giveUp.textContent = t('giveup.button');
  giveUp.addEventListener('click', requestAbandon);
  hud.appendChild(giveUp);

  document.body.appendChild(hud);

  const update = () => {
    el.textContent = `⏱ ${formatElapsed(Date.now() - startedAt)}`;
  };
  update();
  intervalId = setInterval(update, 250);
}

export function stopExperienceTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  document.getElementById('experience-hud')?.remove();
  document.getElementById('experience-timer')?.remove();
  document.getElementById('give-up-btn')?.remove();
}
