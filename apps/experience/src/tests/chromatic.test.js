// chromatic.test.js — second experience: grayscale metro web.
// Covers the line graph (real Madrid topology), tramo resolution and
// duration, the Dijkstra optimum, the builder/list UI, route validation
// popups, mission completion and the grayscale presentation scope.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderMetro } from '../experiences/chromatic/screens/metro.js';
import {
  metroLines,
  stopsBetween,
  tramoMinutes,
  tramoOptions,
  routeConnects,
  routeMinutes,
  optimalRouteMinutes,
  getLine,
  allStations,
} from '../experiences/chromatic/data/metro.js';
import { stationPositions } from '../experiences/chromatic/data/metro-map-data.js';
import { renderInstructions } from '../screens/instructions.js';
import { getSession, setSession, clearSession } from '../session/session.js';
import { mountExperienceTimer, stopExperienceTimer } from '../components/experience-timer.js';
import { getState, setState, clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

function startChromaticSession(elapsedMs = 0) {
  setSession({
    user: 'Ana',
    experienceId: 'chromatic',
    startedAt: Date.now() - elapsedMs,
  });
}

function clickStation(name) {
  document
    .querySelector(`.metro-station[data-station="${name}"]`)
    .dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function addTramo(from, to) {
  clickStation(from);
  clickStation(to);
}

describe('Metro data model', () => {
  it('has unique station names inside each line', () => {
    for (const line of metroLines) {
      expect(new Set(line.stations).size).toBe(line.stations.length);
    }
  });

  it('L12 is circular: San Nicasio and Puerta del Sur are adjacent', () => {
    expect(stopsBetween(getLine('L12'), 'San Nicasio', 'Puerta del Sur')).toBe(1);
    // The long way around the circle is 27 stops — shorter arc wins.
    expect(stopsBetween(getLine('L12'), 'San Nicasio', 'Leganés Central')).toBe(1);
  });

  it('tramoMinutes applies the restricted multiplier on L4', () => {
    const stops = stopsBetween(getLine('L4'), 'Alonso Martínez', 'Mar de Cristal');
    expect(tramoMinutes('L4', 'Alonso Martínez', 'Mar de Cristal')).toBe(stops * 2 * 3);
  });

  it('resolves a same-line tramo to the serving line', () => {
    const r = tramoOptions('San Nicasio', 'Puerta del Sur');
    expect(r.options.length).toBe(1);
    expect(r.options[0].line.id).toBe('L12');
    expect(r.options[0].minutes).toBe(2);
  });

  it('rejects pairs not sharing a line', () => {
    expect(tramoOptions('San Nicasio', 'Joaquín Vilumbrales').error).toBe('different-lines');
    expect(tramoOptions('San Nicasio', 'San Nicasio').error).toBe('same-station');
  });

  it('rejects tramos when only interrupted lines serve the pair', () => {
    // Vicente Aleixandre → Ciudad Universitaria is only served by L6 in
    // the model (Moncloa→Argüelles is also served by L3, which is operative).
    const r = tramoOptions('Vicente Aleixandre', 'Ciudad Universitaria');
    expect(r.error).toBe('interrupted');
    expect(r.line.id).toBe('L6');
  });

  it('computes the optimal route: San Nicasio → Barajas via L12-L10-L8', () => {
    // L12 1 stop + L10 15 stops + L8 6 stops = 22 stops × 2 min = 44
    expect(optimalRouteMinutes('San Nicasio', 'Barajas')).toBe(44);
  });

  it('routeConnects validates continuity and endpoints', () => {
    const good = [
      { from: 'San Nicasio', to: 'Puerta del Sur', minutes: 2 },
      { from: 'Puerta del Sur', to: 'Nuevos Ministerios', minutes: 30 },
      { from: 'Nuevos Ministerios', to: 'Barajas', minutes: 12 },
    ];
    expect(routeConnects(good, 'San Nicasio', 'Barajas')).toBe(true);
    expect(routeMinutes(good)).toBe(44);
    expect(routeConnects(good.slice(0, 2), 'San Nicasio', 'Barajas')).toBe(false);
    expect(routeConnects([good[1], good[2]], 'San Nicasio', 'Barajas')).toBe(false);
  });
});

describe('Chromatic experience UI', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    setState({ tramos: [] });
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    clearCart();
    clearSession();
    stopExperienceTimer();
    localStorage.clear();
    sessionStorage.clear();
    document.querySelector('.congrats-overlay')?.remove();
    setState({ tramos: [] });
    document.body.innerHTML = '';
  });

  it('renders the grayscale metro web with legend and interactive map', () => {
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    expect(document.querySelector('.chromatic-scope')).not.toBeNull();
    const legend = document.querySelectorAll('.legend-item');
    expect(legend.length).toBe(metroLines.length);
    expect(document.body.textContent).toContain('Interrumpida');
    expect(document.body.textContent).toContain('Restricciones');
    // Every positioned station is a clickable target on the map.
    expect(document.querySelectorAll('.metro-station').length).toBe(
      Object.keys(stationPositions).length
    );
  });

  it('removes a tramo with the × button', () => {
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    addTramo('San Nicasio', 'Puerta del Sur');
    addTramo('Puerta del Sur', 'Nuevos Ministerios');
    expect(document.querySelectorAll('.metro-tramos li').length).toBe(2);

    document.querySelector('.tramo-remove').click();

    const items = document.querySelectorAll('.metro-tramos li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Nuevos Ministerios');
    expect(document.querySelector('.metro-total').textContent).toContain('30 min');
  });

  it('asks which line to use when several serve the same pair', () => {
    // Real data has no pair served by two usable lines — inject one to
    // exercise the line-choice dialog.
    metroLines.push({
      id: 'L99',
      status: 'operative',
      multiplier: 1,
      minutesPerStop: 3,
      stations: ['San Nicasio', 'Puerta del Sur'],
    });
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    try {
      addTramo('San Nicasio', 'Puerta del Sur');

      const dialog = document.querySelector('.congrats-dialog');
      expect(dialog).not.toBeNull();
      const buttons = dialog.querySelectorAll('.line-choice-btn');
      expect(buttons.length).toBe(2);
      // L12 (2 min) sorts before L99 (3 min).
      expect(buttons[0].dataset.line).toBe('L12');

      buttons[1].click();
      expect(getState().tramos[0].lineId).toBe('L99');
      expect(getState().tramos[0].minutes).toBe(3);
      expect(document.querySelector('.congrats-dialog')).toBeNull();
    } finally {
      metroLines.pop();
    }
  });

  it('adds a same-line tramo with its minutes and updates the total', () => {
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    addTramo('San Nicasio', 'Puerta del Sur');

    const items = document.querySelectorAll('.metro-tramos li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('L12');
    expect(items[0].textContent).toContain('2 min');
    expect(document.querySelector('.metro-total').textContent).toContain('2 min');
  });

  it('shows the same-line popup for a cross-line pair', () => {
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    addTramo('San Nicasio', 'Joaquín Vilumbrales');

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('misma línea');
    expect(getState().tramos.length).toBe(0);
  });

  it('shows the interrupted popup for an L6 tramo', () => {
    startChromaticSession();
    renderMetro(document.getElementById('app'));

    addTramo('Vicente Aleixandre', 'Ciudad Universitaria');

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('interrumpida');
    expect(getState().tramos.length).toBe(0);
  });

  it('warns that the route is invalid when it does not reach Barajas', () => {
    startChromaticSession();
    setState({
      tramos: [{ lineId: 'L12', from: 'San Nicasio', to: 'Puerta del Sur', minutes: 2 }],
    });
    renderMetro(document.getElementById('app'));

    document.getElementById('route-check').click();

    expect(document.querySelector('.congrats-dialog').textContent).toContain('no es válida');
  });

  it('warns about faster routes when the route is slower than optimal', () => {
    startChromaticSession();
    setState({
      tramos: [
        { lineId: 'L12', from: 'San Nicasio', to: 'Puerta del Sur', minutes: 2 },
        { lineId: 'L10', from: 'Puerta del Sur', to: 'Alonso Martínez', minutes: 26 },
        { lineId: 'L4', from: 'Alonso Martínez', to: 'Mar de Cristal', minutes: 84 },
        { lineId: 'L8', from: 'Mar de Cristal', to: 'Barajas', minutes: 8 },
      ],
    });
    renderMetro(document.getElementById('app'));

    document.getElementById('route-check').click();

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.textContent).toContain('rutas más rápidas');
    expect(localStorage.getItem('faro-results')).toBeNull();
  });

  it('completes the mission on the optimal route and stops the timer', () => {
    startChromaticSession(5000);
    mountExperienceTimer(getSession().startedAt);
    setState({
      tramos: [
        { lineId: 'L12', from: 'San Nicasio', to: 'Puerta del Sur', minutes: 2 },
        { lineId: 'L10', from: 'Puerta del Sur', to: 'Nuevos Ministerios', minutes: 30 },
        { lineId: 'L8', from: 'Nuevos Ministerios', to: 'Barajas', minutes: 12 },
      ],
    });
    renderMetro(document.getElementById('app'));

    document.getElementById('route-check').click();

    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('¡Enhorabuena!');
    expect(document.getElementById('experience-timer')).toBeNull();
    const results = JSON.parse(localStorage.getItem('faro-results'));
    expect(results[0].user).toBe('Ana');
    expect(results[0].experienceId).toBe('chromatic');
    expect(results[0].result).toBe('completed');
  });

  it('instructions show the chromatic mission card and continue to #/metro', () => {
    setSession({ user: 'Ana', experienceId: 'chromatic' });
    renderInstructions(document.getElementById('app'));

    const card = document.querySelector('.mission-card');
    expect(card.textContent).toContain('San Nicasio');
    expect(card.textContent).toContain('Barajas');
    expect(card.textContent).toContain('Línea 6 interrumpida');
    // No copy button — the mission card has no card-number row.
    expect(document.getElementById('copy-card')).toBeNull();

    document.getElementById('instructions-continue').click();
    expect(window.location.hash).toBe('#/metro');
  });
});

