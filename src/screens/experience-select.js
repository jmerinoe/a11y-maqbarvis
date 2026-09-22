// screens/experience-select.js — experience picker driven by the registry
// (accessible, no traps)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { experiences } from '../data/experiences.js';
import { getSession, setSession } from '../session/session.js';
import { navigate } from '../router.js';

export function renderExperienceSelect(container) {
  const { language } = getState();

  const items = experiences
    .map(
      (exp) =>
        `<li><a href="#/instructions" data-experience-id="${exp.id}">${exp.name[language] || exp.name.es}</a></li>`
    )
    .join('');

  container.innerHTML = `
    <main class="session-screen">
      <h1>${t('experience.selectTitle')}</h1>
      <ul class="experience-list">${items}</ul>
    </main>
  `;

  container.querySelectorAll('.experience-list a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const session = getSession() || {};
      session.experienceId = link.dataset.experienceId;
      setSession(session);
      navigate('#/instructions');
    });
  });
}
