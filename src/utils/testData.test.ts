import { describe, expect, it } from 'vitest';

import { createUserCredentials } from './testData.ts';

describe('createUserCredentials', () => {
  it('builds a deterministic username from the supplied seed', () => {
    expect(createUserCredentials('vu1-it2')).toEqual({
      password: '12345678',
      username: 'codex-qp-vu1-it2',
    });
  });

  it('normalizes unsupported characters', () => {
    expect(createUserCredentials('VU 1 / Iteration 2').username).toBe(
      'codex-qp-vu-1-iteration-2',
    );
  });
});
