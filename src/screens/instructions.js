// screens/instructions.js — experience instructions (accessible, no traps)
// The timer starts ONLY when the participant presses Continuar.

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { getExperienceById } from '../data/experiences.js';
import { getSession, markTimerStarted } from '../session/session.js';
import { mountExperienceTimer } from '../components/experience-timer.js';
import { navigate } from '../router.js';

export function renderInstructions(container) {
  const { language } = getState();
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;

  if (!session || !experience) {
    navigate('#/experiences');
    return;
  }

  container.innerHTML = `
    <main class="session-screen">
      <h1>${t('instructions.title')}</h1>
      <p class="instructions-text"><strong>${experience.name[language] || experience.name.es}</strong></p>
      <p class="instructions-text">${experience.instructions[language] || experience.instructions.es}</p>
      <p class="instructions-text">${t('instructions.timerNotice')}</p>
      <button id="instructions-continue" class="btn-primary">${t('instructions.continue')}</button>
    </main>
  `;

  document.getElementById('instructions-continue').addEventListener('click', () => {
    const started = markTimerStarted();
    mountExperienceTimer(started.startedAt);
    navigate('#/home');
  });
}
