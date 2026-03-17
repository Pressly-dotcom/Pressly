import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'mockups');

// Mock user session in localStorage
const USER_DATA = JSON.stringify({
  id: "demo-user",
  name: "Valentin",
  email: "valentin@gmail.com",
  topics: ["tech", "ia", "finance"],
  customTopics: [],
  createdAt: new Date().toISOString()
});

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function screenshot(page, filename) {
  await wait(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, filename), fullPage: false });
  console.log(`✓ ${filename}`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const injectAuth = async (page) => {
    await page.evaluateOnNewDocument((data) => {
      localStorage.setItem('pressly_user', data);
    }, USER_DATA);
  };

  // ── DESKTOP 1280×800 ──────────────────────────────────────────
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1280, height: 800 });

  // Homepage
  await desktop.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await screenshot(desktop, 'desktop-homepage.png');

  // Login
  await desktop.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await screenshot(desktop, 'desktop-login.png');

  // Dashboard
  await injectAuth(desktop);
  await desktop.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
  await screenshot(desktop, 'desktop-dashboard.png');

  // Settings
  await desktop.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await screenshot(desktop, 'desktop-settings.png');

  // ── MOBILE 390×844 ────────────────────────────────────────────
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });

  // Homepage
  await mobile.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await screenshot(mobile, 'mobile-homepage.png');

  // Login
  await mobile.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await screenshot(mobile, 'mobile-login.png');

  // Dashboard
  await injectAuth(mobile);
  await mobile.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
  await screenshot(mobile, 'mobile-dashboard.png');

  // Settings
  await mobile.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
  await screenshot(mobile, 'mobile-settings.png');

  await browser.close();
  console.log(`\n✅ 8 screenshots enregistrés dans mockups/`);
}

main().catch(console.error);
