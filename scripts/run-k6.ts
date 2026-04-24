import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const [suite, profile] = process.argv.slice(2);

const validSuites = new Set(['api', 'browser']);
const validProfiles = new Set(['smoke', 'load']);

if (!validSuites.has(suite ?? '')) {
  printUsage(`Unsupported suite "${suite ?? ''}"`);
}

if (!validProfiles.has(profile ?? '')) {
  printUsage(`Unsupported profile "${profile ?? ''}"`);
}

const resultsDir = process.env.RESULTS_DIR?.trim() || 'results';
const summaryLabel =
  process.env.SUMMARY_LABEL?.trim() || (suite === 'browser' ? 'browser' : profile);
const scriptPath =
  suite === 'browser'
    ? 'src/scenarios/browser/quickpizza-browser.test.ts'
    : 'src/scenarios/api/quickpizza-api.test.ts';

const browserExecutablePath =
  process.env.K6_BROWSER_EXECUTABLE_PATH || resolveBrowserExecutablePath();
const environment: NodeJS.ProcessEnv = {
  ...process.env,
  K6_BROWSER_HEADLESS: normalizeBrowserHeadless(process.env.BROWSER_HEADLESS),
  RESULTS_DIR: resultsDir,
  SUMMARY_LABEL: summaryLabel,
  TEST_PROFILE: suite === 'api' ? profile : process.env.TEST_PROFILE || 'smoke',
};

if (browserExecutablePath) {
  environment.K6_BROWSER_EXECUTABLE_PATH = browserExecutablePath;
}

mkdirSync(resultsDir, { recursive: true });

const rawOutputPath = join(resultsDir, `${summaryLabel}-raw.json`);
const k6Binary = resolveK6Binary();
const result = spawnSync(
  k6Binary,
  ['run', '--out', `json=${rawOutputPath}`, scriptPath],
  {
    env: environment,
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

function normalizeBrowserHeadless(rawValue: string | undefined): string {
  return rawValue === 'false' ? 'false' : 'true';
}

function printUsage(message: string): never {
  console.error(message);
  console.error('Usage: pnpm exec tsx ./scripts/run-k6.ts <api|browser> <smoke|load>');
  process.exit(1);
}

function resolveK6Binary(): string {
  if (process.env.K6_BIN?.trim()) {
    return process.env.K6_BIN.trim();
  }

  const lookup = spawnSync('k6', ['version'], {
    stdio: 'ignore',
  });

  if (lookup.status === 0) {
    return 'k6';
  }

  console.error('Unable to find the k6 binary on PATH.');
  console.error(
    'Install k6 locally or set K6_BIN to an explicit binary path before running pnpm test.',
  );
  process.exit(1);
}

function resolveBrowserExecutablePath(): string {
  if (process.platform === 'darwin') {
    const chromePath =
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

    if (existsSync(chromePath)) {
      return chromePath;
    }
  }

  return '';
}
