// moderator/moderator.js — Ctrl+M toggle, compact badge annotations, click-to-expand

import { getState, setState } from '../store.js';
import { getTrapById } from '../traps/registry.js';
import { t } from '../i18n/index.js';

let moderatorBound = false;
let activeTrapId = null;

export function bindModerator() {
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

    // Mark the trapped element for highlighting
    el.classList.add('moderator-trapped');
    el.setAttribute('data-moderator-trapped', trapId);

    // Create a compact badge button
    const badge = document.createElement('button');
    badge.className = 'moderator-badge-trap';
    badge.setAttribute('data-moderator-badge', trapId);
    badge.textContent = trapId;
    badge.title = trap.description[language] || trap.description.es;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTrapPanel(trapId, el, badge);
    });

    // Position badge at top-right corner of the trapped element
    const wrapper = document.createElement('div');
    wrapper.className = 'moderator-badge-wrapper';
    wrapper.setAttribute('data-moderator-wrapper', trapId);
    wrapper.appendChild(badge);

    el.parentNode.insertBefore(wrapper, el.nextSibling);
  });

  // Close active panel when clicking outside
  document.addEventListener('click', closePanelOnOutsideClick);
}

function toggleTrapPanel(trapId, trappedEl, badge) {
  const { language } = getState();
  const trap = getTrapById(trapId);
  if (!trap) return;

  // If this trap's panel is already open, close it
  if (activeTrapId === trapId) {
    closeAllPanels();
    return;
  }

  // Close any previously open panel
  closeAllPanels();

  // Highlight the trapped element
  trappedEl.classList.add('moderator-highlight');
  badge.classList.add('active');

  // Create the explanation panel
  const panel = document.createElement('div');
  panel.className = 'moderator-panel';
  panel.setAttribute('data-moderator-panel', trapId);
  panel.innerHTML = `
    <div class="moderator-panel-header">
      <span class="moderator-trap-id">${trap.id}</span>
      <span class="moderator-wcag">${t('moderator.wcag')}: ${trap.wcag}</span>
      <button class="moderator-panel-close" aria-label="Close">&times;</button>
    </div>
    <p class="moderator-description">${trap.description[language] || trap.description.es}</p>
    <div class="moderator-fix">
      <span class="moderator-fix-label">${t('moderator.fix')}:</span>
      <pre class="moderator-fix-code"><code>${escapeHtml(trap.fix)}</code></pre>
    </div>
  `;

  // Close button
  panel.querySelector('.moderator-panel-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllPanels();
  });

  // Insert panel after the badge wrapper
  const wrapper = badge.parentNode;
  wrapper.appendChild(panel);

  activeTrapId = trapId;
}

function closeAllPanels() {
  document.querySelectorAll('[data-moderator-panel]').forEach((p) => p.remove());
  document.querySelectorAll('.moderator-badge-trap.active').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.moderator-highlight').forEach((el) => el.classList.remove('moderator-highlight'));
  activeTrapId = null;
}

function closePanelOnOutsideClick(e) {
  if (!activeTrapId) return;
  if (e.target.closest('[data-moderator-wrapper]') || e.target.closest('[data-moderator-panel]')) return;
  closeAllPanels();
}

export function removeModeratorOverlays() {
  document.removeEventListener('click', closePanelOnOutsideClick);
  closeAllPanels();
  document.querySelectorAll('[data-moderator-wrapper]').forEach((w) => w.remove());
  document.querySelectorAll('.moderator-trapped').forEach((el) => {
    el.classList.remove('moderator-trapped');
    el.removeAttribute('data-moderator-trapped');
  });
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
