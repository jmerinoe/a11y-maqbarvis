// screens/booking.js — comprehension experience: appointment request form.
// Date / hour / specialty / center selects in bureaucratic language.
// Availability is deterministic (hospital.js); booking a free but
// non-mission slot confirms it and shows a keep-trying dialog.

import { getSession, setSession, submitResult } from '../../../session/session.js';
import { getExperienceById } from '../../../data/experiences.js';
import { stopExperienceTimer } from '../../../components/experience-timer.js';
import { showCongratsDialog } from '../../../components/congrats-dialog.js';
import { navigate } from '../../../router.js';
import { pickCopy } from '../data/copy.js';
import { hospitalChrome, bindHospitalNav } from '../components/hospital-shell.js';
import { showHospitalDialog } from '../components/hospital-dialog.js';
import {
  centers,
  specialties,
  HOURS,
  appointmentDays,
  isSlotFree,
  isMissionAppointment,
} from '../data/hospital.js';

function fmtDate(dateIso) {
  const d = new Date(`${dateIso}T12:00:00`);
  const wd = d.toLocaleDateString('es', { weekday: 'long' });
  const rest = d.toLocaleDateString('es', { day: 'numeric', month: 'long' });
  return `${wd}, ${rest}`;
}

export function renderBooking(container) {
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  if (!session || experience?.id !== 'comprehension') {
    window.location.hash = '#/experiences';
    return;
  }
  const plain = session.plainMode === true;
  const c = (key) => pickCopy(key, plain);
  const mission = experience.mission;

  const option = (v, label) => `<option value="${v}">${label}</option>`;
  const dateOptions = appointmentDays().map((d) => option(d, fmtDate(d))).join('');
  const hourOptions = HOURS.map((h) => option(h, `${String(h).padStart(2, '0')}:00`)).join('');
  const specOptions = specialties.map((s) => option(s, s)).join('');
  const centerOptions = centers.map((s) => option(s, s)).join('');

  container.innerHTML = `
    <div class="hospital-app">
      ${hospitalChrome(c, plain)}
      <main class="hospital-main hospital-booking" id="main-content">
        <h1>${c('booking.title')}</h1>
        <form class="hospital-form" novalidate>
          <div class="hospital-field">
            <label for="bk-date">${c('field.date')}</label>
            <select id="bk-date" required>
              <option value="">${c('field.placeholder')}</option>
              ${dateOptions}
            </select>
          </div>
          <div class="hospital-field">
            <label for="bk-hour">${c('field.hour')}</label>
            <select id="bk-hour" required>
              <option value="">${c('field.placeholder')}</option>
              ${hourOptions}
            </select>
          </div>
          <div class="hospital-field">
            <label for="bk-specialty">${c('field.specialty')}</label>
            <select id="bk-specialty" required>
              <option value="">${c('field.placeholder')}</option>
              ${specOptions}
            </select>
          </div>
          <div class="hospital-field">
            <label for="bk-center">${c('field.center')}</label>
            <select id="bk-center" required>
              <option value="">${c('field.placeholder')}</option>
              ${centerOptions}
            </select>
          </div>
          <p class="hospital-error" role="alert" hidden>${c('error.required')}</p>
          <div class="hospital-actions">
            <button type="submit" class="btn-primary">${c('btn.submit')}</button>
            <button type="button" id="bk-back" class="btn-secondary">${c('btn.back')}</button>
          </div>
        </form>
        <div class="hospital-booked" hidden>
          <h2>${c('booked.title')}</h2>
          <p class="hospital-booked-msg">${c('booked.msg')}</p>
          <p class="hospital-booked-slot"></p>
        </div>
      </main>
    </div>
  `;
  bindHospitalNav(container);

  container.querySelector('#bk-back').addEventListener('click', () => {
    navigate('#/hospital');
  });

  container.querySelector('.hospital-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = container.querySelector('#bk-date').value;
    const hour = Number(container.querySelector('#bk-hour').value);
    const specialty = container.querySelector('#bk-specialty').value;
    const center = container.querySelector('#bk-center').value;

    const errEl = container.querySelector('.hospital-error');
    if (!date || !container.querySelector('#bk-hour').value || !specialty || !center) {
      errEl.hidden = false;
      return;
    }
    errEl.hidden = true;

    if (!isSlotFree(date, hour)) {
      showHospitalDialog('dialog.occupiedTitle', 'dialog.occupiedMsg');
      return;
    }

    // The slot is free: the booking is always confirmed.
    const booked = container.querySelector('.hospital-booked');
    booked.hidden = false;
    booked.querySelector('.hospital-booked-slot').textContent =
      `${specialty} — ${center} — ${fmtDate(date)} ${String(hour).padStart(2, '0')}:00`;

    if (!isMissionAppointment({ specialty, center, date, hour }, mission)) {
      showHospitalDialog('dialog.offTargetTitle', 'dialog.offTargetMsg');
      return;
    }
    completeMission(session, experience);
  });
}

function completeMission(session, experience) {
  const endedAt = Date.now();
  const elapsedMs = endedAt - session.startedAt;
  stopExperienceTimer();
  // First completion is the recorded run; retries only diff the baseline.
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
    showCongratsDialog(elapsedMs, null, 'comprehension.congratsMessage');
  } else {
    setSession({ ...session, completedAt: endedAt });
    showCongratsDialog(elapsedMs, session.baselineMs, 'comprehension.congratsMessage');
  }
}
