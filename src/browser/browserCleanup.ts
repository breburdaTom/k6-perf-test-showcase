import type { UserCredentials } from '../utils/testData.ts';

interface StatusResponse {
  status: number;
}

export interface BrowserCleanupClient {
  clearRatings(): StatusResponse;
  login(credentials: UserCredentials): StatusResponse;
  logout(): StatusResponse;
}

export function cleanupBrowserJourneyState(
  client: BrowserCleanupClient,
  credentials: UserCredentials,
): void {
  try {
    const loginResponse = client.login(credentials);

    if (loginResponse.status !== 200) {
      return;
    }
  } catch {
    return;
  }

  try {
    client.clearRatings();
  } catch {
    // Best-effort cleanup only.
  }

  try {
    client.logout();
  } catch {
    // Best-effort cleanup only.
  }
}
