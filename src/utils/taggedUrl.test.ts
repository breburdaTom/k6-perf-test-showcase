import { describe, expect, it } from 'vitest';

import { createTaggedDeleteRatingRequest } from './taggedUrl.ts';

describe('createTaggedDeleteRatingRequest', () => {
  it('keeps dynamic rating ids out of the request name tag', () => {
    expect(
      createTaggedDeleteRatingRequest(
        'https://quickpizza.grafana.com',
        31533,
      ),
    ).toEqual({
      params: {
        tags: {
          name: 'DELETE /api/ratings/{id}',
        },
      },
      url: 'https://quickpizza.grafana.com/api/ratings/31533',
    });
  });
});
