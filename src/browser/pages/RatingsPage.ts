import type { Locator, Page } from 'k6/browser';

export class RatingsPage {
  private readonly clearRatingsButton: Locator;

  private readonly heading: Locator;

  private readonly logoutButton: Locator;

  private readonly ratingsList: Locator;

  private readonly siteHeading: Locator;

  constructor(private readonly page: Page) {
    this.clearRatingsButton = page.getByRole('button', {
      name: 'Clear Ratings',
    });
    this.heading = page.getByRole('heading', { name: 'Your Pizza Ratings:' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.ratingsList = page.locator('ul');
    this.siteHeading = page.getByRole('heading', {
      name: 'Looking to break out of your pizza routine?',
    });
  }

  async clearRatings(): Promise<void> {
    await this.clearRatingsButton.click();
    await this.page.waitForFunction(() => {
      const ratingsList = document.querySelector('ul');

      return ratingsList?.textContent?.includes('No ratings yet') ?? false;
    });
  }

  async getRatingsText(): Promise<string> {
    return (await this.ratingsList.textContent()) ?? '';
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.siteHeading.waitFor();
  }

  async waitForLoaded(): Promise<void> {
    await this.heading.waitFor();
  }
}
