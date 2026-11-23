import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { preview } from 'astro';
import { baseUrl as siteUrl } from '../src/config.ts';
import { checkAccessibility } from './accessibility.mjs';
import { checkLocales } from './locales.mjs';

const executablePath = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  .find((path) => path && existsSync(path));
const host = '127.0.0.1';
const server = await preview({ server: { host, port: 0 }, logLevel: 'silent' });
const baseUrl = `http://${host}:${server.port}`;
let browser;
try {
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-crash-reporter'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.cspViolations = [];
    document.addEventListener('securitypolicyviolation', ({ effectiveDirective, blockedURI }) => {
      window.cspViolations.push({ effectiveDirective, blockedURI });
    });
  });
  await page.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), new URL('/en/', siteUrl).href);
  assert.equal(await page.locator('link[rel="preload"][as="font"][crossorigin]').count(), 2, 'Default heading and body fonts are preloaded with crossorigin');
  assert.equal(await page.locator('script[type="application/ld+json"]').count(), 1, 'Structured data JSON-LD is emitted');
  const csp = await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content');
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /script-src 'self' 'sha256-/);
  assert.doesNotMatch(csp, /'unsafe-inline'|'unsafe-eval'/);
  assert.equal((await fetch(`${baseUrl}/robots.txt`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/sitemap.xml`)).status, 200);
  assert.match(await (await fetch(`${baseUrl}/llms.txt`)).text(), /DAV Club Match/);
  assert.equal(await page.locator('.product-card:visible').count(), 3);
  assert.equal(await page.locator('.product-card .product-source').count(), 0);
  assert.equal(await page.locator('.product-launch').nth(0).getAttribute('href'), 'https://dav-club-match.vercel.app/');
  assert.equal(await page.locator('.product-launch').nth(1).getAttribute('href'), 'https://dav-daitech.github.io/dav-assistant/');
  assert.equal(await page.getByRole('link', { name: /Open the kiosk with DAV AI Receptionist/ }).getAttribute('href'), 'https://dav-daitech.github.io/avatar-kiosk/');
  assert.deepEqual(await page.locator('.button:visible').evaluateAll((buttons) => [...new Set(buttons.map((b) => Math.round(b.getBoundingClientRect().height)))]), [44], 'All buttons share a uniform 44px height');
  assert(await page.locator('img').evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), 'All images load');
  assert(await page.locator('.meeting-photo').evaluate((image) => image.srcset.split(',').some((candidate) => {
    const [url, width] = candidate.trim().split(/\s+/);
    return width === '1600w' && new URL(url, document.baseURI).href === image.currentSrc;
  })), 'Desktop hero selects the generated 1600px image');
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Student life', exact: true }).click();
  assert.equal(await page.locator('.product-card:visible').count(), 1);
  assert(await page.locator('.match-card').isVisible());
  assert.equal(await page.getByRole('button', { name: 'Student life', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'AI assistant', exact: true }).click();
  assert.equal(await page.locator('.product-card:visible').count(), 2);
  assert(await page.getByRole('heading', { name: 'DAV Chatbot', exact: true }).isVisible());
  assert(await page.getByRole('heading', { name: 'DAV AI Receptionist', exact: true }).isVisible());
  assert.match(await page.getByRole('status').innerText(), /Showing 2 products in AI assistant/);
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
  const header = page.getByRole('banner');
  const menu = header.locator('summary');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
    assert(await page.locator('.hero h1').isVisible());
    if (await menu.isVisible()) await menu.click();
    assert(await header.getByRole('link', { name: 'Our products', exact: true }).isVisible());
    if (await menu.isVisible()) await page.keyboard.press('Escape');
    if (width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 600));
    assert.equal(Math.round((await header.boundingBox()).y), 0, 'Header stays at the top after scrolling');
    if (await menu.isVisible()) {
      await menu.focus();
      await page.keyboard.press('Enter');
      const projectLink = header.getByRole('link', { name: 'Projects', exact: true });
      await projectLink.focus();
      await page.keyboard.press('Escape');
      assert(await menu.evaluate((item) => item === document.activeElement), 'Escape restores menu focus');
      assert.equal(await projectLink.isVisible(), false);
      await menu.click();
    }
    await header.getByRole('link', { name: 'Our products', exact: true }).click();
    await page.waitForFunction(() => {
      const section = document.getElementById('products').getBoundingClientRect();
      const header = document.querySelector('.site-header').getBoundingClientRect();
      return location.hash === '#products' && section.top >= header.bottom && section.top < innerHeight / 2;
    });
    assert.equal(await header.locator('details[open]').count(), 0);
  }
  assert.equal(await page.locator('.hero-content').evaluate((element) => getComputedStyle(element).animationName), 'none');
  assert.deepEqual(await page.evaluate(() => window.cspViolations), [], 'Production assets comply with the Content Security Policy');

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
  assert.equal(await secondCollection.locator('.product-card:visible').count(), 2);
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
  try {
    await browser?.close();
  } finally {
    await server.stop();
  }
}
