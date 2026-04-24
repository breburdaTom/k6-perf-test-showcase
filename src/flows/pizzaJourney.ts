import { check, group } from 'k6';
import exec from 'k6/execution';

import {
  QuickPizzaClient,
  parseJson,
  type LoginResponse,
  type PizzaRecommendationResponse,
  type Rating,
  type RatingsResponse,
} from '../api/quickPizzaClient.ts';
import { pickRestriction } from '../data/pizzaRestrictions.ts';
import {
  journeyDuration,
  journeySuccessRate,
} from '../metrics/customMetrics.ts';
import { createUserCredentials } from '../utils/testData.ts';

type ApiProfile = 'smoke' | 'load';

const PIZZA_RATING = 5;
const TEST_RUN_ID =
  __ENV.TEST_RUN_ID?.trim() || Date.now().toString(36).slice(-8);

export function runApiPizzaJourney(
  baseUrl: string,
  profile: ApiProfile,
): void {
  const client = new QuickPizzaClient(baseUrl);
  const credentials = createUserCredentials(
    `${profile}-vu${exec.vu.idInTest}-it${exec.scenario.iterationInTest}`,
    TEST_RUN_ID,
  );
  const metricTags = createMetricTags(profile);
  const startedAt = Date.now();

  let success = false;
  let loggedIn = false;
  let ratingId: number | undefined;

  try {
    group('register user', () => {
      const response = client.registerUser(credentials);
      ensure(
        check(response, {
          'user registration returns 201': (res) => res.status === 201,
        }),
        'User registration failed',
      );
    });

    group('login', () => {
      const response = client.login(credentials);
      const loginResponse = parseJson<LoginResponse>(response);
      ensure(
        check(response, {
          'login returns 200': (res) => res.status === 200,
          'login returns token': () => loginResponse.token.length > 0,
        }),
        'Login failed',
      );
      loggedIn = true;
    });

    const pizzaRecommendation = group('request pizza', () => {
      const response = client.requestPizza(
        pickRestriction(exec.scenario.iterationInTest),
      );
      ensure(
        check(response, {
          'pizza recommendation returns 200': (res) => res.status === 200,
        }),
        'Pizza recommendation failed',
      );

      return parseJson<PizzaRecommendationResponse>(response);
    });

    const rating = group('rate pizza', () => {
      const response = client.createRating({
        pizza_id: pizzaRecommendation.pizza.id,
        stars: PIZZA_RATING,
      });
      ensure(
        check(response, {
          'rating creation returns 201': (res) => res.status === 201,
        }),
        'Rating creation failed',
      );

      return parseJson<Rating>(response);
    });

    ratingId = rating.id;

    group('verify ratings', () => {
      const response = client.getRatings();
      const ratings = parseJson<RatingsResponse>(response);
      const hasCreatedRating = ratings.ratings.some(
        (savedRating) =>
          savedRating.id === rating.id &&
          savedRating.pizza_id === pizzaRecommendation.pizza.id &&
          savedRating.stars === PIZZA_RATING,
      );

      ensure(
        check(response, {
          'ratings lookup returns 200': (res) => res.status === 200,
        }) &&
          check(hasCreatedRating, {
            'ratings list contains the new rating': (value) => value,
          }),
        'Rating verification failed',
      );
    });

    group('delete rating', () => {
      const response = client.deleteRating(rating.id);
      ensure(
        check(response, {
          'rating deletion returns 204': (res) => res.status === 204,
        }),
        'Rating deletion failed',
      );
      ratingId = undefined;
    });

    group('logout', () => {
      const response = client.logout();
      ensure(
        check(response, {
          'logout returns 200': (res) => res.status === 200,
        }),
        'Logout failed',
      );
      loggedIn = false;
    });

    success = true;
  } finally {
    if (ratingId !== undefined) {
      safeDeleteRating(client, ratingId);
    }

    if (loggedIn) {
      safeLogout(client);
    }

    journeyDuration.add(Date.now() - startedAt, metricTags);
    journeySuccessRate.add(success, metricTags);
  }
}

function createMetricTags(profile: ApiProfile): Record<string, string> {
  return {
    journey: 'pizza_rating',
    scenario: exec.scenario.name,
    test_type: profile,
  };
}

function ensure(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function safeDeleteRating(client: QuickPizzaClient, ratingId: number): void {
  try {
    const deleteResponse = client.deleteRating(ratingId);
    if (deleteResponse.status !== 204) {
      client.clearRatings();
    }
  } catch {
    client.clearRatings();
  }
}

function safeLogout(client: QuickPizzaClient): void {
  try {
    client.logout();
  } catch {
    // Best-effort cleanup only.
  }
}
