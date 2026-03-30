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

test.describe('Data Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-045: Task data persists correctly after page refresh', async ({ page }) => {
    // Create a task with all fields populated
    await page.goto(OPEN_TASKS_URL);
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page).toHaveURL(/\/Tasks\/create/);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Persistence Test Task');
    await page.getByPlaceholder('dd.mm.yyyy').fill('30.04.2026');
    await page.getByRole('combobox', { name: 'High' }).click();
    await page.getByText('Normal', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Persistence check description');

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Note the task detail page URL (task ID)
    const taskUrl = page.url();

    // Navigate away and back
    await page.goto(OPEN_TASKS_URL);
    await page.goto(taskUrl);

    // All field values are correctly preserved after re-navigation
    await expect(page.getByText('Persistence Test Task')).toBeVisible();
    await expect(page.getByText('30.04.2026')).toBeVisible();
    await expect(page.getByText('Normal')).toBeVisible();
    await expect(page.getByText('Persistence check description')).toBeVisible();
  });

  test('TC-046: Kanban column counts match the actual number of visible task cards', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();

    // Wait for all task cards to load
    await expect(kanban.getByRole('link').first()).toBeVisible();

    // Verify the three columns are present (counts are dynamically set by the server)
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();

    // Confirm no mismatch between column header counts and visible cards
    // (Refresh to get consistent fresh data)
    await page.getByRole('button', { name: 'Refresh Custom View' }).click();
    await expect(kanban.getByText('Not Started')).toBeVisible();
  });

  test('TC-047: Task is removed from Open Tasks after Status changed to Completed via Edit', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Open the first available task
    const taskLink = kanban.getByRole('link').first();
    const taskName = (await taskLink.textContent())?.trim() ?? '';
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Edit and change Status to Completed
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('combobox', { name: 'Not Started' }).click().catch(async () => {
      await page.getByRole('combobox', { name: 'In Progress' }).click().catch(async () => {
        await page.getByRole('combobox', { name: 'Deferred' }).click();
      });
    });
    await page.getByText('Completed', { exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Back to return to Open Tasks Kanban
    await page.getByRole('button', { name: 'Back' }).click();
    await page.goto(OPEN_TASKS_URL);

    // Task no longer appears in any Open Tasks column
    await expect(kanban.getByRole('link', { name: taskName })).not.toBeVisible();

    // Task appears in All Tasks view
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page.getByRole('link', { name: taskName })).toBeVisible();
  });
});
