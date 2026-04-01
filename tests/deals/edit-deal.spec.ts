// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Edit Deal', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should edit deal name inline on the detail page', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-013 Edit Name Test' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-013 Edit Name Test');

    // expect: The deal detail page is open with heading 'TC-013 Edit Name Test'
    await expect(dealDetailPage.dealNameHeading).toHaveText('TC-013 Edit Name Test');

    // 2. Click the Edit (pencil) icon next to the deal name heading
    await dealDetailPage.editNameButton.click();

    // expect: The deal name becomes an editable text field
    await expect(dealDetailPage.dealNameInput).toBeVisible();

    // 3. Clear the existing text and type new name, then save (press Enter)
    // Listen for the save PATCH/PUT response before triggering the edit so we don't miss it
    const nameSaveResponse = dealDetailPage.page.waitForResponse(
      (resp) =>
        (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
        resp.url().includes('hubspot.com') &&
        resp.status() < 400,
      { timeout: 10000 },
    );
    await dealDetailPage.dealNameInput.fill('TC-013 Edited Deal Name');
    await dealDetailPage.dealNameInput.press('Tab');
    await nameSaveResponse;

    // expect: The deal name heading updates to 'TC-013 Edited Deal Name'
    await expect(dealDetailPage.dealNameHeading).toHaveText('TC-013 Edited Deal Name');

    // 4. Reload the detail page to confirm the name was persisted server-side
    await dealDetailPage.page.reload();

    // expect: The deal is still named 'TC-013 Edited Deal Name' after a full page reload
    await expect(dealDetailPage.dealNameHeading).toHaveText('TC-013 Edited Deal Name');
  });

  test('should change deal stage from the deal detail page and log activity', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-014 Stage Change Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-014 Stage Change Deal');

    // expect: The Deal Stage field shows 'Appointment Scheduled'
    await expect(dealDetailPage.dealStageButton).toContainText('Appointment Scheduled');

    // 2. Click the Deal Stage dropdown and select 'Qualified To Buy'
    // Listen for the save PATCH/PUT response before triggering the click so we don't miss it
    const stageSaveResponse = dealDetailPage.page.waitForResponse(
      (resp) =>
        (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
        resp.url().includes('hubspot.com') &&
        resp.status() < 400,
      { timeout: 10000 },
    );
    await dealDetailPage.dealStageButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Qualified To Buy' }).click();
    await stageSaveResponse;

    // expect: The Deal Stage field updates to 'Qualified To Buy'
    await expect(dealDetailPage.dealStageButton).toContainText('Qualified To Buy');

    // 3. Reload to ensure the activity feed includes the new stage change entry
    await dealDetailPage.page.reload();
    await dealDetailPage.activitiesList.scrollIntoViewIfNeeded();

    // expect: A new activity entry appears about stage change
    await expect(dealDetailPage.activitiesList).toContainText(/moved TC-014 Stage Change Deal.*to Qualified To Buy/);
  });

  // TODO: The amount field in the HubSpot highlights section (data-test-id="highlight-property-display-amount") is
  // a read-only display span (cursor: auto, no onclick). Clicking it does not reveal an editable input.
  // There is no property-input-amount on this page. The test needs to be updated once the Amount property
  // is added to an editable section of the deal record layout.
  test.fixme('should edit the Amount field on the deal detail page', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-015 Amount Edit Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-015 Amount Edit Deal');

    // expect: The Amount field shows '--'
    await expect(dealDetailPage.amountField).toContainText('--');

    // 2. Click the Amount field and enter '12500'
    await dealDetailPage.amountField.click();
    await dealDetailPage.amountInput.fill('12500');

    // 3. Save the change and reload the page
    await dealDetailPage.amountInput.press('Enter');
    await dealDetailPage.page.reload();

    // expect: The Amount field shows formatted value
    await expect(dealDetailPage.amountField).toContainText('12,500');
  });

  test('should edit the Close date field on the deal detail page', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-016 Close Date Edit' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-016 Close Date Edit');

    // expect: The Close Date field is visible in the highlights area
    await expect(dealDetailPage.closeDateInput).toBeVisible();

    // 2. Click the Close date field and change the date to '12/31/2026'
    await dealDetailPage.closeDateInput.fill('12/31/2026');
    await dealDetailPage.closeDateInput.press('Enter');

    // 3. Save the change and reload the page
    await dealDetailPage.page.reload();

    // expect: The Close Date field shows '12/31/2026'
    await expect(dealDetailPage.closeDateInput).toHaveValue('12/31/2026');
  });

  test('should edit Deal type from the About this deal section', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-017 Deal Type Edit' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-017 Deal Type Edit');

    // expect: The Deal Type field shows '--'
    await expect(dealDetailPage.dealTypeButton).toContainText('--');

    // 2. Click the Deal Type field and select 'Existing Business'
    // Listen for the save PATCH/PUT response before triggering the click so we don't miss it
    const dealTypeSaveResponse = dealDetailPage.page.waitForResponse(
      (resp) =>
        (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
        resp.url().includes('hubspot.com') &&
        resp.status() < 400,
      { timeout: 10000 },
    );
    await dealDetailPage.dealTypeButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Existing Business' }).click();
    await dealTypeSaveResponse;

    // expect: The Deal Type field updates to 'Existing Business'
    await expect(dealDetailPage.dealTypeButton).toContainText('Existing Business');

    // 3. Reload the page
    await dealDetailPage.page.reload();

    // expect: The Deal Type field still shows 'Existing Business'
    await expect(dealDetailPage.dealTypeButton).toContainText('Existing Business');
  });

  test('should edit Priority from the About this deal section', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-018 Priority Edit Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-018 Priority Edit Deal');

    // expect: The Priority field shows '--'
    await expect(dealDetailPage.priorityButton).toContainText('--');

    // 2. Click the Priority field and select 'Medium'
    // Listen for the save PATCH/PUT response before triggering the click so we don't miss it
    const prioritySaveResponse = dealDetailPage.page.waitForResponse(
      (resp) =>
        (resp.request().method() === 'PATCH' || resp.request().method() === 'PUT') &&
        resp.url().includes('hubspot.com') &&
        resp.status() < 400,
      { timeout: 10000 },
    );
    await dealDetailPage.priorityButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Medium' }).click();
    await prioritySaveResponse;

    // expect: The Priority field updates to 'Medium'
    await expect(dealDetailPage.priorityButton).toContainText('Medium');

    // 3. Reload the page
    await dealDetailPage.page.reload();

    // expect: The Priority field still shows 'Medium'
    await expect(dealDetailPage.priorityButton).toContainText('Medium');
  });
});