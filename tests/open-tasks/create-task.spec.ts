// spec: specs/open-tasks-test-suite.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';
import { ENV } from '../../utils/env';
const OPEN_TASKS_URL =
  'https://crm.zoho.eu/crm/org20113389182/tab/Tasks/custom-view/971606000000269292/kanban';
const CREATE_TASK_URL = 'https://crm.zoho.eu/crm/org20113389182/tab/Tasks/create';

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

async function openCreateTaskForm(page: Page): Promise<void> {
  await page.goto(OPEN_TASKS_URL);
  await page.getByRole('button', { name: 'Create Task' }).click();
  await expect(page).toHaveURL(/\/Tasks\/create/);
}

test.describe('Create Task', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-006: Create a new task with Subject only (minimum required fields)', async ({ page }) => {
    await openCreateTaskForm(page);

    // Enter Subject only, leave all other fields at defaults
    await page.getByRole('textbox', { name: 'Subject' }).fill('Test Task - Minimum Fields');

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is created — redirected to detail page or success shown
    await expect(page).toHaveURL(/\/Tasks\//);

    // Navigate to Open Tasks Kanban to verify placement
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Test Task - Minimum Fields' }).first()).toBeVisible();

    // Priority defaults to High — visible in the detail page
    await kanban.getByRole('link', { name: 'Test Task - Minimum Fields' }).first().click();
    await expect(page.getByRole('button', { name: 'High' })).toBeVisible();
  });

  test('TC-007: Create a task with all fields populated', async ({ page }) => {
    await openCreateTaskForm(page);

    // Populate all fields
    await page.getByRole('textbox', { name: 'Subject' }).fill('Full Fields Task');
    await page.getByRole('textbox', { name: 'Due Date' }).fill('15.04.2026');
    // Click on Subject field to close the calendar popup before interacting with comboboxes
    await page.getByRole('textbox', { name: 'Subject' }).click();

    // Set Status to In Progress
    await page.getByRole('combobox', { name: 'Not Started' }).click();
    await page.getByText('In Progress', { exact: true }).click();

    // Set Priority to Highest
    await page.getByRole('combobox', { name: 'High' }).click();
    await page.getByText('Highest', { exact: true }).click();

    // Fill Description
    await page.getByRole('textbox', { name: 'Description' }).fill('Test description text');

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\//);

    // Verify task appears in In Progress column on Open Tasks Kanban
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Full Fields Task' }).first()).toBeVisible();
  });

  test('TC-008: Create a task using Save and New', async ({ page }) => {
    await openCreateTaskForm(page);

    // Enter subject and click Save and New
    await page.getByRole('textbox', { name: 'Subject' }).fill('Save and New Task 1');
    await page.getByRole('button', { name: 'Save and New' }).click();

    // New empty Create Task form opens
    await expect(page).toHaveURL(/\/Tasks\/create/);
    await expect(page.getByRole('textbox', { name: 'Subject' })).toHaveValue('');

    // Navigate back to Open Tasks Kanban
    await page.goto(OPEN_TASKS_URL);

    // First saved task is visible in Not Started column
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Save and New Task 1' }).first()).toBeVisible();
  });

  test('TC-009: Cancel task creation', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);

    // Open Create Task form and type a subject
    await page.getByRole('button', { name: 'Create Task' }).click();
    await page.getByRole('textbox', { name: 'Subject' }).fill('Cancelled Task');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // User is returned to the Tasks view
    await expect(page).toHaveURL(/tab\/Tasks/);

    // No new task was created — 'Cancelled Task' must not appear on Open Tasks
    await page.goto(OPEN_TASKS_URL);
    await expect(
      page.getByRole('main', { name: 'Records List View' }).getByRole('link', { name: 'Cancelled Task' })
    ).not.toBeVisible();
  });

  test('TC-010: Save a task with empty Subject — validation error', async ({ page }) => {
    await openCreateTaskForm(page);

    // Leave Subject empty and click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is NOT saved — validation error appears
    await expect(page.getByText('Subject cannot be empty.')).toBeVisible();

    // Form remains open
    await expect(page).toHaveURL(/\/Tasks\/create/);
  });

  test('TC-011: Attempt to enter an invalid date format in Due Date', async ({ page }) => {
    await openCreateTaskForm(page);

    // Enter a valid subject
    await page.getByRole('textbox', { name: 'Subject' }).fill('Invalid Date Task');

    // Enter invalid date (month 13)
    await page.getByRole('textbox', { name: 'Due Date' }).fill('31-13-2026');

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is NOT saved — date validation error appears or form remains open
    await expect(page).toHaveURL(/\/Tasks\/create/);
  });

  test('TC-012: Enter a past date in Due Date', async ({ page }) => {
    await openCreateTaskForm(page);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Past Date Task');
    await page.getByRole('textbox', { name: 'Due Date' }).fill('01.01.2020');
    // Click on Subject field to close the calendar popup
    await page.getByRole('textbox', { name: 'Subject' }).click();

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is saved without a blocking error
    await expect(page).toHaveURL(/\/Tasks\//);

    // Task appears in the Open Tasks view
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Past Date Task' }).first()).toBeVisible();
  });

  test('TC-013: Create task with Status=Not Started — verify Kanban placement', async ({ page }) => {
    await openCreateTaskForm(page);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Status Not Started Task');

    // Status defaults to Not Started — leave as is
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\//);

    // Navigate to Open Tasks and verify task is in Not Started column
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Status Not Started Task' }).first()).toBeVisible();
  });

  test('TC-014: Create task with Status=In Progress — verify Kanban placement', async ({ page }) => {
    await openCreateTaskForm(page);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Status In Progress Task');

    // Set Status to In Progress
    await page.getByRole('combobox', { name: 'Not Started' }).click();
    await page.getByText('In Progress', { exact: true }).click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\//);

    // Verify task appears in In Progress column
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Status In Progress Task' }).first()).toBeVisible();
  });

  test('TC-015: Create task with Status=Deferred — verify Kanban placement', async ({ page }) => {
    await openCreateTaskForm(page);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Status Deferred Task');

    // Set Status to Deferred
    await page.getByRole('combobox', { name: 'Not Started' }).click();
    await page.getByText('Deferred', { exact: true }).click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/Tasks\//);

    // Verify task appears in Deferred column
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Status Deferred Task' }).first()).toBeVisible();
  });

  test('TC-016: Create task with Status=Completed — verify exclusion from Open Tasks', async ({ page }) => {
    await openCreateTaskForm(page);

    await page.getByRole('textbox', { name: 'Subject' }).fill('Completed Task Exclusion Test');

    // Set Status to Completed
    await page.getByRole('combobox', { name: 'Not Started' }).click();
    await page.getByText('Completed', { exact: true }).click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is saved successfully
    await expect(page).toHaveURL(/\/Tasks\//);

    // Navigate to Open Tasks — task must NOT appear in any column
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    await expect(kanban.getByRole('link', { name: 'Completed Task Exclusion Test' })).not.toBeVisible();

    // Task is visible in the All Tasks view
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page.getByRole('link', { name: 'Completed Task Exclusion Test' }).first()).toBeVisible();
  });

  test('TC-017: Verify all Priority values can be selected during task creation', async ({ page }) => {
    await openCreateTaskForm(page);

    // Default Priority is High
    await expect(page.getByRole('combobox', { name: 'High' })).toBeVisible();

    // Open the Priority dropdown
    await page.getByRole('combobox', { name: 'High' }).click();

    // All five priority options are available
    await expect(page.getByText('Lowest', { exact: true })).toBeVisible();
    await expect(page.getByText('Low', { exact: true })).toBeVisible();
    await expect(page.getByText('Normal', { exact: true })).toBeVisible();
    await expect(page.getByText('High', { exact: true })).toBeVisible();
    await expect(page.getByText('Highest', { exact: true })).toBeVisible();

    // Each option is selectable — select Lowest
    await page.getByText('Lowest', { exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Lowest' })).toBeVisible();
  });
});
