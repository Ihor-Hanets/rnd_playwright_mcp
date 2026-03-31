import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env'), override: true });

const AUTH_FILE = 'playwright/.auth/user.json';

async function globalSetup(): Promise<void> {
  await mkdir('playwright/.auth', { recursive: true });

  const signinUrl = process.env.SIGNIN_URL ?? 'https://accounts.zoho.eu/signin?servicename=ZohoCRM';
  const username = process.env.USERNAME ?? '';
  const password = process.env.PASSWORD ?? '';

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(signinUrl);
  await page.getByRole('textbox', { name: 'Email address or mobile number' }).fill(username);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(password);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const skipButton = page.getByRole('button', { name: 'Пропустити зараз' });
  await skipButton.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  if (await skipButton.isVisible()) {
    await skipButton.click();
  }

  await page.waitForURL(/crm\.zoho\.eu/, { timeout: 30_000 });
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();
}

export default globalSetup;
