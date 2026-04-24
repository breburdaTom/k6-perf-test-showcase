import { describe, expect, it } from 'vitest';

import { buildRunEnvironment, resolveRunTarget } from './runK6Config.ts';

describe('resolveRunTarget', () => {
  it('accepts api smoke and load profiles', () => {
    expect(resolveRunTarget(['api', 'smoke'])).toMatchObject({
      profile: 'smoke',
      scriptPath: 'src/scenarios/api/quickpizza-api.test.ts',
      suite: 'api',
    });
    expect(resolveRunTarget(['api', 'load'])).toMatchObject({
      profile: 'load',
      scriptPath: 'src/scenarios/api/quickpizza-api.test.ts',
      suite: 'api',
    });
  });

  it('accepts browser smoke', () => {
    expect(resolveRunTarget(['browser', 'smoke'])).toMatchObject({
      profile: 'smoke',
      scriptPath: 'src/scenarios/browser/quickpizza-browser.test.ts',
      suite: 'browser',
    });
  });

  it('rejects browser load with a suite-specific error', () => {
    expect(() => resolveRunTarget(['browser', 'load'])).toThrow(
      'Unsupported profile "load" for suite "browser"',
    );
  });
});

describe('buildRunEnvironment', () => {
  it('normalizes browser config from runtime settings', () => {
    const environment = buildRunEnvironment(
      {
        BROWSER_HEADLESS: 'false',
        RESULTS_DIR: 'artifacts',
      },
      resolveRunTarget(['browser', 'smoke']),
    );

    expect(environment).toMatchObject({
      K6_BROWSER_HEADLESS: 'false',
      RESULTS_DIR: 'artifacts',
      SUMMARY_LABEL: 'browser',
      TEST_PROFILE: 'smoke',
    });
  });
});
