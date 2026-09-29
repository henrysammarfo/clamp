import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const out = '/opt/cursor/artifacts/ui-qa';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${out}/01-landing.png`, fullPage: false });

const landing = await page.evaluate(() => {
  const ghost = document.querySelector('.hero-cta-ghost');
  const cs = ghost ? getComputedStyle(ghost) : null;
  const stats = [...document.querySelectorAll('.stat')].map((el) => ({
    strong: el.querySelector('strong')?.textContent?.trim(),
    symbol: el.querySelector('.stat-symbol')?.textContent?.trim() || null,
    label: el.querySelector('small')?.textContent?.trim(),
    childCount: el.children.length,
  }));
  return {
    ghostColor: cs?.color,
    ghostBg: cs?.backgroundColor,
    stats,
  };
});
console.log('LANDING', JSON.stringify(landing, null, 2));

await page.goto('http://127.0.0.1:3000/product', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/02-product-top.png`, fullPage: false });
await page.evaluate(() => window.scrollTo(0, 1100));
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/03-product-mid.png`, fullPage: false });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/04-product-bottom.png`, fullPage: false });

const product = await page.evaluate(() => {
  const panels = [...document.querySelectorAll('.public-panel')].slice(0, 4).map((p) => {
    const cs = getComputedStyle(p);
    const t = p.querySelector('p, h3, li');
    const tcs = t ? getComputedStyle(t) : null;
    return { bg: cs.backgroundColor, color: cs.color, textColor: tcs?.color, text: t?.textContent?.trim()?.slice(0, 60) };
  });
  const sign = document.querySelector('.desktop-sign');
  const scs = sign ? getComputedStyle(sign) : null;
  return { signBg: scs?.backgroundColor, signColor: scs?.color, panels };
});
console.log('PRODUCT', JSON.stringify(product, null, 2));

await page.goto('http://127.0.0.1:3000/case-studies', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/05-case-studies.png`, fullPage: false });

await page.goto('http://127.0.0.1:3000/sign-in', { waitUntil: 'networkidle' });
await page.fill('#email', 'judge@demo.clamp');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard**', { timeout: 20000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}/06-dashboard.png`, fullPage: false });

const dash = await page.evaluate(() => {
  const menu = document.querySelector('.app-menu');
  const mcs = menu ? getComputedStyle(menu) : null;
  const sidebar = document.querySelector('.sidebar, .desktop-sidebar');
  const scs = sidebar ? getComputedStyle(sidebar) : null;
  const h1 = document.querySelector('.app-topbar h1');
  return {
    menuDisplay: mcs?.display,
    sidebarDisplay: scs?.display,
    sidebarBg: scs?.backgroundColor,
    sidebarWidth: sidebar ? sidebar.getBoundingClientRect().width : 0,
    title: h1?.textContent?.trim(),
    titleOverflow: h1 ? h1.scrollWidth > h1.clientWidth + 1 : null,
  };
});
console.log('DASHBOARD', JSON.stringify(dash, null, 2));

await page.goto('http://127.0.0.1:3000/mandates', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/07-mandates.png`, fullPage: false });

await browser.close();
console.log('OK');
