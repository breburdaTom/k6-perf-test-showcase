import http, { type Params, type Response } from 'k6/http';

import type { PizzaRestrictions } from '../data/pizzaRestrictions.ts';
import type { CreateRatingRequest } from './quickPizzaPayloads.ts';
import type { UserCredentials } from '../utils/testData.ts';
import { createTaggedDeleteRatingRequest } from '../utils/taggedUrl.ts';

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

function jsonParams(): Params {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
