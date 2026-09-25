// screens/ranking.js — top-10 best times for the current experience
// (accessible, no traps)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { getExperienceById } from '../data/experiences.js';
import { getSession, fetchRanking, clearSession, formatElapsed } from '../session/session.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';

export async function renderRanking(container) {
  const { language } = getState();
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  const rows = experience ? await fetchRanking(experience.id) : [];

  const body = rows
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td><td>${r.user}</td><td>${formatElapsed(r.elapsedMs)}</td></tr>`
    )
    .join('');

  container.innerHTML = panelShell(`
    <main class="panel-screen">
      <h1>${t('ranking.title')}</h1>
      ${experience ? `<p class="instructions-text">${experience.name[language] || experience.name.es}</p>` : ''}
      ${
        rows.length === 0
          ? `<p>${t('ranking.empty')}</p>`
          : `<table class="ranking-table">
              <thead>
                <tr>
                  <th>${t('ranking.position')}</th>
                  <th>${t('ranking.user')}</th>
                  <th>${t('ranking.time')}</th>
                </tr>
              </thead>
              <tbody>${body}</tbody>
            </table>`
      }
      <button id="ranking-new-participant" class="btn-primary">${t('ranking.newParticipant')}</button>
    </main>
  `);

  document.getElementById('ranking-new-participant').addEventListener('click', () => {
    clearSession();
    navigate('#/login');
  });
}
