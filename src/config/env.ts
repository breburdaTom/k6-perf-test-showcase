export type ApiTestProfile = 'smoke' | 'load';

export interface RuntimeConfig {
  baseUrl: string;
  browserHeadless: boolean;
  resultsDir: string;
  summaryLabel: string;
  testProfile: ApiTestProfile;
}

export type RuntimeEnv = Record<string, string | undefined>;

const DEFAULT_BASE_URL = 'https://quickpizza.grafana.com';
const DEFAULT_RESULTS_DIR = 'results';
const DEFAULT_SUMMARY_LABEL = 'smoke';

export function createRuntimeConfig(env: RuntimeEnv): RuntimeConfig {
  const testProfile = parseTestProfile(env.TEST_PROFILE);

  return {
    baseUrl: env.BASE_URL?.trim() || DEFAULT_BASE_URL,
    browserHeadless: parseBoolean(env.BROWSER_HEADLESS, true),
    resultsDir: env.RESULTS_DIR?.trim() || DEFAULT_RESULTS_DIR,
    summaryLabel: env.SUMMARY_LABEL?.trim() || DEFAULT_SUMMARY_LABEL,
    testProfile,
  };
}

function parseTestProfile(rawProfile: string | undefined): ApiTestProfile {
  if (rawProfile === undefined || rawProfile === '') {
    return 'smoke';
  }

  if (rawProfile === 'smoke' || rawProfile === 'load') {
    return rawProfile;
  }

  throw new Error(`Unsupported TEST_PROFILE: ${rawProfile}`);
}

function parseBoolean(
  rawValue: string | undefined,
  defaultValue: boolean,
): boolean {
  if (rawValue === undefined || rawValue === '') {
    return defaultValue;
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error(`Unsupported boolean value: ${rawValue}`);
}
