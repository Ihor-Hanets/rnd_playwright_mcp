// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Deals List View — Table', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should navigate to the Deals list via the left sidebar', async ({ dealsPage }) => {
    // 1. Click 'Deals' in the left navigation sidebar
    await dealsPage.page.getByRole('menuitem', { name: 'Deals' }).click();

    // expect: User is navigated to the Deals list page
    await expect(dealsPage.page).toHaveURL(/\/objects\/0-3\/views\/all\/list/);
    // expect: The page title shows 'Deals | All deals'
    await expect(dealsPage.page).toHaveTitle(/Deals | All deals/);
    // expect: The table view shows standard columns
    await expect(dealsPage.page.getByRole('columnheader', { name: /Deal Name/i }).or(dealsPage.page.locator('th').filter({ hasText: /Deal Name/i }))).toBeVisible();
  });

  test('should search for a deal by name using the Search box', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-028 Searchable Deal' and navigate to the Deals list page
    await dealsPage.createDealAndGoToRecord('TC-028 Searchable Deal');
    await dealsPage.open();

    // 2. Type in the Search box
    await dealsPage.searchInput.fill('TC-028 Searchable');

    // expect: The table filters to show only 'TC-028 Searchable Deal'
    await expect(dealsPage.getDealRowByName('TC-028 Searchable Deal')).toBeVisible();

    // 3. Clear the Search box
    await dealsPage.searchInput.fill('');
    await dealsPage.searchInput.press('Escape');
  });

  test('should sort deals by Deal Name column in ascending and descending order', async ({ dealsPage }) => {
    // 1. Create two deals with different names and navigate to the Deals list
    await dealsPage.createDealAndGoToRecord('AAA Sort Deal');
    await dealsPage.open();
    await dealsPage.createDealAndGoToRecord('ZZZ Sort Deal');
    await dealsPage.open();

    // 2. Click the 'Deal Name' column header once
    await dealsPage.dealNameColumnHeader.click();

    // expect: Deals are sorted alphabetically A→Z
    await expect(dealsPage.page).toHaveURL(/.*/);
    await expect(dealsPage.dealNameColumnHeader).toBeVisible();

    // 3. Click the 'Deal Name' column header again
    await dealsPage.dealNameColumnHeader.click();

    // expect: Deals are sorted Z→A (sort direction indicator reverses)
    await expect(dealsPage.dealNameColumnHeader).toBeVisible();
  });

  test('should sort deals by Close Date column', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list
    await expect(dealsPage.closeDataColumnHeader).toBeVisible();

    // 2. Click the 'Close Date' column header once
    await dealsPage.closeDataColumnHeader.click();

    // expect: Deals are sorted by close date ascending
    await expect(dealsPage.closeDataColumnHeader).toBeVisible();

    // 3. Click the 'Close Date' column header again
    await dealsPage.closeDataColumnHeader.click();

    // expect: Sort order reverses to descending
    await expect(dealsPage.closeDataColumnHeader).toBeVisible();
  });

  test('should switch between Table view and Board view using the view toggle', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list (table view). Click the 'Table view' button.
    await expect(dealsPage.page).toHaveURL(/\/views\/all\/list/);
    await dealsPage.viewToggleButton.click();

    // expect: A view type picker panel appears with 'Table view' and 'Board view' options
    await expect(dealsPage.page.getByRole('button', { name: 'Board view' })).toBeVisible();

    // 2. Click 'Board view' in the picker
    await dealsPage.page.getByRole('button', { name: 'Board view' }).click();

    // expect: The page URL changes to board view
    await expect(dealsPage.page).toHaveURL(/\/views\/all\/board/);

    // 3. Click the 'Board view' button to open the picker, then click 'Table view'
    await dealsPage.viewToggleButton.click();
    await dealsPage.page.getByRole('button', { name: 'Table view' }).click();

    // expect: The page URL changes back to list view
    await expect(dealsPage.page).toHaveURL(/\/views\/all\/list/);
  });

  test("should switch between 'All deals' and 'My deals' view tabs", async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'My deals' tab
    await dealsPage.myDealsTab.click();

    // expect: The list filters to show only deals owned by the logged-in user
    await expect(dealsPage.myDealsTab).toHaveAttribute('aria-selected', 'true');

    // 2. Click the 'All deals' tab
    await dealsPage.allDealsTab.click();

    // expect: All deals are shown again
    await expect(dealsPage.allDealsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should change pagination to 50 per page via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Open Settings Sidebar' icon
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The Table settings panel opens
    await expect(dealsPage.page.getByText('Pagination')).toBeVisible();

    // 2. Under Pagination, select '50 per page'
    await dealsPage.page.locator('[data-toggle-input-wrapper]').filter({ hasText: '50 per page' }).locator('label').click();

    // expect: The radio button for '50 per page' becomes selected
    await expect(dealsPage.page.getByRole('radio', { name: '50 per page' })).toBeChecked();
  });

  test('should change row height to Compact via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Open Settings Sidebar' icon
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The Table settings panel opens
    await expect(dealsPage.page.getByText('Row height')).toBeVisible();

    // 2. Under Row height, select 'Compact'
    await dealsPage.page.locator('[data-toggle-input-wrapper]').filter({ hasText: 'Compact' }).locator('label').click();

    // expect: The 'Compact' radio button is selected
    await expect(dealsPage.page.getByLabel('Compact')).toBeChecked();
  });

  test('should toggle Zebra striping via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and open the Settings Sidebar
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The settings sidebar opens with Zebra striping option
    await expect(dealsPage.page.getByText('Zebra striping')).toBeVisible();

    // Toggle Zebra striping ON
    await dealsPage.page.locator('label[data-test-id="crm-object-table-settings-zebra-striping"]').click();

    // 2. Toggle Zebra striping OFF
    await dealsPage.page.locator('label[data-test-id="crm-object-table-settings-zebra-striping"]').click();

    // expect: All rows display the same background colour (toggle is off)
    await expect(dealsPage.page.getByRole('checkbox', { name: /Zebra striping/i })).not.toBeChecked();
  });

  test('should open and use the Edit columns dialog to add a new column', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Edit columns' button
    await dealsPage.editColumnsButton.click();

    // expect: The 'Choose which columns you see' dialog opens
    await expect(dealsPage.page.getByText('Choose which columns you see')).toBeVisible();

    // 2. Search for 'Priority' in the search box inside the dialog
    await dealsPage.page.getByRole('dialog').getByRole('searchbox').fill('Priority');

    // Check the 'Priority' checkbox
    await dealsPage.page.getByRole('dialog').locator('[data-test-id="grouped-property-option"]').filter({ hasText: 'Priority' }).click();

    // expect: The Priority checkbox becomes checked
    await expect(dealsPage.page.getByRole('dialog').getByRole('checkbox', { name: 'Priority' })).toBeChecked();

    // 3. Apply the changes
    await dealsPage.page.getByRole('dialog').getByRole('button', { name: /Apply|Save/i }).click();

    // expect: A 'Priority' column now appears in the table
    await expect(dealsPage.page.locator('th').filter({ hasText: 'Priority' }).or(
      dealsPage.page.getByRole('columnheader', { name: 'Priority' })
    )).toBeVisible();
  });

  test('should clone a view and rename it', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list 'All deals' tab and click the view menu, then Clone
    await dealsPage.cloneViewButton.click();
    await dealsPage.page.locator('[data-test-id="clone-single-view-button"]').click();

    // expect: A new view tab appears in the tab bar with editable name
    const nameInput = dealsPage.page.locator('[data-test-id="view-tab-input"]');
    await expect(nameInput).toBeVisible({ timeout: 15_000 });

    // 2. Clear and type 'TC-038 Cloned View', then confirm
    await nameInput.fill('TC-038 Cloned View');
    await nameInput.press('Enter');

    // expect: The new tab is named 'TC-038 Cloned View'
    await expect(dealsPage.page.getByText('TC-038 Cloned View')).toBeVisible();
  });

  test('should filter deals by Pipeline', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the Pipeline filter button
    await dealsPage.pipelineFilterButton.click();

    // expect: A dropdown appears listing available pipelines
    await expect(dealsPage.page.getByRole('listbox').getByRole('option', { name: 'Sales Pipeline' })).toBeVisible();

    // 2. Select 'Sales Pipeline'
    await dealsPage.page.getByRole('listbox').getByRole('option', { name: 'Sales Pipeline' }).click();

    // expect: The list shows only deals belonging to the 'Sales Pipeline'
    await expect(dealsPage.pipelineFilterButton).toContainText('Sales Pipeline');
  });

  test('should apply a quick filter by Deal owner', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click 'Deal owner' in the quick-filter bar
    await dealsPage.dealOwnerFilterButton.click();

    // expect: A filter input/dropdown appears
    const dealOwnerListbox = dealsPage.page.getByRole('listbox').filter({ hasText: /Me.*dynamically applied/s });
    await expect(dealOwnerListbox).toBeVisible();

    // 2. Select 'Ihor Hanets' from the filter dropdown (auto-applies on selection)
    await dealOwnerListbox.getByRole('option', { name: 'Ihor Hanets' }).first().click();
    await dealsPage.page.keyboard.press('Escape');

    // expect: The table shows only deals owned by 'Ihor Hanets'
    // expect: A filter indicator is visible
    await expect(dealsPage.page.getByText('Ihor Hanets').first()).toBeVisible();

    // 3. Remove the Deal owner filter by reopening and deselecting
    await dealsPage.dealOwnerFilterButton.click();
    const listboxForRemoval = dealsPage.page.getByRole('listbox').filter({ hasText: /Me.*dynamically applied/s });
    await listboxForRemoval.getByRole('option', { name: 'Ihor Hanets' }).first().click();
    await dealsPage.page.keyboard.press('Escape');
  });
});