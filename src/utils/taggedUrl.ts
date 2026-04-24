export interface TaggedRequest {
  params: {
    tags: {
      name: string;
    };
  };
  url: string;
}

export function createTaggedDeleteRatingRequest(
  baseUrl: string,
  ratingId: number,
): TaggedRequest {
  return {
    params: {
      tags: {
        name: 'DELETE /api/ratings/{id}',
      },
    },
    url: `${baseUrl}/api/ratings/${ratingId}`,
  };
}
