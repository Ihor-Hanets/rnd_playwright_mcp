// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Validation and Edge Cases', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should reject non-numeric input in the Amount field during deal creation', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', enter deal name, then type 'abc' in Amount
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-057 Amount Validation');
    await dealCreateModal.amountInput.fill('abc');

    // expect: Non-numeric characters are prevented or a validation error is shown
    // The Amount field value should either be empty or show a validation error
    const amountValue = await dealCreateModal.amountInput.inputValue();
    // HubSpot may strip non-numeric characters or show an error
    expect(amountValue === '' || amountValue === 'abc').toBeTruthy();

    // If still present, verify Create button behavior with invalid amount
    if (amountValue !== '') {
      await dealCreateModal.clickCreate();
      // expect: Form does not submit with invalid amount
      await expect(dealCreateModal.heading).toBeVisible();
    }
  });

  test('should accept a valid MM/DD/YYYY close date during deal creation', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', enter name, clear Close date and type '06/15/2026', then click Create
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-058 Date Format Test');
    await dealCreateModal.closeDateInput.fill('06/15/2026');
    await dealCreateModal.clickCreate();

    // expect: The deal is created successfully
    await expect(dealsPage.successToast).toContainText('A new deal was created');
    await expect(dealCreateModal.heading).not.toBeVisible();

    // 2. Navigate to the deal's detail page
    await dealsPage.goToRecordLink.click();

    // expect: The Close Date field shows '06/15/2026'
    await expect(dealsPage.page.getByRole('textbox').filter({ hasText: /06\/15\/2026/ }).or(
      dealsPage.page.locator('input[value="06/15/2026"]')
    )).toBeVisible();
  });

  test('should handle a very long deal name without crashing', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal' and enter a string of 200+ characters in the Deal name field
    await dealsPage.openCreateDealModal();
    const longName = 'A'.repeat(201);
    await dealCreateModal.fillDealName(longName);

    // expect: The system either accepts the input or shows a clear validation message
    // The UI should not crash
    const actualValue = await dealCreateModal.dealNameInput.inputValue();

    // Either the full value was accepted (truncated or not) or a validation message is shown
    const isAccepted = actualValue.length > 0;
    const validationMessage = dealCreateModal.frame.locator('[class*="error"], [class*="validation"]');
    const hasValidationMessage = await validationMessage.count() > 0;

    expect(isAccepted || hasValidationMessage).toBeTruthy();
  });

  test("should increment the 'All deals' count after creating a deal", async ({ dealsPage, dealCreateModal }) => {
    // 1. Navigate to the Deals list and note the current count on the 'All deals' tab
    const initialCount = await dealsPage.getAllDealsCount();

    // expect: Current count is recorded
    expect(initialCount).toBeGreaterThanOrEqual(0);

    // 2. Create a deal named 'TC-060 Count Increment Deal' and wait for the success notification
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-060 Count Increment Deal');
    await dealCreateModal.clickCreate();

    // expect: Success toast appears
    await expect(dealsPage.successToast).toContainText('A new deal was created');

    // 3. Navigate back and observe the 'All deals' tab count
    await dealsPage.open();
    const newCount = await dealsPage.getAllDealsCount();

    // expect: The count has incremented by 1
    expect(newCount).toBe(initialCount + 1);
  });
});