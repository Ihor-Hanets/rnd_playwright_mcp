// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Deals List View — Board', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should display all 7 pipeline stage columns in Board view', async ({ dealsPage }) => {
    // 1. Navigate to the Deals list and switch to Board view
    await dealsPage.switchToBoardView();

    // expect: Exactly 7 columns are visible in order
    await expect(dealsPage.page.getByText('Appointment Scheduled').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Qualified To Buy').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Presentation Scheduled').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Decision Maker Bought-In').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Contract Sent').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Closed Won').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Closed Lost').first()).toBeVisible();

    // expect: Each column displays a deal count and total/weighted amounts
    await expect(dealsPage.page.getByText('Total amount').first()).toBeVisible();
    await expect(dealsPage.page.getByText('Weighted amount').first()).toBeVisible();
  });

  test('should display correct information on a deal card in Board view', async ({ dealsPage }) => {
    // 1. Create a deal named 'TC-042 Board Card Deal' and switch to Board view
    await dealsPage.createDealAndGoToRecord('TC-042 Board Card Deal');
    await dealsPage.open();
    await dealsPage.switchToBoardView();

    // expect: The deal card is visible in the 'Appointment Scheduled' column
    await expect(dealsPage.getBoardCard('TC-042 Board Card Deal')).toBeVisible();

    // 2. Inspect the deal card content
    const card = dealsPage.getBoardCard('TC-042 Board Card Deal');
    await expect(card).toContainText('TC-042 Board Card Deal');
    await expect(card).toContainText('Close date');
    await expect(card).toContainText('Ihor Hanets');
  });

  test('should navigate to the deal detail page by clicking the deal name on a card', async ({ dealsPage }) => {
    // 1. Switch to Board view and click the deal name link on any deal card
    await dealsPage.switchToBoardView();
    // Use elementHandle for a stable DOM reference (avoids re-evaluation between textContent() and click())
    const dealLinkHandle = await dealsPage.page.locator('[data-test-id="cdb-card"] a').first().elementHandle();
    const dealName = (await dealLinkHandle?.textContent())?.trim() ?? '';
    await dealLinkHandle?.click();

    // expect: User is navigated to that deal's detail page
    await expect(dealsPage.page).toHaveURL(/\/record\/0-3\//);
    await expect(dealsPage.page.getByRole('heading', { level: 2 })).toContainText(dealName);
  });

  test('should select a deal card in Board view using the card checkbox', async ({ dealsPage }) => {
    // 1. Switch to Board view and hover over a deal card
    await dealsPage.switchToBoardView();
    const firstCard = dealsPage.page.getByRole('button', { name: /^Select card / }).first();
    await firstCard.hover();

    // expect: A 'Select card' checkbox appears on the deal card
    const selectCheckbox = firstCard.getByRole('checkbox');
    await expect(selectCheckbox).toBeVisible();

    // 2. Click the Select card checkbox
    // Use native evaluate click to trigger browser event propagation through the ToggleInputWrapper
    await firstCard.locator('[class*="InnerSpan"]').first().evaluate((el: HTMLElement) => el.click());

    // expect: The card is selected (after selection, the checkbox accessible name changes to "Deselect card")
    await expect(dealsPage.page.getByRole('checkbox', { name: 'Deselect card' }).first()).toBeChecked();

    // expect: A bulk actions bar appears at the top of the page
    await expect(dealsPage.page.getByText(/deal selected/)).toBeVisible();
  });

  test.fixme('should update column Total amount after setting a deal amount', async ({ dealsPage, dealDetailPage }) => {
    // 1. Switch to Board view and note the Total amount for the 'Appointment Scheduled' column
    await dealsPage.switchToBoardView();
    const appointmentCol = dealsPage.page.locator('text=Appointment Scheduled').first().locator('..').locator('..');
    const initialTotalText = await dealsPage.page.getByText('| Total amount').first().textContent();

    // 2. Create a deal, navigate to its detail page, and set Amount to '10000'
    await dealsPage.open();
    await dealsPage.createDealAndGoToRecord('TC-045 Amount Update Deal');
    // TODO: [data-test-id="highlight-property-display-amount"] does not open an editable input when clicked.
    // The Amount highlight property in HubSpot's deal hero section does not expose an accessible
    // inline edit input via the ARIA tree. The interaction pattern is not compatible with standard
    // Playwright click+fill automation.
    await dealDetailPage.amountField.click();
    await dealDetailPage.amountInput.fill('10000');
    await dealDetailPage.amountInput.press('Enter');

    // expect: Amount is saved as $10,000
    await dealDetailPage.page.reload();
    await expect(dealDetailPage.amountField).toContainText('10,000');

    // 3. Navigate back to Board view
    await dealsPage.open();
    await dealsPage.switchToBoardView();

    // expect: The 'Appointment Scheduled' column Total amount has increased
    await expect(dealsPage.page.getByText(/\$10,000.*Total amount|Total amount.*\$10,000/).or(
      dealsPage.page.getByText('$10,000')
    )).toBeVisible();
  });

  test('should open the Export dialog from Board view', async ({ dealsPage }) => {
    // 1. Switch to Board view and click the 'Export' button
    await dealsPage.switchToBoardView();
    await dealsPage.page.getByRole('button', { name: 'Export' }).click();

    // expect: An export dialog or modal appears
    await expect(dealsPage.page.getByRole('dialog').first()).toBeVisible();
  });

  test('should sort deal cards in Board view using the Sort button', async ({ dealsPage }) => {
    // 1. Switch to Board view and click the 'Sort' button
    await dealsPage.switchToBoardView();
    await dealsPage.page.getByRole('button', { name: 'Sort' }).click();

    // expect: A sort panel appears showing current sort criterion
    await expect(dealsPage.page.getByRole('heading', { name: /Sort by/i })).toBeVisible();

    // 2. Change sort direction (e.g., Z → A)
    await dealsPage.page.getByRole('button', { name: /Z.*A/i }).first().click();

    // expect: Deal cards within each column are still visible after sort
    await expect(dealsPage.page.getByRole('button', { name: /^Select card / }).first()).toBeVisible();
  });
});