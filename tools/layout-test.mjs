// The crowd board must fill the screen on a phone.
//
// Every layout rule we ship is scoped to `.game-shell.fh-compact`, and that
// class is only applied when `.game-shell` still exists upstream. When it does
// not, the board is left in a narrow centred column. public/ios.js therefore
// measures its way up from the board instead of trusting the class name, so
// this test squeezes the shell on purpose and checks the board still fills the
// viewport.
import { chromium } from 'playwright';
import { CHROME, script, stubHtml, reporter } from './stub-page.mjs';

const PHONE = { width: 390, height: 844 };   // iPhone 16e, logical points
const DESKTOP = { width: 1280, height: 900 };
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });

async function measure({ viewport, withFix, squeezed = true }) {
  const page = await browser.newPage({ viewport, userAgent: IPHONE_UA });
  await page.setContent(stubHtml({ age: 30, squeezed }));
  if (withFix) await page.addScriptTag({ content: script('ios.js') });
  await page.waitForTimeout(250);
  const m = await page.evaluate(() => {
    const r = document.querySelector('.crowd-board').getBoundingClientRect();
    return { left: r.left, right: r.right, width: r.width, height: r.height,
             vw: innerWidth, vh: innerHeight,
             scrollW: document.documentElement.scrollWidth };
  });
  await page.close();
  return m;
}

const before = await measure({ viewport: PHONE, withFix: false });
check('the stub reproduces the squeezed column', before.width < before.vw * 0.8,
  `${Math.round(before.width)}px of ${before.vw}px (${Math.round(before.width / before.vw * 100)}%)`);

const after = await measure({ viewport: PHONE, withFix: true });
const pct = Math.round(after.width / after.vw * 100);
check('the board fills the phone screen', after.width >= after.vw - 14,
  `${Math.round(after.width)}px of ${after.vw}px (${pct}%)`);
check('the board starts at the screen edge', after.left <= 7, `left: ${Math.round(after.left)}px`);
check('nothing overflows sideways', after.scrollW <= after.vw + 1,
  `scrollWidth ${after.scrollW} vs viewport ${after.vw}`);

// ios.js gives the board `height:auto;flex:1 1 0`, which only produces a height
// when the shell is a fixed-height flex column. Without that class the figures
// are all absolutely positioned and the board collapses to nothing, so the
// height has to be measured and filled in too.
check('the board keeps a usable height', after.height > after.vh * 0.4,
  `${Math.round(after.height)}px of ${after.vh}px`);

// A shell narrowed by an explicit width, rather than padding or max-width.
const wBefore = await measure({ viewport: PHONE, withFix: false, squeezed: 'width' });
const wAfter = await measure({ viewport: PHONE, withFix: true, squeezed: 'width' });
check('an explicit narrow width is squeezed too', wBefore.width < wBefore.vw * 0.8,
  `${Math.round(wBefore.width)}px of ${wBefore.vw}px`);
check('the board fills the screen there too', wAfter.width >= wAfter.vw - 14,
  `${Math.round(wAfter.width)}px of ${wAfter.vw}px`);
check('and starts at the edge', wAfter.left <= 7, `left: ${Math.round(wAfter.left)}px`);

// On a wide screen the centred column is the intended design, so leave it be.
const desktop = await measure({ viewport: DESKTOP, withFix: true });
check('a wide screen keeps its centred column', desktop.width < desktop.vw * 0.5,
  `${Math.round(desktop.width)}px of ${desktop.vw}px`);

await browser.close();
process.exit(done() ? 0 : 1);
