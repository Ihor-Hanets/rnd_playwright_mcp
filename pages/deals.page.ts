import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';

export class DealsPage extends BasePage {
  readonly successToast: Locator;
  readonly goToRecordLink: Locator;
  readonly createContactOption: Locator;
  readonly createCompanyOption: Locator;
  readonly createDealOption: Locator;
  readonly createTicketOption: Locator;
  readonly createTaskOption: Locator;
  readonly searchInput: Locator;
  readonly dealNameColumnHeader: Locator;
  readonly closeDataColumnHeader: Locator;
  readonly viewToggleButton: Locator;
  readonly myDealsTab: Locator;
  readonly allDealsTab: Locator;
  readonly openSettingsSidebarButton: Locator;
  readonly editColumnsButton: Locator;
  readonly cloneViewButton: Locator;
  readonly selectAllCheckbox: Locator;
  readonly pipelineFilterButton: Locator;
  readonly dealOwnerFilterButton: Locator;

  constructor(page: Page) {
    super(page);
    this.successToast = page.getByRole('alert').filter({ hasText: /new deal was created/i });
    this.goToRecordLink = page.getByRole('link', { name: /go to record/i });
    this.createContactOption = page.getByRole('button', { name: /^Contact$/i });
    this.createCompanyOption = page.getByRole('button', { name: /^Company$/i });
    this.createDealOption = page.getByRole('button', { name: /^Deal$/i });
    this.createTicketOption = page.getByRole('button', { name: /^Ticket$/i });
    this.createTaskOption = page.getByRole('button', { name: /^Task$/i });
    this.searchInput = page.locator('[data-test-id="search-bar"]');
    this.dealNameColumnHeader = page.getByRole('columnheader', { name: /deal name/i });
    this.closeDataColumnHeader = page.getByRole('columnheader', { name: /close date/i });
    this.viewToggleButton = page
      .getByRole('button', { name: /table view|board view/i })
      .first();
    this.myDealsTab = page.locator('[data-test-id="view-tab-my"]');
    this.allDealsTab = page.locator('[data-test-id="view-tab-all"]').first();
    this.openSettingsSidebarButton = page
      .getByLabel(/open settings sidebar/i)
      .or(page.getByRole('button', { name: /settings sidebar/i }));
    this.editColumnsButton = page.getByRole('button', { name: /edit columns/i });
    this.cloneViewButton = page.locator('[data-test-id="view-tab-menu"]');
    this.selectAllCheckbox = page.locator('[data-test-id="checkbox-select-all"] label > span:first-child');
    this.pipelineFilterButton = page.locator('[data-test-id="pipeline-switcher"]');
    this.dealOwnerFilterButton = page.getByRole('button', { name: /deal owner/i });
  }

  get allDealsTabButton(): Locator {
    return this.allDealsTab;
  }

  private async getDealsListUrl(): Promise<string> {
    const url = this.page.url();
    // Extract portal ID from any HubSpot URL pattern (e.g. /contacts/148143933/, /global-home/148143933)
    const match = url.match(/hubspot\.com\/[^/]+\/(\d{5,})/);
    if (match) {
      const base = ENV.baseUrl.replace(/\/$/, '');
      return `${base}/contacts/${match[1]}/objects/0-3/views/all/list`;
    }
    return '';
  }

  async open(): Promise<void> {
    // Wait for any post-login redirects to settle before reading the URL
    await this.page.waitForURL(/\/\d{5,}\//, { timeout: 15_000 }).catch(() => {});
    const url = await this.getDealsListUrl();
    if (url) {
      await this.page.goto(url);
    } else {
      await this.page.keyboard.press('Escape');
      await this.page.getByRole('menuitem', { name: 'Deals' }).click({ force: true });
    }
    await this.waitForPageLoad();
  }

  async clickCreateNew(): Promise<void> {
    await this.page.locator('[data-test-id="hs-global-toolbar-object-create"]').click();
  }

  async clickDealOption(): Promise<void> {
    await this.createDealOption.click();
  }

  async openCreateDealModal(): Promise<void> {
    await this.clickCreateNew();
    await this.clickDealOption();
  }

  getDealRowByName(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name }).first();
  }

  getDealStageForRow(name: string): Locator {
    return this.getDealRowByName(name)
      .getByRole('button')
      .filter({ hasText: /Pipeline/ })
      .first();
  }

  getBoardCard(name: string): Locator {
    return this.page
      .locator('[data-test-id="cdb-card"]')
      .filter({ hasText: name })
      .first();
  }

  async switchToBoardView(): Promise<void> {
    await this.viewToggleButton.click();
    await this.page.getByRole('button', { name: 'Board view' }).click();
    await this.waitForPageLoad();
  }

  async createDealAndGoToRecord(name: string): Promise<void> {
    await this.openCreateDealModal();
    // Deal form is in nested iframes identified by HubSpot's data-test-id
    const frame = this.page
      .frameLocator('[name="nav-components:nav-object-create"]')
      .frameLocator('[data-test-id="object-builder-ui-iframe"]');
    await frame.getByRole('heading', { name: /create deal/i }).waitFor({ state: 'visible', timeout: 30_000 });
    await frame.getByLabel(/deal name/i).fill(name);
    await frame.getByRole('button', { name: /^create$/i }).click();
    await this.goToRecordLink.waitFor({ state: 'visible' });
    const href = await this.goToRecordLink.getAttribute('href');
    if (href) {
      await this.page.goto(href);
    } else {
      await this.goToRecordLink.click({ force: true });
    }
    await this.waitForPageLoad();
  }

  async clickGoToRecord(): Promise<void> {
    await this.goToRecordLink.waitFor({ state: 'visible' });
    const href = await this.goToRecordLink.getAttribute('href');
    if (href) {
      await this.page.goto(href);
    } else {
      await this.goToRecordLink.click({ force: true });
    }
    await this.waitForPageLoad();
  }

  async searchDeal(name: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(name);
    await this.waitForPageLoad();
  }

  async getAllDealsCount(): Promise<number> {
    const tabText = await this.allDealsTab.textContent();
    const match = tabText?.match(/(\d[\d,]*)/);
    return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
  }
}
