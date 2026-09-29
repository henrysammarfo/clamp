/**
 * Headed Playwright demo with visible mouse + zoom, timed to Lily VO (~134s).
 * Pair with ffmpeg x11grab (draw_mouse=1) started externally OR use this script's
 * built-in record via CDP screencast. Here we drive the browser; parent muxes VO.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const BLOCK = "481f3fe4-e0e8-431f-9376-d2d6e6770825";
const ALLOW = "26f23e60-54e2-4837-a858-1540eddaa291";
const HUMAN = "6a439bf5-bbdd-408d-876f-47b96bc1e45d";
const BASE = "http://127.0.0.1:3000";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const waitUntil = async (sec) => {
  const left = sec * 1000 - (Date.now() - t0);
  if (left > 0) await sleep(left);
  else console.warn(`late ${(-left / 1000).toFixed(1)}s @ ${sec}`);
};

/** Slow human-like move then click */
async function glideClick(page, locator, steps = 18) {
  const el = typeof locator === "string" ? page.locator(locator).first() : locator;
  await el.waitFor({ state: "visible", timeout: 12000 });
  const box = await el.boundingBox();
  if (!box) return;
  const x = box.x + box.width * 0.45;
  const y = box.y + box.height * 0.5;
  const mouse = page.mouse;
  // stepwise move for visible cursor trail
  const pos = await page.evaluate(() => ({ x: 0, y: 0 }));
  // get current via moving from a known corner gently
  for (let i = 1; i <= steps; i++) {
    await mouse.move(x * (i / steps) + 80 * (1 - i / steps), y * (i / steps) + 120 * (1 - i / steps), {
      steps: 1,
    });
    await sleep(16);
  }
  await mouse.move(x, y, { steps: 8 });
  await sleep(220);
  await mouse.click(x, y);
  await sleep(180);
}

async function glideHover(page, locator, holdMs = 900) {
  const el = typeof locator === "string" ? page.locator(locator).first() : locator;
  await el.waitFor({ state: "visible", timeout: 10000 }).catch(() => null);
  const box = await el.boundingBox().catch(() => null);
  if (!box) return;
  const x = box.x + box.width * 0.4;
  const y = box.y + box.height * 0.45;
  await page.mouse.move(x, y, { steps: 22 });
  await sleep(holdMs);
}

async function zoomIn(page, level = 1.35) {
  // CSS zoom is reliable on camera; Ctrl+= is flaky under automation
  await page.evaluate((z) => {
    document.documentElement.style.zoom = String(z);
  }, level);
  await sleep(400);
}

async function zoomReset(page) {
  await page.evaluate(() => {
    document.documentElement.style.zoom = "1";
  });
  await sleep(300);
}