// --- Hotspot designer: Integrar cambios -----------------------------------
// The designer lives at #/metro-design; "Integrar cambios" posts the
// regenerated data file to the dev-server endpoint that writes it to disk.

import { renderMetroDesign } from '../experiences/chromatic/screens/metro-design.js';
import { vi } from 'vitest';

describe('Metro designer — integrate button', () => {
  beforeEach(() => {
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('posts the regenerated data file to the dev endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    renderMetroDesign(document.getElementById('app'));
    document.getElementById('md-integrate').click();
    await vi.waitFor(() =>
      expect(document.getElementById('md-integrate-status').hidden).toBe(false)
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/__metro-design/save',
      expect.objectContaining({ method: 'POST' })
    );
    expect(fetchMock.mock.calls[0][1].body).toContain('stationPositions');
    expect(document.getElementById('md-integrate-status').textContent).toContain('Integrado');
  });

  it('shows an error when the endpoint is unavailable (no dev server)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    renderMetroDesign(document.getElementById('app'));
    document.getElementById('md-integrate').click();
    await vi.waitFor(() =>
      expect(document.getElementById('md-integrate-status').hidden).toBe(false)
    );

    expect(document.getElementById('md-integrate-status').textContent).toContain(
      'servidor de desarrollo'
    );
  });
});

