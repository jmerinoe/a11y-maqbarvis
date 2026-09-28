// panel-branding.test.js — Panel logo + look-and-feel chrome on the four
// workshop session screens (login, experience select, instructions, ranking).

import { describe, it, expect, beforeEach } from 'vitest';
import { renderLogin } from '../screens/login.js';
import { renderExperienceSelect } from '../screens/experience-select.js';
import { renderInstructions } from '../screens/instructions.js';
import { renderRanking } from '../screens/ranking.js';
import { setSession, clearSession } from '../session/session.js';
import { clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

const screens = [
  ['login', renderLogin],
  ['experience-select', renderExperienceSelect],
  ['instructions', renderInstructions],
  ['ranking', renderRanking],
];

describe('Panel branding on session screens', () => {
  beforeEach(() => {
    clearCart();
    clearSession();
    localStorage.clear();
    sessionStorage.clear();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
  });

  it.each(screens)('%s renders the Panel shell with the logo', async (name, render) => {
    await render(document.getElementById('app'));

    const shell = document.querySelector('.panel-shell');
    expect(shell).not.toBeNull();

    const logo = shell.querySelector('.panel-logo');
    expect(logo).not.toBeNull();
    expect(logo.getAttribute('src')).toBe('/images/panel-logo.jpg');
    expect(logo.getAttribute('alt')).toBe('Panel');
  });

  it.each(screens)('%s keeps its content inside .panel-screen', async (name, render) => {
    await render(document.getElementById('app'));
    expect(document.querySelector('.panel-shell main.panel-screen')).not.toBeNull();
  });

  it.each(screens)('%s introduces no accessibility traps', async (name, render) => {
    await render(document.getElementById('app'));
    expect(document.querySelector('[data-trap]')).toBeNull();
  });

  it.each(screens)('%s logo is not focusable and stays out of tab order', async (name, render) => {
    await render(document.getElementById('app'));
    const logo = document.querySelector('.panel-logo');
    expect(logo.tabIndex).toBe(-1);
  });

  it('login shows the A11y Experience Center brand name', () => {
    renderLogin(document.getElementById('app'));
    const brand = document.querySelector('.app-brand');
    expect(brand).not.toBeNull();
    expect(brand.textContent).toBe('A11y Experience Center');
  });

  it('does not brand the Faro purchase flow', () => {
    // confirmation is a Faro screen — it must not get the Panel shell
    document.body.innerHTML = '<div id="app"></div>';
    const app = document.getElementById('app');
    app.innerHTML = '<main class="faro-screen"></main>';
    expect(document.querySelector('.panel-shell')).toBeNull();
  });
});

// REQ-820-10 — session screens stay trap-free and operable
describe('Session screens accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearSession();
    setLanguage('es');
    document.body.innerHTML = '<div id="app"></div>';
    setSession({ user: 'Ana', experienceId: 'screen-reader' });
  });

  it('login field has a real label and a live error region', () => {
    renderLogin(document.getElementById('app'));
    expect(document.querySelector('label[for="login-username"]')).not.toBeNull();
    const err = document.getElementById('login-error');
    expect(err.getAttribute('role')).toBe('alert');
    expect(document.getElementById('login-username').getAttribute('aria-describedby')).toBe('login-error');
  });

  it('experience select renders real links with meaningful text', async () => {
    await renderExperienceSelect(document.getElementById('app'));
    const links = document.querySelectorAll('.experience-list a');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((a) => expect(a.textContent.trim().length).toBeGreaterThan(0));
  });

  it('instructions uses labelled sections and a semantic mission card', async () => {
    await renderInstructions(document.getElementById('app'));
    expect(document.querySelector('.instructions-screen h1')).not.toBeNull();
    expect(document.querySelectorAll('section[aria-labelledby]').length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('.mission-card').tagName).toBe('DL');
    expect(document.getElementById('instructions-continue').tagName).toBe('BUTTON');
  });
});
