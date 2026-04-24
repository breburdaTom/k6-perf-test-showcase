export interface UserCredentials {
  password: string;
  username: string;
}

const DEFAULT_PASSWORD = '12345678';

export function createUserCredentials(
  seed: string,
  runId?: string,
): UserCredentials {
  const sanitizedSeed = sanitizeSegment(seed, 20);
  const sanitizedRunId = runId ? sanitizeSegment(runId, 12) : '';
  const usernameSegments = ['codex', 'qp'];

  if (sanitizedRunId) {
    usernameSegments.push(sanitizedRunId);
  }

  usernameSegments.push(sanitizedSeed);

  return {
    password: DEFAULT_PASSWORD,
    username: usernameSegments.join('-'),
  };
}

function sanitizeSegment(value: string, maxLength: number): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}
