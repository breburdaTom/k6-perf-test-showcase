import type { Locator, Page } from 'k6/browser';

export class HomePage {
  private readonly heading: Locator;

  private readonly loveItButton: Locator;

  private readonly pizzaPleaseButton: Locator;

  private readonly profileLink: Locator;

  private readonly rateResult: Locator;

  private readonly recommendations: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1');
    this.loveItButton = page.getByRole('button', { name: 'Love it!' });
    this.pizzaPleaseButton = page.getByRole('button', {
      name: 'Pizza, Please!',
    });
    this.profileLink = page.getByRole('link', { name: 'Profile' });
    this.rateResult = page.locator('#rate-result');
    this.recommendations = page.locator('#recommendations');
  }

  async getHeadingText(): Promise<string> {
    return (await this.heading.textContent()) ?? '';
  }

  async getRateResultText(): Promise<string> {
    return (await this.rateResult.textContent()) ?? '';
  }

  async getRecommendationText(): Promise<string> {
    return (await this.recommendations.textContent()) ?? '';
  }

  async openProfile(): Promise<void> {
    await this.profileLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async ratePizzaFiveStars(): Promise<void> {
    await this.loveItButton.click();
    await this.rateResult.waitFor();
  }

  async requestPizza(): Promise<void> {
    await this.pizzaPleaseButton.click();
    await this.recommendations.waitFor();
  }
}