mkdirSync("/opt/cursor/artifacts/demo-rec", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  executablePath: "/usr/local/bin/google-chrome",
  args: [
    "--window-size=1440,900",
    "--window-position=80,60",
    "--disable-infobars",
    "--no-first-run",
    "--disable-session-crashed-bubble",
  ],
  slowMo: 40,
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

// Signal ready for ffmpeg parent
writeFileSync("/tmp/clamp-demo-ready", String(Date.now()));
log("browser up — waiting for record arm");
// Give ffmpeg a moment to attach
await sleep(1500);

try {
  // 0–18 open
  log("landing");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await sleep(800);
  await glideHover(page, ".brand-mark, a[aria-label='CLAMP home']", 700);
  await glideHover(page, ".desktop-nav a >> text=Product", 600);
  await glideHover(page, ".hero-cta-ghost", 700);
  await glideHover(page, ".hero-cta:not(.hero-cta-ghost)", 800);
  await waitUntil(16.5);
  await glideClick(page, ".hero-cta:not(.hero-cta-ghost), a.hero-cta");
  await waitUntil(18.2);

  // 18–22 sign-in / dashboard
  log("sign-in");
  if (!page.url().includes("dashboard")) {
    await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
    await page.fill("#email", "judge@demo.clamp");
    await glideClick(page, 'button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 25000 });
  }
  await waitUntil(22.2);

  // 22–39 mandate
  log("mandate");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  await glideHover(page, "text=Available", 500);
  await glideClick(page, '.app-nav a[href="/mandates"], a:has-text("Mandates")');
  await sleep(700);
  const mLink = page.locator('a[href*="/mandates/"]').first();
  if (await mLink.count()) {
    await glideClick(page, mLink);
    await sleep(600);
    await glideHover(page, "text=Purpose", 700);
    await glideHover(page, "text=Budget", 600);
    await glideHover(page, "text=Merchants", 700);
    await glideHover(page, "text=Human approval", 800);
  }
  await waitUntil(39.0);

  // 39–44 new request BestBuy
  log("new request BestBuy");
  await glideClick(page, '.app-nav a[href="/requests/new"], a:has-text("New request")');
  await page.waitForSelector("#request", { timeout: 10000 });
  await glideClick(page, "#request");
  await page.locator("#request").fill("");
  await page.locator("#request").fill("Buy a $22 USB C hub on BestBuy");
  await glideHover(page, 'button[type="submit"]', 900);
  await waitUntil(44.0);

  // 44–58 block + zoom
  log("block zoom");
  await page.goto(`${BASE}/decisions/${BLOCK}`, { waitUntil: "domcontentloaded" });
  await sleep(700);
  await zoomIn(page, 1.4);
  await glideHover(page, "text=Block.", 1400);
  await glideHover(page, "text=not allowed", 1600);
  await glideHover(page, "text=Original request", 900);
  await waitUntil(56.5);
  await zoomReset(page);
  await waitUntil(58.2);

  // 58–62 allow prep
  log("allow prep");
  await page.goto(`${BASE}/requests/new`, { waitUntil: "domcontentloaded" });
  await page.locator("#request").fill("");
  await page.locator("#request").fill("Buy $30 of printer paper on Amazon");
  await glideHover(page, "#request", 800);
  await waitUntil(62.2);

  // 62–72 allow zoom
  log("allow zoom");
  await page.goto(`${BASE}/decisions/${ALLOW}`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  await zoomIn(page, 1.4);
  await glideHover(page, "text=Allow.", 1300);
  await glideHover(page, "text=satisfies every mandate", 1400);
  await waitUntil(70.5);
  await zoomReset(page);
  await waitUntil(72.3);

  // 72–76 human prep
  log("human prep");
  await page.goto(`${BASE}/requests/new`, { waitUntil: "domcontentloaded" });
  await page.locator("#request").fill("");
  await page.locator("#request").fill("Buy a $120 monitor stand from Apple");
  await waitUntil(76.3);

  // 76–86.7 human zoom
  log("human zoom");
  await page.goto(`${BASE}/decisions/${HUMAN}`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  await zoomIn(page, 1.4);
  await glideHover(page, "text=Needs human.", 1300);
  await glideHover(page, "text=Awaiting a person", 1400);
  await waitUntil(85.0);
  await zoomReset(page);
  await waitUntil(86.7);

  // 86.7–99.9 case studies
  log("case studies");
  await page.goto(`${BASE}/case-studies`, { waitUntil: "domcontentloaded" });
  await sleep(400);
  await glideHover(page, "text=Allow", 700);
  await glideHover(page, "text=Block", 700);
  await glideHover(page, "text=Needs human", 900);
  await waitUntil(99.9);

  // 99.9–115.6 metrics
  log("metrics");
  await page.goto(`${BASE}/metrics`, { waitUntil: "domcontentloaded" });
  await sleep(500);
  await zoomIn(page, 1.2);
  await glideHover(page, "text=fewer tokens", 1200);
  await glideHover(page, "text=Decision accuracy", 900);
  await glideHover(page, "text=Total tokens", 900);
  await waitUntil(113.5);
  await zoomReset(page);
  await waitUntil(115.6);

  // 115.6–133 close
  log("audit");
  await page.goto(`${BASE}/audit`, { waitUntil: "domcontentloaded" });
  await sleep(800);
  await glideHover(page, "h1, .app-topbar h1", 700);
  await waitUntil(119.6);
  log("home close");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await glideHover(page, ".brand-mark, a[aria-label='CLAMP home']", 1500);
  await glideHover(page, ".headline", 1200);
  await waitUntil(133.7);
  log("done");
  writeFileSync("/tmp/clamp-demo-done", String(Date.now()));
} catch (e) {
  console.error(e);
  writeFileSync("/tmp/clamp-demo-error", String(e?.stack || e));
} finally {
  await sleep(800);
  await browser.close();
}
