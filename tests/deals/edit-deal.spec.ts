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
    await dealDetailPage.dealNameInput.fill('TC-013 Edited Deal Name');
    await dealDetailPage.dealNameInput.press('Enter');

    // expect: The deal name heading updates to 'TC-013 Edited Deal Name'
    await expect(dealDetailPage.dealNameHeading).toHaveText('TC-013 Edited Deal Name');

    // 4. Navigate back to the Deals list page
    await dealsPage.open();

    // expect: The deal is listed as 'TC-013 Edited Deal Name'
    await expect(dealsPage.getDealRowByName('TC-013 Edited Deal Name')).toBeVisible();
  });

  test('should change deal stage from the deal detail page and log activity', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-014 Stage Change Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-014 Stage Change Deal');

    // expect: The Deal Stage field shows 'Appointment Scheduled'
    await expect(dealDetailPage.dealStageButton).toContainText('Appointment Scheduled');

    // 2. Click the Deal Stage dropdown and select 'Qualified To Buy'
    await dealDetailPage.dealStageButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Qualified To Buy' }).click();

    // expect: The Deal Stage field updates to 'Qualified To Buy'
    await expect(dealDetailPage.dealStageButton).toContainText('Qualified To Buy');

    // 3. Scroll down to the activity timeline
    await dealDetailPage.activitiesList.scrollIntoViewIfNeeded();

    // expect: A new activity entry appears about stage change
    await expect(dealDetailPage.activitiesList).toContainText('moved TC-014 Stage Change Deal to Qualified To Buy');
  });

  test('should edit the Amount field on the deal detail page', async ({ dealsPage, dealDetailPage }) => {
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
    await dealDetailPage.dealTypeButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Existing Business' }).click();

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
    await dealDetailPage.priorityButton.click();
    await dealDetailPage.page.getByRole('button', { name: 'Medium' }).click();

    // expect: The Priority field updates to 'Medium'
    await expect(dealDetailPage.priorityButton).toContainText('Medium');

    // 3. Reload the page
    await dealDetailPage.page.reload();

    // expect: The Priority field still shows 'Medium'
    await expect(dealDetailPage.priorityButton).toContainText('Medium');
  });
});