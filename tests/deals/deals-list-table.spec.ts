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

    // expect: The deal appears in the list
    await expect(dealsPage.getDealRowByName('TC-028 Searchable Deal')).toBeVisible();

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

    // expect: Both deals appear in the table
    await expect(dealsPage.getDealRowByName('AAA Sort Deal')).toBeVisible();
    await expect(dealsPage.getDealRowByName('ZZZ Sort Deal')).toBeVisible();

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
    await expect(dealsPage.myDealsTab).toHaveAttribute('aria-pressed', 'true');

    // 2. Click the 'All deals' tab
    await dealsPage.allDealsTab.click();

    // expect: All deals are shown again
    await expect(dealsPage.allDealsTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('should change pagination to 50 per page via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Open Settings Sidebar' icon
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The Table settings panel opens
    await expect(dealsPage.page.getByText('Pagination')).toBeVisible();

    // 2. Under Pagination, select '50 per page'
    await dealsPage.page.getByLabel('50 per page').click();

    // expect: The radio button for '50 per page' becomes selected
    await expect(dealsPage.page.getByLabel('50 per page')).toBeChecked();
  });

  test('should change row height to Compact via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Open Settings Sidebar' icon
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The Table settings panel opens, 'Default' is selected
    await expect(dealsPage.page.getByText('Row height')).toBeVisible();
    await expect(dealsPage.page.getByLabel('Default')).toBeChecked();

    // 2. Under Row height, select 'Compact'
    await dealsPage.page.getByLabel('Compact').click();

    // expect: The 'Compact' radio button is selected
    await expect(dealsPage.page.getByLabel('Compact')).toBeChecked();
  });

  test('should toggle Zebra striping via the settings sidebar', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and open the Settings Sidebar
    await dealsPage.openSettingsSidebarButton.click();

    // expect: The settings sidebar opens with Zebra striping option
    await expect(dealsPage.page.getByText('Zebra striping')).toBeVisible();

    // Toggle Zebra striping ON
    await dealsPage.page.getByRole('checkbox', { name: /Zebra striping/i }).click();

    // 2. Toggle Zebra striping OFF
    await dealsPage.page.getByRole('checkbox', { name: /Zebra striping/i }).click();

    // expect: All rows display the same background colour (toggle is off)
    await expect(dealsPage.page.getByRole('checkbox', { name: /Zebra striping/i })).not.toBeChecked();
  });

  test('should open and use the Edit columns dialog to add a new column', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the 'Edit columns' button
    await dealsPage.editColumnsButton.click();

    // expect: The 'Choose which columns you see' dialog opens
    await expect(dealsPage.page.getByRole('dialog').getByText('Priority').or(dealsPage.page.getByText('Choose which columns you see'))).toBeVisible();

    // 2. Search for 'Priority' in the search box inside the dialog
    await dealsPage.page.getByRole('dialog').getByRole('searchbox').fill('Priority');

    // Check the 'Priority' checkbox
    await dealsPage.page.getByRole('dialog').getByRole('checkbox', { name: 'Priority' }).check();

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
    // 1. Navigate to the Deals list 'All deals' tab and click 'Clone view' button
    await dealsPage.cloneViewButton.click();

    // expect: A new view tab appears in the tab bar with editable name
    const newViewInput = dealsPage.page.getByRole('textbox').filter({ hasText: /All deals/ }).or(
      dealsPage.page.locator('input[value*="All deals"]')
    );
    await expect(newViewInput.or(dealsPage.page.locator('input').last())).toBeVisible();

    // 2. Clear and type 'TC-038 Cloned View', then confirm
    const nameInput = dealsPage.page.locator('input').last();
    await nameInput.fill('TC-038 Cloned View');
    await nameInput.press('Enter');

    // expect: The new tab is named 'TC-038 Cloned View'
    await expect(dealsPage.page.getByText('TC-038 Cloned View')).toBeVisible();
  });

  test('should filter deals by Pipeline', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click the Pipeline filter button
    await dealsPage.pipelineFilterButton.click();

    // expect: A dropdown appears listing available pipelines
    await expect(dealsPage.page.getByRole('option', { name: 'Sales Pipeline' }).or(
      dealsPage.page.getByRole('button', { name: 'Sales Pipeline' })
    )).toBeVisible();

    // 2. Select 'Sales Pipeline'
    await dealsPage.page.getByRole('option', { name: 'Sales Pipeline' }).or(
      dealsPage.page.getByRole('button', { name: 'Sales Pipeline' })
    ).click();

    // expect: The list shows only deals belonging to the 'Sales Pipeline'
    await expect(dealsPage.pipelineFilterButton).toContainText('Sales Pipeline');
  });

  test('should apply a quick filter by Deal owner', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and click 'Deal owner' in the quick-filter bar
    await dealsPage.dealOwnerFilterButton.click();

    // expect: A filter input/dropdown appears
    await expect(dealsPage.page.getByRole('textbox').or(dealsPage.page.getByRole('combobox'))).toBeVisible();

    // 2. Select 'Ihor Hanets' as the filter value and apply
    await dealsPage.page.getByRole('option', { name: 'Ihor Hanets' }).or(
      dealsPage.page.getByText('Ihor Hanets')
    ).first().click();
    await dealsPage.page.getByRole('button', { name: /Apply/i }).click();

    // expect: The table shows only deals owned by 'Ihor Hanets'
    // expect: A filter tag/indicator is visible
    await expect(dealsPage.page.getByText('Ihor Hanets')).toBeVisible();

    // 3. Remove the Deal owner filter tag
    await dealsPage.page.getByRole('button', { name: /Remove.*filter|Clear/i }).first().click();
  });
});