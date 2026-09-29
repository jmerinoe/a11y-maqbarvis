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
  { pattern: /^#\/metro-design$/, name: 'metro-design' },
  { pattern: /^#\/home$/, name: 'home' },
  { pattern: /^#\/products$/, name: 'products' },
  { pattern: /^#\/product\/(.+)$/, name: 'product-detail' },
  { pattern: /^#\/cart$/, name: 'cart' },
  { pattern: /^#\/checkout$/, name: 'checkout' },
  { pattern: /^#\/confirmation$/, name: 'confirmation' },
];

// Instructions and the experience screens (Faro or metro) require a
// completed workshop session; the picker and login are entry screens.
const SESSION_ROUTES = new Set([
  'instructions',
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

// A session is complete once the participant picked an experience AND
// registered a name for it — the pick alone is a pending session.
function sessionComplete(session) {
  return Boolean(session?.experienceId && session?.user);
}

// Where a participant (re)joins the flow given their session state:
// picker → login → experience home.
function entryRoute() {
  const session = getSession();
  if (sessionComplete(session)) return sessionHome();
  return session?.experienceId ? '#/login' : '#/experiences';
}

export function getCurrentRoute() {
  const hash = window.location.hash || '#/home';
  for (const route of routes) {
    const match = hash.match(route.pattern);
    if (match) {
      return { name: route.name, param: match[1] || null };
    }
  }
  const entry = entryRoute();
  if (entry === '#/experiences') return { name: 'experience-select', param: null };
  if (entry === '#/login') return { name: 'login', param: null };
  return { name: entry === '#/metro' ? 'metro' : 'home', param: null };
}

export function handleRouteChange() {
  const { name, param } = getCurrentRoute();

  // Reaching the experience picker abandons the previous run: stop the
  // timer and drop the session so the next participant starts clean.
  if (name === 'experience-select' && getSession()) {
    stopExperienceTimer();
    clearSession();
  }

  const session = getSession();

  // Login registers the participant for the picked experience: without a
  // pending pick it bounces to the picker, and a completed session resumes
  // (re-registering the same name would hit the duplicate check).
  if (name === 'login') {
    if (!session?.experienceId) {
      navigate('#/experiences');
      return;
    }
    if (sessionComplete(session)) {
      navigate(session.startedAt ? sessionHome() : '#/instructions');
      return;
    }
  }

  // Session guard: instructions and experience screens require an
  // identified participant with a picked experience.
  if (SESSION_ROUTES.has(name) && !sessionComplete(session)) {
    navigate(session?.experienceId ? '#/login' : '#/experiences');
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
    window.location.hash = entryRoute();
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
