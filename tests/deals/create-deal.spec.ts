// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Create Deal', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should create a deal with required fields only', async ({ dealsPage, dealCreateModal }) => {
    // 1. Navigate to the Deals list page and click the 'Create new' button
    await dealsPage.clickCreateNew();

    // expect: A dropdown menu appears with options: Contact, Company, Deal, Ticket, Task
    await expect(dealsPage.createContactOption).toBeVisible();
    await expect(dealsPage.createCompanyOption).toBeVisible();
    await expect(dealsPage.createDealOption).toBeVisible();
    await expect(dealsPage.createTicketOption).toBeVisible();
    await expect(dealsPage.createTaskOption).toBeVisible();

    // 2. Click 'Deal' from the dropdown menu
    await dealsPage.clickDealOption();

    // expect: The 'Create Deal' modal opens
    await expect(dealCreateModal.heading).toBeVisible();
    // expect: Pipeline is pre-populated with 'Sales Pipeline'
    await expect(dealCreateModal.pipelineButton).toContainText('Sales Pipeline');
    // expect: Deal stage is pre-populated with 'Appointment Scheduled'
    await expect(dealCreateModal.dealStageButton).toContainText('Appointment Scheduled');
    // expect: Close date is pre-populated with today's date
    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
    await expect(dealCreateModal.closeDateInput).toHaveValue(todayFormatted);
    // expect: Deal owner is pre-populated with 'Ihor Hanets'
    await expect(dealCreateModal.dealOwnerButton).toContainText('Ihor Hanets');
    // expect: The Create button is disabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'true');

    // 3. Type 'TC-001 Required Fields Deal' into the Deal name field
    await dealCreateModal.fillDealName('TC-001 Required Fields Deal');

    // expect: The Create button becomes enabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'false');

    // 4. Click the 'Create' button
    await dealCreateModal.clickCreate();

    // expect: A success toast notification appears with the text 'A new deal was created'
    await expect(dealsPage.successToast).toContainText('A new deal was created');
    // expect: A 'Go to record' link is visible in the notification
    await expect(dealsPage.goToRecordLink).toBeVisible();
    // expect: The Create Deal modal closes
    await expect(dealCreateModal.heading).not.toBeVisible();

    // 5. Navigate back to the Deals list page
    await dealsPage.open();

    // expect: The deal appears in the table with stage 'Appointment Scheduled (Sales Pipeline)'
    await expect(dealsPage.getDealRowByName('TC-001 Required Fields Deal')).toBeVisible();
    await expect(dealsPage.getDealStageForRow('TC-001 Required Fields Deal')).toContainText('Appointment Scheduled (Sales Pipeline)');
  });

  test('should create a deal with all optional fields populated', async ({ dealsPage, dealCreateModal }) => {
    // 1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    await dealsPage.openCreateDealModal();

    // expect: The Create Deal modal opens
    await expect(dealCreateModal.heading).toBeVisible();

    // 2. Enter 'TC-002 Full Fields Deal' in the Deal name field
    await dealCreateModal.fillDealName('TC-002 Full Fields Deal');

    // expect: The Create button becomes enabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'false');

    // 3. Click the Deal stage dropdown and select 'Qualified To Buy'
    await dealCreateModal.selectDealStage('Qualified To Buy');

    // expect: The Deal stage field shows 'Qualified To Buy'
    await expect(dealCreateModal.dealStageButton).toContainText('Qualified To Buy');

    // 4. Click the Amount field and enter '5000'
    await dealCreateModal.fillAmount('5000');

    // expect: The Amount field shows '5000'
    await expect(dealCreateModal.amountInput).toHaveValue('5000');

    // 5. Click the Deal type dropdown and select 'New Business'
    await dealCreateModal.selectDealType('New Business');

    // expect: The Deal type field shows 'New Business'
    await expect(dealCreateModal.dealTypeButton).toContainText('New Business');

    // 6. Click the Priority dropdown and select 'High'
    await dealCreateModal.selectPriority('High');

    // expect: The Priority field shows 'High'
    await expect(dealCreateModal.priorityButton).toContainText('High');

    // 7. Click the 'Create' button
    await dealCreateModal.clickCreate();

    // expect: Success toast: 'A new deal was created'
    await expect(dealsPage.successToast).toContainText('A new deal was created');

    // 8. Navigate to the deals list and find 'TC-002 Full Fields Deal'
    await dealsPage.open();

    // expect: The deal appears with stage 'Qualified To Buy (Sales Pipeline)'
    await expect(dealsPage.getDealRowByName('TC-002 Full Fields Deal')).toBeVisible();
    await expect(dealsPage.getDealStageForRow('TC-002 Full Fields Deal')).toContainText('Qualified To Buy (Sales Pipeline)');
  });

  test('should keep modal open and reset after using Create and add another', async ({ dealsPage, dealCreateModal }) => {
    // 1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    await dealsPage.openCreateDealModal();

    // expect: The Create Deal modal opens
    await expect(dealCreateModal.heading).toBeVisible();

    // 2. Enter 'TC-003 Create And Add Another Deal' in the Deal name field
    await dealCreateModal.fillDealName('TC-003 Create And Add Another Deal');

    // expect: The Create button and 'Create and add another' button are both enabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'false');
    await expect(dealCreateModal.createAndAddAnotherButton).toHaveAttribute('aria-disabled', 'false');

    // 3. Click the 'Create and add another' button
    await dealCreateModal.clickCreateAndAddAnother();

    // expect: A success toast appears for the first deal
    await expect(dealsPage.successToast).toContainText('A new deal was created');
    // expect: The Create Deal modal stays open
    await expect(dealCreateModal.heading).toBeVisible();
    // expect: The Deal name field is cleared and ready for a new entry
    await expect(dealCreateModal.dealNameInput).toHaveValue('');
  });

  test('should disable the Create button when Deal name is empty', async ({ dealsPage, dealCreateModal }) => {
    // 1. Navigate to the Deals list page and click 'Create new' → 'Deal'
    await dealsPage.openCreateDealModal();

    // 2. Leave the Deal name field empty and observe the Create button
    // expect: The Create button is disabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'true');

    // 3. Click inside the Deal name field then click outside without entering text
    await dealCreateModal.dealNameInput.click();
    await dealCreateModal.amountInput.click();

    // expect: The Create button remains disabled
    await expect(dealCreateModal.createButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('should cancel deal creation using the Cancel button', async ({ dealsPage, dealCreateModal }) => {
    // 1. Note the current deal count on the 'All deals' tab
    const initialCount = await dealsPage.getAllDealsCount();

    // 2. Click 'Create new' → 'Deal', then enter 'TC-005 Should Not Be Created'
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-005 Should Not Be Created');

    // expect: The Create Deal modal is open with text entered
    await expect(dealCreateModal.heading).toBeVisible();

    // 3. Click the 'Cancel' button at the bottom of the modal
    await dealCreateModal.clickCancel();

    // expect: The Create Deal modal closes
    await expect(dealCreateModal.heading).not.toBeVisible();

    // expect: The deal count on the 'All deals' tab remains unchanged
    await expect(dealsPage.allDealsTabButton).toContainText(String(initialCount));
  });

  test('should cancel deal creation using the X (close) button', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', then enter 'TC-006 Cancel via X'
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-006 Cancel via X');

    // expect: The Create Deal modal is open
    await expect(dealCreateModal.heading).toBeVisible();

    // 2. Click the X (Close) button in the modal header
    await dealCreateModal.clickClose();

    // expect: The Create Deal modal closes
    await expect(dealCreateModal.heading).not.toBeVisible();
  });

  test('should display all 7 pipeline stages in the Deal stage dropdown', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal' and click the Deal stage dropdown
    await dealsPage.openCreateDealModal();
    await dealCreateModal.dealStageButton.click();

    // expect: Exactly 7 options appear in order
    const stageOptions = dealCreateModal.dealStageOptionsList;
    await expect(stageOptions).toHaveCount(7);
    await expect(stageOptions.nth(0)).toContainText('Appointment Scheduled');
    await expect(stageOptions.nth(1)).toContainText('Qualified To Buy');
    await expect(stageOptions.nth(2)).toContainText('Presentation Scheduled');
    await expect(stageOptions.nth(3)).toContainText('Decision Maker Bought-In');
    await expect(stageOptions.nth(4)).toContainText('Contract Sent');
    await expect(stageOptions.nth(5)).toContainText('Closed Won');
    await expect(stageOptions.nth(6)).toContainText('Closed Lost');
  });

  test('should display correct Deal type options', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal' and click the Deal type dropdown
    await dealsPage.openCreateDealModal();
    await dealCreateModal.dealTypeButton.click();

    // expect: The dropdown opens and lists exactly 3 options: blank, 'New Business', and 'Existing Business'
    const typeOptions = dealCreateModal.dealTypeOptionsList;
    await expect(typeOptions).toHaveCount(3);
    await expect(typeOptions.nth(1)).toContainText('New Business');
    await expect(typeOptions.nth(2)).toContainText('Existing Business');
  });

  test('should display correct Priority options', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal' and click the Priority dropdown
    await dealsPage.openCreateDealModal();
    await dealCreateModal.priorityButton.click();

    // expect: The dropdown opens and lists exactly 4 options: blank, 'Low', 'Medium', 'High'
    const priorityOptions = dealCreateModal.priorityOptionsList;
    await expect(priorityOptions).toHaveCount(4);
    await expect(priorityOptions.nth(1)).toContainText('Low');
    await expect(priorityOptions.nth(2)).toContainText('Medium');
    await expect(priorityOptions.nth(3)).toContainText('High');
  });

  test('should create a deal with Closed Won stage', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', enter name, select 'Closed Won', then click Create
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-010 Closed Won Deal');
    await dealCreateModal.selectDealStage('Closed Won');
    await dealCreateModal.clickCreate();

    // expect: Success toast appears
    await expect(dealsPage.successToast).toContainText('A new deal was created');

    // 2. Navigate to the Deals list and find the deal
    await dealsPage.open();

    // expect: The deal is listed with stage 'Closed Won (Sales Pipeline)'
    await expect(dealsPage.getDealRowByName('TC-010 Closed Won Deal')).toBeVisible();
    await expect(dealsPage.getDealStageForRow('TC-010 Closed Won Deal')).toContainText('Closed Won (Sales Pipeline)');
  });

  test('should create a deal with Closed Lost stage', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', enter name, select 'Closed Lost', then click Create
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-011 Closed Lost Deal');
    await dealCreateModal.selectDealStage('Closed Lost');
    await dealCreateModal.clickCreate();

    // expect: Success toast appears
    await expect(dealsPage.successToast).toContainText('A new deal was created');

    // 2. Navigate to the Deals list and find the deal
    await dealsPage.open();

    // expect: The deal is listed with stage 'Closed Lost (Sales Pipeline)'
    await expect(dealsPage.getDealRowByName('TC-011 Closed Lost Deal')).toBeVisible();
    await expect(dealsPage.getDealStageForRow('TC-011 Closed Lost Deal')).toContainText('Closed Lost (Sales Pipeline)');
  });

  test('should navigate to the deal detail page via the Go to record link', async ({ dealsPage, dealCreateModal }) => {
    // 1. Click 'Create new' → 'Deal', enter name, click Create
    await dealsPage.openCreateDealModal();
    await dealCreateModal.fillDealName('TC-012 Notification Link Deal');
    await dealCreateModal.clickCreate();

    // expect: Success toast appears with a 'Go to record' link
    await expect(dealsPage.successToast).toContainText('A new deal was created');
    await expect(dealsPage.goToRecordLink).toBeVisible();

    // 2. Click the 'Go to record' link in the success notification
    await dealsPage.goToRecordLink.click();

    // expect: User is navigated to the deal detail page
    await expect(dealsPage.page).toHaveTitle('TC-012 Notification Link Deal');
    // expect: The page title shows the deal name
    await expect(dealsPage.page.getByRole('heading', { name: 'TC-012 Notification Link Deal', level: 2 })).toBeVisible();
  });
});