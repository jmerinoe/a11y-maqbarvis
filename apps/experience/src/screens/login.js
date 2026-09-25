// screens/login.js — workshop session login (accessible, no traps)

import { t } from '../i18n/index.js';
import { registerUser, setSession } from '../session/session.js';
import { navigate } from '../router.js';
import { panelShell } from '../components/panel-shell.js';

export function renderLogin(container) {
  container.innerHTML = panelShell(`
    <main class="panel-screen">
      <h1 class="app-brand">A11y Experience Center</h1>
      <form id="login-form" novalidate>
        <div class="form-field">
          <label for="login-username">${t('session.username')}</label>
          <input type="text" id="login-username" aria-describedby="login-error" autocomplete="off" />
          <span class="field-error" id="login-error" role="alert"></span>
        </div>
        <button type="submit" class="btn-primary">${t('session.continue')}</button>
      </form>
    </main>
  `);

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('login-username');
    const errorEl = document.getElementById('login-error');
    const result = registerUser(input.value);

    if (!result.ok) {
      errorEl.textContent =
        result.reason === 'duplicate' ? t('session.errorDuplicate') : t('session.errorRequired');
      errorEl.classList.add('visible');
      input.focus();
      return;
    }

    setSession({ user: result.name });
    navigate('#/experiences');
  });
}
