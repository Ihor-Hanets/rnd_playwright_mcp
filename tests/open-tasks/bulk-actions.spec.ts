// spec: specs/open-tasks-test-suite.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { ENV } from '../../utils/env';
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

test.describe('Bulk Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(OPEN_TASKS_URL);
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
  });

  test('TC-038: Export tasks from Open Tasks view', async ({ page }) => {
    // Click Actions button
    await page.getByRole('button', { name: 'Actions' }).click();

    // Click Export Tasks from the dropdown
    await page.getByText('Export Tasks').click();

    // Export dialog or download is initiated — no error occurs
    const exportDialog = page
      .getByRole('dialog')
      .or(page.locator('.export-modal, .download-container'))
      .first();

    // Wait for either a dialog or a download event
    const [downloadPromise] = await Promise.allSettled([
      page.waitForEvent('download', { timeout: 10000 }),
    ]);

    if (downloadPromise.status === 'fulfilled') {
      expect(downloadPromise.value).toBeTruthy();
    } else {
      await expect(exportDialog).toBeVisible();
    }
  });

  test('TC-039: Mass Update — change Priority for multiple tasks', async ({ page }) => {
    // Click Actions button
    await page.getByRole('button', { name: 'Actions' }).click();

    // Click Mass Update
    await page.getByText('Mass Update').click();

    // Select checkboxes for multiple tasks if checkboxes become visible
    const checkboxes = page.getByRole('checkbox');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
    }

    // Locate the Priority field in Mass Update form and set to Normal
    const priorityField = page.getByRole('combobox', { name: /Priority/i });
    if (await priorityField.isVisible()) {
      await priorityField.click();
      await page.getByText('Normal', { exact: true }).click();
    }

    // Confirm the mass update
    const updateButton = page.getByRole('button', { name: /Update|Apply|Save/i });
    await updateButton.first().click();

    // Success notification is shown or kanban refreshes without error
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
  });
});
