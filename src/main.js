// main.js — entry point

import { initRouter, handleRouteChange } from './router.js';
import { getState, subscribe } from './store.js';
import { bindModerator } from './moderator/moderator.js';

// Set default language
document.documentElement.lang = 'es';

// Register the global Ctrl+M moderator listener once
bindModerator();

// Re-render current screen when language changes
let lastLanguage = getState().language;
subscribe((state) => {
  if (state.language !== lastLanguage) {
    lastLanguage = state.language;
    handleRouteChange();
  }
});

// Initialize the router (renders the initial screen)
initRouter();
