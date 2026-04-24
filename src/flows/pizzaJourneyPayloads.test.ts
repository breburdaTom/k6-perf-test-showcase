import { describe, expect, it } from 'vitest';

import {
  isLoginResponse,
  isPizzaRecommendationResponse,
  isRating,
  isRatingsResponse,
} from './pizzaJourneyPayloads.ts';

describe('pizza journey payload guards', () => {
  it('validates login payloads', () => {
    expect(isLoginResponse({ token: 'abc123' })).toBe(true);
    expect(isLoginResponse({ token: 123 })).toBe(false);
  });

  it('validates pizza recommendation payloads', () => {
    expect(
      isPizzaRecommendationResponse({
        calories: 400,
        pizza: {
          id: 1,
          ingredients: [
            {
              id: 1,
              name: 'cheese',
              vegetarian: true,
            },
          ],
          name: 'Margherita',
          tool: 'oven',
        },
        vegetarian: true,
      }),
    ).toBe(true);
    expect(isPizzaRecommendationResponse({ pizza: { id: 1 } })).toBe(false);
  });

  it('accepts the real quickpizza response shape used by the journey', () => {
    expect(
      isPizzaRecommendationResponse({
        calories: 505,
        pizza: {
          id: 1,
          dough: {
            name: 'Traditional',
            caloriesPerSlice: 200,
          },
          ingredients: [
            {
              name: 'Extra Virgin Olive Oil',
              caloriesPerSlice: 120,
              vegetarian: true,
            },
          ],
          name: 'The Savory Margherita',
          tool: 'Wood Fired Oven',
        },
        vegetarian: true,
      }),
    ).toBe(true);
  });

  it('validates rating payloads', () => {
    expect(isRating({ id: 1, pizza_id: 2, stars: 5 })).toBe(true);
    expect(isRating({ id: 1, pizza_id: 2 })).toBe(false);
  });

  it('validates ratings list payloads', () => {
    expect(isRatingsResponse({ ratings: [{ id: 1, pizza_id: 2, stars: 5 }] })).toBe(
      true,
    );
    expect(isRatingsResponse({ ratings: [{ id: 1 }] })).toBe(false);
  });
});
