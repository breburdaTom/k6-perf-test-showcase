import { describe, expect, it } from 'vitest';

import { tryParseJson } from './responseParsing.ts';

describe('tryParseJson', () => {
  it('returns parsed data when response json is valid', () => {
    const response = {
      json: () => ({ token: 'abc123' }),
    };

    expect(tryParseJson(response)).toEqual({ token: 'abc123' });
  });

  it('returns undefined instead of throwing when response json parsing fails', () => {
    const response = {
      json: () => {
        throw new Error('invalid json');
      },
    };

    expect(() => tryParseJson(response)).not.toThrow();
    expect(tryParseJson(response)).toBeUndefined();
  });
});
