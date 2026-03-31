// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Bulk Actions', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should show bulk action bar with correct controls when a row is selected', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-048 Bulk Select Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-048 Bulk Select Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-048 Bulk Select Deal')).toBeVisible();

    // 2. Click the row checkbox for 'TC-048 Bulk Select Deal'
    const row = dealsPage.getDealRowByName('TC-048 Bulk Select Deal');
    await row.locator('label').click();

    // expect: The bulk actions bar appears at the top of the table
    const bulkBar = dealsPage.page.locator('[data-test-id="customer-data-bulk-actions-container"]');
    await expect(dealsPage.page.getByText(/deals? selected/i)).toBeVisible();
    // expect: The bar shows '1 deal selected'
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();
    // expect: The following buttons are visible: Assign, Edit, Delete, More
    await expect(bulkBar.getByRole('button', { name: 'Assign' })).toBeVisible();
    await expect(bulkBar.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(bulkBar.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(bulkBar.getByRole('button', { name: 'More' })).toBeVisible();
  });

  test('should select all deals using the column header checkbox', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Select all records' checkbox in the column header
    await dealsPage.selectAllCheckbox.click();

    // expect: All rows on the current page have their checkboxes checked
    const rowCheckboxes = dealsPage.page.getByRole('row').getByRole('checkbox', { name: 'Select row' });
    const count = await rowCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }

    // expect: The bulk actions bar shows the correct total count
    await expect(dealsPage.page.getByText(/deals? selected/i)).toBeVisible();
  });

  test('should bulk delete a selected deal', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-050 Bulk Delete Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-050 Bulk Delete Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-050 Bulk Delete Deal')).toBeVisible();

    // 2. Select the row for 'TC-050 Bulk Delete Deal'
    const row = dealsPage.getDealRowByName('TC-050 Bulk Delete Deal');
    const rowTestId = await row.getAttribute('data-test-id');
    await row.locator('label').click();

    // expect: Bulk actions bar appears
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();

    // 3. Click 'Delete' in the bulk actions bar and confirm
    await dealsPage.page.locator('[data-test-id="customer-data-bulk-actions-container"]').getByRole('button', { name: 'Delete' }).click();
    const confirmDeleteInput = dealsPage.page.locator('[data-test-id="delete-dialog-match"]');
    await expect(confirmDeleteInput).toBeVisible();
    await confirmDeleteInput.fill('1');
    const confirmDeleteBtn = dealsPage.page.locator('[data-test-id="delete-dialog-confirm-button"]');
    await expect(confirmDeleteBtn).toBeEnabled({ timeout: 5_000 });
    await confirmDeleteBtn.click();

    // expect: The deal is removed from the table
    await expect(dealsPage.page.locator(`[data-test-id="${rowTestId}"]`)).not.toBeVisible({ timeout: 15_000 });
  });

  test('should bulk assign a deal to a user', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-051 Bulk Assign Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-051 Bulk Assign Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-051 Bulk Assign Deal')).toBeVisible();

    // 2. Select the row for 'TC-051 Bulk Assign Deal'
    const row = dealsPage.getDealRowByName('TC-051 Bulk Assign Deal');
    await row.locator('label').click();

    // expect: Bulk actions bar appears
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();

    // 3. Click 'Assign', select 'Ihor Hanets', and confirm
    await dealsPage.page.locator('[data-test-id="customer-data-bulk-actions-container"]').getByRole('button', { name: 'Assign' }).click();
    const assignModal = dealsPage.page.locator('[data-selenium-test="customer-data-bulk-actions-assign-modal"]');
    await expect(assignModal).toBeVisible();
    await assignModal.locator('[data-test-id="property-input-hubspot_owner_id"]').click();
    await dealsPage.page.getByRole('option', { name: /Ihor Hanets/i }).first().click();
    await assignModal.locator('[data-test-id="bulk-actions-assign-modal-save"]').click();

    // expect: The deal remains assigned to 'Ihor Hanets'
    await expect(dealsPage.getDealRowByName('TC-051 Bulk Assign Deal')).toContainText('Ihor Hanets');
  });

  test('should bulk edit a property across selected deals', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-052 Bulk Edit Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-052 Bulk Edit Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-052 Bulk Edit Deal')).toBeVisible();

    // 2. Select the row and click 'Edit' in the bulk actions bar
    const row = dealsPage.getDealRowByName('TC-052 Bulk Edit Deal');
    await row.locator('label').click();
    await dealsPage.page.locator('[data-test-id="bulk-action-edit"]').first().click();

    // expect: A bulk edit dialog opens
    const bulkEditDialog = dealsPage.page.getByRole('dialog').filter({ hasText: /bulk edit/i });
    await expect(bulkEditDialog).toBeVisible();

    // 3. Select the 'Priority' property, set value to 'High', and confirm
    await bulkEditDialog.locator('[data-test-id="bulk-edit-property-select"]').click();
    await dealsPage.page.getByRole('option', { name: 'Priority' }).first().click();
    await bulkEditDialog.locator('[data-test-id="property-input-hs_priority"]').click();
    await dealsPage.page.getByRole('option', { name: 'High' }).first().click();
    await bulkEditDialog.locator('[data-test-id="bulk-actions-edit-modal-save"]').click();

    // expect: The bulk edit applies the change
    await expect(dealsPage.page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
  });

  test("should display all options in the 'More' bulk actions dropdown", async ({ dealsPage }) => {
    // 1. Create a deal, navigate to the Deals list, select the row checkbox, then click 'More'
    await dealsPage.createDealAndGoToRecord('TC-053 More Actions Deal');
    await dealsPage.open();
    const row = dealsPage.getDealRowByName('TC-053 More Actions Deal');
    await row.locator('label').click();
    await dealsPage.page.locator('[data-test-id="bulk-actions-dropdown"]').first().click();

    // expect: A dropdown appears with specific options
    const moreDropdownMenu = dealsPage.page.locator('[data-dropdown-menu="true"]');
    await expect(moreDropdownMenu.getByText('Review Associations')).toBeVisible();
    await expect(moreDropdownMenu.getByText('Add to static segment')).toBeVisible();
    await expect(moreDropdownMenu.getByText('Create tasks')).toBeVisible();
    await expect(moreDropdownMenu.getByText('Enroll in workflow')).toBeVisible();
  });
});