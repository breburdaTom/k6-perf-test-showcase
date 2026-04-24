import type {
  LoginResponse,
  PizzaRecommendationResponse,
  Rating,
  RatingsResponse,
} from '../api/quickPizzaPayloads.ts';

export function isLoginResponse(value: unknown): value is LoginResponse {
  return isRecord(value) && typeof value.token === 'string';
}

export function isPizzaRecommendationResponse(
  value: unknown,
): value is PizzaRecommendationResponse {
  return (
    isRecord(value) &&
    typeof value.calories === 'number' &&
    typeof value.vegetarian === 'boolean' &&
    isPizza(value.pizza)
  );
}

export function isRating(value: unknown): value is Rating {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.pizza_id === 'number' &&
    typeof value.stars === 'number'
  );
}

export function isRatingsResponse(value: unknown): value is RatingsResponse {
  return (
    isRecord(value) &&
    Array.isArray(value.ratings) &&
    value.ratings.every((rating) => isRating(rating))
  );
}

function isPizza(value: unknown): value is PizzaRecommendationResponse['pizza'] {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.tool === 'string' &&
    Array.isArray(value.ingredients) &&
    value.ingredients.length > 0 &&
    value.ingredients.every((ingredient) => isPizzaIngredient(ingredient))
  );
}

function isPizzaIngredient(
  value: unknown,
): value is PizzaRecommendationResponse['pizza']['ingredients'][number] {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.vegetarian === 'boolean'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
