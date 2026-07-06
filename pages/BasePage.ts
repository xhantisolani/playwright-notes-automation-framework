import type { Locator, Page } from '@playwright/test';
import { env } from '../utils/env';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected appUrl(path = ''): string {
    const base = env.uiBaseUrl.endsWith('/') ? env.uiBaseUrl : `${env.uiBaseUrl}/`;
    return new URL(path.replace(/^\//, ''), base).toString();
  }

  async open(path = ''): Promise<void> {
    await this.page.goto(this.appUrl(path));
  }
}
