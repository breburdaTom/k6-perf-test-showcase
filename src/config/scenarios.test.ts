import { describe, expect, it } from 'vitest';

import {
  buildApiOptions,
  buildBrowserOptions,
} from './scenarios.ts';

describe('buildApiOptions', () => {
  it('builds smoke thresholds and only the smoke scenario', () => {
    const options = buildApiOptions('smoke');

    expect(Object.keys(options.scenarios ?? {})).toEqual(['smoke']);
    expect(options.thresholds).toMatchObject({
      'http_req_duration{scenario:smoke}': ['p(95)<1000'],
      'http_req_failed{scenario:smoke}': ['rate<0.01'],
      'checks{scenario:smoke}': ['rate>0.99'],
      'journey_success_rate{scenario:smoke}': ['rate>0.99'],
    });
  });

  it('builds load thresholds and only the load scenario', () => {
    const options = buildApiOptions('load');

    expect(Object.keys(options.scenarios ?? {})).toEqual(['load']);
    expect(options.thresholds).toMatchObject({
      'http_req_duration{scenario:load}': ['p(95)<1500'],
      'http_req_failed{scenario:load}': ['rate<0.01'],
      'checks{scenario:load}': ['rate>0.99'],
      'journey_success_rate{scenario:load}': ['rate>0.99'],
    });
  });
});

describe('buildBrowserOptions', () => {
  it('builds a single browser scenario with frontend thresholds', () => {
    const options = buildBrowserOptions();

    expect(Object.keys(options.scenarios ?? {})).toEqual(['browser']);
    expect(options.thresholds).toMatchObject({
      'browser_http_req_failed{scenario:browser}': ['rate<0.01'],
      'browser_web_vital_lcp{scenario:browser}': ['p(95)<4000'],
      'checks{scenario:browser}': ['rate>0.95'],
    });
  });
});
