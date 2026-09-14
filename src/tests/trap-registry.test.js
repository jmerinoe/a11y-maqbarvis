// trap-registry.test.js — verify all 19 traps have valid metadata

import { describe, it, expect } from 'vitest';
import { traps } from '../traps/registry.js';

describe('Trap registry integrity', () => {
  it('should have exactly 19 traps', () => {
    expect(traps).toHaveLength(19);
  });

  it('should have unique IDs', () => {
    const ids = traps.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have IDs from TR-01 to TR-19', () => {
    const expectedIds = Array.from({ length: 19 }, (_, i) => `TR-${String(i + 1).padStart(2, '0')}`);
    const ids = traps.map((t) => t.id);
    expect(ids.sort()).toEqual(expectedIds.sort());
  });

  it('should have all required fields for each trap', () => {
    const requiredFields = ['id', 'screen', 'wcag', 'description', 'fix', 'selector'];

    traps.forEach((trap) => {
      requiredFields.forEach((field) => {
        expect(trap).toHaveProperty(field);
      });

      // description must have es and en
      expect(trap.description).toHaveProperty('es');
      expect(trap.description).toHaveProperty('en');
      expect(trap.description.es).toBeTruthy();
      expect(trap.description.en).toBeTruthy();

      // other fields must be non-empty strings
      expect(trap.id).toBeTruthy();
      expect(trap.screen).toBeTruthy();
      expect(trap.wcag).toBeTruthy();
      expect(trap.fix).toBeTruthy();
      expect(trap.selector).toBeTruthy();
    });
  });

  it('should have selectors matching the data-trap attribute pattern', () => {
    traps.forEach((trap) => {
      expect(trap.selector).toBe(`[data-trap="${trap.id}"]`);
    });
  });

  it('should map traps to valid screen names', () => {
    const validScreens = ['home', 'products', 'product-detail', 'cart', 'checkout', 'confirmation'];
    traps.forEach((trap) => {
      expect(validScreens).toContain(trap.screen);
    });
  });
});
