// router.js — hash-based router

import { getState, setState } from './store.js';
import { renderScreen } from './screens/index.js';
import { getSession, clearSession } from './session/session.js';
import { getExperienceById } from './data/experiences.js';
import { mountExperienceTimer, stopExperienceTimer } from './components/experience-timer.js';

const routes = [
  { pattern: /^#\/login$/, name: 'login' },
  { pattern: /^#\/experiences$/, name: 'experience-select' },
  { pattern: /^#\/instructions$/, name: 'instructions' },
  { pattern: /^#\/ranking$/, name: 'ranking' },
  { pattern: /^#\/metro$/, name: 'metro' },
  { pattern: /^#\/home$/, name: 'home' },
  { pattern: /^#\/products$/, name: 'products' },
  { pattern: /^#\/product\/(.+)$/, name: 'product-detail' },
  { pattern: /^#\/cart$/, name: 'cart' },
  { pattern: /^#\/checkout$/, name: 'checkout' },
  { pattern: /^#\/confirmation$/, name: 'confirmation' },
];

// Experience screens (Faro or metro) require an active workshop session;
// session screens are open.
const EXPERIENCE_ROUTES = new Set([
  'home',
  'products',
  'product-detail',
  'cart',
  'checkout',
  'confirmation',
  'metro',
]);

export function navigate(hash) {
  window.location.hash = hash;
}

export function getCurrentRoute() {
  const hash = window.location.hash || '#/home';
  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      return { name: route.name, param: match[1] || null };
    }
  }
  const home = sessionHome();
  return { name: getSession() ? (home === '#/metro' ? 'metro' : 'home') : 'login', param: null };
}

export function handleRouteChange() {
  const { name, param } = getCurrentRoute();

  // Reaching login abandons the previous run: stop the timer and drop the
  // session so the next participant starts with a clean slate.
  if (name === 'login' && getSession()) {
    stopExperienceTimer();
    clearSession();
  }

  // Session guard: experience screens require an identified participant.
  if (EXPERIENCE_ROUTES.has(name) && !getSession()) {
    navigate('#/login');
    return;
  }

  const { route } = getState();
  if (route !== name) {
    setState({ route: name });
  }
  renderScreen(name, param);
}

function sessionHome() {
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  return experience?.homeRoute || '#/home';
}

export function initRouter() {
  if (!window.location.hash) {
    window.location.hash = getSession() ? sessionHome() : '#/login';
  }
  // Restore a running session timer after a page reload — but only when the
  // run is still in progress (a completed session must not resurrect it).
  const session = getSession();
  if (session?.startedAt && !session.completedAt) {
    mountExperienceTimer(session.startedAt);
  }
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
