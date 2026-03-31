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
    await row.getByRole('checkbox', { name: 'Select row' }).click();

    // expect: The bulk actions bar appears at the top of the table
    await expect(dealsPage.page.getByText(/deal selected/)).toBeVisible();
    // expect: The bar shows '1 deal selected'
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();
    // expect: The following buttons are visible: Assign, Edit, Delete, More
    await expect(dealsPage.page.getByRole('button', { name: 'Assign' })).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'More' })).toBeVisible();
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
    await expect(dealsPage.page.getByText(/deal selected/)).toBeVisible();
  });

  test('should bulk delete a selected deal', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-050 Bulk Delete Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-050 Bulk Delete Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-050 Bulk Delete Deal')).toBeVisible();

    // 2. Select the row for 'TC-050 Bulk Delete Deal'
    const row = dealsPage.getDealRowByName('TC-050 Bulk Delete Deal');
    await row.getByRole('checkbox', { name: 'Select row' }).click();

    // expect: Bulk actions bar appears
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();

    // 3. Click 'Delete' in the bulk actions bar and confirm
    await dealsPage.page.getByRole('button', { name: 'Delete' }).click();
    await dealsPage.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    // expect: A success notification appears
    await expect(dealsPage.successToast).toBeVisible();
    // expect: The deal is removed from the table
    await expect(dealsPage.getDealRowByName('TC-050 Bulk Delete Deal')).not.toBeVisible();
  });

  test('should bulk assign a deal to a user', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-051 Bulk Assign Deal' and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('TC-051 Bulk Assign Deal');
    await dealsPage.open();

    // expect: The deal is visible in the table
    await expect(dealsPage.getDealRowByName('TC-051 Bulk Assign Deal')).toBeVisible();

    // 2. Select the row for 'TC-051 Bulk Assign Deal'
    const row = dealsPage.getDealRowByName('TC-051 Bulk Assign Deal');
    await row.getByRole('checkbox', { name: 'Select row' }).click();

    // expect: Bulk actions bar appears
    await expect(dealsPage.page.getByText('1 deal selected')).toBeVisible();

    // 3. Click 'Assign', select 'Ihor Hanets', and confirm
    await dealsPage.page.getByRole('button', { name: 'Assign' }).click();
    await dealsPage.page.getByRole('option', { name: 'Ihor Hanets' }).or(
      dealsPage.page.getByText('Ihor Hanets').first()
    ).click();
    await dealsPage.page.getByRole('button', { name: /Assign|Confirm|Save/i }).first().click();

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
    await row.getByRole('checkbox', { name: 'Select row' }).click();
    await dealsPage.page.getByRole('button', { name: 'Edit' }).click();

    // expect: A bulk edit dialog opens
    await expect(dealsPage.page.getByRole('dialog')).toBeVisible();

    // 3. Select the 'Priority' property, set value to 'High', and confirm
    await dealsPage.page.getByRole('dialog').getByRole('combobox').or(
      dealsPage.page.getByRole('dialog').getByRole('button', { name: /Select property/i })
    ).click();
    await dealsPage.page.getByRole('option', { name: 'Priority' }).click();
    await dealsPage.page.getByRole('dialog').getByRole('button', { name: 'High' }).or(
      dealsPage.page.getByRole('dialog').getByRole('option', { name: 'High' })
    ).click();
    await dealsPage.page.getByRole('dialog').getByRole('button', { name: /Update|Apply|Confirm/i }).click();

    // expect: The bulk edit applies the change
    await expect(dealsPage.successToast).toBeVisible();
  });

  test("should display all options in the 'More' bulk actions dropdown", async ({ dealsPage }) => {
    // 1. Create a deal, navigate to the Deals list, select the row checkbox, then click 'More'
    await dealsPage.createDealAndGoToRecord('TC-053 More Actions Deal');
    await dealsPage.open();
    const row = dealsPage.getDealRowByName('TC-053 More Actions Deal');
    await row.getByRole('checkbox', { name: 'Select row' }).click();
    await dealsPage.page.getByRole('button', { name: 'More' }).click();

    // expect: A dropdown appears with specific options
    await expect(dealsPage.page.getByRole('button', { name: 'Review Associations' }).or(
      dealsPage.page.getByText('Review Associations')
    )).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'Add to static segment' }).or(
      dealsPage.page.getByText('Add to static segment')
    )).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'Create tasks' }).or(
      dealsPage.page.getByText('Create tasks')
    )).toBeVisible();
    await expect(dealsPage.page.getByRole('button', { name: 'Enroll in workflow' }).or(
      dealsPage.page.getByText('Enroll in workflow')
    )).toBeVisible();
  });
});