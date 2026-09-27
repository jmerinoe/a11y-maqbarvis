// presentation.js — fullscreen rotating ranking display, arcade style.
// Polls the API every POLL_MS and rotates across experiences every ROTATE_MS.
// Rows are persistent DOM nodes keyed per record so position changes,
// new entries and new records can be animated (FLIP + CSS keyframes).

import { api, formatElapsed, getKioskTheme, KIOSK_THEMES, DEFAULT_THEME } from './api.js';

const POLL_MS = 15000;
const ROTATE_MS = 12000;
const MAX_ROWS = 16; // 8 per column when two-column layout kicks in
const COL_SIZE = 8;
const NEW_BADGE_MS = 60_000; // how long the NEW badge stays on a fresh entry
const DELTA_MS = 60_000; // how long ▲/▼ position deltas are shown
const RECORD_BANNER_MS = 10_000; // NEW RECORD celebration duration

const RETRY_MS = 5000; // faster retry while offline (Azure SWA cold start)

let pollTimer = null;
let rotateTimer = null;
let recordTimer = null;
let retryTimer = null;

let current = { experienceIds: [], index: 0, rankings: {}, updatedAt: null, error: null };
// expId -> ranking as last displayed (used to diff on next paint)
const prevRankings = {};
// expId -> Map<rowKey, { newAt, delta, deltaAt }>
const metaByExp = {};

let curTheme = DEFAULT_THEME;
let rowsEl = null;
let boardEl = null;
let bannerEl = null;
let updatedEl = null;
let indexEl = null;

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

const keyOf = (r) => `${r.user}::${r.endedAt ?? r.elapsedMs}`;
const metaFor = (expId) => (metaByExp[expId] ??= new Map());
const canAnimate = (el) => typeof el.animate === 'function';

async function refresh() {
  clearTimeout(retryTimer);
  retryTimer = null;
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
    retryTimer = setTimeout(refresh, RETRY_MS);
  }
  paint();
}

function resolveTheme() {
  // ?theme=arcade|classic|glass previews a theme without persisting it
  const q = new URLSearchParams(location.search).get('theme');
  return KIOSK_THEMES.includes(q) ? q : getKioskTheme();
}

function mount(app) {
  const theme = resolveTheme();
  curTheme = theme;
  document.body.dataset.theme = theme;
  app.innerHTML = `
    <div class="kiosk theme-${theme}${theme === 'arcade' ? ' crt' : ''}">
      <div class="scanbar" aria-hidden="true"></div>
      <header class="kiosk-hdr">
        <img src="${import.meta.env.BASE_URL}images/panel-logo.jpg" alt="Panel" class="kiosk-logo" tabindex="-1" />
        <span class="kiosk-brand kiosk-brand-center">A11Y EXPERIENCE CENTER</span>
        <img src="${import.meta.env.BASE_URL}images/vlctesting-logo.svg" alt="VLCTESTING" class="vlc-logo" tabindex="-1" />
      </header>
      <h1 class="kiosk-title">${THEME_TITLES[theme] ?? THEME_TITLES.arcade}</h1>
      <p class="kiosk-board"></p>
      <div class="record-banner" hidden>★ NEW RECORD ★</div>
      <main class="k-main"><div class="k-rows"></div></main>
      <footer class="kiosk-footer">
        <span class="k-insert" aria-hidden="true">INSERT COIN</span>
        <span class="k-updated"></span>
        <span class="k-footer-right">
          <span class="k-index"></span>
          <a href="#/admin" class="kiosk-admin-link" aria-label="Modo administración">⚙</a>
        </span>
      </footer>
    </div>
  `;
  rowsEl = app.querySelector('.k-rows');
  boardEl = app.querySelector('.kiosk-board');
  bannerEl = app.querySelector('.record-banner');
  updatedEl = app.querySelector('.k-updated');
  indexEl = app.querySelector('.k-index');
}

function buildRow() {
  const el = document.createElement('div');
  el.className = 'k-row';
  return el;
}

function deltaHtml(m, showNew, now) {
  if (m?.delta && now - m.deltaAt < DELTA_MS) {
    return m.delta > 0
      ? `<span class="up">▲${m.delta}</span>`
      : `<span class="down">▼${-m.delta}</span>`;
  }
  return showNew ? '' : '<span class="same">—</span>';
}

const THEME_TITLES = { arcade: 'HI-SCORE', classic: 'Ranking', glass: 'RANKING' };

const POS_LABELS = {
  arcade: (p) => (p === 0 ? '1ST' : p === 1 ? '2ND' : p === 2 ? '3RD' : `${p + 1}TH`),
  glass: (p) => String(p + 1).padStart(2, '0'),
  classic: (p) => String(p + 1),
};

function updateRow(el, r, pos, m, now) {
  const posLabel = (POS_LABELS[curTheme] ?? POS_LABELS.arcade)(pos);
  el.className = `k-row${pos < 3 ? ` r${pos + 1}` : ''}`;
  const showNew = Boolean(m?.newAt) && now - m.newAt < NEW_BADGE_MS;
  el.innerHTML = `
    <span class="k-pos">${posLabel}</span>
    <span class="k-user">${esc(r.user)}${showNew ? '<span class="badge-new">NEW</span>' : ''}</span>
    <span class="k-delta">${deltaHtml(m, showNew, now)}</span>
    <span class="k-time">${pos === 0 ? '★ ' : ''}${formatElapsed(r.elapsedMs)}</span>
  `;
}

function celebrateRecord() {
  if (!bannerEl) return;
  clearTimeout(recordTimer);
  bannerEl.hidden = false;
  bannerEl.classList.remove('show');
  void bannerEl.offsetWidth; // restart the flash animation
  bannerEl.classList.add('show');
  recordTimer = setTimeout(() => {
    bannerEl.classList.remove('show');
    bannerEl.hidden = true;
  }, RECORD_BANNER_MS);
}

