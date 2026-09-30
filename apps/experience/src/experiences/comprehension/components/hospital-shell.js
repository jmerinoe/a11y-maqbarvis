// hospital-shell.js — shared chrome for every comprehension site page:
// logo + brand header + two-level obfuscated navigation, so all pages
// look alike. Top-level items open a dropdown of second-level links;
// the booking entry is one of those nested links.

import { infoPages } from '../data/copy.js';

// Sub-items are info-page slugs; 'cita' is the booking form itself.
const NAV = [
  { key: 'nav.about', items: ['nosotros', 'mision', 'organigrama'] },
  { key: 'nav.services', items: ['servicios', 'unidades', 'imagen'] },
  { key: 'nav.contact', items: ['contacto', 'reclamaciones', 'urgencias'] },
  { key: 'nav.area', items: ['cita', 'documentacion', 'facturacion'] },
];

export function hospitalChrome(c, plain) {
  const subHref = (slug) => `#/hospital/${slug}`;
  const subLabel = (slug) =>
    slug === 'cita'
      ? c('nav.booking')
      : plain
        ? infoPages[slug].title.plain
        : infoPages[slug].title.obf;

  return `
      <header class="hospital-header">
        <img class="hospital-logo" src="/hospital/logo.svg" alt="" />
        <div>
          <p class="hospital-brand">${c('brand')}</p>
          <p class="hospital-tagline">${c('tagline')}</p>
        </div>
      </header>
      <nav class="hospital-nav" aria-label="Navegación principal">
        <ul class="hospital-nav-list">
          <li class="hospital-nav-item">
            <a class="hospital-nav-home" href="#/hospital">${c('nav.home')}</a>
          </li>
          ${NAV.map(
            (group, i) => `
            <li class="hospital-nav-item">
              <button type="button" class="hospital-nav-toggle"
                      aria-expanded="false" aria-haspopup="true"
                      aria-controls="hsub-${i}">${c(group.key)}</button>
              <ul class="hospital-submenu" id="hsub-${i}" hidden>
                ${group.items
                  .map(
                    (slug) => `<li><a class="hospital-subnav-link" href="${subHref(slug)}">${subLabel(slug)}</a></li>`
                  )
                  .join('')}
              </ul>
            </li>`
          ).join('')}
        </ul>
      </nav>`;
}

// Wires the dropdowns after render: click toggles, opening one closes
// the rest, Escape closes and returns focus to the owning button, and
// clicks outside the nav close any open menu.
let outsideBound = false;

export function bindHospitalNav(container) {
  const nav = container.querySelector('.hospital-nav');
  if (!nav) return;
  const toggles = [...nav.querySelectorAll('.hospital-nav-toggle')];

  const closeAll = () => {
    toggles.forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      nav.querySelector(`#${b.getAttribute('aria-controls')}`).hidden = true;
    });
  };

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const submenu = nav.querySelector(`#${btn.getAttribute('aria-controls')}`);
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!wasOpen) {
        btn.setAttribute('aria-expanded', 'true');
        submenu.hidden = false;
      }
    });
  });

  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const toggle = e.target
      .closest('.hospital-nav-item')
      ?.querySelector('.hospital-nav-toggle');
    closeAll();
    toggle?.focus();
  });

  if (!outsideBound) {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.hospital-nav')) return;
      document
        .querySelectorAll('.hospital-submenu:not([hidden])')
        .forEach((ul) => {
          ul.hidden = true;
          document
            .querySelectorAll('.hospital-nav-toggle[aria-expanded="true"]')
            .forEach((b) => b.setAttribute('aria-expanded', 'false'));
        });
    });
    outsideBound = true;
  }
}
