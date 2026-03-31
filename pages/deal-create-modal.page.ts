import { Page, Locator, FrameLocator } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';

const hubUrl = (path: string): string =>
  ENV.baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');

export class DealCreateModal extends BasePage {
  readonly frame: FrameLocator;
  readonly heading: Locator;
  readonly dealNameInput: Locator;
  readonly pipelineButton: Locator;
  readonly dealStageButton: Locator;
  readonly closeDateInput: Locator;
  readonly dealOwnerButton: Locator;
  readonly createButton: Locator;
  readonly createAndAddAnotherButton: Locator;
  readonly amountInput: Locator;
  readonly dealTypeButton: Locator;
  readonly priorityButton: Locator;
  readonly dealStageOptionsList: Locator;
  readonly dealTypeOptionsList: Locator;
  readonly priorityOptionsList: Locator;

  constructor(page: Page) {
    super(page);
    // The Create Deal form renders inside nested iframes identified by HubSpot's data-test-id
    this.frame = page
      .frameLocator('[name="nav-components:nav-object-create"]')
      .frameLocator('[data-test-id="object-builder-ui-iframe"]');
    this.heading = this.frame.getByRole('heading', { name: /create deal/i });
    this.dealNameInput = this.frame.getByLabel(/deal name/i);
    this.pipelineButton = this.frame
      .locator('[data-field-name="pipeline"] button')
      .or(this.frame.getByRole('button', { name: /pipeline/i }).first());
    this.dealStageButton = this.frame
      .locator('[data-field-name="dealstage"] button')
      .or(
        this.frame
          .getByRole('button', {
            name: /appointment scheduled|qualified to buy|presentation scheduled|decision maker|contract sent|closed won|closed lost/i,
          })
          .first(),
      );
    this.closeDateInput = this.frame.getByLabel(/close date/i);
    this.dealOwnerButton = this.frame
      .locator('[data-field-name="hubspot_owner_id"] button')
      .or(this.frame.getByRole('button', { name: /owner/i }).first());
    this.createButton = this.frame.getByRole('button', { name: /^create$/i });
    this.createAndAddAnotherButton = this.frame.getByRole('button', {
      name: /create and add another/i,
    });
    this.amountInput = this.frame.getByLabel(/^amount$/i);
    this.dealTypeButton = this.frame.getByRole('button', { name: /^deal type/i });
    this.priorityButton = this.frame.getByRole('button', { name: /^priority/i });
    this.dealStageOptionsList = this.frame.locator('[role="listbox"] > [role="option"]');
    this.dealTypeOptionsList = this.frame.locator('[role="listbox"] > [role="option"]');
    this.priorityOptionsList = this.frame.locator('[role="listbox"] > [role="option"]');
  }

  async open(): Promise<void> {
    await this.page.goto(hubUrl('/objects/0-3/views/all/list'));
    await this.waitForPageLoad();
  }

  async fillDealName(name: string): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
    await this.dealNameInput.fill(name);
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickCreateAndAddAnother(): Promise<void> {
    await this.createAndAddAnotherButton.click();
  }

  async clickCancel(): Promise<void> {
    await this.frame.getByRole('button', { name: /cancel/i }).click();
  }

  async clickClose(): Promise<void> {
    await this.frame
      .getByRole('button', { name: /close/i })
      .or(this.frame.locator('button[aria-label*="close" i], button[aria-label*="dismiss" i]'))
      .first()
      .click();
  }

  async selectDealStage(stage: string): Promise<void> {
    await this.dealStageButton.click();
    await this.frame
      .getByRole('option', { name: stage })
      .getByRole('button', { name: stage })
      .click();
  }

  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.fill(amount);
  }

  async selectDealType(type: string): Promise<void> {
    await this.dealTypeButton.click();
    await this.frame
      .getByRole('option', { name: type })
      .getByRole('button', { name: type })
      .click();
  }

  async selectPriority(priority: string): Promise<void> {
    await this.priorityButton.click();
    await this.frame
      .getByRole('option', { name: priority })
      .getByRole('button', { name: priority })
      .click();
  }
}
