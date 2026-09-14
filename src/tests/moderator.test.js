// moderator.test.js — verify moderator overlay injection and removal

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { applyModeratorOverlays, removeModeratorOverlays } from '../moderator/moderator.js';

describe('Moderator mode overlays', () => {
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

  it('should inject overlays for all [data-trap] elements when applied', () => {
    applyModeratorOverlays();

    const overlays = document.querySelectorAll('[data-moderator-overlay]');
    expect(overlays.length).toBe(2);

    expect(overlays[0].getAttribute('data-moderator-overlay')).toBe('TR-04');
    expect(overlays[1].getAttribute('data-moderator-overlay')).toBe('TR-05');
  });

  it('should remove all overlays when removed', () => {
    applyModeratorOverlays();
    expect(document.querySelectorAll('[data-moderator-overlay]').length).toBe(2);

    removeModeratorOverlays();
    expect(document.querySelectorAll('[data-moderator-overlay]').length).toBe(0);
    expect(document.querySelectorAll('[data-moderator-wrapper]').length).toBe(0);
  });

  it('should not mutate the trapped elements when applying overlays', () => {
    const trapElement = document.getElementById('trap-element-1');
    const originalHtml = trapElement.outerHTML;

    applyModeratorOverlays();

    // The trapped element itself should be unchanged
    expect(document.getElementById('trap-element-1').outerHTML).toBe(originalHtml);
    // The data-trap attribute should still be present
    expect(document.getElementById('trap-element-1').getAttribute('data-trap')).toBe('TR-04');
  });

  it('should not mutate the trapped elements when removing overlays', () => {
    const trapElement = document.getElementById('trap-element-1');
    const originalHtml = trapElement.outerHTML;

    applyModeratorOverlays();
    removeModeratorOverlays();

    expect(document.getElementById('trap-element-1').outerHTML).toBe(originalHtml);
  });

  it('should include WCAG reference in the overlay content', () => {
    applyModeratorOverlays();

    const overlay = document.querySelector('[data-moderator-overlay="TR-04"]');
    expect(overlay).toBeTruthy();
    expect(overlay.innerHTML).toContain('4.1.2');
  });
});
