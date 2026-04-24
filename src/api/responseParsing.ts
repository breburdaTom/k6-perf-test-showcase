export interface JsonResponseLike {
  json: () => unknown;
}

export function tryParseJson(response: JsonResponseLike): unknown | undefined {
  try {
    return response.json();
  } catch {
    return undefined;
  }
}
