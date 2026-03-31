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

async function openFirstTask(page: Page): Promise<void> {
  await page.goto(OPEN_TASKS_URL);
  const kanban = page.getByRole('main', { name: 'Records List View' });
  await kanban.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);
}

test.describe('View & Read Task Details', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-018: Open a task from the Kanban to view its detail page', async ({ page }) => {
    await page.goto(OPEN_TASKS_URL);

    const kanban = page.getByRole('main', { name: 'Records List View' });
    const taskLink = kanban.getByRole('link').first();
    const taskName = await taskLink.textContent();

    // Click the task subject link
    await taskLink.click();
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Task detail page opens with the correct title
    await expect(page.locator('text=' + taskName?.trim())).toBeVisible();

    // Two tabs are visible: Overview and Timeline
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Timeline' })).toBeVisible();

    // Action buttons are visible
    await expect(page.getByRole('button', { name: 'Close Task' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Options' })).toBeVisible();

    // Navigation buttons are visible
    await expect(page.getByRole('button', { name: 'Previous Record' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next Record' })).toBeVisible();
  });

  test('TC-019: Task detail page — Business Card section shows key fields', async ({ page }) => {
    await openFirstTask(page);

    // Business Card section is visible with key fields
    const businessCard = page.getByRole('region', { name: 'Business Card Details' });
    await expect(businessCard).toBeVisible();

    // Required fields are displayed in the Business Card
    await expect(businessCard.getByText('Priority')).toBeVisible();
    await expect(businessCard.getByText('Due Date')).toBeVisible();
    await expect(businessCard.getByText('Status')).toBeVisible();
    await expect(businessCard.getByText('Related To')).toBeVisible();
    await expect(businessCard.getByText('Task Owner')).toBeVisible();
  });

  test('TC-020: Navigate between tasks using Previous and Next Record buttons', async ({ page }) => {
    await openFirstTask(page);

    const firstUrl = page.url();

    // Click Next Record
    await page.getByRole('button', { name: 'Next Record' }).click();
    const nextUrl = page.url();
    expect(nextUrl).not.toBe(firstUrl);
    await expect(page).toHaveURL(/\/tab\/Tasks\/\d+/);

    // Click Previous Record to go back
    await page.getByRole('button', { name: 'Previous Record' }).click();
    await expect(page).toHaveURL(firstUrl);
  });

  test('TC-021: Timeline tab shows task activity history', async ({ page }) => {
    await openFirstTask(page);

    // Click the Timeline tab
    await page.getByRole('tab', { name: 'Timeline' }).click();

    // Timeline panel becomes visible
    const timelinePanel = page.getByRole('tabpanel');
    await expect(timelinePanel).toBeVisible();

    // At minimum the creation event is present — check for date/user indication
    await expect(timelinePanel.locator('text=Ihor Hanets').first()).toBeVisible();
  });

  test('TC-042: Add a note to an open task', async ({ page }) => {
    await openFirstTask(page);

    // Click the Add a note textbox
    await page.getByRole('textbox', { name: 'Add a note' }).click();
    await page.getByRole('textbox', { name: 'Add a note' }).fill('This is a test note');

    // Save the note (submit / press Enter or click Save button in the notes area)
    await page.getByRole('textbox', { name: 'Add a note' }).press('Control+Enter');

    // Note is displayed in the Notes section
    await expect(page.getByText('This is a test note')).toBeVisible();
  });

  test('TC-043: Attach a file to an open task', async ({ page }) => {
    await openFirstTask(page);

    // Click Attach button
    await page.getByRole('button', { name: 'Attach' }).click();

    // Attach dialog or file input is opened
    const attachDialog = page.locator('[role="dialog"], .attachments-dialog, input[type="file"]');
    await expect(attachDialog.first()).toBeVisible();
  });

  test('TC-044: Add a link to an open task', async ({ page }) => {
    await openFirstTask(page);

    // Click Add button in the Links section
    await page.getByRole('button', { name: 'Add' }).first().click();

    // Links add dialog is visible
    await expect(page.getByRole('dialog').or(page.locator('.link-modal, .addlink-container')).first()).toBeVisible();
  });
});
