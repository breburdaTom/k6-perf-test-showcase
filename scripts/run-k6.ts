import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import {
  buildRunEnvironment,
  resolveRunTarget,
  RUN_USAGE,
} from './runK6Config.ts';

const browserExecutablePath =
  process.env.K6_BROWSER_EXECUTABLE_PATH || resolveBrowserExecutablePath();

const runTarget = resolveTargetOrExit(process.argv.slice(2));
const environment = buildRunEnvironment(process.env, runTarget);
const resultsDir = environment.RESULTS_DIR ?? 'results';
const summaryLabel = environment.SUMMARY_LABEL ?? runTarget.defaultSummaryLabel;

if (browserExecutablePath) {
  environment.K6_BROWSER_EXECUTABLE_PATH = browserExecutablePath;
}

mkdirSync(resultsDir, { recursive: true });

const rawOutputPath = join(resultsDir, `${summaryLabel}-raw.json`);
const k6Binary = resolveK6Binary();
const result = spawnSync(
  k6Binary,
  ['run', '--out', `json=${rawOutputPath}`, runTarget.scriptPath],
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

function printUsage(message: string): never {
  console.error(message);
  console.error(RUN_USAGE);
  process.exit(1);
}

function resolveTargetOrExit(args: readonly string[]) {
  try {
    return resolveRunTarget(args);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to resolve k6 run target.';

    return printUsage(message);
  }
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
