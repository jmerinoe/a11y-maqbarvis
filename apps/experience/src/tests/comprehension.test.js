// comprehension.test.js — third experience: hospital site in obfuscated
// Spanish; mission = book an Algología appointment at the named center
// in the afternoon under deterministic availability rules.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { experiences, getExperienceById } from '../data/experiences.js';
import {
  isSlotFree,
  isAfternoon,
  isMissionDate,
  isMissionAppointment,
  appointmentDays,
} from '../experiences/comprehension/data/hospital.js';
import { renderHospital } from '../experiences/comprehension/screens/hospital.js';
import { renderHospitalInfo } from '../experiences/comprehension/screens/hospital-info.js';
import { renderBooking } from '../experiences/comprehension/screens/booking.js';
import { renderRanking } from '../screens/ranking.js';
import { setSession, clearSession, getSession } from '../session/session.js';

const MISSION = {
  specialty: 'Algología',
  center: 'Hospital Vega Norte',
  afternoonStart: 15,
  afternoonEnd: 20,
  month: 10,
  dayMin: 16,
  dayMax: 31,
};

const days = appointmentDays();
const freeDay = () => days.find((d) => isSlotFree(d, 10));
const busyDay = () => days.find((d) => !isSlotFree(d, 10));
const missionDay = () =>
  days.find((d) => isMissionDate(d, MISSION) && isSlotFree(d, 16));
const novemberDay = () =>
  days.find((d) => Number(d.slice(5, 7)) === 11 && isSlotFree(d, 10));

describe('comprehension registry', () => {
  it('registers a third, locked experience with mission config', () => {
    const exp = getExperienceById('comprehension');
    expect(exp).toBeTruthy();
    expect(exp.locked).toBe(true);
    expect(exp.name.es).toBe('Experiencia Comprensión');
    expect(exp.homeRoute).toBe('#/hospital');
    expect(exp.mission).toEqual(MISSION);
    expect(experiences).toHaveLength(3);
  });
});

describe('hospital availability rules', () => {
  it('offers October 16–31 plus November decoys, scrambled', () => {
    const list = appointmentDays();
    expect(list).toHaveLength(31);
    expect(list.filter((d) => d.includes('-10-'))).toHaveLength(16);
    expect(list.filter((d) => d.includes('-11-'))).toHaveLength(15);
    // Not sorted: the mission dates must be hunted among the decoys.
    expect(list).not.toEqual([...list].sort());
  });

  it('free only on even weekdays at even hours', () => {
    const free = freeDay();
    expect(isSlotFree(free, 10)).toBe(true);
    expect(isSlotFree(free, 11)).toBe(false); // odd hour
    const oddDay = days.find((d) => Number(d.slice(-2)) % 2 === 1);
    expect(isSlotFree(oddDay, 10)).toBe(false); // odd day
    const weekend = days.find(
      (d) => [0, 6].includes(new Date(`${d}T12:00:00`).getDay())
    );
    expect(isSlotFree(weekend, 10)).toBe(false); // weekend
  });

  it('afternoon bounds follow the mission window', () => {
    expect(isAfternoon(14, MISSION)).toBe(false);
    expect(isAfternoon(15, MISSION)).toBe(true);
    expect(isAfternoon(19, MISSION)).toBe(true);
    expect(isAfternoon(20, MISSION)).toBe(false);
  });

  it('mission date is the second fortnight of October only', () => {
    expect(isMissionDate('2026-10-15', MISSION)).toBe(false);
    expect(isMissionDate('2026-10-16', MISSION)).toBe(true);
    expect(isMissionDate('2026-10-31', MISSION)).toBe(true);
    expect(isMissionDate('2026-11-01', MISSION)).toBe(false);
  });

  it('mission appointment requires specialty + center + date + afternoon', () => {
    const base = {
      specialty: 'Algología',
      center: 'Hospital Vega Norte',
      date: '2026-10-20',
      hour: 16,
    };
    expect(isMissionAppointment(base, MISSION)).toBe(true);
    expect(isMissionAppointment({ ...base, hour: 10 }, MISSION)).toBe(false);
    expect(isMissionAppointment({ ...base, date: '2026-11-02' }, MISSION)).toBe(false);
    expect(isMissionAppointment({ ...base, date: '2026-10-10' }, MISSION)).toBe(false);
    expect(
      isMissionAppointment({ ...base, specialty: 'Cardiología' }, MISSION)
    ).toBe(false);
    expect(
      isMissionAppointment({ ...base, center: 'Policlínico Las Cumbres' }, MISSION)
    ).toBe(false);
  });
});

