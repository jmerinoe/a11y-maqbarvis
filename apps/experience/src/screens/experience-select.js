// screens/experience-select.js — experience picker driven by the registry
// (accessible, no traps)

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { experiences } from '../data/experiences.js';
import { getSession, setSession } from '../session/session.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';
import { verifyAdminPin } from '../components/pin-gate.js';

export function renderExperienceSelect(container) {
  const { language } = getState();

  const items = experiences
    .map((exp) => {
      const name = exp.name[language] || exp.name.es;
      const lock = exp.locked
        ? ` <span class="experience-lock" aria-label="${t('experience.locked')}">🔒</span>`
        : '';
      return `<li><a href="#/instructions" data-experience-id="${exp.id}">${name}${lock}</a></li>`;
    })
    .join('');

  container.innerHTML = panelShell(`
    <main class="panel-screen">
      <h1>${t('experience.selectTitle')}</h1>
      <ul class="experience-list">${items}</ul>
    </main>
  `);

  const start = (experienceId) => {
    const session = getSession() || {};
    session.experienceId = experienceId;
    setSession(session);
    navigate('#/instructions');
  };

  container.querySelectorAll('.experience-list a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const experience = experiences.find((exp) => exp.id === link.dataset.experienceId);
      if (!experience?.locked) {
        start(link.dataset.experienceId);
        return;
      }
      // Locked experience (WIP): ask for the admin PIN first.
      showPinPrompt(link.parentElement, () => start(experience.id));
    });
  });
}

// Inline PIN prompt inside the locked experience's <li>. Accessible:
// labelled input, Enter submits, Escape cancels, errors via role="alert".
function showPinPrompt(li, onSuccess) {
  if (li.querySelector('.pin-form')) return; // already open
  const form = document.createElement('form');
  form.className = 'pin-form';
  form.innerHTML = `
    <label for="pin-input">${t('experience.pinPrompt')}</label>
    <input id="pin-input" type="password" inputmode="numeric" autocomplete="off">
    <button type="submit" class="btn-primary">${t('experience.pinSubmit')}</button>
    <button type="button" class="btn-secondary" data-cancel>${t('experience.pinCancel')}</button>
    <p class="pin-error" role="alert" hidden></p>
  `;
  li.appendChild(form);

  const input = form.querySelector('#pin-input');
  const error = form.querySelector('.pin-error');
  input.focus();

  const close = () => {
    form.remove();
    li.querySelector('a')?.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    const result = await verifyAdminPin(input.value.trim());
    if (result === 'ok') {
      onSuccess();
      return;
    }
    error.textContent = t(result === 'denied' ? 'experience.pinDenied' : 'experience.pinUnavailable');
    error.hidden = false;
    input.select();
  });

  form.querySelector('[data-cancel]').addEventListener('click', close);
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
