// admin.js — kiosk administration mode (PIN-gated): list, add, edit,
// delete results and reset rankings per experience or globally.

import { api, getAdminPin, setAdminPin, clearAdminPin, formatElapsed } from './api.js';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

const msToInput = (ms) => {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const inputToMs = (v) => {
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(v.trim());
  return m ? (Number(m[1]) * 60 + Number(m[2])) * 1000 : null;
};

function renderPinGate(app, error = '') {
  app.innerHTML = `
    <div class="kiosk admin">
      <main class="admin-card">
        <h1>Administración</h1>
        <form id="pin-form">
          <label for="pin-input">PIN de administrador</label>
          <input type="password" id="pin-input" autocomplete="off" />
          ${error ? `<p class="admin-error" role="alert">${error}</p>` : ''}
          <button type="submit" class="btn-primary">Entrar</button>
        </form>
        <a href="#/" class="admin-back">← Volver al ranking</a>
      </main>
    </div>
  `;
  document.getElementById('pin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = document.getElementById('pin-input').value;
    setAdminPin(pin);
    const { status } = await api.adminResults();
    if (status === 403 || status === 503) {
      clearAdminPin();
      renderPinGate(app, 'PIN incorrecto');
    } else {
      renderAdmin(app);
    }
  });
  document.getElementById('pin-input').focus();
}

async function renderAdmin(app, notice = '') {
  const [{ status, data }, expRes] = await Promise.all([api.adminResults(), api.experiences()]);
  if (status === 403 || status === 503) {
    clearAdminPin();
    renderPinGate(app, 'Sesión expirada. Introduce el PIN de nuevo.');
    return;
  }
  const results = data.results || [];
  const experienceIds = [...new Set(results.map((r) => r.experienceId))];
  const knownIds = expRes.status === 200 ? expRes.data.experiences : [];
  for (const id of knownIds) if (!experienceIds.includes(id)) experienceIds.push(id);

  const rows = results
    .map(
      (r) => `<tr data-pk="${esc(r.partitionKey)}" data-rk="${esc(r.rowKey)}">
        <td>${esc(r.user)}</td>
        <td>${esc(r.experienceId)}</td>
        <td>${formatElapsed(r.elapsedMs)}</td>
        <td>${esc((r.endedAt || '').slice(0, 19).replace('T', ' '))}</td>
        <td class="admin-actions">
          <button class="admin-edit" type="button">Editar</button>
          <button class="admin-del" type="button">Eliminar</button>
        </td>
      </tr>`
    )
    .join('');

  app.innerHTML = `
    <div class="kiosk admin">
      <header class="admin-header">
        <h1>Administración del ranking</h1>
        <div>
          <a href="#/" class="admin-back">← Ranking</a>
          <button id="admin-logout" type="button">Cerrar sesión</button>
        </div>
      </header>
      <main class="admin-main">
        ${notice ? `<p class="admin-notice" role="status">${esc(notice)}</p>` : ''}

        <section class="admin-add">
          <h2>Añadir registro</h2>
          <form id="add-form" class="admin-form">
            <input id="add-user" placeholder="Participante" required />
            <select id="add-exp">
              ${experienceIds.map((id) => `<option value="${esc(id)}">${esc(id)}</option>`).join('')}
              <option value="__new">Nueva experiencia…</option>
            </select>
            <input id="add-exp-new" placeholder="experience-id" hidden />
            <input id="add-time" placeholder="MM:SS" required pattern="\\d{1,3}:[0-5]\\d" />
            <button type="submit" class="btn-primary">Añadir</button>
          </form>
        </section>

        <section>
          <h2>Registros (${results.length})</h2>
          <table class="admin-table">
            <thead><tr><th>Participante</th><th>Experiencia</th><th>Tiempo</th><th>Fin</th><th></th></tr></thead>
            <tbody>${rows || '<tr><td colspan="5">Sin registros</td></tr>'}</tbody>
          </table>
        </section>

        <section class="admin-reset">
          <h2>Resetear</h2>
          ${experienceIds
            .map((id) => `<button class="reset-exp" data-exp="${esc(id)}" type="button">Resetear ${esc(id)}</button>`)
            .join('')}
          <button id="reset-all" class="danger" type="button">Resetear TODO el ranking</button>
        </section>
      </main>
    </div>
  `;

  bindAdmin(app, results);
}

function bindAdmin(app, results) {
  document.getElementById('admin-logout').addEventListener('click', () => {
    clearAdminPin();
    location.hash = '#/';
  });

  const expSelect = document.getElementById('add-exp');
  const expNew = document.getElementById('add-exp-new');
  expSelect.addEventListener('change', () => {
    expNew.hidden = expSelect.value !== '__new';
    if (!expNew.hidden) expNew.focus();
  });

  document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('add-user').value.trim();
    const experienceId = expSelect.value === '__new' ? expNew.value.trim() : expSelect.value;
    const elapsedMs = inputToMs(document.getElementById('add-time').value);
    if (!user || !experienceId || elapsedMs === null) return;
    const endedAt = new Date().toISOString();
    const { status } = await api.adminAdd({
      user, experienceId, startedAt: endedAt, endedAt, elapsedMs,
    });
    renderAdmin(app, status === 201 ? 'Registro añadido' : 'Error al añadir');
  });

  app.querySelectorAll('.admin-del').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const tr = btn.closest('tr');
      if (!confirm('¿Eliminar este registro?')) return;
      await api.adminDelete(tr.dataset.pk, tr.dataset.rk);
      renderAdmin(app, 'Registro eliminado');
    })
  );

  app.querySelectorAll('.admin-edit').forEach((btn) =>
    btn.addEventListener('click', () => {
      const tr = btn.closest('tr');
      const rec = results.find(
        (r) => r.partitionKey === tr.dataset.pk && r.rowKey === tr.dataset.rk
      );
      if (!rec || tr.querySelector('.edit-form')) return;
      tr.innerHTML = `<td colspan="5">
        <form class="edit-form admin-form">
          <input id="edit-user" value="${esc(rec.user)}" required />
          <input id="edit-time" value="${msToInput(rec.elapsedMs)}" required pattern="\\d{1,3}:[0-5]\\d" />
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="edit-cancel">Cancelar</button>
        </form>
      </td>`;
      tr.querySelector('.edit-cancel').addEventListener('click', () => renderAdmin(app));
      tr.querySelector('.edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const elapsedMs = inputToMs(tr.querySelector('#edit-time').value);
        if (elapsedMs === null) return;
        await api.adminUpdate(rec.partitionKey, rec.rowKey, {
          user: tr.querySelector('#edit-user').value.trim(),
          elapsedMs,
        });
        renderAdmin(app, 'Registro actualizado');
      });
    })
  );

  app.querySelectorAll('.reset-exp').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Resetear el ranking de "${btn.dataset.exp}"?`)) return;
      await api.adminReset(btn.dataset.exp);
      renderAdmin(app, `Ranking de ${btn.dataset.exp} reseteado`);
    })
  );

  document.getElementById('reset-all').addEventListener('click', async () => {
    if (!confirm('¿Resetear TODOS los rankings? Esta acción no se puede deshacer.')) return;
    await api.adminReset();
    renderAdmin(app, 'Ranking global reseteado');
  });
}

export function renderAdminMode(app) {
  if (!getAdminPin()) {
    renderPinGate(app);
  } else {
    renderAdmin(app);
  }
}
