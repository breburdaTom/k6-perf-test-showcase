import type { Locator, Page } from 'k6/browser';

import type { UserCredentials } from '../../utils/testData.ts';

export class LoginPage {
  private readonly backToMainPageLink: Locator;

  private readonly csrfTokenInput: Locator;

  private readonly passwordInput: Locator;

  private readonly ratingsHeading: Locator;

  private readonly submitButton: Locator;

  private readonly usernameInput: Locator;

  constructor(private readonly page: Page) {
    this.backToMainPageLink = page.getByRole('link', {
      name: 'Back to main page',
    });
    this.csrfTokenInput = page.locator('#csrf-token');
    this.passwordInput = page.locator('#password');
    this.ratingsHeading = page.getByRole('heading', {
      name: 'Your Pizza Ratings:',
    });
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.usernameInput = page.locator('#username');
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
  }

  async login(credentials: UserCredentials): Promise<void> {
    await this.csrfTokenInput.waitFor();
    await this.page.waitForFunction(() => {
      const tokenInput = document.querySelector('#csrf-token');

      return (
        tokenInput instanceof HTMLInputElement &&
        tokenInput.value.length > 0
      );
    });
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
    await this.ratingsHeading.waitFor();
  }

  async goBackToMainPage(): Promise<void> {
    await this.backToMainPageLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isProfileLoaded(): Promise<boolean> {
    return this.ratingsHeading.isVisible();
  }
}
