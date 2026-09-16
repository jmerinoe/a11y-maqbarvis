// logo-icon.test.js — verify logo icon letter/typeface and TR-02 preservation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHeader } from '../components/header.js';
import { clearCart } from '../store.js';
import { setLanguage } from '../i18n/index.js';

function mountHeader() {
  const host = document.createElement('div');
  host.innerHTML = renderHeader();
  document.body.appendChild(host);
  return host;
}

describe('Logo icon', () => {
  beforeEach(() => {
    clearCart();
    setLanguage('es');
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a lowercase f in Times New Roman', () => {
    const host = mountHeader();
    const img = host.querySelector('img[data-trap="TR-02"]');

    expect(img).not.toBeNull();
    expect(img.src).toContain('%3Ef%3C/text%3E');
    expect(img.src).toContain("font-family='Times New Roman'");
  });

  it('keeps TR-02 intact (no alt, data-trap present)', () => {
    const host = mountHeader();
    const img = host.querySelector('img[data-trap="TR-02"]');

    expect(img.getAttribute('data-trap')).toBe('TR-02');
    expect(img.hasAttribute('alt')).toBe(false);
  });

  it('keeps the Faro wordmark unchanged', () => {
    const host = mountHeader();

    expect(host.querySelector('.logo-link span').textContent).toBe('Faro');
  });
});