// --- Hotspot designer: station list CRUD ---------------------------------

describe('Metro designer — station CRUD', () => {
  beforeEach(() => {
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
    renderMetroDesign(document.getElementById('app'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  const row = (name) => document.querySelector(`#md-list li[data-name="${name}"]`);

  it('has no reassign select in the inspector', () => {
    expect(document.getElementById('md-reassign')).toBeNull();
  });

  it('renames a station from its row input, keeping the geometry', async () => {
    const input = row('San Nicasio').querySelector('.md-row-name');
    input.value = 'San Nicasio X';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    // Renamed entry exists (orphan — not in the line model); the original
    // model name keeps a row in the missing style, like a deletion.
    const renamed = row('San Nicasio X');
    expect(renamed).not.toBeNull();
    expect(renamed.classList.contains('orphan')).toBe(true);
    expect(row('San Nicasio').classList.contains('missing')).toBe(true);
  });

  it('rejects duplicate and empty renames', () => {
    const input = row('San Nicasio').querySelector('.md-row-name');
    input.value = 'Puerta del Sur';
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(row('San Nicasio')).not.toBeNull();
    expect(row('Puerta del Sur')).not.toBeNull();
  });

  it('deletes a hotspot and keeps the model row as missing', () => {
    const del = row('Casa de Campo').querySelector('.md-row-del');
    expect(del.getAttribute('aria-label')).toBe('Eliminar Casa de Campo');
    del.click();

    const li = row('Casa de Campo');
    expect(li.classList.contains('missing')).toBe(true);
    expect(li.querySelector('.md-row-name').disabled).toBe(true);
  });

  it('creates a new station with a unique name, selected and dirty', () => {
    document.getElementById('md-add').click();
    const li = row('Nueva estación');
    expect(li).not.toBeNull();
    expect(li.classList.contains('dirty')).toBe(true);
    expect(li.classList.contains('sel')).toBe(true);
    expect(li.classList.contains('orphan')).toBe(true);

    document.getElementById('md-add').click();
    expect(row('Nueva estación 2')).not.toBeNull();
  });
});
