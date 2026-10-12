import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const url = process.env.CHECKOUT_LAB_URL || 'https://lfamilia-checkout-lab.vercel.app/';
const output = path.resolve('responsive-screenshots');
const sizes = [
  ['hp-kecil', 360, 780],
  ['hp-standar', 390, 844],
  ['hp-besar', 430, 932],
  ['tablet-kecil', 640, 960],
  ['tablet', 768, 1024],
  ['tablet-besar', 1024, 768],
  ['laptop', 1366, 768],
  ['desktop', 1440, 900],
  ['full-hd', 1920, 1080],
  ['monitor-lebar', 2560, 1440],
];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const records = [];
try {
  for (const [label, width, height] of sizes) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.lfx').waitFor({ timeout: 35000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = [...document.images].filter(image => image.complete === false);
      await Promise.all(imgs.map(img => new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 4000);
      })));
    });
    await page.waitForTimeout(700);
    const metrics = await page.evaluate(() => {
      const box = selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const b = element.getBoundingClientRect();
        return { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height), visible: b.width > 0 && b.height > 0 };
      };
      const cover = document.querySelector('.lfx-product-cover');
      return {
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        hero: box('.lfx-hero'),
        productCover: box('.lfx-product-cover'),
        productImage: box('.lfx-cover-frame > img'),
        headerProduct: box('.lfx-product-header'),
        checkoutContent: box('.lfx-content'),
        checkoutMain: box('.lfx-sections'),
        payment: box('#lfx-payment'),
        sidebar: box('.lfx-aside'),
        bottomBar: box('.lfx-bottom-bar'),
        bottomSummary: box('.lfx-bottom-summary'),
        bottomAction: box('.lfx-bottom-pay'),
        bottomBarPosition: getComputedStyle(document.querySelector('.lfx-bottom-bar')).position,
        fullWidthMain: Math.abs((box('.lfx-sections')?.width ?? 0) - (box('.lfx-layout')?.width ?? 0)) < 4,
        coverSquare: cover ? Math.abs(cover.getBoundingClientRect().width - cover.getBoundingClientRect().height) < 2 : null,
      };
    });
    const basename = `${String(width)}x${String(height)}-${label}`;
    await page.screenshot({ path: path.join(output, basename + '-full.png'), fullPage: true, animations: 'disabled' });
    await page.screenshot({ path: path.join(output, basename + '-viewport.png'), fullPage: false, animations: 'disabled' });
    // Actual DOM interaction: select a demo nominal, open the unified order overview.
    await page.locator('.lfx-nominal[role="radio"]:not([aria-disabled="true"])').first().click();
    await page.locator('.lfx-bottom-summary').click();
    const review = page.getByRole('dialog', { name: 'Ringkasan Pesanan' });
    await review.waitFor({ state: 'visible', timeout: 5000 });
    const modalShowsTotal = await review.getByText('Total Pembayaran').isVisible();
    await page.screenshot({ path: path.join(output, basename + '-order-summary.png'), fullPage: false, animations: 'disabled' });
    await review.getByRole('button', { name: 'Tutup ringkasan' }).click();
    await review.waitFor({ state: 'hidden', timeout: 5000 });
    const summaryDismissed = await page.locator('[aria-modal="true"]').count() === 0;
    const screen = metrics.bottomBar;
    const bottomBarFixedToViewport = screen && Math.abs((screen.y + screen.height) - height) <= 2;
    const sidebarAbsent = await page.locator('.lfx-aside').count() === 0;
    records.push({ label, width, height, status: response?.status(), pageTitle: await page.title(), ...metrics, modalShowsTotal, summaryDismissed, bottomBarFixedToViewport, sidebarAbsent, javascriptErrors: errors });
    console.log(JSON.stringify({ label, width, height, status: response?.status(), horizontalOverflow: metrics.horizontalOverflow,
      fullWidthMain: metrics.fullWidthMain, sidebarAbsent, bottomBarFixedToViewport,
      modalShowsTotal, summaryDismissed, coverSquare: metrics.coverSquare }));
    await page.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(path.join(output, 'viewport-audit.json'), JSON.stringify({ url, capturedAt: new Date().toISOString(), records }, null, 2));
console.log('Captured', records.length, 'viewport sizes');
const failures = records.filter(r => r.status !== 200 ||
  r.horizontalOverflow || r.javascriptErrors.length ||
  r.sidebar || !r.sidebarAbsent || !r.fullWidthMain ||
  r.bottomBarPosition !== 'fixed' || !r.bottomBarFixedToViewport ||
  !r.modalShowsTotal || !r.summaryDismissed || !r.coverSquare);
if (failures.length) {
  console.error('Responsive test failures:', JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