// Diff the incoming ranking against what was last displayed for expId.
// Records NEW badges, ▲/▼ deltas and the NEW RECORD celebration.
function diff(expId, rows) {
  const prev = prevRankings[expId];
  if (!prev) return; // first time this board is shown — no events
  const now = Date.now();
  const meta = metaFor(expId);
  const prevKeys = prev.map(keyOf);
  const prevBest = prev[0]?.elapsedMs;

  rows.forEach((r, i) => {
    const key = keyOf(r);
    const prevIdx = prevKeys.indexOf(key);
    const m = meta.get(key) ?? {};
    if (prevIdx === -1) m.newAt = now;
    else if (prevIdx !== i) {
      m.delta = prevIdx - i;
      m.deltaAt = now;
    }
    meta.set(key, m);
  });

  if (rows[0] && (prev.length === 0 || (keyOf(rows[0]) !== prevKeys[0] && rows[0].elapsedMs <= prevBest))) {
    celebrateRecord();
  }
}

function paintRows(rows) {
  const now = Date.now();
  const visible = rows.slice(0, MAX_ROWS);
  const meta = metaFor(current.experienceIds[current.index]);
  const colCount = visible.length > COL_SIZE ? 2 : 1;

  // drop non-column children left by paintMessage (error/empty placeholders)
  [...rowsEl.children].filter((el) => !el.classList.contains('k-col')).forEach((el) => el.remove());

  // collect keyed rows from all columns before mutating layout
  const existing = new Map();
  rowsEl.querySelectorAll('.k-row').forEach((el) => existing.set(el.dataset.key, el));
  const firstRects = new Map();
  existing.forEach((el, key) => firstRects.set(key, el.getBoundingClientRect()));

  // ensure the required column wrappers exist (1 or 2)
  rowsEl.classList.toggle('two-col', colCount === 2);
  while (rowsEl.children.length < colCount) {
    const col = document.createElement('div');
    col.className = 'k-col';
    rowsEl.appendChild(col);
  }
  while (rowsEl.children.length > colCount) rowsEl.lastElementChild.remove();
  const cols = [...rowsEl.children];

  visible.forEach((r, i) => {
    const key = keyOf(r);
    let el = existing.get(key);
    if (!el) {
      el = buildRow();
      el.dataset.key = key;
    }
    updateRow(el, r, i, meta.get(key), now);
    cols[Math.floor(i / COL_SIZE)].appendChild(el); // reorders within target column
    existing.delete(key);
  });

  existing.forEach((el) => {
    if (canAnimate(el) && el.isConnected) {
      el.animate(
        [{ opacity: 1 }, { opacity: 0, transform: 'translateX(60px)' }],
        { duration: 300, easing: 'ease-in' }
      ).onfinish = () => el.remove();
    } else {
      el.remove();
    }
  });

  rowsEl.querySelectorAll('.k-row').forEach((el, i) => {
    if (!canAnimate(el)) return;
    const first = firstRects.get(el.dataset.key);
    if (!first) {
      el.animate(
        [
          { opacity: 0, transform: 'scale(0.6)', filter: 'brightness(3)' },
          { opacity: 1, transform: 'scale(1.08)', filter: 'brightness(1.6)', offset: 0.7 },
          { opacity: 1, transform: 'scale(1)', filter: 'brightness(1)' },
        ],
        { duration: 600, delay: i * 90, easing: 'ease-out', fill: 'backwards' }
      );
      return;
    }
    const last = el.getBoundingClientRect();
    const dy = first.top - last.top;
    if (dy) {
      el.animate(
        [{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }],
        { duration: 500, easing: 'cubic-bezier(.2,.9,.25,1.15)' }
      );
    }
  });
}

function paintMessage(text) {
  rowsEl.innerHTML = `<p class="k-empty">${esc(text)}</p>`;
}

function paint() {
  const app = document.getElementById('app');
  if (!rowsEl || !app.contains(rowsEl)) mount(app);

  const expId = current.experienceIds[current.index];
  const rows = current.rankings[expId] || [];

  boardEl.textContent = `— ${expId || 'A11Y EXPERIENCE CENTER'} —`;
  updatedEl.textContent = current.updatedAt
    ? `UPDATED ${current.updatedAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
    : 'UPDATED —';
  indexEl.textContent = current.experienceIds.length > 1
    ? `${current.index + 1}/${current.experienceIds.length}`
    : '';

  if (current.error) {
    paintMessage('SIN CONEXIÓN CON EL SERVIDOR — REINTENTANDO…');
    return;
  }
  if (rows.length === 0) {
    prevRankings[expId] = rows;
    paintMessage('ESPERANDO JUGADORES…');
    return;
  }

  diff(expId, rows);
  prevRankings[expId] = rows;
  paintRows(rows);
}

function rotate() {
  if (current.experienceIds.length <= 1) return;
  current.index = (current.index + 1) % current.experienceIds.length;
  paint();
  const main = document.querySelector('.k-main');
  if (main) {
    main.classList.remove('board-in');
    void main.offsetWidth;
    main.classList.add('board-in');
  }
}

export function startPresentation() {
  stopPresentation();
  refresh();
  pollTimer = setInterval(refresh, POLL_MS);
  rotateTimer = setInterval(rotate, ROTATE_MS);
}

export function stopPresentation() {
  clearInterval(pollTimer);
  clearInterval(rotateTimer);
  clearTimeout(recordTimer);
  clearTimeout(retryTimer);
  pollTimer = rotateTimer = recordTimer = retryTimer = null;
}
