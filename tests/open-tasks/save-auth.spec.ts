/**
 * Run this test ONCE to create the authentication state file.
 * After successful run, all other tests will reuse the saved session.
 * Usage: Run only this test with chromium project before running other specs.
 */
import { test } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { ENV } from '../../utils/env';

const AUTH_FILE = 'playwright/.auth/user.json';

test.describe.configure({ mode: 'serial' });

test('save authentication state', async ({ page }) => {
  await mkdir('playwright/.auth', { recursive: true });

  await page.goto(ENV.signinUrl);

  if (page.url().includes('accounts.zoho.eu') && page.url().includes('/signin')) {
    await page.getByRole('textbox', { name: 'Email address or mobile number' }).fill(ENV.username);
    await page.getByRole('textbox', { name: 'Enter password' }).fill(ENV.password);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }

  const skipButton = page.getByRole('button', { name: 'Пропустити зараз' });
  await skipButton.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  if (await skipButton.isVisible()) await skipButton.click();

  await page.waitForURL(/crm\.zoho\.eu/, { timeout: 60_000 });
  await page.context().storageState({ path: AUTH_FILE });
});
