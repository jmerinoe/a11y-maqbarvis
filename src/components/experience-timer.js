// experience-timer.js — global session timer overlay
// Mounted on document.body (NOT inside #app): every screen rewrites
// #app.innerHTML, so an in-screen timer would be destroyed on navigation.

import { t } from '../i18n/index.js';
import { formatElapsed } from '../session/session.js';

let intervalId = null;

export function mountExperienceTimer(startedAt) {
  stopExperienceTimer();

  const el = document.createElement('div');
  el.id = 'experience-timer';
  el.setAttribute('role', 'timer');
  el.setAttribute('aria-label', t('timer.label'));
  document.body.appendChild(el);

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
  document.getElementById('experience-timer')?.remove();
}
