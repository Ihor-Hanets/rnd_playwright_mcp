// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Deal Record Associations', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should display Contacts, Companies, Tickets, and Attachments sections in the right sidebar', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-055 Sidebar Sections Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-055 Sidebar Sections Deal');

    // expect: The right sidebar is visible
    await expect(dealDetailPage.rightSidebar).toBeVisible();

    // 2. Inspect the right sidebar sections
    // expect: The right sidebar contains Contacts (0), Companies (0), Tickets (0), Attachments with Add buttons
    await expect(dealDetailPage.contactsSection).toBeVisible();
    await expect(dealDetailPage.contactsSection).toContainText('Contacts (0)');
    await expect(dealDetailPage.contactsSection.getByRole('button', { name: 'Add' })).toBeVisible();

    await expect(dealDetailPage.companiesSection).toBeVisible();
    await expect(dealDetailPage.companiesSection).toContainText('Companies (0)');
    await expect(dealDetailPage.companiesSection.getByRole('button', { name: 'Add' })).toBeVisible();

    await expect(dealDetailPage.ticketsSection).toBeVisible();
    await expect(dealDetailPage.ticketsSection).toContainText('Tickets (0)');
    await expect(dealDetailPage.ticketsSection.getByRole('button', { name: 'Add' })).toBeVisible();

    await expect(dealDetailPage.attachmentsSection).toBeVisible();
    await expect(dealDetailPage.attachmentsSection.getByRole('button', { name: 'Add' })).toBeVisible();
  });

  test('should upload an attachment to a deal', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-056 Attachment Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-056 Attachment Deal');

    // Click the 'Add' button under Attachments
    await dealDetailPage.attachmentsSection.getByRole('button', { name: 'Add' }).click();

    // expect: A file upload dialog or dropzone appears
    await expect(dealDetailPage.page.getByRole('dialog').or(
      dealDetailPage.page.getByRole('button', { name: /upload|file/i })
    )).toBeVisible();

    // 2. Upload a small test file
    const fileInput = dealDetailPage.page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-attachment.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test attachment content for TC-056'),
    });

    // expect: The file appears listed in the Attachments section
    await expect(dealDetailPage.attachmentsSection).toContainText('test-attachment.txt');
  });
});