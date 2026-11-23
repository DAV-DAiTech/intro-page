import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { en, vi } from '../src/i18n.ts';

export async function checkLocales(browser, baseUrl) {
  assert.deepEqual(Object.keys(vi).sort(), Object.keys(en).sort(), 'Every English string has a Vietnamese translation');
  for (const key of Object.keys(en)) {
    const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    assert(vi[key].trim(), `${key} is translated`);
    assert.deepEqual(placeholders(vi[key]), placeholders(en[key]), `${key} preserves its placeholders`);
  }

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const audit = async (name) => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), [], name);
  };
  try {
    await page.goto(`${baseUrl}/en/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    const switchToVietnamese = page.getByRole('link', { name: 'Tiếng Việt', exact: true });
    assert.equal(await switchToVietnamese.getAttribute('lang'), 'vi');
    await page.getByRole('button', { name: 'Accessibility settings', exact: true }).click();
    await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
    await page.getByLabel('Text size', { exact: true }).selectOption('large');
    await page.keyboard.press('Escape');
    await switchToVietnamese.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(`${baseUrl}/`);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Theme survives switching language');
    assert.equal(await page.locator('html').getAttribute('data-text-size'), 'large', 'Reading size survives switching language');
    await page.getByRole('button', { name: 'Cài đặt trợ năng', exact: true }).click();
    await page.getByRole('button', { name: 'Đặt lại tùy chọn' }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.title(), vi['meta.title']);
    assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), vi['meta.description']);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://dav-daitech.github.io/');
    assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), 'vi_VN');
    for (const [locale, path] of [['en', '/en/'], ['vi', '/'], ['x-default', '/']]) {
      assert.equal(await page.locator(`link[rel="alternate"][hreflang="${locale}"]`).getAttribute('href'), `https://dav-daitech.github.io${path}`);
    }
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(schema['@graph'][1].name, vi['products.listName']);
    assert.equal(schema['@graph'][1].itemListElement[0].item.description, vi['products.match.description']);
    await page.evaluate(() => document.fonts.ready);
    assert.match(await page.locator('h1').evaluate((element) => getComputedStyle(element).fontFamily), /Lexend/, 'Vietnamese headings use a font with Vietnamese coverage');
    for (const font of await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) => links.map((link) => link.href))) {
      assert.equal((await fetch(font)).status, 200, 'Preloaded locale fonts exist');
    }
    await audit('Vietnamese light appearance');
    await page.screenshot({ path: 'test-results/vi-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Đời sống sinh viên', exact: true }).click();
    assert.equal(await page.locator('.product-card:visible').count(), 1);
    assert(await page.locator('.match-card').isVisible());
    assert.equal(await page.getByRole('status').textContent(), 'Đang hiển thị 1 sản phẩm thuộc danh mục Đời sống sinh viên');
    await page.getByRole('button', { name: 'Trợ lý AI', exact: true }).click();
    assert(await page.getByRole('heading', { name: 'DAV Chatbot', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Tìm hiểu thêm về DAV Chatbot', exact: true }).click();
    assert(await page.getByRole('dialog').getByText(vi['products.chat.detail'], { exact: true }).isVisible());
    await audit('Vietnamese product dialog');
    await page.getByRole('button', { name: 'Đóng thông tin sản phẩm' }).click();
    await page.getByRole('button', { name: /Tất cả sản phẩm/ }).click();
    await page.getByRole('button', { name: 'Cài đặt trợ năng', exact: true }).click();
    await audit('Vietnamese reading settings');
    await page.getByLabel('Giao diện', { exact: true }).selectOption('dark');
    await page.keyboard.press('Escape');
    await audit('Vietnamese dark appearance');
    await page.screenshot({ path: 'test-results/vi-dark.png', fullPage: true });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Vietnamese reflows at ${width}px`);
      assert(await page.getByRole('link', { name: 'English', exact: true }).isVisible());
      if (width === 390) await page.screenshot({ path: 'test-results/vi-mobile.png', fullPage: true });
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Vietnamese reflows at 200% text');
    await page.getByRole('button', { name: 'Cài đặt trợ năng', exact: true }).click();
    assert(await page.getByRole('dialog').evaluate((element) => element.scrollWidth <= element.clientWidth + 1), 'Vietnamese settings fit at 200% text');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await page.waitForURL(`${baseUrl}/en/`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.goto(`${baseUrl}/404.html`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'vi');
    assert(await page.getByRole('heading', { level: 1, name: vi['notFound.title'] }).isVisible());
    assert.equal(await page.getByRole('link', { name: vi['notFound.cta'], exact: true }).getAttribute('href'), '/');
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex');
    const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
    assert.match(sitemap, /<loc>https:\/\/dav-daitech.github.io\/en\/<\/loc>/);
    const llms = await (await fetch(`${baseUrl}/llms.txt`)).text();
    assert(llms.includes(vi['llms.description']));
    assert(llms.includes(vi['products.chat.detail']));
    assert.deepEqual(errors, [], 'No locale JavaScript errors');
  } finally {
    await context.close();
  }

  const noScript = await browser.newContext({ javaScriptEnabled: false });
  try {
    const staticPage = await noScript.newPage();
    await staticPage.goto(`${baseUrl}/en/`);
    await staticPage.getByRole('link', { name: 'Tiếng Việt', exact: true }).click();
    assert.equal(await staticPage.locator('html').getAttribute('lang'), 'vi', 'Language switching works without JavaScript');
    assert.equal(await staticPage.locator('.product-actions > a:visible').count(), 3);
  } finally {
    await noScript.close();
  }
  console.log('Passed: Vietnamese translations, language switching with and without JS, persisted preferences, localized metadata, fonts, filters, dialogs, 5 responsive widths, 200% text, and accessibility audits.');
}
