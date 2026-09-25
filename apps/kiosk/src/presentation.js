// presentation.js — fullscreen rotating ranking display.
// Polls the API every POLL_MS and rotates across experiences every ROTATE_MS.

import { api, formatElapsed } from './api.js';

const POLL_MS = 15000;
const ROTATE_MS = 12000;

let pollTimer = null;
let rotateTimer = null;
let current = { experienceIds: [], index: 0, rankings: {}, updatedAt: null, error: null };

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

async function refresh() {
  try {
    const { status, data } = await api.experiences();
    if (status !== 200) throw new Error('api');
    const ids = data.experiences.length ? data.experiences : ['screen-reader'];
    const rankings = {};
    await Promise.all(
      ids.map(async (id) => {
        const r = await api.ranking(id);
        rankings[id] = r.status === 200 ? r.data.ranking : [];
      })
    );
    current = {
      ...current,
      experienceIds: ids,
      rankings,
      updatedAt: new Date(),
      error: null,
      index: current.index % ids.length,
    };
  } catch {
    current.error = 'offline';
  }
  paint();
}

function paint() {
  const app = document.getElementById('app');
  const expId = current.experienceIds[current.index];
  const rows = current.rankings[expId] || [];
  const updated = current.updatedAt
    ? current.updatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const body = rows
    .map(
      (r, i) => `<tr>
        <td class="k-pos">${i + 1}</td>
        <td class="k-user">${esc(r.user)}</td>
        <td class="k-time">${formatElapsed(r.elapsedMs)}</td>
      </tr>`
    )
    .join('');

  app.innerHTML = `
    <div class="kiosk">
      <header class="kiosk-header">
        <img src="${import.meta.env.BASE_URL}images/panel-logo.jpg" alt="Panel" class="kiosk-logo" tabindex="-1" />
        <div>
          <h1 class="kiosk-title">Ranking</h1>
          <p class="kiosk-subtitle">${esc(expId || 'A11y Experience Center')}</p>
        </div>
      </header>
      <main class="kiosk-main">
        ${
          current.error
            ? `<p class="kiosk-empty">Sin conexión con el servidor — reintentando…</p>`
            : rows.length === 0
              ? `<p class="kiosk-empty">Todavía no hay participantes en el ranking</p>`
              : `<table class="kiosk-table">
                  <thead><tr><th>#</th><th>Participante</th><th>Tiempo</th></tr></thead>
                  <tbody>${body}</tbody>
                </table>`
        }
      </main>
      <footer class="kiosk-footer">
        <span>Actualizado ${updated}</span>
        ${current.experienceIds.length > 1 ? `<span>${current.index + 1}/${current.experienceIds.length}</span>` : ''}
        <a href="#/admin" class="kiosk-admin-link" aria-label="Modo administración">⚙</a>
      </footer>
    </div>
  `;
}

export function startPresentation() {
  stopPresentation();
  refresh();
  pollTimer = setInterval(refresh, POLL_MS);
  rotateTimer = setInterval(() => {
    if (current.experienceIds.length > 1) {
      current.index = (current.index + 1) % current.experienceIds.length;
      paint();
    }
  }, ROTATE_MS);
}

export function stopPresentation() {
  clearInterval(pollTimer);
  clearInterval(rotateTimer);
  pollTimer = rotateTimer = null;
}
