import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const launchOptions = {};
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
  launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
}

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
const injectedScripts = ['crowd-assets.js', 'enhance.js'];
const reactOwnedSelectors = [
  '.first-instruction',
  '#instruction-without-class',
  '.game-footer > p',
  '.fh-extra-crowd',
];

page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

try {
  await page.setContent(`
    <main class="game-shell">
      <header class="masthead"></header>
      <section class="crowd-board">
        <div class="first-instruction">Finn Harald blant 4</div>
        <div id="instruction-without-class">Finn Harald blant 4</div>
      </section>
      <footer class="game-footer"><p>Jo raskare du finn han</p></footer>
      <div class="fh-extra-crowd"></div>
    </main>
  `);
  await page.evaluate(() => {
    window.__FH_CROWD = [
      'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA',
    ];
  });

  for (const file of injectedScripts) {
    const source = await readFile(new URL(`../public/${file}`, import.meta.url), 'utf8');
    await page.addScriptTag({ content: source });
  }
  await page.waitForTimeout(100);

  for (const selector of reactOwnedSelectors) {
    assert.equal(
      await page.locator(selector).count(),
      1,
      `${selector} was removed outside React`
    );
  }
  assert.equal(errors.length, 0, errors.join('\n'));

  await page.evaluate((selectors) => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      node.parentNode.removeChild(node);
    }
  }, reactOwnedSelectors);
  assert.equal(await page.locator('.game-shell').count(), 1);
  console.log('Injected enhancements leave React-owned game nodes intact.');
} finally {
  await browser.close();
}
