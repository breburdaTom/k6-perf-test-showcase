import { describe, expect, it } from 'vitest';

import { createRuntimeConfig } from './env.ts';

describe('createRuntimeConfig', () => {
  it('falls back to the public quickpizza target', () => {
    expect(createRuntimeConfig({})).toEqual({
      baseUrl: 'https://quickpizza.grafana.com',
      browserHeadless: true,
      resultsDir: 'results',
      summaryLabel: 'smoke',
      testProfile: 'smoke',
    });
  });

  it('respects explicit overrides', () => {
    expect(
      createRuntimeConfig({
        BASE_URL: 'https://example.test',
        BROWSER_HEADLESS: 'false',
        RESULTS_DIR: 'artifacts',
        SUMMARY_LABEL: 'browser',
        TEST_PROFILE: 'load',
      }),
    ).toEqual({
      baseUrl: 'https://example.test',
      browserHeadless: false,
      resultsDir: 'artifacts',
      summaryLabel: 'browser',
      testProfile: 'load',
    });
  });

  it('fails fast on invalid test profiles', () => {
    expect(() =>
      createRuntimeConfig({
        TEST_PROFILE: 'chaos',
      }),
    ).toThrow('Unsupported TEST_PROFILE');
  });
});
