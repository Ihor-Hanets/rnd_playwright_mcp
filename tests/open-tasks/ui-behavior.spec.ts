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

test.describe('UI Behavior & Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-048: Task card displays long subject gracefully without breaking layout', async ({ page }) => {
    // Create a task with a 200+ character subject
    const longSubject = 'A'.repeat(200) + ' Long Subject Overflow Test';

    await page.goto(OPEN_TASKS_URL);
    await page.getByRole('button', { name: 'Create Task' }).click();
    await expect(page).toHaveURL(/\/Tasks\/create/);

    await page.getByRole('textbox', { name: 'Subject' }).fill(longSubject);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Navigate to Open Tasks Kanban
    await page.goto(OPEN_TASKS_URL);

    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();

    // Kanban layout is not broken — columns are still visible
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();

    // Task card with long subject appears (may be truncated) — at least first characters are present
    await expect(kanban.getByRole('link', { name: new RegExp('^' + 'A'.repeat(10)) })).toBeVisible();
  });

  test('TC-049: Create Task button is always accessible on Open Tasks view', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();

    // Create Task button is visible and clickable in the toolbar
    const createTaskButton = page.getByRole('button', { name: 'Create Task' });
    await expect(createTaskButton).toBeVisible();
    await expect(createTaskButton).toBeEnabled();
  });

  test('TC-050: Open Tasks page loads within an acceptable time', async ({ page }) => {
    const start = Date.now();

    // Navigate directly to the Open Tasks URL from an authenticated session
    await page.goto(OPEN_TASKS_URL);

    // Kanban fully renders — all columns and task cards are visible
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();

    const elapsed = Date.now() - start;

    // Page loads within 5 seconds (5000 ms)
    expect(elapsed).toBeLessThan(5000);
  });
});
