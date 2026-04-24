import http, { type Params, type Response } from 'k6/http';

import type { PizzaRestrictions } from '../data/pizzaRestrictions.ts';
import type { UserCredentials } from '../utils/testData.ts';
import { createTaggedDeleteRatingRequest } from '../utils/taggedUrl.ts';

export interface RegisterUserResponse {
  id: number;
  username: string;
}

export interface LoginResponse {
  token: string;
}

export interface PizzaRecommendationResponse {
  calories: number;
  pizza: {
    id: number;
    ingredients: Array<{
      id: number;
      name: string;
      vegetarian: boolean;
    }>;
    name: string;
    tool: string;
  };
  vegetarian: boolean;
}

export interface Rating {
  id: number;
  pizza_id: number;
  stars: number;
}

export interface RatingsResponse {
  ratings: Rating[];
}

export interface CreateRatingRequest {
  pizza_id: number;
  stars: number;
}

export class QuickPizzaClient {
  constructor(private readonly baseUrl: string) {}

  registerUser(credentials: UserCredentials): Response {
    return http.post(
      `${this.baseUrl}/api/users`,
      JSON.stringify(credentials),
      jsonParams(),
    );
  }

  login(credentials: UserCredentials): Response {
    return http.post(
      `${this.baseUrl}/api/users/token/login?set_cookie=true`,
      JSON.stringify(credentials),
      jsonParams(),
    );
  }

  requestPizza(restrictions: PizzaRestrictions): Response {
    return http.post(
      `${this.baseUrl}/api/pizza`,
      JSON.stringify(restrictions),
      jsonParams(),
    );
  }

  createRating(payload: CreateRatingRequest): Response {
    return http.post(
      `${this.baseUrl}/api/ratings`,
      JSON.stringify(payload),
      jsonParams(),
    );
  }

  getRatings(): Response {
    return http.get(`${this.baseUrl}/api/ratings`);
  }

  deleteRating(ratingId: number): Response {
    const request = createTaggedDeleteRatingRequest(this.baseUrl, ratingId);

    return http.del(request.url, null, request.params);
  }

  clearRatings(): Response {
    return http.del(`${this.baseUrl}/api/ratings`);
  }

  logout(): Response {
    return http.post(`${this.baseUrl}/api/users/token/logout`, null);
  }
}

export function parseJson<T>(response: Response): T {
  return response.json() as unknown as T;
}

function jsonParams(): Params {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
