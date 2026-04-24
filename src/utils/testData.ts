export interface UserCredentials {
  password: string;
  username: string;
}

const DEFAULT_PASSWORD = '12345678';

export function createUserCredentials(seed: string): UserCredentials {
  const sanitizedSeed = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);

  return {
    password: DEFAULT_PASSWORD,
    username: `codex-qp-${sanitizedSeed}`,
  };
}
