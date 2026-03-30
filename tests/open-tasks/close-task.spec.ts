// spec: specs/open-tasks-test-suite.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { ENV } from '../../utils/env';
const OPEN_TASKS_URL =
  'https://crm.zoho.eu/crm/org20113389182/tab/Tasks/custom-view/971606000000269292/kanban';

async function login(page: Page): Promise<void> {
  await page.goto(ENV.signinUrl);
  if (!page.url().includes('accounts.zoho.eu')) return;
  await page.getByRole('textbox', { name: 'Email address or mobile number' }).fill(ENV.username);
  await page.getByRole('textbox', { name: 'Enter password' }).fill(ENV.password);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  const skipButton = page.getByRole('button', { name: 'Пропустити зараз' });
  await skipButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  if (await skipButton.isVisible()) {
    await skipButton.click();
  }
  await expect(page).toHaveURL(/crm\.zoho\.eu/);
}

test.describe('Close Task Action', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-027: Close a task using the Close Task button', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Open the first available task
    const taskLink = kanban.getByRole('link').first();
    const taskName = (await taskLink.textContent())?.trim() ?? '';
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Close Task button
    await page.getByRole('button', { name: 'Close Task' }).click();

    // Task status changes to Completed — a success notification or status update is shown
    await expect(page.getByText('Closed', { exact: false }).or(page.getByText('Completed', { exact: false })).first()).toBeVisible();

    // Navigate back to Open Tasks Kanban
    await page.goto(OPEN_TASKS_URL);

    // Closed task is removed from Open Tasks Kanban
    await expect(kanban.getByRole('link', { name: taskName })).not.toBeVisible();
  });

  test('TC-028: Closed task is absent from Open Tasks and present in Closed Tasks view', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Open the first task and close it
    const taskLink = kanban.getByRole('link').first();
    const taskName = (await taskLink.textContent())?.trim() ?? '';
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);
    await page.getByRole('button', { name: 'Close Task' }).click();

    // Navigate back to Open Tasks Kanban — task must NOT be visible
    await page.goto(OPEN_TASKS_URL);
    await expect(kanban.getByRole('link', { name: taskName })).not.toBeVisible();

    // Switch to the Closed Tasks view via the custom view picker
    const viewPicker = page.getByRole('combobox').filter({ hasText: /Tasks|Custom View/i }).first();
    await viewPicker.click();
    await page.getByText('Closed Tasks').click();

    // The closed task IS present in the Closed Tasks view
    await expect(page.getByRole('link', { name: taskName })).toBeVisible();
  });
});
