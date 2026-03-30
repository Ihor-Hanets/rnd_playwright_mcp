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

test.describe('Sort & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(OPEN_TASKS_URL);
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
  });

  test('TC-029: Sort Open Tasks by Due Date ascending', async ({ page }) => {
    // Click Sort button
    await page.getByRole('button', { name: 'Sort' }).click();

    // Select Due Date from the Sort By dropdown
    const sortByDropdown = page.getByRole('combobox').filter({ hasText: /Sort By|None/i }).first();
    await sortByDropdown.click();
    await page.getByText('Due Date', { exact: true }).click();

    // Set order to Ascending
    await page.getByText('Ascending', { exact: true }).click();

    // Apply the sort
    await page.getByRole('button', { name: 'Apply' }).click();

    // Kanban is still displayed and no errors appear
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
    await expect(page.getByText('Not Started')).toBeVisible();
  });

  test('TC-030: Sort Open Tasks by Priority descending', async ({ page }) => {
    // Click Sort button
    await page.getByRole('button', { name: 'Sort' }).click();

    // Select Priority and Descending order
    const sortByDropdown = page.getByRole('combobox').filter({ hasText: /Sort By|None/i }).first();
    await sortByDropdown.click();
    await page.getByText('Priority', { exact: true }).click();

    await page.getByText('Descending', { exact: true }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Kanban remains displayed without errors
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
  });

  test('TC-031: Remove applied sort from Open Tasks', async ({ page }) => {
    // First apply a sort
    await page.getByRole('button', { name: 'Sort' }).click();
    const sortByDropdown = page.getByRole('combobox').filter({ hasText: /Sort By|None/i }).first();
    await sortByDropdown.click();
    await page.getByText('Due Date', { exact: true }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Now clear the sort — open Sort again and select None
    await page.getByRole('button', { name: 'Sort' }).click();
    const sortByDropdown2 = page.getByRole('combobox').filter({ hasText: /Due Date/i }).first();
    await sortByDropdown2.click();
    await page.getByText('None', { exact: true }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Tasks return to default order — kanban is still displayed
    await expect(page.getByRole('main', { name: 'Records List View' })).toBeVisible();
    await expect(page.getByText('Not Started')).toBeVisible();
  });

  test('TC-032: Filter Open Tasks by Priority', async ({ page }) => {
    // Open Filter panel
    await page.getByRole('button', { name: 'Filter' }).click();

    // Check the Priority checkbox
    await page.getByRole('checkbox', { name: 'Priority' }).check();

    // Select High priority value
    await page.getByText('High', { exact: true }).click();

    // Apply the filter
    await page.getByRole('button', { name: 'Apply' }).click();

    // Kanban updates to show only High priority tasks
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();

    // No other columns appear with tasks — all visible task cards have Priority=High
    // (Visual indicator of active filter should be present)
    await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();
  });

  test('TC-033: Filter Open Tasks by Due Date range', async ({ page }) => {
    // Open Filter panel
    await page.getByRole('button', { name: 'Filter' }).click();

    // Check Due Date checkbox
    await page.getByRole('checkbox', { name: 'Due Date' }).check();

    // Set from date
    const fromInput = page.getByPlaceholder('dd.mm.yyyy').first();
    await fromInput.fill('01.03.2026');

    // Set to date
    const toInput = page.getByPlaceholder('dd.mm.yyyy').last();
    await toInput.fill('31.03.2026');

    // Apply the filter
    await page.getByRole('button', { name: 'Apply' }).click();

    // Kanban updates and shows tasks in the date range
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();
  });

  test('TC-034: Filter Open Tasks by Task Owner', async ({ page }) => {
    // Open Filter panel
    await page.getByRole('button', { name: 'Filter' }).click();

    // Check Task Owner checkbox
    await page.getByRole('checkbox', { name: 'Task Owner' }).check();

    // Select the current logged-in user
    const ownerInput = page.getByRole('textbox', { name: /Task Owner|Search/ }).last();
    await ownerInput.fill('Ihor Hanets');
    await page.getByText('Ihor Hanets').first().click();

    // Apply the filter
    await page.getByRole('button', { name: 'Apply' }).click();

    // Kanban shows only tasks owned by Ihor Hanets
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();
  });

  test('TC-035: Clear all applied filters', async ({ page }) => {
    // Apply a filter first
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByRole('checkbox', { name: 'Priority' }).check();
    await page.getByText('High', { exact: true }).click();
    await page.getByRole('button', { name: 'Apply' }).click();

    // Clear all filters
    await page.getByRole('button', { name: 'Filter' }).click();
    const clearAllButton = page.getByRole('button', { name: /Clear All|Reset/i });
    await clearAllButton.click();

    // Full Open Tasks list is restored
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByText('Not Started')).toBeVisible();
    await expect(kanban.getByText('Deferred')).toBeVisible();
    await expect(kanban.getByText('In Progress')).toBeVisible();
  });

  test('TC-036: Apply multiple filters simultaneously (AND logic)', async ({ page }) => {
    // Open Filter panel
    await page.getByRole('button', { name: 'Filter' }).click();

    // Apply Priority = High
    await page.getByRole('checkbox', { name: 'Priority' }).check();
    await page.getByText('High', { exact: true }).click();

    // Apply Due Date = current month
    await page.getByRole('checkbox', { name: 'Due Date' }).check();
    const fromInput = page.getByPlaceholder('dd.mm.yyyy').first();
    await fromInput.fill('01.03.2026');
    const toInput = page.getByPlaceholder('dd.mm.yyyy').last();
    await toInput.fill('31.03.2026');

    // Apply both filters
    await page.getByRole('button', { name: 'Apply' }).click();

    // No errors and kanban updates to filtered results
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban).toBeVisible();
  });

  test('TC-037: Filter with criteria that matches no tasks', async ({ page }) => {
    // Open Filter panel and set an impossible Due Date range
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByRole('checkbox', { name: 'Due Date' }).check();

    const fromInput = page.getByPlaceholder('dd.mm.yyyy').first();
    await fromInput.fill('01.01.2099');
    const toInput = page.getByPlaceholder('dd.mm.yyyy').last();
    await toInput.fill('31.01.2099');

    await page.getByRole('button', { name: 'Apply' }).click();

    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Each column shows empty state
    await expect(kanban.getByText('No Tasks found.').first()).toBeVisible();

    // No error is thrown — kanban structure remains
    await expect(kanban.getByText('Not Started')).toBeVisible();

    // Clear filter — original list is restored
    await page.getByRole('button', { name: 'Filter' }).click();
    await page.getByRole('button', { name: /Clear All|Reset/i }).click();
    await expect(kanban.getByRole('link').first()).toBeVisible();
  });
});
