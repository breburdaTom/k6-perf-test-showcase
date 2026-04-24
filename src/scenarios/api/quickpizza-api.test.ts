import { createRuntimeConfig } from '../../config/env.ts';
import { buildApiOptions } from '../../config/scenarios.ts';
import { runApiPizzaJourney } from '../../flows/pizzaJourney.ts';
import { createSummaryReport } from '../../reporting/summary.ts';

const runtimeConfig = createRuntimeConfig(__ENV);

export const options = buildApiOptions(runtimeConfig.testProfile);

export default function (): void {
  runApiPizzaJourney(runtimeConfig.baseUrl, 'smoke');
}

export function loadScenario(): void {
  runApiPizzaJourney(runtimeConfig.baseUrl, 'load');
}

export function handleSummary(data: unknown): Record<string, string> {
  return createSummaryReport(
    data,
    runtimeConfig.resultsDir,
    runtimeConfig.summaryLabel,
  );
}
