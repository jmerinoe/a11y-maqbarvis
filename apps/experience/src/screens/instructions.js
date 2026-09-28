// screens/instructions.js — experience instructions (accessible, no traps)
// The timer starts ONLY when the participant presses Continuar.

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { getExperienceById } from '../data/experiences.js';
import { getSession, markTimerStarted } from '../session/session.js';
import { mountExperienceTimer } from '../components/experience-timer.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';

// Clipboard API requires a secure context; fall back to a hidden textarea
// + execCommand for older setups.
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

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

  // Key shortcuts card is only meaningful for screen-reader experiences.
  const keysCard =
    experience.id === 'screen-reader'
      ? `
    <aside class="navkeys-card" aria-labelledby="navkeys-title">
      <h2 id="navkeys-title">${t('instructions.keysTitle')}</h2>
      <dl class="navkeys-list">
        <div class="navkeys-row"><dt><kbd>Tab</kbd></dt><dd>${t('instructions.key.tab')}</dd></div>
        <div class="navkeys-row"><dt><kbd>Shift</kbd> + <kbd>Tab</kbd></dt><dd>${t('instructions.key.shiftTab')}</dd></div>
        <div class="navkeys-row"><dt><kbd>Enter</kbd></dt><dd>${t('instructions.key.enter')}</dd></div>
        <div class="navkeys-row"><dt><kbd>${t('instructions.key.spaceName')}</kbd></dt><dd>${t('instructions.key.space')}</dd></div>
        <div class="navkeys-row"><dt><kbd>↑</kbd> <kbd>↓</kbd></dt><dd>${t('instructions.key.arrows')}</dd></div>
      </dl>
    </aside>`
      : '';

  container.innerHTML = panelShell(`
    <main class="panel-screen instructions-screen">
      <div class="instructions-layout">
        <div class="instructions-content">
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
                <dd class="mission-card-card">
                  <span class="card-number">${item.cardNumber}</span>
                  <button type="button" id="copy-card" class="copy-btn"
                          aria-label="${t('instructions.copyCardLabel')}">${t('instructions.copyCard')}</button>
                  <span id="copy-status" class="copy-status" role="status"></span>
                </dd>
              </div>
            </dl>

            ${paragraphs(experience.missionOutro)}
          </section>

          <button id="instructions-continue" class="btn-primary">${t('instructions.continue')}</button>
        </div>
        ${keysCard}
      </div>
    </main>
  `);

  document.getElementById('copy-card').addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    const ok = await copyText(item.cardNumber);
    status.textContent = t(ok ? 'instructions.copied' : 'instructions.copyError');
  });

  document.getElementById('instructions-continue').addEventListener('click', () => {
    const started = markTimerStarted();
    mountExperienceTimer(started.startedAt);
    navigate('#/home');
  });
}
