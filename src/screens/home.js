// screens/home.js — hero, carousel (TR-03), search bar, featured products

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderSearchBar, bindSearchBarEvents } from '../components/search-bar.js';
import { renderProductCard } from '../components/product-card.js';
import { products } from '../data/products.js';
import { bindModerator } from '../moderator/moderator.js';

let carouselTimer = null;

export function renderHome(container) {
  const { language } = getState();
  const featured = products.slice(0, 4);
  const featuredCards = featured.map((p, i) => renderProductCard(p, i)).join('');

  container.innerHTML = `
    ${renderHeader()}
    <main id="main-content">
      <section class="hero">
        <h1>${t('home.hero.title')}</h1>
        <p>${t('home.hero.subtitle')}</p>
      </section>

      ${renderSearchBar()}

      <section data-trap="TR-03" class="carousel" id="hero-carousel">
        <div class="carousel-slides">
          <div class="carousel-slide active" tabindex="0" style="background-image: url('${products[0].image}')">
            <div class="carousel-slide-overlay">
              <h2>${products[0].name[language]}</h2>
              <p>€${products[0].price.toFixed(2)}</p>
            </div>
          </div>
          <div class="carousel-slide" tabindex="0" style="background-image: url('${products[3].image}')">
            <div class="carousel-slide-overlay">
              <h2>${products[3].name[language]}</h2>
              <p>€${products[3].price.toFixed(2)}</p>
            </div>
          </div>
          <div class="carousel-slide" tabindex="0" style="background-image: url('${products[4].image}')">
            <div class="carousel-slide-overlay">
              <h2>${products[4].name[language]}</h2>
              <p>€${products[4].price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="featured">
        <h2>${t('home.featured')}</h2>
        <div class="product-grid">${featuredCards}</div>
      </section>
    </main>
  `;

  bindHeaderEvents();
  bindSearchBarEvents();
  bindModerator();

  // TR-03: auto-rotating carousel that steals focus every 3 seconds
  startCarousel();
}

function startCarousel() {
  stopCarousel();
  const slides = document.querySelectorAll('#hero-carousel .carousel-slide');
  let current = 0;

  carouselTimer = setInterval(() => {
    slides.forEach((s) => s.classList.remove('active'));
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    // TR-03: steal focus to the current slide — interrupts keyboard nav
    if (slides[current] && document.activeElement !== document.body) {
      slides[current].focus();
    }
  }, 3000);

  if (slides[0]) slides[0].classList.add('active');
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

export function stopHomeCarousel() {
  stopCarousel();
}
