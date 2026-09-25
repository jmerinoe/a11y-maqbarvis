// router.js — hash-based router

import { getState, setState } from './store.js';
import { renderScreen } from './screens/index.js';
import { getSession } from './session/session.js';
import { mountExperienceTimer } from './components/experience-timer.js';

const routes = [
  { pattern: /^#\/login$/, name: 'login' },
  { pattern: /^#\/experiences$/, name: 'experience-select' },
  { pattern: /^#\/instructions$/, name: 'instructions' },
  { pattern: /^#\/ranking$/, name: 'ranking' },
  { pattern: /^#\/home$/, name: 'home' },
  { pattern: /^#\/products$/, name: 'products' },
  { pattern: /^#\/product\/(.+)$/, name: 'product-detail' },
  { pattern: /^#\/cart$/, name: 'cart' },
  { pattern: /^#\/checkout$/, name: 'checkout' },
  { pattern: /^#\/confirmation$/, name: 'confirmation' },
];

// Faro screens require an active workshop session; session screens are open.
const FARO_ROUTES = new Set([
  'home',
  'products',
  'product-detail',
  'cart',
  'checkout',
  'confirmation',
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
  return { name: getSession() ? 'home' : 'login', param: null };
}

export function handleRouteChange() {
  const { name, param } = getCurrentRoute();

  // Session guard: Faro screens require an identified participant.
  if (FARO_ROUTES.has(name) && !getSession()) {
    navigate('#/login');
    return;
  }

  const { route } = getState();
  if (route !== name) {
    setState({ route: name });
  }
  renderScreen(name, param);
}

export function initRouter() {
  if (!window.location.hash) {
    window.location.hash = getSession() ? '#/home' : '#/login';
  }
  // Restore a running session timer after a page reload.
  const session = getSession();
  if (session?.startedAt) {
    mountExperienceTimer(session.startedAt);
  }
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
