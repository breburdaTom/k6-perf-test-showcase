import { check } from 'k6';
import { browser } from 'k6/browser';

import { QuickPizzaClient } from '../../api/quickPizzaClient.ts';
import { runBrowserJourney } from '../../browser/browserJourney.ts';
import { cleanupBrowserJourneyState } from '../../browser/browserCleanup.ts';
import { createRuntimeConfig } from '../../config/env.ts';
import { buildBrowserOptions } from '../../config/scenarios.ts';
import { createSummaryReport } from '../../reporting/summary.ts';
import {
  createUserCredentials,
  type UserCredentials,
} from '../../utils/testData.ts';

interface BrowserSetupData {
  credentials: UserCredentials;
}

const runtimeConfig = createRuntimeConfig(__ENV);

export const options = buildBrowserOptions();

export function setup(): BrowserSetupData {
  const credentials = createUserCredentials(`browser-${Date.now()}`);
  const client = new QuickPizzaClient(runtimeConfig.baseUrl);
  const response = client.registerUser(credentials);

  if (
    !check(response, {
      'browser setup user registration returns 201': (res) => res.status === 201,
    })
  ) {
    throw new Error('Unable to create browser test user');
  }

  return { credentials };
}

export default async function (data: BrowserSetupData): Promise<void> {
  const client = new QuickPizzaClient(runtimeConfig.baseUrl);
  const page = await browser.newPage();
  let completed = false;

  try {
    await runBrowserJourney(page, runtimeConfig.baseUrl, data.credentials);
    completed = true;
  } finally {
    try {
      await page.close();
    } finally {
      if (!completed) {
        cleanupBrowserJourneyState(client, data.credentials);
      }
    }
  }
}

export function handleSummary(data: unknown): Record<string, string> {
  return createSummaryReport(
    data,
    runtimeConfig.resultsDir,
    runtimeConfig.summaryLabel,
  );
}
