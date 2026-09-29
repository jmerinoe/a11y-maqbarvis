// screens/metro-design.js — hotspot designer for the chromatic map.
// Open dev tool at #/metro-design: drag a station box to move it, drag its
// corner to resize, edit names/geometry in the inspector, then export the
// regenerated metro-map-data.js (clipboard or download).

import { mapImage, stationPositions } from '../data/metro-map-data.js';
import { allStations } from '../data/metro.js';
import { attachMapView, resetMapView } from '../components/metro-map.js';
import { t } from '../../../i18n/index.js';

const HANDLE = 'md-handle';

export function renderMetroDesign(container) {
  const original = stationPositions;
  const state = new Map(
    Object.entries(original).map(([k, v]) => [k, { ...v }])
  );
  const model = allStations();
  const dirty = new Set();
  let sel = null;

  container.innerHTML = `
    <div class="metro-app md-app">
      <h1 class="sr-only">${t('metroDesign.title')}</h1>
      <main class="metro-main md-main">
        <section class="metro-panel metro-map-panel md-map-panel">
          <h2 class="sr-only">${t('metro.mapTitle')}</h2>
          <div class="metro-map-wrap">
            <div class="metro-map" style="aspect-ratio: ${mapImage.w} / ${mapImage.h}; --mw: ${mapImage.w}; --mh: ${mapImage.h}">
              <img src="/metro/metro-map.svg" alt="" draggable="false" />
              <div class="md-boxes"></div>
            </div>
          </div>
        </section>

        <aside class="md-inspector">
          <h2>${t('metroDesign.inspector')}</h2>

          <div class="md-field">
            <label for="md-name">${t('metroDesign.name')}</label>
            <input id="md-name" type="text" />
            <select id="md-reassign" size="1">
              <option value="">${t('metroDesign.reassign')}</option>
              ${model.map((s) => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <p id="md-orphan" class="md-warn" hidden>${t('metroDesign.orphan')}</p>
          </div>

          <div class="md-geom">
            ${['x', 'y', 'w', 'h']
              .map(
                (f) => `<label>${f}<input data-geom="${f}" type="number" step="0.5" /></label>`
              )
              .join('')}
          </div>

          <div class="md-actions">
            <button type="button" id="md-prev">←</button>
            <button type="button" id="md-next">→</button>
            <button type="button" id="md-revert">${t('metroDesign.revert')}</button>
          </div>

          <ul class="md-list" id="md-list"></ul>

          <div class="md-actions md-export">
            <button type="button" id="md-copy" class="btn-primary">${t('metroDesign.copy')}</button>
            <button type="button" id="md-download">${t('metroDesign.download')}</button>
          </div>
          <p class="md-hint">${t('metroDesign.hint')}</p>
        </aside>
      </main>
    </div>
  `;

  const mapEl = container.querySelector('.metro-map');
  resetMapView();
  attachMapView(mapEl);
  const boxesEl = container.querySelector('.md-boxes');
  const nameInput = container.querySelector('#md-name');
  const reassignSel = container.querySelector('#md-reassign');
  const orphanWarn = container.querySelector('#md-orphan');
  const geomInputs = Object.fromEntries(
    [...container.querySelectorAll('[data-geom]')].map((i) => [i.dataset.geom, i])
  );
  const listEl = container.querySelector('#md-list');

  const px = (frac, axis) => frac * mapImage[axis === 'x' || axis === 'w' ? 'w' : 'h'];

  function paintBoxes() {
    boxesEl.innerHTML = [...state.entries()]
      .map(([name, p]) => {
        const cls = [
          'md-box',
          name === sel ? 'sel' : '',
          dirty.has(name) ? 'dirty' : '',
          model.includes(name) ? '' : 'orphan',
        ]
          .filter(Boolean)
          .join(' ');
        return `<div class="${cls}" data-name="${name}" tabindex="0"
            style="left:${((p.x - p.w / 2) * 100).toFixed(3)}%;top:${((p.y - p.h / 2) * 100).toFixed(3)}%;width:${(p.w * 100).toFixed(3)}%;height:${(p.h * 100).toFixed(3)}%">
            <span class="md-tag">${name}</span>
            <span class="${HANDLE}"></span>
          </div>`;
      })
      .join('');
  }

  function paintInspector() {
    nameInput.value = sel || '';
    orphanWarn.hidden = !sel || model.includes(sel);
    const p = sel ? state.get(sel) : null;
    geomInputs.x.value = p ? px(p.x, 'x').toFixed(1) : '';
    geomInputs.y.value = p ? px(p.y, 'y').toFixed(1) : '';
    geomInputs.w.value = p ? px(p.w, 'w').toFixed(1) : '';
    geomInputs.h.value = p ? px(p.h, 'h').toFixed(1) : '';
    for (const i of Object.values(geomInputs)) i.disabled = !p;
    nameInput.disabled = !sel;
    reassignSel.disabled = !sel;
  }

  function paintList() {
    const names = [...model, ...[...state.keys()].filter((k) => !model.includes(k))];
    listEl.innerHTML = names
      .map((n) => {
        const p = state.get(n);
        const cls = [
          n === sel ? 'sel' : '',
          dirty.has(n) ? 'dirty' : '',
          p ? '' : 'missing',
          model.includes(n) ? '' : 'orphan',
        ]
          .filter(Boolean)
          .join(' ');
        return `<li class="${cls}" data-name="${n}">${n}${p ? '' : ' ·'}</li>`;
      })
      .join('');
  }

  function select(name) {
    sel = state.has(name) ? name : sel;
    paintBoxes();
    paintInspector();
    paintList();
    // no scrollIntoView: under zoom+pan it scrolls ancestors and shifts the map
  }

  function markDirty() {
    dirty.add(sel);
  }

  function repaint() {
    paintBoxes();
    paintInspector();
    paintList();
  }

  // --- drag: move box / resize via corner handle ---
  let drag = null;
  boxesEl.addEventListener('pointerdown', (e) => {
    const box = e.target.closest('.md-box');
    if (!box) return;
    e.preventDefault();
    e.stopPropagation(); // box drag must not start a map pan
    select(box.dataset.name);
    const p = state.get(sel);
    const rect = mapEl.getBoundingClientRect();
    drag = {
      resize: e.target.classList.contains(HANDLE),
      x0: e.clientX,
      y0: e.clientY,
      p0: { ...p },
      rect,
    };
    boxesEl.setPointerCapture(e.pointerId);
  });
  boxesEl.addEventListener('pointermove', (e) => {
    if (!drag || !sel) return;
    const p = state.get(sel);
    const dx = (e.clientX - drag.x0) / drag.rect.width;
    const dy = (e.clientY - drag.y0) / drag.rect.height;
    if (drag.resize) {
      p.w = Math.max(0.005, drag.p0.w + dx);
      p.h = Math.max(0.005, drag.p0.h + dy);
    } else {
      p.x = drag.p0.x + dx;
      p.y = drag.p0.y + dy;
    }
    markDirty();
    paintBoxes();
    paintInspector();
  });
  boxesEl.addEventListener('pointerup', () => (drag = null));

  // --- keyboard: arrows nudge, shift+arrows resize ---
  container.addEventListener('keydown', (e) => {
    if (!sel || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const p = state.get(sel);
    const step = 1 / mapImage.w; // 1 viewBox px
    const stepY = 1 / mapImage.h;
    const key = e.key;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) return;
    e.preventDefault();
    const resize = e.shiftKey;
    const fx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0;
    const fy = key === 'ArrowUp' ? -stepY : key === 'ArrowDown' ? stepY : 0;
    if (resize) {
      p.w = Math.max(0.005, p.w + fx * 2);
      p.h = Math.max(0.005, p.h + fy * 2);
    } else {
      p.x += fx;
      p.y += fy;
    }
    markDirty();
    paintBoxes();
    paintInspector();
  });

  // --- inspector ---
  nameInput.addEventListener('change', () => {
    const next = nameInput.value.trim();
    if (!next || next === sel) return;
    if (state.has(next)) {
      nameInput.value = sel;
      return;
    }
    state.set(next, state.get(sel));
    state.delete(sel);
    dirty.add(next);
    dirty.delete(sel);
    sel = next;
    repaint();
  });

  reassignSel.addEventListener('change', () => {
    const target = reassignSel.value;
    reassignSel.value = '';
    if (!target) return;
    state.set(target, state.get(sel));
    state.delete(sel);
    dirty.add(target);
    dirty.delete(sel);
    sel = target;
    repaint();
  });

  for (const [f, input] of Object.entries(geomInputs)) {
    input.addEventListener('change', () => {
      if (!sel) return;
      const p = state.get(sel);
      p[f] = Math.max(0.001, Number(input.value) / mapImage[f === 'x' || f === 'w' ? 'w' : 'h']);
      markDirty();
      repaint();
    });
  }

  container.querySelector('#md-prev').addEventListener('click', () => {
    const i = model.indexOf(sel);
    select(model[(i - 1 + model.length) % model.length]);
  });
  container.querySelector('#md-next').addEventListener('click', () => {
    const i = model.indexOf(sel);
    select(model[(i + 1) % model.length]);
  });
  container.querySelector('#md-revert').addEventListener('click', () => {
    if (!sel || !original[sel]) return;
    state.set(sel, { ...original[sel] });
    dirty.delete(sel);
    repaint();
  });
  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-name]');
    if (li && state.has(li.dataset.name)) select(li.dataset.name);
  });

  // --- export ---
  function exportText() {
    const ordered = {};
    for (const n of model) if (state.has(n)) ordered[n] = state.get(n);
    for (const [k, v] of state) if (!(k in ordered)) ordered[k] = v;
    for (const p of Object.values(ordered)) delete p.manual;
    return `// metro-map-data.js — curated in the #/metro-design hotspot designer.
// Positions as fractions (0-1) of the image, label-centered.
export const mapImage = { w: ${mapImage.w}, h: ${mapImage.h} };
export const stationPositions = ${JSON.stringify(ordered, null, 1)};
`;
  }

  container.querySelector('#md-copy').addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(exportText());
    e.target.textContent = t('metroDesign.copied');
    setTimeout(() => (e.target.textContent = t('metroDesign.copy')), 1500);
  });
  container.querySelector('#md-download').addEventListener('click', () => {
    const url = URL.createObjectURL(
      new Blob([exportText()], { type: 'text/javascript' })
    );
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: 'metro-map-data.js',
    });
    a.click();
    URL.revokeObjectURL(url);
  });

  select(model[0]);
}
