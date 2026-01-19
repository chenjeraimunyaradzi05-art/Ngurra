const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/dev/notifications');
  console.log('Loaded');
  await page.click('text=Show actionable');
  await page.waitForTimeout(500);
  const toasts = await page.$$eval('div[aria-live="polite"] > div > div', els => els.map(el => el.outerHTML));
  console.log('Found toast nodes:', toasts.length);
  toasts.forEach((t, i) => console.log(`--- toast ${i} ---\n`, t.slice(0, 400)));
  const actionCount = await page.$$eval('[data-testid="ai-cooldown-action"]', els => els.length);
  console.log('actionCount', actionCount);
  await browser.close();
})();