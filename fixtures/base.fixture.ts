import { test as base } from '@playwright/test';
import { ExamplePage } from '../pages/example.page';
import { LoginPage } from '../pages/login.page';
import { DealsPage } from '../pages/deals.page';
import { DealDetailPage } from '../pages/deal-detail.page';
import { DealCreateModal } from '../pages/deal-create-modal.page';

type Pages = {
  examplePage: ExamplePage;
  loginPage: LoginPage;
  dealsPage: DealsPage;
  dealDetailPage: DealDetailPage;
  dealCreateModal: DealCreateModal;
};

export const test = base.extend<Pages>({
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dealsPage: async ({ page }, use) => {
    await use(new DealsPage(page));
  },
  dealDetailPage: async ({ page }, use) => {
    await use(new DealDetailPage(page));
  },
  dealCreateModal: async ({ page }, use) => {
    await use(new DealCreateModal(page));
  },
});

export { expect } from '@playwright/test';
