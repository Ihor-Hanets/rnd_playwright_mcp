import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from './pages/login.page';
import { ENV } from './utils/env';

const AUTH_FILE = path.resolve(__dirname, 'playwright/.auth/state.json');
const MAX_AGE_MS = 23 * 60 * 60 * 1000; // reuse auth for up to 23 hours

async function globalSetup(_config: FullConfig): Promise<void> {
  if (fs.existsSync(AUTH_FILE)) {
    const age = Date.now() - fs.statSync(AUTH_FILE).mtimeMs;
    if (age < MAX_AGE_MS) {
      return;
    }
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await context.storageState({ path: AUTH_FILE });
  await browser.close();
}

export default globalSetup;
