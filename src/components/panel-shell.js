// components/panel-shell.js — shared Panel-branded chrome for the workshop
// session screens (login, experience selection, instructions, ranking).
// Accessible, no traps: the logo has an alt and is not focusable.

import { t } from '../i18n/index.js';

export function panelShell(innerHtml) {
  return `
    <div class="panel-shell">
      <img class="panel-logo" src="/images/panel-logo.jpg" alt="${t('panel.logoAlt')}" />
      ${innerHtml}
    </div>
  `;
}
