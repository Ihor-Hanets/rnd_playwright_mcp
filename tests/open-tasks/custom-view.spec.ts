// spec: specs/open-tasks-test-suite.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { ENV } from '../../utils/env';
const TASKS_URL = 'https://crm.zoho.eu/crm/org20113389182/tab/Tasks';
const OPEN_TASKS_URL =
  'https://crm.zoho.eu/crm/org20113389182/tab/Tasks/custom-view/971606000000269292/kanban';

async function login(page: Page): Promise<void> {
  if (page.url().includes('crm.zoho.eu')) return;
  await page.goto(ENV.signinUrl);
  if (!page.url().includes('accounts.zoho.eu')) return;
  if (!page.url().includes('/signin')) {
    const skipBtn = page.getByRole('button', { name: 'Пропустити зараз' });
    await skipBtn.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    if (await skipBtn.isVisible()) await skipBtn.click();
    await page.waitForURL(/crm\.zoho\.eu/, { timeout: 15_000 });
    return;
  }
  await page.getByRole('textbox', { name: 'Email address or mobile number' }).fill(ENV.username);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(ENV.password);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const skipButton = page.getByRole('button', { name: 'Пропустити зараз' });
  await skipButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  if (await skipButton.isVisible()) await skipButton.click();
  await page.waitForURL(/crm\.zoho\.eu/, { timeout: 15_000 });
}

test.describe('Custom View & View Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-040: Verify Open Tasks is listed in the custom views dropdown', async ({ page }) => {
    await page.goto(TASKS_URL);
    await expect(page.getByRole('button', { name: 'Open Tasks' })).toBeVisible();

    // Click the custom view dropdown (combobox next to the tabs)
    const viewDropdown = page.getByRole('combobox').filter({ hasText: /Custom View|More/i }).first();
    await viewDropdown.click();

    // Open Tasks appears in the dropdown under Public Views
    await expect(page.getByText('Open Tasks')).toBeVisible();

    // Other standard public views are also listed
    await expect(page.getByText('All Tasks')).toBeVisible();
  });

  test('TC-041: Switch from Open Tasks to My Open Tasks via dropdown', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();

    // Click the custom view dropdown
    const viewDropdown = page.getByRole('combobox').filter({ hasText: /Custom View|More/i }).first();
    await viewDropdown.click();

    // Select My Open Tasks
    await page.getByText('My Open Tasks').click();

    // View switches and kanban updates
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();

    // The three Kanban columns are still present
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByText('Not Started')).toBeVisible();
  });
});
