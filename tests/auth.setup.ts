import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/login.page';
import { ENV } from '../utils/env';

const AUTH_FILE = path.resolve(__dirname, '../playwright/.auth/state.json');
const MAX_AGE_MS = 23 * 60 * 60 * 1000; // reuse auth for up to 23 hours

setup('authenticate', async ({ page, context }) => {
  if (fs.existsSync(AUTH_FILE)) {
    const age = Date.now() - fs.statSync(AUTH_FILE).mtimeMs;
    if (age < MAX_AGE_MS) {
      return; // Session is still fresh
    }
  }

  const loginPage = new LoginPage(page);
  await loginPage.loginWithOtp(ENV.username, ENV.password, ENV.otpSecret);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await context.storageState({ path: AUTH_FILE });
});
