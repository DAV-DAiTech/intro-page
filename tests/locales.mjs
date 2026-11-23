import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { clubPages, en, pagePath, vi } from '../src/i18n.ts';
import { contactLinks } from '../src/data/contact.ts';
import { getShowcaseImages, launchImage } from '../src/data/images.ts';
import { members } from '../src/data/members.ts';
import { getProducts, getProjects } from '../src/data/products.ts';

export async function checkLocales(browser, baseUrl) {
  assert.deepEqual(Object.keys(vi).sort(), Object.keys(en).sort(), 'Every English string has a Vietnamese translation');
  for (const key of Object.keys(en)) {
    const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    assert(vi[key].trim(), `${key} is translated`);
    assert.deepEqual(placeholders(vi[key]), placeholders(en[key]), `${key} preserves its placeholders`);
  }

  const products = getProducts('vi');
  const match = products.find(({ id }) => id === 'match');
  const chat = products.find(({ id }) => id === 'chat');

  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage();
  const header = page.getByRole('banner');
  const menu = header.locator('summary');
  const openMenu = async () => {
    if (await menu.isVisible() && !(await menu.evaluate((item) => item.parentElement.open))) await menu.click();
  };
  const checkProjectCardLayout = async (wide = true) => {
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.locator('.product-card:visible').evaluateAll((cards) => cards.map((card) => ({
      row: card.getBoundingClientRect().toJSON(),
      description: card.querySelector('.product-description').getBoundingClientRect().toJSON(),
      actions: card.querySelector('.product-actions').getBoundingClientRect().toJSON(),
      firstAction: card.querySelector('.product-launch').getBoundingClientRect().toJSON(),
      lastAction: card.querySelector('.details-button').getBoundingClientRect().toJSON()
    })));
    const edge = wide ? 'right' : 'left';
    for (const [index, { row, description, actions, firstAction, lastAction }] of rows.entries()) {
      assert.equal(Math.round(row.height), Math.round(rows[0].row.height), 'Project rows have equal height');
      if (index > 0) assert(row.top >= rows[index - 1].row.bottom - 1, 'Projects are listed in one column');
      assert(lastAction.top >= firstAction.bottom, 'Learn more sits below the launch button');
      assert.equal(Math.round(firstAction[edge]), Math.round(row[edge]), `Project launch buttons align to the ${edge} edge`);
      assert.equal(Math.round(lastAction[edge]), Math.round(row[edge]), `Learn more buttons align to the ${edge} edge`);
      if (wide) assert(actions.left >= description.right, 'Project actions sit beside their description');
      else assert(actions.top >= description.bottom, 'Project actions reflow below the description in a narrow layout');
    }
  };
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
    const languageSwitch = header.getByRole('link', { name: 'English', exact: true });
    const settings = header.getByRole('button', { name: vi['a11y.triggerLabel'], exact: true });
    assert.equal((await languageSwitch.boundingBox()).height, (await settings.boundingBox()).height);
    assert.equal(await page.title(), vi['meta.title']);
    assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), vi['meta.description']);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://dav-daitech.github.io/');
    assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'), 'vi_VN');
    for (const [locale, path] of [['en', '/en/'], ['vi', '/'], ['x-default', '/']]) {
      assert.equal(await page.locator(`link[rel="alternate"][hreflang="${locale}"]`).getAttribute('href'), `https://dav-daitech.github.io${path}`);
    }
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(schema['@graph'][1].name, vi['products.listName']);
    assert.equal(schema['@graph'][1].itemListElement[0].item.description, match.description);
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
    assert(await page.getByRole('heading', { name: 'DAV AI Receptionist', exact: true }).isVisible());
    assert.equal(await page.getByRole('status').textContent(), 'Đang hiển thị 2 sản phẩm thuộc danh mục Trợ lý AI');
    await page.getByRole('button', { name: 'Tìm hiểu thêm về DAV Chatbot', exact: true }).click();
    assert(await page.getByRole('dialog').getByText(chat.detail, { exact: true }).isVisible());
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
      await openMenu();
      assert(await header.getByRole('link', { name: 'English', exact: true }).isVisible());
      if (await menu.isVisible()) await page.keyboard.press('Escape');
      if (width === 390) await page.screenshot({ path: 'test-results/vi-mobile.png', fullPage: true });
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Vietnamese reflows at 200% text');
    await page.getByRole('button', { name: 'Cài đặt trợ năng', exact: true }).click();
    assert(await page.getByRole('dialog').evaluate((element) => element.scrollWidth <= element.clientWidth + 1), 'Vietnamese settings fit at 200% text');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
    await openMenu();
    await header.getByRole('link', { name: 'English', exact: true }).click();
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
    assert(llms.includes(chat.detail));

    for (const [locale, dictionary, otherLocale] of [['vi', vi, 'en'], ['en', en, 'vi']]) {
      for (const slug of clubPages) {
        const path = pagePath(locale, slug);
        const alternate = pagePath(otherLocale, slug);
        const title = dictionary[`pages.${slug}.title`];
        assert(sitemap.includes(`<loc>https://dav-daitech.github.io${path}</loc>`));
        await page.setViewportSize({ width: 1440, height: 1000 });
        assert.equal((await page.goto(`${baseUrl}${path}`)).status(), 200);
        assert.equal(await page.locator('html').getAttribute('lang'), locale);
        assert.equal(await page.getByRole('heading', { level: 1 }).textContent(), title);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://dav-daitech.github.io${path}`);
        assert.equal(await page.locator(`link[hreflang="${otherLocale}"]`).getAttribute('href'), `https://dav-daitech.github.io${alternate}`);
        const mainNav = header.getByRole('navigation', { name: dictionary['header.navLabel'] });
        const footerNav = page.getByRole('navigation', { name: dictionary['footer.navLabel'] });
        for (const nav of [mainNav, footerNav]) {
          assert.equal(await nav.locator('a[aria-current="page"]').textContent(), title);
        }
        const navItems = (nav) => nav.locator('a').evaluateAll((links) =>
          links.map((link) => [link.textContent, link.getAttribute('href')])
        );
        assert.deepEqual(await navItems(mainNav), await navItems(footerNav));

        if (slug === 'projects') {
          const projects = getProjects(locale);
          assert.equal(await page.locator('.product-card:visible').count(), projects.length);
          await checkProjectCardLayout();
          assert.equal(await page.locator('.product-source:visible').count(), 0);
          const cards = page.locator('.product-card');
          for (const project of projects) {
            const card = cards.filter({ has: page.getByRole('heading', { name: project.name, exact: true }) });
            const sourceName = dictionary['products.sourceLabel'].replace('{name}', project.name);
            const detailsName = dictionary['products.moreAbout'].replace('{name}', project.name);
            await card.getByRole('button', { name: detailsName, exact: true }).click();
            const source = page.getByRole('dialog').getByRole('link', { name: sourceName, exact: true });
            if (project.sourceUrl) {
              assert.equal(await source.getAttribute('href'), project.sourceUrl);
            } else {
              assert.equal(await source.count(), 0);
            }
            await page.keyboard.press('Escape');
            if (project.id === 'website') {
              const home = card.getByRole('link', { name: project.link, exact: true });
              assert.equal(await home.getAttribute('href'), pagePath(locale));
              assert.equal(await home.getAttribute('target'), null);
            }
          }
          await page.getByRole('button', { name: dictionary['products.chat.category'], exact: true }).click();
          assert.equal(await page.locator('.product-card:visible').count(), 2);
          await checkProjectCardLayout();
          await page.getByRole('button', { name: new RegExp(dictionary['products.all']) }).click();
        }
        if (slug === 'showcase') {
          const images = page.locator('main figure img');
          assert.equal(await images.count(), 3);
          for (const image of await images.all()) {
            await image.scrollIntoViewIfNeeded();
            assert(await image.getAttribute('alt'));
            await page.waitForFunction((element) => element.complete && element.naturalWidth > 0, await image.elementHandle());
          }
          const links = await page.locator('main figcaption a').evaluateAll((elements) => elements.map((link) => link.href));
          assert.equal(links.length, await images.count());
          assert.equal(links[0], new URL(launchImage.href, baseUrl).href);
          const copy = getShowcaseImages(locale);
          assert.deepEqual(await page.locator('main figcaption').allTextContents(), copy.map(({ caption }) => caption));
          assert.deepEqual(await images.evaluateAll((elements) => elements.map((image) => image.alt)), copy.map(({ alt }) => alt));
          assert.equal((await fetch(links[0], { method: 'HEAD' })).status, 200);
          assert.match(await images.first().evaluate((image) => image.currentSrc), /\/images\/club\/orientationday-1600\.webp$/);
        }
        if (slug === 'members') {
          if (members.length) {
            assert.deepEqual(await page.locator('main h2').allTextContents(), members.map(({ name }) => name));
          } else {
            assert(await page.locator('main').getByText(dictionary['members.empty'], { exact: true }).isVisible());
          }
        }
        if (slug === 'contact') {
          for (const landmark of ['main', 'contentinfo']) {
            const list = page.getByRole(landmark).getByRole('list', { name: dictionary['contact.linksLabel'] });
            assert.deepEqual(await navItems(list), contactLinks.map(({ label, url }) => [label, url]));
            assert.equal(await list.locator('a > svg[aria-hidden="true"]:visible').count(), contactLinks.length);
          }
        }

        await audit(`${locale} ${slug}`);
        if (locale === 'en') {
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: `test-results/${slug}-desktop.png`, fullPage: true });
        }
        await page.setViewportSize({ width: 320, height: 900 });
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        assert(await page.locator('main').evaluate((main) => main.scrollWidth <= main.clientWidth), `${locale} ${slug} reflows at 200% text`);
        if (slug === 'projects') await checkProjectCardLayout(false);
        if (locale === 'en') {
          await openMenu();
          await header.getByRole('link', { name: 'Tiếng Việt', exact: true }).click();
          await page.waitForURL(`${baseUrl}${alternate}`);
        }
      }
    }
    assert.deepEqual(errors, [], 'No locale JavaScript errors');
  } finally {
    await context.close();
  }

  const noScript = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
    reducedMotion: 'reduce'
  });
  try {
    const staticPage = await noScript.newPage();
    await staticPage.goto(`${baseUrl}/en/`);
    const staticHeader = staticPage.getByRole('banner');
    await staticHeader.locator('summary').click();
    await staticHeader.getByRole('link', { name: 'Tiếng Việt', exact: true }).click();
    assert.equal(await staticPage.locator('html').getAttribute('lang'), 'vi', 'Language switching works without JavaScript');
    assert.equal(await staticPage.locator('.product-launch:visible').count(), products.length);
    await staticHeader.locator('summary').click();
    await staticHeader.getByRole('link', { name: vi['nav.products'], exact: true }).click();
    await staticPage.waitForURL(`${baseUrl}/#products`);
    assert(await staticPage.locator('#products-title').evaluate((heading) => {
      const { x, y } = heading.getBoundingClientRect();
      return heading.contains(document.elementFromPoint(x + 1, y + 1));
    }), 'The no-script mobile menu leaves the anchored heading visible');
    await staticPage.evaluate(() => window.scrollTo(0, 0));
    await staticHeader.getByRole('link', { name: vi['pages.projects.title'], exact: true }).click();
    await staticPage.waitForURL(`${baseUrl}/projects/`);
    const projects = getProjects('vi');
    assert.equal(await staticPage.locator('.product-launch:visible').count(), projects.length);
    assert.equal(await staticPage.locator('.product-source:visible').count(), 0);
    assert.equal(await staticPage.locator('button[data-filter]:visible').count(), 0);
  } finally {
    await noScript.close();
  }
  console.log('Passed: localized homepages and subpages, language switching, metadata, images, filters, dialogs, 200% text, and accessibility audits.');
}
