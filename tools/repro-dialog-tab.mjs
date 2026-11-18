import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:5173/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=1280,800'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));

await page.goto(URL, { waitUntil: 'networkidle0' });

// Seed a comprehension session directly (bypass login/PIN flow).
await page.evaluate(() => {
  sessionStorage.setItem('faro-session', JSON.stringify({
    experienceId: 'comprehension',
    user: 'TestUser',
    startedAt: Date.now(),
  }));
});
await page.goto(URL + '#/hospital/cita', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 500));

// Pick a mission-valid but NOT closest slot: Algología, Vega Norte,
// 2026-10-20 (Tue, even day) at 16:00 — best is 2026-10-16T16:00.
await page.select('#bk-date', '2026-10-20');
await page.select('#bk-hour', '16');
await page.select('#bk-specialty', 'Algología');
await page.select('#bk-center', 'Hospital Vega Norte');
await page.click('.hospital-form button[type="submit"]');
await new Promise(r => setTimeout(r, 500));

const dialogInfo = await page.evaluate(() => {
  const dlg = document.querySelector('.congrats-dialog');
  if (!dlg) return { found: false };
  return {
    found: true,
    title: dlg.querySelector('h2')?.textContent,
    active: document.activeElement?.id || document.activeElement?.className || document.activeElement?.tagName,
    buttons: [...dlg.querySelectorAll('button')].map(b => ({ id: b.id, text: b.textContent.trim() })),
  };
});
console.log('DIALOG:', JSON.stringify(dialogInfo, null, 2));

// Press Tab and trace focus through the dialog.
for (let i = 0; i < 5; i++) {
  await page.keyboard.press('Tab');
  await new Promise(r => setTimeout(r, 200));
  const state = await page.evaluate(() => ({
    active: document.activeElement?.id || document.activeElement?.className || document.activeElement?.tagName,
    inDialog: !!document.activeElement?.closest?.('.congrats-dialog'),
    dialogStillOpen: !!document.querySelector('.congrats-dialog'),
  }));
  console.log(`after Tab #${i + 1}:`, JSON.stringify(state));
}

await browser.close();
