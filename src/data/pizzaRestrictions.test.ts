import { describe, expect, it } from 'vitest';

import {
  pizzaRestrictions,
  pickRestriction,
} from './pizzaRestrictions.ts';

describe('pizzaRestrictions', () => {
  it('provides multiple deterministic presets', () => {
    expect(pizzaRestrictions.length).toBeGreaterThan(2);
    expect(pickRestriction(0)).toEqual(pizzaRestrictions[0]);
    expect(pickRestriction(pizzaRestrictions.length)).toEqual(
      pizzaRestrictions[0],
    );
  });

  it('keeps each preset internally valid', () => {
    for (const preset of pizzaRestrictions) {
      expect(preset.maxNumberOfToppings).toBeGreaterThanOrEqual(
        preset.minNumberOfToppings,
      );
      expect(preset.maxCaloriesPerSlice).toBeGreaterThan(0);
    }
  });
});
