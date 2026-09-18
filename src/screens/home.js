// screens/home.js — hero, carousel, search bar, featured products
// TR-03 (carousel steals focus) has been corrected: rotation never moves
// focus and honors prefers-reduced-motion.

import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderSearchBar, bindSearchBarEvents } from '../components/search-bar.js';
import { renderProductCard } from '../components/product-card.js';
import { products } from '../data/products.js';
import { bindModerator } from '../moderator/moderator.js';

let carouselTimer = null;
let motionQuery = null;
let motionQueryListener = null;

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

      <section class="carousel" id="hero-carousel">
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

  // Carousel auto-rotates every 3s but never moves focus (TR-03 corrected)
  // and does not auto-rotate under prefers-reduced-motion.
  startCarousel();
}

function startCarousel() {
  stopCarousel();
  const slides = document.querySelectorAll('#hero-carousel .carousel-slide');
  if (slides.length === 0) return;
  let current = 0;

  const startRotation = () => {
    if (carouselTimer) return;
    carouselTimer = setInterval(() => {
      slides.forEach((s) => s.classList.remove('active'));
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 3000);
  };

  // Interval-only stop: keeps the change listener alive so rotation can
  // resume when the preference flips back to no-preference.
  const stopRotation = () => {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  };

  // Respect prefers-reduced-motion; degrade gracefully when matchMedia
  // is unavailable (e.g. jsdom) — treat as "no preference".
  motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : { matches: false, addEventListener: null, removeEventListener: null };

  if (!motionQuery.matches) startRotation();

  motionQueryListener = (e) => {
    if (e.matches) stopRotation();
    else startRotation();
  };
  motionQuery.addEventListener?.('change', motionQueryListener);

  if (slides[0]) slides[0].classList.add('active');
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  if (motionQuery && motionQueryListener) {
    motionQuery.removeEventListener?.('change', motionQueryListener);
    motionQueryListener = null;
  }
  motionQuery = null;
}

export function stopHomeCarousel() {
  stopCarousel();
}
