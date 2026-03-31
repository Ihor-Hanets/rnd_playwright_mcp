import dotenv from 'dotenv';

dotenv.config({ override: true, path: '/Users/ihor.hanets/pet-projects/rnd_playwright_mcp/.env' });

export const ENV = {
  get baseUrl() { return process.env.BASE_URL ?? 'https://example.com'; },
  get apiUrl() { return process.env.API_URL ?? 'https://api.example.com'; },
  get username() { return process.env.USERNAME ?? ''; },
  get password() { return process.env.PASSWORD ?? ''; },
  get otpSecret() { return process.env.OTP_SECRET ?? ''; },
  get defaultTimeout() { return Number(process.env.DEFAULT_TIMEOUT ?? 30_000); },
};
