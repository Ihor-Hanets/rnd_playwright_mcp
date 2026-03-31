import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';
import { generateTotp } from '../utils/otp';

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/state.json');
const AUTH_LOCK = path.resolve(__dirname, '../playwright/.auth/state.lock');
const AUTH_MAX_AGE_MS = 23 * 60 * 60 * 1000;

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(ENV.baseUrl);
    await this.waitForPageLoad();
  }

  async loginWithOtp(username: string, password: string, otpSecret: string): Promise<void> {
    // Check if a fresh auth state is cached from a previous login in this run
    if (this.isCachedAuthFresh()) {
      await this.applyAuthState();
      return;
    }

    // Only one worker should perform the full login; others wait for the auth file
    const acquiredLock = this.acquireLock();
    if (!acquiredLock) {
      await this.waitForAuthFile();
      await this.applyAuthState();
      return;
    }

    try {
      await this.performFullLogin(username, password, otpSecret);
      fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
      await this.page.context().storageState({ path: AUTH_FILE });
    } finally {
      this.releaseLock();
    }
  }

  private isCachedAuthFresh(): boolean {
    if (!fs.existsSync(AUTH_FILE)) return false;
    const age = Date.now() - fs.statSync(AUTH_FILE).mtimeMs;
    return age < AUTH_MAX_AGE_MS;
  }

  private acquireLock(): boolean {
    // Clean up stale locks older than 3 minutes
    if (fs.existsSync(AUTH_LOCK)) {
      try {
        const age = Date.now() - fs.statSync(AUTH_LOCK).mtimeMs;
        if (age > 3 * 60 * 1000) fs.unlinkSync(AUTH_LOCK);
      } catch {
        // Ignore
      }
    }
    try {
      fs.mkdirSync(path.dirname(AUTH_LOCK), { recursive: true });
      // Exclusive creation: fails if file already exists
      fs.writeFileSync(AUTH_LOCK, String(process.pid), { flag: 'wx' });
      return true;
    } catch {
      return false;
    }
  }

  private releaseLock(): void {
    try {
      fs.unlinkSync(AUTH_LOCK);
    } catch {
      // Ignore errors — lock may have been cleaned up already
    }
  }

  private async waitForAuthFile(): Promise<void> {
    const deadline = Date.now() + 90_000; // wait up to 90 seconds
    while (Date.now() < deadline) {
      if (fs.existsSync(AUTH_FILE)) return;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Timed out waiting for another worker to complete login');
  }

  private async applyAuthState(): Promise<void> {
    const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
    const state = JSON.parse(raw) as { cookies: Cookie[] };
    await this.page.context().addCookies(state.cookies);
    await this.page.goto(ENV.baseUrl);
    await this.waitForPageLoad();
  }

  private async performFullLogin(username: string, password: string, otpSecret: string): Promise<void> {
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
        const codeInput = this.page.getByPlaceholder('Enter 6-digit code').or(this.page.getByLabel('Code'));
        await codeInput.waitFor({ state: 'visible' });

        // Retry OTP up to 4 times to handle code expiry (window edge cases)
        for (let otpAttempt = 0; otpAttempt < 4; otpAttempt++) {
          await codeInput.fill('');
          await codeInput.fill(generateTotp(secret));
          await this.page.getByRole('button', { name: 'Continue' }).click();

          const isInvalid = await this.page
            .getByText(/invalid code/i)
            .waitFor({ state: 'visible', timeout: 6_000 })
            .then(() => true)
            .catch(() => false);

          if (!isInvalid) break;

          // Wait for the TOTP window to rotate
          const remaining = 30 - (Math.floor(Date.now() / 1000) % 30) + 1;
          await this.page.waitForTimeout(remaining * 1000);
        }

        const askBtn = this.page.getByRole('button', { name: 'Ask every time' });
        if (await askBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await askBtn.click();
        }
        await this.page.waitForURL(
          (u) => !u.pathname.includes('/two-factor'),
          { timeout: 60_000 },
        );
        continue;
      }

      if (url.includes('/user-preferences')) {
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

      const askBtn = this.page.getByRole('button', { name: 'Ask every time' });
      if (await askBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await askBtn.click();
        continue;
      }

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
