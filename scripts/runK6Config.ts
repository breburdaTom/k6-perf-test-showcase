import { createRuntimeConfig, type ApiTestProfile } from '../src/config/env.ts';

export type RunSuite = 'api' | 'browser';
export type RunProfile = 'smoke' | 'load';

export interface RunTarget {
  defaultSummaryLabel: string;
  profile: RunProfile;
  scriptPath: string;
  suite: RunSuite;
  testProfile: ApiTestProfile;
}

export const RUN_USAGE =
  'Usage: pnpm exec tsx ./scripts/run-k6.ts api <smoke|load> | browser <smoke>';

export function resolveRunTarget(args: readonly string[]): RunTarget {
  const [suite, profile] = args;

  if (suite !== 'api' && suite !== 'browser') {
    throw new Error(`Unsupported suite "${suite ?? ''}"`);
  }

  if (suite === 'api') {
    if (profile !== 'smoke' && profile !== 'load') {
      throw new Error(`Unsupported profile "${profile ?? ''}" for suite "api"`);
    }

    return {
      defaultSummaryLabel: profile,
      profile,
      scriptPath: 'src/scenarios/api/quickpizza-api.test.ts',
      suite,
      testProfile: profile,
    };
  }

  if (profile !== 'smoke') {
    throw new Error(`Unsupported profile "${profile ?? ''}" for suite "browser"`);
  }

  return {
    defaultSummaryLabel: 'browser',
    profile,
    scriptPath: 'src/scenarios/browser/quickpizza-browser.test.ts',
    suite,
    testProfile: 'smoke',
  };
}

export function buildRunEnvironment(
  environment: NodeJS.ProcessEnv,
  target: RunTarget,
): NodeJS.ProcessEnv {
  const runtimeConfig = createRuntimeConfig({
    ...environment,
    SUMMARY_LABEL: environment.SUMMARY_LABEL?.trim() || target.defaultSummaryLabel,
    TEST_PROFILE: target.testProfile,
  });

  return {
    ...environment,
    K6_BROWSER_HEADLESS: normalizeBrowserHeadless(runtimeConfig.browserHeadless),
    RESULTS_DIR: runtimeConfig.resultsDir,
    SUMMARY_LABEL: runtimeConfig.summaryLabel,
    TEST_PROFILE: runtimeConfig.testProfile,
  };
}

export function normalizeBrowserHeadless(browserHeadless: boolean): string {
  return browserHeadless ? 'true' : 'false';
}
