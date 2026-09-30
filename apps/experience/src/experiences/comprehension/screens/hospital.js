// screens/hospital.js — comprehension experience: private hospital home.
// The navigation and every label use bureaucratic Spanish; the booking
// entry point is deliberately hard to spot among the obfuscated items.
// When session.plainMode is set (barrier-free retry) the same DOM
// renders in clear language.

import { getSession } from '../../../session/session.js';
import { getExperienceById } from '../../../data/experiences.js';
import { pickCopy } from '../data/copy.js';
import { hospitalChrome, bindHospitalNav } from '../components/hospital-shell.js';

export function renderHospital(container) {
  const session = getSession();
  const experience = session ? getExperienceById(session.experienceId) : null;
  if (!session || experience?.id !== 'comprehension') {
    window.location.hash = '#/experiences';
    return;
  }
  const plain = session.plainMode === true;
  const c = (key) => pickCopy(key, plain);

  container.innerHTML = `
    <div class="hospital-app">
      <h1 class="sr-only">${c('brand')}</h1>
      ${hospitalChrome(c, plain)}
      <main class="hospital-main" id="main-content">
        <section class="hospital-hero" aria-labelledby="hospital-hero-title">
          <img class="hospital-img hospital-hero-img" src="/hospital/fachada.jpg" alt="" />
          <div class="hospital-hero-body">
            <h2 id="hospital-hero-title">${c('home.heroTitle')}</h2>
            <p>${c('home.heroText')}</p>
          </div>
        </section>

        <section class="hospital-units" aria-labelledby="hospital-units-title">
          <h2 id="hospital-units-title">${c('home.unitsTitle')}</h2>
          <div class="hospital-units-grid">
            <article class="hospital-unit">
              <img class="hospital-img" src="/hospital/personal.jpg" alt="" />
              <h3>${c('home.unitPain')}</h3>
              <p>${c('home.unitPainDesc')}</p>
            </article>
            <article class="hospital-unit">
              <img class="hospital-img" src="/hospital/equipo.jpg" alt="" />
              <h3>${c('home.unitCardio')}</h3>
              <p>${c('home.unitCardioDesc')}</p>
            </article>
            <article class="hospital-unit">
              <img class="hospital-img" src="/hospital/pasillo.jpg" alt="" />
              <h3>${c('home.unitTrauma')}</h3>
              <p>${c('home.unitTraumaDesc')}</p>
            </article>
          </div>
        </section>

        <section class="hospital-news" aria-labelledby="hospital-news-title">
          <h2 id="hospital-news-title">${c('home.newsTitle')}</h2>
          <div class="hospital-news-grid">
            <article class="hospital-news-item">
              <h3>${c('home.news1Title')}</h3>
              <p>${c('home.news1Text')}</p>
            </article>
            <article class="hospital-news-item">
              <h3>${c('home.news2Title')}</h3>
              <p>${c('home.news2Text')}</p>
            </article>
          </div>
        </section>

        <section class="hospital-quick" aria-labelledby="hospital-quick-title">
          <h2 id="hospital-quick-title">${c('home.quickTitle')}</h2>
          <ul class="hospital-quick-grid">
            <li><a href="#/hospital/cita" class="hospital-card">
              <strong>${c('quick.booking')}</strong>
              <span>${c('quick.bookingDesc')}</span>
            </a></li>
            <li><a href="#/hospital/contacto" class="hospital-card">
              <strong>${c('quick.results')}</strong>
              <span>${c('quick.resultsDesc')}</span>
            </a></li>
            <li><a href="#/hospital/contacto" class="hospital-card">
              <strong>${c('quick.urgencies')}</strong>
              <span>${c('quick.urgenciesDesc')}</span>
            </a></li>
            <li><a href="#/hospital/servicios" class="hospital-card">
              <strong>${c('quick.centers')}</strong>
              <span>${c('quick.centersDesc')}</span>
            </a></li>
          </ul>
        </section>
      </main>
      <footer class="hospital-footer">
        <p>${c('home.footerText')}</p>
      </footer>
    </div>
  `;
  bindHospitalNav(container);
}
