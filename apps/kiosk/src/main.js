// main.js — kiosk router: #/ presentation, #/admin administration

import { startPresentation, stopPresentation } from './presentation.js';
import { renderAdminMode } from './admin.js';
import './styles.css';

function route() {
  const app = document.getElementById('app');
  if (location.hash === '#/admin') {
    document.title = 'Administración — Kiosko';
    stopPresentation();
    renderAdminMode(app);
  } else {
    document.title = 'Ranking — Kiosko';
    startPresentation();
  }
}

window.addEventListener('hashchange', route);
route();
