import { describe, expect, it } from 'vitest';

import { cleanupBrowserJourneyState } from './browserCleanup.ts';

describe('cleanupBrowserJourneyState', () => {
  it('logs in, clears ratings, and logs out when login succeeds', () => {
    const calls: string[] = [];
    const client = {
      clearRatings: () => {
        calls.push('clearRatings');
        return { status: 204 };
      },
      login: () => {
        calls.push('login');
        return { status: 200 };
      },
      logout: () => {
        calls.push('logout');
        return { status: 200 };
      },
    };

    cleanupBrowserJourneyState(client, {
      password: '12345678',
      username: 'codex-qp-browser',
    });

    expect(calls).toEqual(['login', 'clearRatings', 'logout']);
  });

  it('stops cleanup when login fails', () => {
    const calls: string[] = [];
    const client = {
      clearRatings: () => {
        calls.push('clearRatings');
        return { status: 204 };
      },
      login: () => {
        calls.push('login');
        return { status: 401 };
      },
      logout: () => {
        calls.push('logout');
        return { status: 200 };
      },
    };

    cleanupBrowserJourneyState(client, {
      password: '12345678',
      username: 'codex-qp-browser',
    });

    expect(calls).toEqual(['login']);
  });
});
