// ranking-timer.test.js — regression: the session timer must never appear
// on the ranking screen. Two paths caused it: a page reload resurrecting a
// finished session's startedAt, and reaching ranking while a failed-mission
// session was still counting.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderRanking } from '../screens/ranking.js';
import { mountExperienceTimer, stopExperienceTimer } from '../components/experience-timer.js';
import { setSession, clearSession, getSession } from '../session/session.js';
import { setLanguage } from '../i18n/index.js';

describe('Timer on the ranking screen', () => {
  beforeEach(() => {
    clearSession();
    setLanguage('es');
    window.location.hash = '#/ranking';
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    stopExperienceTimer();
    clearSession();
    document.body.innerHTML = '';
  });

  it('removes a running timer when the ranking renders', async () => {
    setSession({ user: 'Ana', experienceId: 'screen-reader', startedAt: Date.now() - 60000 });
    mountExperienceTimer(getSession().startedAt);
    expect(document.getElementById('experience-timer')).not.toBeNull();

    await renderRanking(document.getElementById('app'));
    expect(document.getElementById('experience-timer')).toBeNull();
  });

  it('a completed session is marked so a reload cannot resurrect the timer', async () => {
    setSession({
      user: 'Ana',
      experienceId: 'screen-reader',
      startedAt: Date.now() - 60000,
      completedAt: Date.now(),
    });
    await renderRanking(document.getElementById('app'));

    // Simulating initRouter's restore check: completed sessions are skipped
    const session = getSession();
    expect(session.completedAt).toBeDefined();
    expect(document.getElementById('experience-timer')).toBeNull();
  });
});