describe('comprehension UI', () => {
  beforeEach(() => {
    clearSession();
    localStorage.clear();
    window.location.hash = '#/hospital';
    document.body.innerHTML = '<div id="app"></div>';
    setSession({
      user: 'Ana',
      experienceId: 'comprehension',
      startedAt: Date.now(),
    });
  });

  afterEach(() => {
    clearSession();
    document.body.innerHTML = '';
  });

  const app = () => document.getElementById('app');

  function renderForm() {
    renderBooking(app());
    const f = app();
    const set = (sel, v) => {
      f.querySelector(sel).value = v;
    };
    return { set, submit: () => f.querySelector('.hospital-form').dispatchEvent(new Event('submit', { cancelable: true })) };
  }

  it('home renders the two-level obfuscated navigation', () => {
    renderHospital(app());
    const toggles = [...app().querySelectorAll('.hospital-nav-toggle')].map((b) => b.textContent);
    expect(toggles).toContain('Área transaccional del usuario-paciente');
    const subLinks = [...app().querySelectorAll('.hospital-subnav-link')].map((a) => a.textContent);
    expect(subLinks).toContain('Gestión de encuentros asistenciales programados');
    expect(app().querySelector('a[href="#/hospital/cita"]')).not.toBeNull();
    // Submenus start collapsed.
    expect(app().querySelectorAll('.hospital-submenu:not([hidden])')).toHaveLength(0);
    // Home carries the hospital photos.
    expect(app().querySelectorAll('.hospital-img').length).toBeGreaterThanOrEqual(3);
  });

  it('nav toggle opens its submenu and Escape closes it', () => {
    renderHospital(app());
    const toggle = [...app().querySelectorAll('.hospital-nav-toggle')].find((b) =>
      b.textContent.includes('Área transaccional')
    );
    toggle.click();
    const submenu = app().querySelector(`#${toggle.getAttribute('aria-controls')}`);
    expect(submenu.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    submenu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(submenu.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it.each(['nosotros', 'servicios', 'contacto'])(
    'info page "%s" renders inside the shared hospital chrome',
    (section) => {
      renderHospitalInfo(app(), section);
      expect(app().querySelector('.hospital-header')).not.toBeNull();
      expect(app().querySelector('.hospital-nav')).not.toBeNull();
      expect(app().querySelector('.hospital-info h2')).not.toBeNull();
      expect(app().querySelector('.hospital-img')).not.toBeNull();
    }
  );

  it('plain mode services page reveals the Algología mapping', () => {
    renderHospitalInfo(app(), 'servicios');
    const obf = app().querySelector('.hospital-info-list').textContent;
    expect(obf).toContain('Unidad integral del dolor');
    expect(obf).not.toContain('Algología');
    setSession({ ...getSession(), plainMode: true });
    renderHospitalInfo(app(), 'servicios');
    expect(app().querySelector('.hospital-info-list').textContent).toContain(
      'Algología'
    );
  });

  it('plain mode renders clear language', () => {
    setSession({ ...getSession(), plainMode: true });
    renderHospital(app());
    const links = [...app().querySelectorAll('.hospital-subnav-link')].map((a) => a.textContent);
    expect(links).toContain('Pedir cita');
  });

  it('booking form requires all fields', () => {
    const { set, submit } = renderForm();
    set('#bk-specialty', 'Algología');
    submit();
    expect(app().querySelector('.hospital-error').hidden).toBe(false);
  });

  it('occupied slot shows the unavailable dialog and books nothing', () => {
    const { set, submit } = renderForm();
    set('#bk-date', busyDay());
    set('#bk-hour', '10');
    set('#bk-specialty', 'Algología');
    set('#bk-center', 'Hospital Vega Norte');
    submit();
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.textContent).toContain('Indisponibilidad');
    expect(app().querySelector('.hospital-booked').hidden).toBe(true);
    expect(getSession().completedAt).toBeUndefined();
  });

  it('free but off-mission booking confirms and keeps the timer running', () => {
    const { set, submit } = renderForm();
    set('#bk-date', novemberDay()); // free, but not the October fortnight
    set('#bk-hour', '10');
    set('#bk-specialty', 'Algología');
    set('#bk-center', 'Hospital Vega Norte');
    submit();
    expect(app().querySelector('.hospital-booked').hidden).toBe(false);
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.textContent).toContain('parámetros divergentes');
    expect(getSession().completedAt).toBeUndefined();
  });

  it('mission booking completes the experience and shows congrats', () => {
    const { set, submit } = renderForm();
    set('#bk-date', missionDay());
    set('#bk-hour', '16'); // even + afternoon
    set('#bk-specialty', 'Algología');
    set('#bk-center', 'Hospital Vega Norte');
    submit();
    const dialog = document.querySelector('.congrats-dialog');
    expect(dialog.textContent).toContain('¡Enhorabuena!');
    expect(dialog.textContent).toContain('conseguido tu cita');
    expect(getSession().completedAt).toBeDefined();
  });

  it('plain mode sorts selects and disables never-free options', () => {
    setSession({ ...getSession(), plainMode: true });
    renderForm();
    const dateOpts = [...app().querySelectorAll('#bk-date option:not([value=""])')];
    const dateValues = dateOpts.map((o) => o.value);
    expect(dateValues).toEqual([...dateValues].sort());
    // Odd days and weekends are fully busy; even weekdays stay enabled.
    const disabledDates = new Set(
      dateOpts.filter((o) => o.disabled).map((o) => o.value)
    );
    for (const o of dateOpts) {
      const fullyBusy =
        Number(o.value.slice(-2)) % 2 === 1 ||
        [0, 6].includes(new Date(`${o.value}T12:00:00`).getDay());
      expect(o.disabled).toBe(fullyBusy);
    }
    expect(disabledDates.size).toBeGreaterThan(0);
    expect(disabledDates.size).toBeLessThan(dateOpts.length);

    const hourOpts = [...app().querySelectorAll('#bk-hour option:not([value=""])')];
    expect(hourOpts.map((o) => Number(o.value))).toEqual(
      hourOpts.map((o) => Number(o.value)).sort((a, b) => a - b)
    );
    for (const o of hourOpts) {
      expect(o.disabled).toBe(Number(o.value) % 2 === 1);
    }

    const specValues = [
      ...app().querySelectorAll('#bk-specialty option:not([value=""])'),
    ].map((o) => o.value);
    expect(specValues).toEqual(
      [...specValues].sort((a, b) => a.localeCompare(b, 'es'))
    );
    expect(specValues).toContain('Algología');
    const centerValues = [
      ...app().querySelectorAll('#bk-center option:not([value=""])'),
    ].map((o) => o.value);
    expect(centerValues).toEqual(
      [...centerValues].sort((a, b) => a.localeCompare(b, 'es'))
    );
    expect(centerValues).toContain('Hospital Vega Norte');
  });

  it('barrier mode keeps scrambled, fully-enabled selects', () => {
    renderForm();
    const dateValues = [
      ...app().querySelectorAll('#bk-date option:not([value=""])'),
    ].map((o) => o.value);
    expect(dateValues).not.toEqual([...dateValues].sort());
    expect(app().querySelector('#bk-date option[disabled]')).toBeNull();
    expect(app().querySelector('#bk-hour option[disabled]')).toBeNull();
    const specValues = [
      ...app().querySelectorAll('#bk-specialty option:not([value=""])'),
    ].map((o) => o.value);
    expect(specValues).not.toEqual(
      [...specValues].sort((a, b) => a.localeCompare(b, 'es'))
    );
  });

  it('ranking retry activates plainMode for a barrier-free replay', async () => {
    setSession({
      ...getSession(),
      completedAt: Date.now(),
      baselineMs: 100000,
    });
    await renderRanking(app());
    app().querySelector('#ranking-retry').click();
    expect(getSession().plainMode).toBe(true);
    expect(window.location.hash).toBe('#/hospital');
  });
});
