// screens/metro.js — chromatic experience: grayscale transport web
// A metro info site with an interactive schematic map, a line legend, and a
// tramo-based journey calculator. The whole experience renders under
// grayscale(1): line tones are indistinguishable by design.

import { t } from '../../../i18n/index.js';
import { getState, setState } from '../../../store.js';
import { getSession, setSession, submitResult } from '../../../session/session.js';
import { getExperienceById } from '../../../data/experiences.js';
import { stopExperienceTimer } from '../../../components/experience-timer.js';
import { showCongratsDialog } from '../../../components/congrats-dialog.js';
import { showMetroDialog, showLineChoiceDialog } from '../components/metro-dialog.js';
import { renderMetroMap, attachMapView, resetMapView } from '../components/metro-map.js';
import {
  metroLines,
  cutStations,
  tramoOptions,
  routeConnects,
  routeMinutes,
} from '../data/metro.js';

const STATUS_KEY = {
  operative: 'metro.status.operative',
  restricted: 'metro.status.restricted',
  interrupted: 'metro.status.interrupted',
};

let pendingFrom = null;
let checkFailed = false;
let missionRef = null;

export function renderMetro(container) {
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  if (!session || experience?.id !== 'chromatic') {
    // This screen belongs to the chromatic experience.
    window.location.hash = '#/experiences';
    return;
  }
  if (!container.querySelector('.metro-app')) {
    pendingFrom = null;
    checkFailed = false;
    resetMapView();
  }
  const mission = experience.mission;
  missionRef = mission;
  const { tramos } = getState();

  // Only non-operative lines are listed — everything else just works.
  const legend = metroLines
    .filter((l) => l.status !== 'operative')
    .map(
      (l) => `<li class="legend-item">
        <span class="legend-swatch" data-line="${l.id}">${l.id}</span>
        <span class="legend-status">${t(STATUS_KEY[l.status])}</span>
      </li>`
    )
    .join('');
  const cuts = cutStations
    .map(
      (s) => `<li class="legend-item">
        <span class="legend-swatch legend-swatch-cut" aria-hidden="true">✕</span>
        <span class="legend-status"><strong>${s}</strong> — ${t('metro.status.cut')}</span>
      </li>`
    )
    .join('');

  const tramoItems = tramos
    .map((tr, i) => {
      const leg = `${tr.from} → ${tr.to} (${tr.lineId})`;
      return `<li><span><strong>${tr.lineId}</strong> · ${tr.from} → ${tr.to} — ${tr.minutes} ${t(
        'metro.minutes'
      )}</span>
        <button type="button" class="tramo-remove" data-index="${i}" aria-label="${t(
        'metro.removeTramo',
        { leg }
      )}">×</button></li>`;
    })
    .join('');

  // Once the mission has been completed the grayscale barrier is lifted —
  // the reveal lets the participant see the colour information they lacked.
  // baselineMs survives retries, so colour stays for the "sighted" replay.
  const revealed = session.completedAt || session.baselineMs != null;
  const scopeClass = revealed ? 'metro-app' : 'chromatic-scope metro-app';
  container.innerHTML = `
    <div class="${scopeClass}">
      <h1 class="sr-only">${t('metro.title')}</h1>
      <main class="metro-main" id="main-content">
        <section class="metro-panel metro-map-panel" aria-labelledby="metro-map-title">
          <h2 id="metro-map-title" class="sr-only">${t('metro.mapTitle')}</h2>
          <div class="metro-map-wrap">
            ${renderMetroMap({ selected: pendingFrom })}
          </div>
        </section>

        <div class="metro-side">
          <section class="metro-panel" aria-labelledby="metro-legend-title">
            <h2 id="metro-legend-title">${t('metro.legendTitle')}</h2>
            <ul class="metro-legend">${legend}${cuts}</ul>
          </section>

          <section class="metro-panel metro-route-panel" aria-labelledby="metro-tramos-title">
            <h2 id="metro-tramos-title">${t('metro.tramosTitle')}
              <span class="metro-hint-inline" role="status">(${
                pendingFrom
                  ? t('metro.hintDest', { station: pendingFrom })
                  : t('metro.hintOrigin')
              })</span>
            </h2>
            <div class="metro-route-body">
              ${
                tramos.length === 0
                  ? `<p class="metro-empty">${t('metro.tramosEmpty')}</p>`
                  : `<ol class="metro-tramos">${tramoItems}</ol>
                     <p class="metro-total"><strong>${t('metro.total')}:</strong> ${routeMinutes(tramos)} ${t('metro.minutes')}</p>`
              }
              ${checkFailed ? `<p class="metro-check-error" role="alert">${t('metro.routeIncomplete', { station: mission.destination })}</p>` : ''}
            </div>
            <button type="button" id="route-check" class="btn-primary">${t('metro.checkRoute')}</button>
          </section>
        </div>
      </main>
    </div>
  `;

  const mapEl = container.querySelector('.metro-map');
  attachMapView(mapEl);
  mapEl.addEventListener('click', (e) => {
    const station = e.target.closest('.metro-station');
    if (station) pickStation(station.dataset.station, container);
  });

  container.querySelectorAll('.tramo-remove').forEach((btn) =>
    btn.addEventListener('click', () => {
      const next = getState().tramos.filter((_, i) => i !== Number(btn.dataset.index));
      setState({ tramos: next });
      checkFailed = false;
      renderMetro(container);
    })
  );

  container.querySelector('#route-check').addEventListener('click', () => {
    const legs = getState().tramos;
    if (!routeConnects(legs, mission.origin, mission.destination)) {
      checkFailed = true;
      renderMetro(container);
      return;
    }
    const total = routeMinutes(legs);
    if (total > mission.maxMinutes) {
      showMetroDialog('metro.dialog.slowTitle', 'metro.dialog.slowMsg', {
        minutes: total,
        max: mission.maxMinutes,
      });
      return;
    }
    completeMission(session, experience);
  });
}

