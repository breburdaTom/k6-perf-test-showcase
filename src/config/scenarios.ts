import type { Options } from 'k6/options';

import {
  createApiThresholds,
  createBrowserThresholds,
} from '../metrics/thresholdPresets.ts';

export function buildApiOptions(profile: 'smoke' | 'load'): Options {
  if (profile === 'smoke') {
    return {
      scenarios: {
        smoke: {
          executor: 'per-vu-iterations',
          exec: 'default',
          gracefulStop: '10s',
          iterations: 1,
          maxDuration: '1m',
          tags: {
            journey: 'pizza_rating',
            test_type: 'smoke',
          },
          vus: 3,
        },
      },
      thresholds: createApiThresholds('smoke'),
    };
  }

  return {
    scenarios: {
      load: {
        executor: 'ramping-vus',
        exec: 'loadScenario',
        gracefulRampDown: '10s',
        gracefulStop: '15s',
        stages: [
          { duration: '30s', target: 5 },
          { duration: '1m', target: 10 },
          { duration: '90s', target: 20 },
          { duration: '30s', target: 0 },
        ],
        tags: {
          journey: 'pizza_rating',
          test_type: 'load',
        },
        startVUs: 1,
      },
    },
    thresholds: createApiThresholds('load'),
  };
}

export function buildBrowserOptions(): Options {
  return {
    scenarios: {
      browser: {
        executor: 'shared-iterations',
        exec: 'default',
        iterations: 1,
        options: {
          browser: {
            type: 'chromium',
          },
        },
        tags: {
          journey: 'pizza_rating',
          test_type: 'browser',
        },
        vus: 1,
      },
    },
    thresholds: createBrowserThresholds(),
  };
}
