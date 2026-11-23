import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';

export async function checkAccessibility(browser, baseUrl) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const audit = async (name) => {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    assert.deepEqual(result.violations.map(({ id, nodes }) => ({ id, elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), [], `${name}: no automated accessibility violations`);
  };
  const openSettings = async () => page.getByRole('button', { name: 'Accessibility settings', exact: true }).click();
  const closeSettings = async () => page.keyboard.press('Escape');

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('body').evaluate((element) => getComputedStyle(element).fontSize), '18px');
  assert.equal(await page.locator('.product-description').first().evaluate((element) => getComputedStyle(element).fontSize), '18px');
  await page.keyboard.press('Tab');
  assert(await page.getByRole('link', { name: 'Skip to content' }).evaluate((element) => element === document.activeElement));
  await page.keyboard.press('Enter');
  assert(await page.locator('#main').evaluate((element) => element === document.activeElement), 'Skip link moves keyboard focus into content');
  await audit('Default light appearance');
  await openSettings();
  await audit('Reading settings dialog');
  const options = await page.locator('#reading-font option').allTextContents();
  assert(!options.some((option) => /dyslexic/i.test(option)));
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await closeSettings();
  await audit('Dark appearance');
  await page.screenshot({ path: 'test-results/dark.png', fullPage: true });
  await openSettings();
  await audit('Dark reading settings dialog');
  await closeSettings();
  await page.getByRole('button', { name: 'More about DAV Chatbot' }).click();
  await audit('Dark product dialog');
  await closeSettings();
  await openSettings();
  await page.getByLabel('Contrast', { exact: true }).selectOption('high');
  await closeSettings();
  await audit('High contrast dark appearance');
  await openSettings();
  await page.getByLabel('Appearance', { exact: true }).selectOption('light');
  await closeSettings();
  await audit('High contrast light appearance');
  await openSettings();
  await page.getByLabel('Reading font', { exact: true }).selectOption('atkinson');
  await page.getByLabel('Text size', { exact: true }).selectOption('larger');
  await page.getByLabel('Reduce motion', { exact: true }).check();
  await closeSettings();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('body').evaluate((element) => getComputedStyle(element).fontSize), '22.5px');
  assert.match(await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily), /Atkinson Hyperlegible/);
  assert.equal(await page.locator('.hero-content').evaluate((element) => getComputedStyle(element).animationName), 'none');
  await openSettings();
  assert(await page.getByLabel('Reduce motion', { exact: true }).isChecked(), 'Preferences survive reload');
  await page.getByRole('button', { name: 'Reset preferences' }).click();
  assert.equal(await page.getByLabel('Text size', { exact: true }).inputValue(), 'default');
  await page.getByLabel('Reading font', { exact: true }).selectOption('lexend');
  await closeSettings();
  assert.match(await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily), /Lexend/);
  await openSettings();
  await page.getByRole('button', { name: 'Reset preferences' }).click();
  await closeSettings();

  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('html { font-size: 200%; }');
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `200% text reflows at ${width}px`);
    assert(await page.locator('.hero-content').evaluate((element) => element.scrollHeight <= element.clientHeight + 1), 'Hero text is not clipped');
    await openSettings();
    assert(await page.getByRole('dialog').evaluate((element) => element.scrollWidth <= element.clientWidth + 1), 'Settings fit at 200% text');
    await closeSettings();
    await page.evaluate(() => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync('p, h1, h2, h3, a, button, label { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }');
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `User text spacing reflows at ${width}px`);
    await page.evaluate(() => { document.adoptedStyleSheets = []; });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark', contrast: 'more' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.hero-content').evaluate((element) => getComputedStyle(element).animationName), 'none');
  assert.equal(await page.locator('html').evaluate((element) => getComputedStyle(element).color), 'rgb(255, 255, 255)');
  await openSettings();
  assert(await page.getByLabel('Reduce motion', { exact: true }).isChecked());
  assert(await page.getByLabel('Reduce motion', { exact: true }).isDisabled());
  await closeSettings();
  await page.emulateMedia({ forcedColors: 'active' });
  await audit('Operating system forced colors');
  await page.getByRole('button', { name: 'More about DAV Chatbot' }).click();
  await audit('Product dialog');
  await closeSettings();

  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noScript.newPage();
  await staticPage.goto(baseUrl);
  assert.equal(await staticPage.locator('.product-launch:visible').count(), 3);
  assert.equal(await staticPage.locator('.filters:visible, .details-button:visible, .settings-trigger:visible').count(), 0, 'Only usable controls are shown without JavaScript');
  await noScript.close();
  const blockedStorage = await context.newPage();
  blockedStorage.on('pageerror', (error) => errors.push(error.message));
  await blockedStorage.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage unavailable'); } }));
  await blockedStorage.goto(baseUrl, { waitUntil: 'networkidle' });
  await blockedStorage.getByRole('button', { name: 'Accessibility settings', exact: true }).click();
  await blockedStorage.getByLabel('Appearance', { exact: true }).selectOption('dark');
  assert.equal(await blockedStorage.locator('html').getAttribute('data-theme'), 'dark');
  assert.deepEqual(errors, [], 'Accessibility controls work without browser storage');
  await context.close();
  console.log('Passed: automated contrast/semantics audits, keyboard skip link, reading preferences, storage fallback, no-JS access, forced colors, reduced motion, 200% text, and user text spacing.');
}
