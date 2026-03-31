import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';
import { generateTotp } from '../utils/otp';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(ENV.baseUrl);
    await this.waitForPageLoad();
  }

  async loginWithOtp(username: string, password: string, otpSecret: string): Promise<void> {
    const base = ENV.baseUrl.replace(/\/$/, '');
    const secret = otpSecret.replace(/\s+/g, '');

    // Step 1: email
    await this.page.goto(`${base}/login`);
    const emailInput = this.page.getByPlaceholder('Enter your email');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(username);
    await this.page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: password
    const passwordInput = this.page.locator('input[type="password"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);
    await this.page.getByRole('button', { name: /log in|sign in/i }).first().click();

    // Step 3: drive through all post-password screens until we reach an authenticated CRM page
    let attempts = 0;
    while (attempts++ < 10) {
      const url = this.page.url();

      if (/\/contacts\/\d+\//.test(url) || /\/home-beta/.test(url)) {
        break; // successfully in the portal
      }

      if (url.includes('/two-factor')) {
        // OTP screen
        const codeInput = this.page.getByPlaceholder('Enter 6-digit code').or(this.page.getByLabel('Code'));
        await codeInput.waitFor({ state: 'visible' });
        await codeInput.fill(generateTotp(secret));
        await this.page.getByRole('button', { name: 'Continue' }).click();
        // "Remember this device?" dialog may appear on the same page before navigation
        const askBtn = this.page.getByRole('button', { name: 'Ask every time' });
        if (await askBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await askBtn.click();
        }
        await this.page.waitForURL(
          (u) => !u.pathname.includes('/two-factor'),
          { timeout: 30_000 },
        );
        continue;
      }

      if (url.includes('/user-preferences')) {
        // Passkey nudge — dismiss and proceed
        const nudgeMatch = url.match(/setupPasskeyFromNudge=([^&]+)/);
        const postLoginUrl = nudgeMatch ? decodeURIComponent(nudgeMatch[1]) : null;
        const skipBtn = this.page.getByRole('button', { name: 'Skip for now' });
        if (await skipBtn.isVisible({ timeout: 10_000 }).catch(() => false)) {
          await skipBtn.click();
          if (postLoginUrl) {
            await this.page.goto(postLoginUrl);
          } else {
            await this.page.waitForURL(
              (u) => !u.pathname.includes('/user-preferences'),
              { timeout: 30_000 },
            ).catch(() => {});
          }
        }
        continue;
      }

      if (url.includes('Ask every time') || this.page.getByRole('button', { name: 'Ask every time' })) {
        const askBtn = this.page.getByRole('button', { name: 'Ask every time' });
        if (await askBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await askBtn.click();
          continue;
        }
      }

      // Wait briefly for navigation to settle
      await this.page.waitForURL(
        (u) =>
          u.pathname.includes('/two-factor') ||
          u.pathname.includes('/user-preferences') ||
          /\/contacts\/\d+\//.test(u.pathname) ||
          /\/home-beta/.test(u.pathname),
        { timeout: 15_000 },
      ).catch(() => {});
    }

    await this.waitForPageLoad();
  }
}
