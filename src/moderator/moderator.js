// moderator/moderator.js — Ctrl+M toggle, overlay annotations, mode badge

import { getState, setState, notify } from '../store.js';
import { getTrapById } from '../traps/registry.js';
import { t } from '../i18n/index.js';

let moderatorBound = false;

export function bindModerator() {
  // Ensure the global Ctrl+M listener is registered once
  if (moderatorBound) return;
  moderatorBound = true;

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      toggleModeratorMode();
    }
  });
}

export function toggleModeratorMode() {
  const { moderatorMode } = getState();
  const next = !moderatorMode;
  setState({ moderatorMode: next });

  if (next) {
    applyModeratorOverlays();
    showModeratorBadge();
  } else {
    removeModeratorOverlays();
    hideModeratorBadge();
  }
}

export function applyModeratorOverlays() {
  removeModeratorOverlays();

  const { language } = getState();
  const trappedElements = document.querySelectorAll('[data-trap]');

  trappedElements.forEach((el) => {
    const trapId = el.getAttribute('data-trap');
    const trap = getTrapById(trapId);
    if (!trap) return;

    const overlay = document.createElement('div');
    overlay.className = 'moderator-overlay';
    overlay.setAttribute('data-moderator-overlay', trapId);
    overlay.innerHTML = `
      <div class="moderator-overlay-header">
        <span class="moderator-trap-id">${trap.id}</span>
        <span class="moderator-wcag">${t('moderator.wcag')}: ${trap.wcag}</span>
      </div>
      <p class="moderator-description">${trap.description[language] || trap.description.es}</p>
      <div class="moderator-fix">
        <span class="moderator-fix-label">${t('moderator.fix')}:</span>
        <pre class="moderator-fix-code"><code>${escapeHtml(trap.fix)}</code></pre>
      </div>
    `;

    // Position the overlay relative to the trapped element
    const wrapper = document.createElement('div');
    wrapper.className = 'moderator-overlay-wrapper';
    wrapper.setAttribute('data-moderator-wrapper', trapId);

    // Insert overlay as a sibling, positioned absolutely
    el.parentNode.insertBefore(wrapper, el.nextSibling);
    wrapper.appendChild(overlay);
  });
}

export function removeModeratorOverlays() {
  const wrappers = document.querySelectorAll('[data-moderator-wrapper]');
  wrappers.forEach((w) => w.remove());
}

export function showModeratorBadge() {
  hideModeratorBadge();
  const badge = document.createElement('div');
  badge.id = 'moderator-badge';
  badge.className = 'moderator-badge';
  badge.textContent = t('moderator.badge');
  document.body.appendChild(badge);
}

export function hideModeratorBadge() {
  const badge = document.getElementById('moderator-badge');
  if (badge) badge.remove();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
