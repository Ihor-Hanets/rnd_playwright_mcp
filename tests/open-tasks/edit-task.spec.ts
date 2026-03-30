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

async function openFirstTask(page: Page): Promise<void> {
  await page.goto(OPEN_TASKS_URL);
  const kanban = page.getByRole('main', { name: 'Records List View' });
  await kanban.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);
}

test.describe('Edit Task', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-022: Edit a task subject from the detail page', async ({ page }) => {
    await openFirstTask(page);

    // Click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/edit/);

    // Clear the Subject field and enter new value
    const subjectField = page.getByRole('textbox', { name: 'Subject' });
    await subjectField.clear();
    await subjectField.fill('Updated Task Subject');

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Subject is updated on the detail page
    await expect(page.getByText('Updated Task Subject')).toBeVisible();
  });

  test('TC-023: Inline edit Priority field on the task detail page', async ({ page }) => {
    await openFirstTask(page);

    // Click on the Priority field value in the Business Card section
    const businessCard = page.getByRole('region', { name: 'Business Card Details' });
    await businessCard.getByText('Priority').click();

    // An inline edit dropdown / button appears — click the current Priority value to open dropdown
    const priorityButton = businessCard.locator('[title*="Priority"], button').filter({ hasText: /Lowest|Low|Normal|High|Highest/ }).first();
    await priorityButton.click();

    // Select Highest from the dropdown
    await page.getByText('Highest', { exact: true }).click();

    // Save the inline edit by clicking elsewhere or Save icon
    await page.getByRole('button', { name: 'Save', exact: true }).first().click().catch(async () => {
      await page.keyboard.press('Escape');
    });

    // Priority is updated to Highest
    await expect(businessCard.getByText('Highest')).toBeVisible();
  });

  test('TC-024: Change task Status from Not Started to In Progress — Kanban column update', async ({ page }) => {
    // Find a task in Not Started column
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });
    const notStartedSection = kanban.locator('text=Not Started').locator('../..');
    const taskLink = notStartedSection.getByRole('link').first();
    const taskName = (await taskLink.textContent())?.trim() ?? '';
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Edit
    await page.getByRole('button', { name: 'Edit' }).click();

    // Change Status from Not Started to In Progress
    await page.getByRole('combobox', { name: 'Not Started' }).click();
    await page.getByText('In Progress', { exact: true }).click();

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Navigate back to Open Tasks Kanban
    await page.goto(OPEN_TASKS_URL);

    // Task is no longer in Not Started and appears in In Progress column
    const inProgressSection = kanban.locator('text=In Progress').locator('../..');
    await expect(inProgressSection.getByRole('link', { name: taskName })).toBeVisible();

    // Task is still visible in Open Tasks view
    await expect(kanban.getByRole('link', { name: taskName })).toBeVisible();
  });

  test('TC-025: Change task Status from In Progress to Completed — task removed from Open Tasks', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);
    const kanban = page.getByRole('main', { name: 'Records List View' });

    // Find an In Progress task
    const inProgressSection = kanban.locator('text=In Progress').locator('../..');
    const taskLink = inProgressSection.getByRole('link').first();
    const taskName = (await taskLink.textContent())?.trim() ?? '';
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Edit and change Status to Completed
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('combobox', { name: 'In Progress' }).click();
    await page.getByText('Completed', { exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Navigate back to Open Tasks — task must be removed
    await page.goto(OPEN_TASKS_URL);
    await expect(kanban.getByRole('link', { name: taskName })).not.toBeVisible();

    // Task is visible in All Tasks view
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page.getByRole('link', { name: taskName })).toBeVisible();
  });

  test('TC-026: Attempt to save an edited task with an empty Subject', async ({ page }) => {
    await openFirstTask(page);

    // Click Edit
    await page.getByRole('button', { name: 'Edit' }).click();

    // Clear the Subject field entirely
    const subjectField = page.getByRole('textbox', { name: 'Subject' });
    await subjectField.clear();

    // Click Save
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Task is NOT saved — error message is shown
    await expect(page.getByText('Subject cannot be empty.')).toBeVisible();

    // Form remains open
    await expect(page).toHaveURL(/\/edit/);
  });
});
