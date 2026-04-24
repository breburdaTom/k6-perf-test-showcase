import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

export function createSummaryReport(
  data: unknown,
  resultsDir: string,
  summaryLabel: string,
): Record<string, string> {
  return {
    [`${resultsDir}/${summaryLabel}-summary.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, {
      enableColors: true,
      indent: ' ',
    }),
  };
}
