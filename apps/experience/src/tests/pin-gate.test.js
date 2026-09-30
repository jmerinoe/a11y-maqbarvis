// pin-gate.test.js — experiences flagged `locked` sit behind the admin
// PIN while under development; the prompt must be accessible and only
// grant access on a correct PIN (offline dev path via VITE_ADMIN_PIN).
// No production experience is currently locked — the test locks the
// chromatic entry to exercise the mechanism.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderExperienceSelect } from '../screens/experience-select.js';
import { setLanguage } from '../i18n/index.js';
import { setSession, clearSession, getSession } from '../session/session.js';
import { experiences } from '../data/experiences.js';

function clickExperience(id) {
  document.querySelector(`a[data-experience-id="${id}"]`).click();
}

describe('Locked experience PIN gate', () => {
  beforeEach(() => {
    clearSession();
    setLanguage('es');
    vi.stubEnv('VITE_ADMIN_PIN', '4242');
    experiences.find((e) => e.id === 'chromatic').locked = true;
    window.location.hash = '#/experiences';
    document.body.innerHTML = '<div id="app"></div>';
    renderExperienceSelect(document.getElementById('app'));
  });

  afterEach(() => {
    delete experiences.find((e) => e.id === 'chromatic').locked;
    vi.unstubAllEnvs();
    clearSession();
    document.body.innerHTML = '';
  });

  it('unlocked experiences navigate straight to login', () => {
    clickExperience('screen-reader');
    expect(window.location.hash).toBe('#/login');
    expect(getSession().experienceId).toBe('screen-reader');
  });

  it('no experience is locked by default', () => {
    delete experiences.find((e) => e.id === 'chromatic').locked;
    renderExperienceSelect(document.getElementById('app'));
    clickExperience('chromatic');
    expect(window.location.hash).toBe('#/login');
    expect(getSession().experienceId).toBe('chromatic');
  });

  it('locked experience asks for the PIN instead of navigating', () => {
    clickExperience('chromatic');
    expect(window.location.hash).toBe('#/experiences');

    const form = document.querySelector('.pin-form');
    expect(form).not.toBeNull();
    expect(document.activeElement).toBe(form.querySelector('#pin-input'));
    expect(getSession()?.experienceId).toBeUndefined();
  });

  it('wrong PIN shows an alert error and stays put', async () => {
    clickExperience('chromatic');
    const form = document.querySelector('.pin-form');
    form.querySelector('#pin-input').value = '0000';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() =>
      expect(form.querySelector('.pin-error').hidden).toBe(false)
    );
    expect(form.querySelector('.pin-error').textContent).toContain('PIN incorrecto');
    expect(window.location.hash).toBe('#/experiences');
  });

  it('correct PIN starts the locked experience', async () => {
    clickExperience('chromatic');
    const form = document.querySelector('.pin-form');
    form.querySelector('#pin-input').value = '4242';
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(window.location.hash).toBe('#/login'));
    expect(getSession().experienceId).toBe('chromatic');
  });

  it('Escape cancels the prompt and returns focus to the link', () => {
    const link = document.querySelector('a[data-experience-id="chromatic"]');
    clickExperience('chromatic');
    const form = document.querySelector('.pin-form');
    form.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.pin-form')).toBeNull();
    expect(document.activeElement).toBe(link);
  });
});
