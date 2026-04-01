// spec: specs/hubspot-deals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '../../fixtures/base.fixture';
import { ENV } from '../../utils/env';

test.describe('Deal Activity Timeline', () => {
  test.beforeEach(async ({ loginPage, dealsPage }) => {
    await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);
    await dealsPage.open();
  });

  test('should verify creation activities appear in the timeline immediately after deal creation', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-023 Activity Log Deal' and navigate directly to its detail page
    await dealsPage.createDealAndGoToRecord('TC-023 Activity Log Deal');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-023 Activity Log Deal');

    // 2. Scroll to the activity timeline area
    await dealDetailPage.activitiesList.scrollIntoViewIfNeeded();

    // expect: The timeline shows a 'Created' entry: 'This deal was created by Ihor Hanets'
    await expect(dealDetailPage.activitiesList).toContainText('This deal was created by');
    await expect(dealDetailPage.activitiesList).toContainText('Ihor Hanets');
    // expect: The timeline shows a 'Deal Activity' entry: moved to Appointment Scheduled
    await expect(dealDetailPage.activitiesList).toContainText('moved TC-023 Activity Log Deal to Appointment Scheduled');
  });

  test('should add a Note to a deal and display it in the timeline', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-024 Note Test Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-024 Note Test Deal');

    // expect: The deal detail page is open with activity timeline visible
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-024 Note Test Deal');

    // 2. Click the 'Note' (Create a note) button in the activity area
    await dealDetailPage.createNoteButton.click();

    // expect: A note editor appears
    await expect(dealDetailPage.noteEditor).toBeVisible();

    // 3. Type note text and click Create note
    await dealDetailPage.noteEditor.fill('This is a test note for TC-024');
    await dealDetailPage.page.getByRole('button', { name: 'Create note' }).click();

    // expect: The note appears in the activity timeline
    await expect(dealDetailPage.activitiesList).toContainText('This is a test note for TC-024');

    // 4. Click the 'Notes' filter tab in the timeline
    await dealDetailPage.notesTab.click();

    // expect: Only the newly added note is displayed under the Notes filter
    await expect(dealDetailPage.activitiesList).toContainText('This is a test note for TC-024');
  });

  test('should create a Task from a deal and display it in the timeline', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal named 'TC-025 Task Test Deal' and navigate to its detail page
    await dealsPage.createDealAndGoToRecord('TC-025 Task Test Deal');

    // expect: The deal detail page is open
    await expect(dealDetailPage.dealNameHeading).toContainText('TC-025 Task Test Deal');

    // 2. Click the 'Task' (Create a task) button in the activity area
    await dealDetailPage.createTaskButton.click();

    // expect: A task creation form appears
    await expect(dealDetailPage.page.getByRole('dialog').or(dealDetailPage.page.getByLabel('Task title'))).toBeVisible();

    // 3. Enter title and save the task
    await dealDetailPage.page.getByPlaceholder('Enter your task').fill('TC-025 Follow up task');
    await dealDetailPage.page.locator('[data-selenium-test="CreateTaskSidebar__save-btn"]').click();

    // 4. Click the 'Tasks' filter tab in the timeline
    await dealDetailPage.tasksTab.click();

    // expect: Only the task 'TC-025 Follow up task' is displayed
    await expect(dealDetailPage.activitiesList).toContainText('TC-025 Follow up task');
  });

  test('should filter activities by type using timeline tabs', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal, add a note and a task, navigate to the deal detail page
    await dealsPage.createDealAndGoToRecord('TC-026 Filter Activity Deal');

    // Add a note
    await dealDetailPage.createNoteButton.click();
    await dealDetailPage.noteEditor.fill('TC-026 Test Note');
    await dealDetailPage.page.getByRole('button', { name: 'Create note' }).click();

    // expect: The deal detail page shows multiple activities in the timeline
    await expect(dealDetailPage.allActivitiesTab).toBeVisible();

    // 2. Click the 'Notes' tab in the activity timeline navigation
    await dealDetailPage.notesTab.click();

    // expect: Only note activities are shown
    await expect(dealDetailPage.activitiesList).toContainText('TC-026 Test Note');

    // 3. Click the 'Tasks' tab
    await dealDetailPage.tasksTab.click();

    // expect: Only task activities are shown (no notes visible)
    await expect(dealDetailPage.activitiesList).not.toContainText('TC-026 Test Note');

    // 4. Click the 'All activities' tab
    await dealDetailPage.allActivitiesTab.click();

    // expect: All activity types are shown
    await expect(dealDetailPage.activitiesList).toContainText('TC-026 Test Note');
  });

  test('should filter activities using the search box in the timeline', async ({ dealsPage, dealDetailPage }) => {
    // 1. Create a deal, add a note containing the search keyword
    await dealsPage.createDealAndGoToRecord('TC-027 Search Activity Deal');
    await dealDetailPage.createNoteButton.click();
    await dealDetailPage.noteEditor.fill('unique-search-keyword-TC-026');
    await dealDetailPage.page.getByRole('button', { name: 'Create note' }).click();

    // expect: The note appears in the timeline
    await expect(dealDetailPage.activitiesList).toContainText('unique-search-keyword-TC-026');

    // 2. Type in the 'Search activities' search box
    await dealDetailPage.searchActivitiesInput.fill('unique-search-keyword-TC-026');

    // expect: Only the note matching the search text is displayed
    await expect(dealDetailPage.activitiesList).toContainText('unique-search-keyword-TC-026');

    // 3. Clear the search box
    await dealDetailPage.searchActivitiesInput.fill('');

    // expect: All activities are restored in the timeline
    await expect(dealDetailPage.activitiesList).toContainText('This deal was created by');
  });
});