function pickStation(station, container) {
  const legs = getState().tramos;
  if (!pendingFrom) {
    // The origin must continue the chain: the first leg starts at the
    // mission origin, every next leg starts where the previous ended.
    const expected = legs.length ? legs[legs.length - 1].to : missionRef.origin;
    if (station !== expected) {
      const msgKey = legs.length
        ? 'metro.dialog.chainMsg'
        : 'metro.dialog.chainStartMsg';
      showMetroDialog('metro.dialog.chainTitle', msgKey, {
        station: expected,
      });
      return;
    }
    pendingFrom = station;
    renderMetro(container);
    return;
  }
  const from = pendingFrom;
  pendingFrom = null;
  const result = tramoOptions(from, station);

  if (result.error === 'same-station') {
    renderMetro(container);
    showMetroDialog('metro.dialog.sameStationTitle', 'metro.dialog.sameStationMsg');
    return;
  }
  if (result.error === 'different-lines') {
    renderMetro(container);
    showMetroDialog('metro.dialog.sameLineTitle', 'metro.dialog.sameLineMsg');
    return;
  }
  if (result.error === 'interrupted') {
    renderMetro(container);
    showMetroDialog('metro.dialog.interruptedTitle', 'metro.dialog.interruptedMsg');
    return;
  }
  if (result.error === 'cut' || result.error === 'closed-station') {
    renderMetro(container);
    showMetroDialog('metro.dialog.cutTitle', 'metro.dialog.cutMsg', {
      station: result.station,
    });
    return;
  }

  const addTramo = (option) => {
    setState({
      tramos: [
        ...getState().tramos,
        { lineId: option.line.id, from, to: station, minutes: option.minutes },
      ],
    });
    checkFailed = false;
    renderMetro(container);
  };

  if (result.options.length === 1) {
    addTramo(result.options[0]);
    return;
  }
  showLineChoiceDialog(from, station, result.options, (lineId) => {
    if (!lineId) return;
    addTramo(result.options.find((o) => o.line.id === lineId));
  });
}

function completeMission(session, experience) {
  const endedAt = Date.now();
  const elapsedMs = endedAt - session.startedAt;
  stopExperienceTimer();
  // A session without baselineMs is the recorded run — submit it and
  // store the time as the baseline. Retry runs are not submitted; the
  // congrats dialog only shows the diff vs. the baseline.
  if (session.baselineMs == null) {
    submitResult({
      user: session.user,
      experienceId: experience.id,
      startedAt: new Date(session.startedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      elapsedMs,
      result: 'completed',
    });
    setSession({ ...session, completedAt: endedAt, baselineMs: elapsedMs });
    showCongratsDialog(elapsedMs);
  } else {
    setSession({ ...session, completedAt: endedAt });
    showCongratsDialog(elapsedMs, session.baselineMs);
  }
}
