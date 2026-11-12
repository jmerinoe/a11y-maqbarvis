// route-hint.js — progressive facilitator hints for chromatic runs.
// One leg of the optimal route every three minutes (3, 6, 9, 12, 15, 18),
// in order, once each — the count persists on the session so navigation
// and reloads never repeat a hint. Same accessible overlay pattern as
// the other metro dialogs, kept grayscale (chromatic-scope) like the
// rest of the barrier run. First run only; the timer keeps running.

import { t } from '../../../i18n/index.js';
import { getSession, setSession, isReplaySession } from '../../../session/session.js';
import { getExperienceById } from '../../../data/experiences.js';
import { optimalRouteLegs } from '../data/metro.js';

const HINT_EVERY_MS = 3 * 60 * 1000;
let pendingTimer = null;
let previousFocus = null;
let cachedLegs = null;

function legs() {
  if (!cachedLegs) {
    const mission = getExperienceById('chromatic')?.mission;
    cachedLegs = mission ? optimalRouteLegs(mission.origin, mission.destination) : [];
  }
  return cachedLegs;
}

function hintEligible(session) {
  return (
    session?.experienceId === 'chromatic' &&
    session.startedAt &&
    !session.completedAt &&
    !isReplaySession(session) &&
    (session.hintCount ?? 0) < legs().length
  );
}

export function armRouteHint() {
  clearTimeout(pendingTimer);
  pendingTimer = null;
  const session = getSession();
  if (!hintEligible(session)) return;

  const next = ((session.hintCount ?? 0) + 1) * HINT_EVERY_MS;
  const remaining = next - (Date.now() - session.startedAt);
  if (remaining <= 0) fire();
  else pendingTimer = setTimeout(fire, remaining);
}

function fire() {
  pendingTimer = null;
  const session = getSession();
  if (!hintEligible(session)) return;
  // Never stack over another open dialog (route check, abandon, …):
  // retry shortly — the threshold has already passed, so it fires then.
  if (document.querySelector('.congrats-overlay')) {
    pendingTimer = setTimeout(fire, 15000);
    return;
  }
  const n = (session.hintCount ?? 0) + 1;
  setSession({ ...session, hintCount: n });
  showRouteHint(n, legs()[n - 1]);
}

function showRouteHint(n, leg) {
  previousFocus = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'congrats-overlay chromatic-scope';
  overlay.innerHTML = `
    <div class="congrats-dialog metro-dialog" role="dialog" aria-modal="true"
         aria-labelledby="route-hint-title" tabindex="-1">
      <h2 id="route-hint-title">${t('metro.hintTitle')}</h2>
      <p>${t('metro.hintMsg', {
        n,
        leg: `<strong>${leg.line} · ${leg.from} → ${leg.to}</strong>`,
      })}</p>
      <button id="route-hint-ok" class="btn-primary">${t('metro.dialog.ok')}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.congrats-dialog');
  const okBtn = overlay.querySelector('#route-hint-ok');

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKeydown);
    previousFocus?.focus?.();
    armRouteHint(); // schedule the next leg (fires at once if past due)
  };
  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);
  okBtn.addEventListener('click', close);

  dialog.focus();
}
