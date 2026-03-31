// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Deal Actions Menu', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should display all expected items in the Actions dropdown', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-019 Actions Verify Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-019 Actions Verify Deal');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-019 Actions Verify Deal');

    // 2. Click the 'Actions' button at the top of the left panel
    await dealDetailPage.actionsButton.click();

    // expect: A dropdown menu opens with exactly these items
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Unfollow' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'View all properties' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'View property history' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'View association history' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Review associations' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Summarize' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('link', { name: /Restore activity/ })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Merge' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Clone' })).toBeVisible();
    await expect(dealDetailPage.actionsMenu.getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('should clone a deal via the Actions menu', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-020 Original Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-020 Original Deal');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-020 Original Deal');

    // 2. Click 'Actions' → 'Clone'
    await dealDetailPage.actionsButton.click();
    await dealDetailPage.actionsMenu.getByRole('button', { name: 'Clone' }).click();

    // expect: User is navigated to a new deal detail page (the clone)
    await expect(dealDetailPage.page).toHaveURL(/\/record\/0-3\//);
    // expect: The cloned deal has a name derived from the original
    await expect(dealDetailPage.dealNameHeading).toContainText('Copy of TC-020 Original Deal');

    // 3. Navigate to the Deals list
    await dealsPage.open();

    // expect: Both original and cloned deal appear in the list
    await expect(dealsPage.getDealRowByName('TC-020 Original Deal')).toBeVisible();
    await expect(dealsPage.getDealRowByName('Copy of TC-020 Original Deal')).toBeVisible();
  });

  test('should delete a deal via the Actions menu with confirmation', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-021 Deal To Delete' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-021 Deal To Delete');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-021 Deal To Delete');

    // 2. Click 'Actions' → 'Delete'
    await dealDetailPage.actionsButton.click();
    await dealDetailPage.actionsMenu.getByRole('button', { name: 'Delete' }).click();

    // expect: A confirmation dialog appears
    await expect(dealDetailPage.page.getByRole('dialog')).toBeVisible();

    // 3. Click the confirm Delete button in the dialog
    await dealDetailPage.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

    // expect: The deal is deleted and user is redirected to the Deals list
    await expect(dealDetailPage.page).toHaveURL(/\/objects\/0-3\/views\//);

    // 4. Verify the deleted deal does not appear in the list
    const row = dealsPage.getDealRowByName('TC-021 Deal To Delete');
    await expect(row).not.toBeVisible();
  });

  test('should open all properties panel via Actions menu', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-022 View Props Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-022 View Props Deal');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-022 View Props Deal');

    // 2. Click 'Actions' → 'View all properties'
    await dealDetailPage.actionsButton.click();
    await dealDetailPage.actionsMenu.getByRole('button', { name: 'View all properties' }).click();

    // expect: A panel or page opens displaying all deal properties
    await expect(dealDetailPage.page.getByRole('dialog').or(dealDetailPage.page.getByText('All properties'))).toBeVisible();
  });
});