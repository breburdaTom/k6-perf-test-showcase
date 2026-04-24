import { check } from 'k6';
import exec from 'k6/execution';
import type { Page } from 'k6/browser';

import {
  journeyDuration,
  journeySuccessRate,
} from '../metrics/customMetrics.ts';
import type { UserCredentials } from '../utils/testData.ts';
import { HomePage } from './pages/HomePage.ts';
import { LoginPage } from './pages/LoginPage.ts';
import { RatingsPage } from './pages/RatingsPage.ts';

export async function runBrowserJourney(
  page: Page,
  baseUrl: string,
  credentials: UserCredentials,
): Promise<void> {
  const startedAt = Date.now();
  const metricTags = {
    journey: 'pizza_rating',
    scenario: exec.scenario.name,
    test_type: 'browser',
  };

  let success = false;

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto(baseUrl);
    await loginPage.login(credentials);
    ensure(
      check(await loginPage.isProfileLoaded(), {
        'profile page is visible after login': (value) => value,
      }),
      'Browser login failed',
    );
    await loginPage.goBackToMainPage();

    const homePage = new HomePage(page);
    ensure(
      check(await homePage.getHeadingText(), {
        'home page heading matches quickpizza': (value) =>
          value === 'Looking to break out of your pizza routine?',
      }),
      'Unexpected home page heading',
    );

    await homePage.requestPizza();
    ensure(
      check(await homePage.getRecommendationText(), {
        'pizza recommendation is visible': (value) =>
          value.includes('Our recommendation:'),
      }),
      'No pizza recommendation rendered',
    );

    await homePage.ratePizzaFiveStars();
    ensure(
      check(await homePage.getRateResultText(), {
        'pizza rating confirmation is visible': (value) => value === 'Rated!',
      }),
      'Pizza rating confirmation missing',
    );

    await homePage.openProfile();

    const ratingsPage = new RatingsPage(page);
    await ratingsPage.waitForLoaded();
    ensure(
      check(await ratingsPage.getRatingsText(), {
        'profile contains the five-star rating': (value) =>
          value.includes('stars=5'),
      }),
      'Five-star rating was not visible in the profile',
    );

    await ratingsPage.clearRatings();
    ensure(
      check(await ratingsPage.getRatingsText(), {
        'profile shows empty ratings after cleanup': (value) =>
          value.includes('No ratings yet'),
      }),
      'Ratings cleanup did not complete',
    );

    await ratingsPage.logout();
    success = true;
  } finally {
    journeyDuration.add(Date.now() - startedAt, metricTags);
    journeySuccessRate.add(success, metricTags);
  }
}

function ensure(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
