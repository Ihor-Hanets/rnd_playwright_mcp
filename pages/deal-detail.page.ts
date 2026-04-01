import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';

const hubUrl = (path: string): string =>
  ENV.baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');

export class DealDetailPage extends BasePage {
  readonly dealNameHeading: Locator;
  readonly dealNameInput: Locator;
  readonly editNameButton: Locator;
  readonly dealStageButton: Locator;
  readonly amountField: Locator;
  readonly amountInput: Locator;
  readonly closeDateInput: Locator;
  readonly dealTypeButton: Locator;
  readonly priorityButton: Locator;
  readonly actionsButton: Locator;
  readonly actionsMenu: Locator;
  readonly activitiesList: Locator;
  readonly createNoteButton: Locator;
  readonly noteEditor: Locator;
  readonly notesTab: Locator;
  readonly tasksTab: Locator;
  readonly allActivitiesTab: Locator;
  readonly searchActivitiesInput: Locator;
  readonly createTaskButton: Locator;
  readonly rightSidebar: Locator;
  readonly contactsSection: Locator;
  readonly companiesSection: Locator;
  readonly ticketsSection: Locator;
  readonly attachmentsSection: Locator;

  constructor(page: Page) {
    super(page);
    this.dealNameHeading = page.getByRole('heading', { level: 2 });
    this.dealNameInput = page
      .locator('[data-selenium-test="deal-name-input"]')
      .or(page.locator('h2 input, h2 ~ input').first());
    this.editNameButton = page
      .getByRole('button', { name: /edit.*name|pencil/i })
      .or(page.locator('[aria-label*="Edit"]').first());
    this.dealStageButton = page
      .locator('[data-test-id="deal-stage-select"] button')
      .or(page.locator('[class*="stage"] button').first());
    this.amountField = page.locator('[data-test-id="highlight-property-display-amount"]');
    this.amountInput = page
      .locator('[data-test-id="highlight-property-input-amount"]')
      .or(page.locator('[data-test-id="highlight-property-item-amount"] input'))
      .or(page.locator('[data-property-name="amount"] input'))
      .or(page.getByRole('spinbutton').first())
      .or(page.getByLabel(/^amount$/i));
    this.closeDateInput = page
      .locator('[data-property-name="closedate"] input')
      .or(page.getByLabel(/close date/i));
    this.dealTypeButton = page
      .locator('[data-property-name="dealtype"] button')
      .or(page.getByLabel(/deal type/i).locator('..').getByRole('button'));
    this.priorityButton = page
      .locator('[data-property-name="hs_priority"] button')
      .or(page.getByLabel(/priority/i).locator('..').getByRole('button'));
    this.actionsButton = page.locator('[data-selenium-test="profile-settings-actions-btn"]');
    this.actionsMenu = page.locator('[id^="abstractdropdown-content-"]');
    this.activitiesList = page
      .locator('[data-test-id="activity-feed"]')
      .or(page.getByRole('region', { name: /activities|timeline/i }))
      .or(page.locator('[class*="activity"], [class*="timeline"]').first());
    this.createNoteButton = page.getByRole('button', { name: /note/i }).first();
    this.noteEditor = page
      .getByRole('textbox', { name: /note/i })
      .or(page.locator('[contenteditable="true"]').first());
    this.notesTab = page.getByRole('button', { name: /^notes$/i });
    this.tasksTab = page.getByRole('button', { name: /^tasks$/i });
    this.allActivitiesTab = page.getByRole('button', { name: /all activities/i });
    this.searchActivitiesInput = page
      .getByPlaceholder(/search activities/i)
      .or(page.getByRole('searchbox', { name: /search activities/i }));
    this.createTaskButton = page.getByRole('button', { name: /task/i }).first();
    this.rightSidebar = page.locator('[data-test-id="right-sidebar"]');
    this.contactsSection = page
      .locator('[data-test-id="card-wrapper-ASSOCIATION_V3/0-1"]')
      .or(page.locator('[data-test-id*="contacts-association"]'));
    this.companiesSection = page
      .locator('[data-test-id="card-wrapper-ASSOCIATION_V3/0-2"]')
      .or(page.locator('[data-test-id*="companies-association"]'));
    this.ticketsSection = page
      .locator('[data-test-id="card-wrapper-ASSOCIATION_V3/0-5"]')
      .or(page.locator('[data-test-id*="tickets-association"]'));
    this.attachmentsSection = page.locator('[data-test-id="card-wrapper-SINGLETON/0-3/ATTACHMENTS"]');
  }

  async open(): Promise<void> {
    await this.page.goto(hubUrl('/objects/0-3/views/all/list'));
    await this.waitForPageLoad();
  }
}
