// i18n.test.js — verify ES and EN string tables have matching keys

import { describe, it, expect } from 'vitest';
import { es } from '../i18n/es.js';
import { en } from '../i18n/en.js';

describe('i18n completeness', () => {
  it('should have the same number of keys', () => {
    expect(Object.keys(es).length).toBe(Object.keys(en).length);
  });

  it('should have every ES key present in EN', () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);

    esKeys.forEach((key) => {
      expect(enKeys).toContain(key);
    });
  });

  it('should have every EN key present in ES', () => {
    const esKeys = Object.keys(es);
    const enKeys = Object.keys(en);

    enKeys.forEach((key) => {
      expect(esKeys).toContain(key);
    });
  });

  it('should have no empty string values', () => {
    Object.entries(es).forEach(([key, value]) => {
      expect(value, `ES key "${key}" is empty`).toBeTruthy();
    });
    Object.entries(en).forEach(([key, value]) => {
      expect(value, `EN key "${key}" is empty`).toBeTruthy();
    });
  });
});
