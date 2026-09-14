// router.js — hash-based router

import { getState, setState } from './store.js';
import { renderScreen } from './screens/index.js';

const routes = [
  { pattern: /^#\/home$/, name: 'home' },
  { pattern: /^#\/products$/, name: 'products' },
  { pattern: /^#\/product\/(.+)$/, name: 'product-detail' },
  { pattern: /^#\/cart$/, name: 'cart' },
  { pattern: /^#\/checkout$/, name: 'checkout' },
  { pattern: /^#\/confirmation$/, name: 'confirmation' },
];

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
  return { name: 'home', param: null };
}

export function handleRouteChange() {
  const { name, param } = getCurrentRoute();
  const { route } = getState();
  if (route !== name) {
    setState({ route: name });
  }
  renderScreen(name, param);
}

export function initRouter() {
  if (!window.location.hash) {
    window.location.hash = '#/home';
  }
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}
