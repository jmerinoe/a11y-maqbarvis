// carousel-motion.test.js — verify TR-03 correction: rotation never steals focus,
// and auto-rotation honors prefers-reduced-motion

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHome } from '../screens/home.js';
import { clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

let mqListeners;
let mqMatches;

function stubMatchMedia(matches) {
  mqMatches = matches;
  mqListeners = [];
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: mqMatches,
    media: query,
    addEventListener: (_e, fn) => mqListeners.push(fn),
    removeEventListener: (_e, fn) => {
      mqListeners = mqListeners.filter((l) => l !== fn);
    },
  }));
}

function dispatchMotionChange(matches) {
  mqMatches = matches;
  mqListeners.forEach((fn) => fn({ matches }));
}

function activeSlideIndex() {
  const slides = [...document.querySelectorAll('#hero-carousel .carousel-slide')];
  return slides.findIndex((s) => s.classList.contains('active'));
}

describe('Carousel motion (TR-03 corrected)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mqListeners = [];
    mqMatches = false;
    stubMatchMedia(false);
    setLanguage('es');
    clearCart();
    document.body.innerHTML = '<div id="app"></div>';
  });

  afterEach(() => {
    vi.useRealTimers();
    delete window.matchMedia;
    document.body.innerHTML = '';
    mqListeners = [];
  });

  it('rotates slides without stealing focus', () => {
    renderHome(document.getElementById('app'));

    const input = document.getElementById('search-input');
    input.focus();
    expect(document.activeElement).toBe(input);

    vi.advanceTimersByTime(3000);
    expect(document.activeElement).toBe(input);

    vi.advanceTimersByTime(3000);
    expect(document.activeElement).toBe(input);
  });

  it('auto-rotates slides when no reduced-motion preference', () => {
    renderHome(document.getElementById('app'));

    expect(activeSlideIndex()).toBe(0);
    vi.advanceTimersByTime(3000);
    expect(activeSlideIndex()).toBe(1);
    vi.advanceTimersByTime(3000);
    expect(activeSlideIndex()).toBe(2);
  });

  it('does not auto-rotate when prefers-reduced-motion: reduce', () => {
    stubMatchMedia(true);
    renderHome(document.getElementById('app'));

    expect(activeSlideIndex()).toBe(0);
    vi.advanceTimersByTime(9000);
    expect(activeSlideIndex()).toBe(0);
  });

  it('stops and resumes rotation when the motion preference changes', () => {
    renderHome(document.getElementById('app'));

    vi.advanceTimersByTime(3000);
    expect(activeSlideIndex()).toBe(1);

    // reduce → rotation stops
    dispatchMotionChange(true);
    vi.advanceTimersByTime(9000);
    expect(activeSlideIndex()).toBe(1);

    // no-preference → rotation resumes
    dispatchMotionChange(false);
    vi.advanceTimersByTime(3000);
    expect(activeSlideIndex()).toBe(2);
  });

  it('renders the carousel without a data-trap="TR-03" marker', () => {
    renderHome(document.getElementById('app'));
    expect(document.querySelector('[data-trap="TR-03"]')).toBeNull();
  });

  it('keeps slides keyboard-focusable', () => {
    renderHome(document.getElementById('app'));
    const slides = document.querySelectorAll('#hero-carousel .carousel-slide');
    slides.forEach((s) => expect(s.getAttribute('tabindex')).toBe('0'));
  });
});
