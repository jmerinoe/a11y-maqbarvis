// screens/instructions.js — experience instructions (accessible, no traps)
// The timer starts ONLY when the participant presses Continuar.

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { getExperienceById } from '../data/experiences.js';
import { getSession, markTimerStarted } from '../session/session.js';
import { mountExperienceTimer } from '../components/experience-timer.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';

export function renderInstructions(container) {
  const { language } = getState();
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;

  if (!session || !experience) {
    navigate('#/experiences');
    return;
  }

  const pick = (field) => field[language] || field.es;
  const paragraphs = (field) =>
    (pick(field) || []).map((p) => `<p>${p}</p>`).join('');
  const item = experience.requiredItem;

  container.innerHTML = panelShell(`
    <main class="panel-screen instructions-screen">
      <h1>${pick(experience.welcome)}</h1>

      <section class="instructions-section" aria-labelledby="instructions-objective">
        <h2 id="instructions-objective">${t('instructions.objectiveTitle')}</h2>
        ${paragraphs(experience.objective)}
      </section>

      <section class="instructions-section" aria-labelledby="instructions-mission">
        <h2 id="instructions-mission">${t('instructions.missionTitle')}</h2>
        ${paragraphs(experience.missionIntro)}

        <dl class="mission-card">
          <div class="mission-card-row">
            <dt>${t('instructions.productLabel')}</dt>
            <dd>${pick(item.label)}</dd>
          </div>
          <div class="mission-card-row">
            <dt>${t('instructions.sizeLabel')}</dt>
            <dd>${item.size}</dd>
          </div>
          <div class="mission-card-row">
            <dt>${t('instructions.cardLabel')}</dt>
            <dd>${item.cardNumber}</dd>
          </div>
        </dl>

        ${paragraphs(experience.missionOutro)}
      </section>

      <button id="instructions-continue" class="btn-primary">${t('instructions.continue')}</button>
    </main>
  `);

  document.getElementById('instructions-continue').addEventListener('click', () => {
    const started = markTimerStarted();
    mountExperienceTimer(started.startedAt);
    navigate('#/home');
  });
}
