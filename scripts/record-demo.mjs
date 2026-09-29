/**
 * Timed CLAMP demo capture synced to clamp-demo-vo.mp3 (~95s).
 * Pre-authenticates, then records a timed navigation using seeded decisions.
 */
import { chromium } from "playwright";
import {
  mkdirSync,
  copyFileSync,
  existsSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { execSync } from "child_process";
import { join } from "path";

const OUT = "/opt/cursor/artifacts/demo-rec";
const FINAL = "/opt/cursor/artifacts/CLAMP_Team14_Demo.mp4";
const VO = "/opt/cursor/artifacts/clamp-demo-vo.mp3";
const STATE = join(OUT, "auth.json");
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".webm") || f.endsWith(".png")) unlinkSync(join(OUT, f));
}

const BLOCK = "481f3fe4-e0e8-431f-9376-d2d6e6770825";
const ALLOW = "26f23e60-54e2-4837-a858-1540eddaa291";
const HUMAN = "6a439bf5-bbdd-408d-876f-47b96bc1e45d";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

// 1) Pre-auth outside the timed recording
{
  const setup = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await setup.newPage();
  await p.goto("http://127.0.0.1:3000/sign-in", { waitUntil: "networkidle" });
  await p.fill("#email", "judge@demo.clamp");
  await Promise.all([
    p.waitForURL(/\/dashboard/, { timeout: 30000 }),
    p.click('button[type="submit"]'),
  ]);
  await p.waitForSelector("text=Control room", { timeout: 15000 });
  await setup.storageState({ path: STATE });
  await setup.close();
  console.log("auth ok", STATE);
}

// 2) Timed recording with auth cookies
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  storageState: STATE,
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const t0 = Date.now();
const elapsed = () => ((Date.now() - t0) / 1000).toFixed(1);
const log = (m) => console.log(`[${elapsed()}s] ${m}`);
const waitUntil = async (targetSec) => {
  const left = targetSec * 1000 - (Date.now() - t0);
  if (left > 0) await sleep(left);
  else console.warn(`late by ${(-left / 1000).toFixed(1)}s at target ${targetSec}`);
};
const go = async (url) => {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
};

try {
  log("landing");
  await go("http://127.0.0.1:3000/");
  await waitUntil(11.6);

  log("dashboard");
  await go("http://127.0.0.1:3000/dashboard");
  await page.waitForSelector("text=Control room", { timeout: 10000 });
  await waitUntil(16.6);

  log("mandate");
  await go("http://127.0.0.1:3000/mandates");
  await sleep(400);
  const link = page.locator('a[href*="/mandates/"]').first();
  if (await link.count()) {
    await link.click();
    await sleep(700);
  }
  await waitUntil(23.9);

  log("new request form");
  await go("http://127.0.0.1:3000/requests/new");
  await page.waitForSelector("#request", { timeout: 8000 });
  await page.fill("#request", "Buy a $22 USB C hub on BestBuy");
  await waitUntil(31.9);

  log("block decision");
  await go(`http://127.0.0.1:3000/decisions/${BLOCK}`);
  await waitUntil(39.7);

  log("allow prep");
  await go("http://127.0.0.1:3000/requests/new");
  await page.fill("#request", "Buy $30 of printer paper on Amazon");
  await waitUntil(45.7);

  log("allow decision");
  await go(`http://127.0.0.1:3000/decisions/${ALLOW}`);
  await waitUntil(50.5);

  log("human prep");
  await go("http://127.0.0.1:3000/requests/new");
  await page.fill("#request", "Buy a $120 monitor stand from Apple");
  await waitUntil(56.5);

  log("needs human");
  await go(`http://127.0.0.1:3000/decisions/${HUMAN}`);
  await waitUntil(60.7);

  log("case studies");
  await go("http://127.0.0.1:3000/case-studies");
  await waitUntil(65.0);
  await go("http://127.0.0.1:3000/reviews");
  await waitUntil(69.7);

  log("metrics");
  await go("http://127.0.0.1:3000/metrics");
  await waitUntil(80.6);

  log("audit");
  await go("http://127.0.0.1:3000/audit");
  await waitUntil(88.0);
  log("home close");
  await go("http://127.0.0.1:3000/");
  await waitUntil(95.5);
  log("done");
} catch (err) {
  console.error("DEMO ERROR", err);
  writeFileSync(join(OUT, "error.txt"), String(err?.stack || err));
} finally {
  const video = page.video();
  await page.close();
  const videoPath = video ? await video.path() : null;
  await context.close();
  await browser.close();

  if (!videoPath || !existsSync(videoPath)) {
    console.error("No video recorded");
    process.exit(1);
  }
  console.log("raw video", videoPath);
  const rawDur = execSync(
    `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 ${JSON.stringify(videoPath)}`,
  )
    .toString()
    .trim();
  console.log("raw duration", rawDur);
  if (Number(rawDur) < 90) {
    console.error("Video too short — aborting mux");
    process.exit(2);
  }

  execSync(
    [
      "ffmpeg -y",
      `-i ${JSON.stringify(videoPath)}`,
      `-i ${JSON.stringify(VO)}`,
      "-map 0:v:0 -map 1:a:0",
      "-c:v libx264 -pix_fmt yuv420p -r 25",
      "-c:a aac -b:a 192k",
      "-shortest",
      "-movflags +faststart",
      JSON.stringify(FINAL),
    ].join(" "),
    { stdio: "inherit" },
  );
  copyFileSync(FINAL, "/workspace/docs/submit/demo/CLAMP_Team14_Demo.mp4");
  const dur = execSync(
    `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 ${JSON.stringify(FINAL)}`,
  )
    .toString()
    .trim();
  console.log("FINAL", FINAL, "duration", dur);

  const frames = "/opt/cursor/artifacts/demo-frames";
  mkdirSync(frames, { recursive: true });
  for (const f of readdirSync(frames)) unlinkSync(join(frames, f));
  for (const [t, name] of [
    [5, "01-open"],
    [20, "02-mandate"],
    [35, "03-block"],
    [48, "04-allow"],
    [58, "05-human"],
    [72, "06-metrics"],
    [90, "07-close"],
  ]) {
    execSync(
      `ffmpeg -y -ss ${t} -i ${JSON.stringify(FINAL)} -frames:v 1 ${JSON.stringify(`${frames}/${name}.png`)}`,
      { stdio: "pipe" },
    );
  }
  console.log("frames ready");
}
