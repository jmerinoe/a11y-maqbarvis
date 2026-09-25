// moderator.test.js — verify moderator badge injection, click-to-expand, and removal

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyModeratorOverlays, removeModeratorOverlays } from '../moderator/moderator.js';

describe('Moderator mode badges', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <div data-trap="TR-04" id="trap-element-1">Search div</div>
        <div data-trap="TR-05" id="trap-element-2">Search input</div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should inject badges for all [data-trap] elements when applied', () => {
    applyModeratorOverlays();

    const badges = document.querySelectorAll('[data-moderator-badge]');
    expect(badges.length).toBe(2);

    expect(badges[0].getAttribute('data-moderator-badge')).toBe('TR-04');
    expect(badges[1].getAttribute('data-moderator-badge')).toBe('TR-05');
  });

  it('should not show any panels initially (click-to-expand)', () => {
    applyModeratorOverlays();

    const panels = document.querySelectorAll('[data-moderator-panel]');
    expect(panels.length).toBe(0);
  });

  it('should remove all badges and wrappers when removed', () => {
    applyModeratorOverlays();
    expect(document.querySelectorAll('[data-moderator-badge]').length).toBe(2);

    removeModeratorOverlays();
    expect(document.querySelectorAll('[data-moderator-badge]').length).toBe(0);
    expect(document.querySelectorAll('[data-moderator-wrapper]').length).toBe(0);
  });

  it('should mark trapped elements with moderator-trapped class', () => {
    applyModeratorOverlays();

    const el = document.getElementById('trap-element-1');
    expect(el.classList.contains('moderator-trapped')).toBe(true);
    expect(el.getAttribute('data-moderator-trapped')).toBe('TR-04');
  });

  it('should clean up moderator-trapped class when removed', () => {
    applyModeratorOverlays();
    removeModeratorOverlays();

    const el = document.getElementById('trap-element-1');
    expect(el.classList.contains('moderator-trapped')).toBe(false);
    expect(el.hasAttribute('data-moderator-trapped')).toBe(false);
  });

  it('should not mutate the data-trap attribute of trapped elements', () => {
    const trapElement = document.getElementById('trap-element-1');

    applyModeratorOverlays();
    expect(document.getElementById('trap-element-1').getAttribute('data-trap')).toBe('TR-04');

    removeModeratorOverlays();
    expect(document.getElementById('trap-element-1').getAttribute('data-trap')).toBe('TR-04');
  });

  it('should expand a panel when badge is clicked', () => {
    applyModeratorOverlays();

    const badge = document.querySelector('[data-moderator-badge="TR-04"]');
    badge.click();

    const panel = document.querySelector('[data-moderator-panel="TR-04"]');
    expect(panel).toBeTruthy();
    expect(panel.innerHTML).toContain('4.1.2');
  });

  it('should close the panel when badge is clicked again', () => {
    applyModeratorOverlays();

    const badge = document.querySelector('[data-moderator-badge="TR-04"]');
    badge.click();
    expect(document.querySelectorAll('[data-moderator-panel]').length).toBe(1);

    badge.click();
    expect(document.querySelectorAll('[data-moderator-panel]').length).toBe(0);
  });
});
