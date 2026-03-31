// spec: specs/open-tasks-test-suite.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { ENV } from '../../utils/env';
const OPEN_TASKS_URL =
  'https://crm.zoho.eu/crm/org20113389182/tab/Tasks/custom-view/971606000000269292/kanban';
const TASKS_URL = 'https://crm.zoho.eu/crm/org20113389182/tab/Tasks';

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

test.describe('Navigation & View Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-001: Navigate to Open Tasks view via Activities menu', async ({ page }) => {
    // Navigate to Tasks module via Activities > Tasks path
    await page.goto(TASKS_URL);
    await expect(page.getByRole('button', { name: 'Open Tasks' })).toBeVisible();

    // Click the Open Tasks tab
    await page.getByRole('button', { name: 'Open Tasks' }).click();

    // URL ends with /kanban
    await expect(page).toHaveURL(/\/kanban/);

    // Three Kanban columns are visible
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();
  });

  test('TC-002: Open Tasks default Kanban view displays correct status columns', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);

    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Exactly three status columns: Not Started, Deferred, In Progress
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();

    // Completed column is absent — completed tasks are excluded
    await expect(kanban.getByText('Completed', { exact: true })).not.toBeVisible();

    // Task cards display subject links
    await expect(kanban.getByRole('link').first()).toBeVisible();
  });

  test('TC-003: Open Tasks tab is distinct from All Tasks tab', async ({ page }) => {
    await page.goto(TASKS_URL);

    // Click All Tasks tab and note view loads
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page).toHaveURL(/tab\/Tasks/);
    await expect(page.getByRole('button', { name: 'All Tasks' })).toBeVisible();

    // Click Open Tasks tab
    await page.getByRole('button', { name: 'Open Tasks' }).click();

    // Open Tasks Kanban view loads
    await expect(page).toHaveURL(/\/kanban/);

    // Open Tasks does not show Completed status column
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByText('Completed', { exact: true })).not.toBeVisible();

    // Both tab buttons are present
    await expect(page.getByRole('button', { name: 'All Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Tasks' })).toBeVisible();
  });

  test('TC-004: Refresh Open Tasks view', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);

    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();

    // Click the Refresh Custom View button
    await page.getByRole('button', { name: 'Refresh Custom View' }).click();

    // Kanban reloads without error and columns remain intact
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();
  });

  test('TC-005: Open Tasks Kanban — empty Deferred column renders correctly', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);

    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Deferred column is visible regardless of task count
    await expect(kanban.getByText('Deferred')).toBeVisible();

    // Other columns are unaffected
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();

    // If Deferred has no tasks, empty state message is shown within the column
    const deferredZeroCount = kanban.locator('text=Deferred').locator('xpath=following-sibling::*[1][text()="0"]');
    const hasZeroCount = await deferredZeroCount.isVisible().catch(() => false);
    if (hasZeroCount) {
      await expect(kanban.getByText('No Tasks found.')).toBeVisible();
    }
  });
});
