// screens/ranking.js — top-10 best times for the current experience
// (accessible, no traps)

import { t } from '../i18n/index.js';
import { getState, setState } from '../store.js';
import { getExperienceById } from '../data/experiences.js';
import { getSession, setSession, fetchRanking, clearSession, formatElapsed, rankingWindow } from '../session/session.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';
import { stopExperienceTimer, mountExperienceTimer } from '../components/experience-timer.js';

export async function renderRanking(container) {
  // The ranking is a terminal screen — the run timer must never show here
  // (e.g. reaching it while a failed-mission session is still counting).
  stopExperienceTimer();

  const { language } = getState();
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  const full = experience ? await fetchRanking(experience.id, { all: true }) : [];
  const { rows, offset } = rankingWindow(full, session?.user);

  // The journey-duration column only appears when at least one row has
  // the data (chromatic results); the appointment column appears for
  // comprehension rows; others stay a plain time ranking.
  const showRoute = rows.some((r) => r.routeMinutes != null);
  const showAppointment = rows.some((r) => r.appointmentAt != null);
  const fmtAppointment = (iso) => {
    const d = new Date(iso);
    const locale = language === 'en' ? 'en-GB' : 'es-ES';
    const date = d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return `${date} · ${time}`;
  };
  const body = rows
    .map((r, i) => {
      const self = session && r.user === session.user;
      const routeCell = showRoute
        ? `<td>${r.routeMinutes != null ? `${r.routeMinutes} min` : '—'}</td>`
        : '';
      const apptCell = showAppointment
        ? `<td>${r.appointmentAt != null ? fmtAppointment(r.appointmentAt) : '—'}</td>`
        : '';
      return `<tr${self ? ' class="ranking-self"' : ''}><td>${offset + i + 1}</td><td>${r.user}${self ? `<span class="sr-only">${t('ranking.you')}</span>` : ''}</td>${routeCell}${apptCell}<td>${formatElapsed(r.elapsedMs)}</td></tr>`;
    })
    .join('');

  container.innerHTML = panelShell(`
    <main class="panel-screen ranking-screen">
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
                  ${showRoute ? `<th>${t('ranking.routeDuration')}</th>` : ''}
                  ${showAppointment ? `<th>${t('ranking.appointment')}</th>` : ''}
                  <th>${t('ranking.time')}</th>
                </tr>
              </thead>
              <tbody>${body}</tbody>
            </table>`
      }
      <div class="ranking-actions">
        ${session && experience ? `<button id="ranking-retry" class="btn-secondary">${t('ranking.retry')}</button>` : ''}
        <button id="ranking-new-participant" class="btn-primary">${t('ranking.newParticipant')}</button>
      </div>
    </main>
  `);

  // Retry mission sighted: restart the timer (baselineMs survives so the
  // next completion is not submitted, only compared to the recorded run).
  const retryBtn = document.getElementById('ranking-retry');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      const startedAt = Date.now();
      // Comprehension retry runs barrier-free: plainMode switches the
      // hospital copy to clear language.
      const plainMode = experience.id === 'comprehension' ? true : session.plainMode;
      setSession({ ...session, startedAt, completedAt: undefined, plainMode });
      // Drop the previous journey so the replay starts from scratch.
      setState({ tramos: [] });
      mountExperienceTimer(startedAt);
      navigate(experience.homeRoute || '#/home');
    });
  }

  document.getElementById('ranking-new-participant').addEventListener('click', () => {
    clearSession();
    navigate('#/experiences');
  });
}
