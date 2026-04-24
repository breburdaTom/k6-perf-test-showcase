import type { Options } from 'k6/options';

export function createApiThresholds(
  profile: 'smoke' | 'load',
): NonNullable<Options['thresholds']> {
  const latencyBudget = profile === 'smoke' ? 1000 : 1500;

  return {
    [`http_req_failed{scenario:${profile}}`]: ['rate<0.01'],
    [`checks{scenario:${profile}}`]: ['rate>0.99'],
    [`journey_success_rate{scenario:${profile}}`]: ['rate>0.99'],
    [`http_req_duration{scenario:${profile}}`]: [`p(95)<${latencyBudget}`],
  };
}

export function createBrowserThresholds(): NonNullable<Options['thresholds']> {
  return {
    'browser_http_req_failed{scenario:browser}': ['rate<0.01'],
    'browser_web_vital_lcp{scenario:browser}': ['p(95)<4000'],
    'checks{scenario:browser}': ['rate>0.95'],
  };
}
