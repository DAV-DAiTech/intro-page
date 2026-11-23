import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import { checkAccessibility } from './accessibility.mjs';
import { checkLocales } from './locales.mjs';

const findBrowser = () => {
  const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  const cacheDir = join(homedir(), '.cache', 'ms-playwright');
  if (existsSync(cacheDir)) {
    for (const dir of readdirSync(cacheDir).sort().reverse()) {
      if (dir.startsWith('chromium_headless_shell-')) candidates.push(join(cacheDir, dir, 'chrome-headless-shell-linux64', 'chrome-headless-shell'));
      if (dir.startsWith('chromium-')) candidates.push(join(cacheDir, dir, 'chrome-linux64', 'chrome'));
    }
  }
  return candidates.find((path) => existsSync(path));
};

const baseUrl = 'http://127.0.0.1:4322';
const server = spawn('pnpm', ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', '4322'], { stdio: 'pipe' });
let serverOutput = '';
server.stdout.on('data', (data) => { serverOutput += data; });
server.stderr.on('data', (data) => { serverOutput += data; });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) { ready = true; break; }
    } catch { }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(ready, `Production preview must start: ${serverOutput}`);
  browser = await chromium.launch({ executablePath: findBrowser(), headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-crash-reporter'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://dav-daitech.github.io/en/');
  assert.equal(await page.locator('link[rel="preload"][as="font"][crossorigin]').count(), 2, 'Default heading and body fonts are preloaded with crossorigin');
  assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1, 'Structured data JSON-LD is emitted');
  assert.equal((await fetch(`${baseUrl}/robots.txt`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/sitemap.xml`)).status, 200);
  assert.match(await (await fetch(`${baseUrl}/llms.txt`)).text(), /DAV Club Match/);
  assert.equal(await page.locator('.product-card:visible').count(), 3);
  assert.equal(await page.locator('.product-actions > a').nth(0).getAttribute('href'), 'https://dav-club-match.vercel.app/');
  assert.equal(await page.locator('.product-actions > a').nth(1).getAttribute('href'), 'https://dav-daitech.github.io/dav-assistant/');
  assert.equal(await page.getByRole('link', { name: /Open the kiosk with DAV AI Receptionist/ }).getAttribute('href'), 'https://dav-daitech.github.io/avatar-kiosk/');
  assert.deepEqual(await page.locator('.button:visible').evaluateAll((buttons) => [...new Set(buttons.map((b) => Math.round(b.getBoundingClientRect().height)))]), [44], 'All buttons share a uniform 44px height');
  assert(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'All images load');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Student life', exact: true }).click();
  assert.equal(await page.locator('.product-card:visible').count(), 1);
  assert(await page.locator('.match-card').isVisible());
  assert.equal(await page.getByRole('button', { name: 'Student life', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'AI assistant', exact: true }).click();
  assert.equal(await page.locator('.product-card:visible').count(), 1);
  assert(await page.getByRole('heading', { name: 'DAV Chatbot', exact: true }).isVisible());
  assert.match(await page.getByRole('status').innerText(), /Showing 1 product in AI assistant/);
  await page.getByRole('button', { name: /All products/ }).click();
  for (const product of ['DAV Club Match', 'DAV Chatbot', 'DAV AI Receptionist']) {
    const trigger = page.getByRole('button', { name: `More about ${product}`, exact: true });
    await trigger.click();
    assert(await page.getByRole('dialog').isVisible());
    assert.equal(await page.getByRole('dialog').getByRole('heading').innerText(), product);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert(await trigger.evaluate((element) => document.activeElement === element), 'Dialog restores focus');
  }
  await page.getByRole('button', { name: 'More about DAV Chatbot' }).click();
  await page.getByRole('button', { name: 'Close product details' }).click();
  assert.equal(await page.locator('dialog[open]').count(), 0);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
    assert(await page.locator('.hero h1').isVisible());
    assert(await page.getByRole('link', { name: 'Our products', exact: true }).isVisible());
    if (width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.hero-content').evaluate((element) => getComputedStyle(element).animationName), 'none');

  const html = await (await fetch(`${baseUrl}/en/`)).text();
  const collectionMarkup = html.match(/<section\b[^>]*data-product-collection[\s\S]*?<\/section>/)?.[0];
  assert(collectionMarkup, 'Production output contains the product collection');
  const duplicateMarkup = collectionMarkup
    .replaceAll('products-', 'additional-products-')
    .replace('id="products"', 'id="additional-products"');
  const repeated = await browser.newPage();
  repeated.on('pageerror', (error) => errors.push(error.message));
  await repeated.route(`${baseUrl}/en/`, (route) => route.fulfill({
    contentType: 'text/html',
    body: html.replace('</main>', `${duplicateMarkup}</main>`)
  }));
  await repeated.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
  const firstCollection = repeated.locator('#products');
  const secondCollection = repeated.locator('#additional-products');
  await secondCollection.getByRole('button', { name: 'AI assistant', exact: true }).click();
  assert.equal(await firstCollection.locator('.product-card:visible').count(), 3, 'Filtering one collection leaves the other unchanged');
  assert.equal(await secondCollection.locator('.product-card:visible').count(), 1);
  await secondCollection.getByRole('button', { name: 'More about DAV Chatbot' }).click();
  assert(await secondCollection.getByRole('dialog').isVisible(), 'Repeated cards open their own dialog');
  assert.equal(await firstCollection.locator('dialog[open]').count(), 0);
  await repeated.keyboard.press('Escape');
  assert(await repeated.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    return new Set(ids).size === ids.length;
  }), 'Reused collections have unique accessible IDs');
  await repeated.close();
  await checkAccessibility(browser, `${baseUrl}/en/`);
  await checkLocales(browser, baseUrl);
  assert.deepEqual(errors, [], 'No JavaScript errors');
  console.log('Passed: product links, filters, dialogs, focus restoration, images, reduced motion, 5 responsive widths, and independent reusable collections.');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
