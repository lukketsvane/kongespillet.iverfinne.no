// The crowd and the king must move as one.
//
// Upstream is React, and it rewrites the `style` attribute on the elements it
// owns — the original figures and the Harald target — on every render. world.js
// used to read each figure's position back out of `img.style.left`, so a render
// mid-pinch left those elements with no position to read, and they were skipped
// while world.js's own clones kept moving. This reproduces that by wiping the
// inline styles React would have wiped, then pinching.
import { chromium } from 'playwright';
import { CHROME, PNG, script, stubHtml, reporter } from './stub-page.mjs';

const AGE = 30;
const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, hasTouch: true });
const cdp = await page.context().newCDPSession(page);
// The production pair. crowd-assets.js is what actually applies
// --fh-render-scale as a `scale`, and it is what gives Harald a scale of his
// own (physicalHarald) that differs from the crowd's — so without it loaded
// there is no scale difference to drift.
await page.route('**://i.ibb.co/**', route =>
  route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
await page.setContent(stubHtml({ age: AGE }));
await page.addScriptTag({ content: script('crowd-assets.js') });
await page.addScriptTag({ content: script('world.js') });
await page.waitForTimeout(600);

// Where every figure sits on screen, keyed by the uid world.js assigns.
// The king included — he is a <button>, not an <img>, and leaving him out of
// this is exactly how he came to drift away from the crowd under a pinch.
const positions = () => page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.crowd-board img.crowd-figure,.crowd-board .harald-target').forEach(el => {
    const r = el.getBoundingClientRect();
    out[el.dataset.fhUid] = [r.x + r.width / 2, r.y + r.height / 2];
  });
  return out;
});

check('panning is enabled at age ' + AGE,
  await page.$eval('.crowd-board', el => el.dataset.fhNavigable) === '1');

const king = await page.evaluate(() =>
  document.querySelector('.harald-target')?.dataset.fhUid);
check('the king is laid out with the crowd', !!king, `uid: ${king}`);

const before = await positions();

// React re-renders: the style attribute it controls is rewritten from props.
// It owns the upstream figures and the king, not world.js's clones.
const wiped = await page.evaluate(() => {
  let n = 0;
  document.querySelectorAll('.crowd-board img.crowd-figure,.crowd-board .harald-target').forEach(el => {
    if (el.classList.contains('fh-extra-crowd')) return;   // world.js's own clone
    el.setAttribute('style', '');                          // what React does
    n++;
  });
  return n;
});

// Pinch out with real touch points, so the pointer ids are ones the browser
// recognises and setPointerCapture behaves as it does on a phone.
const mid = await page.evaluate(() => {
  const r = document.querySelector('.crowd-board').getBoundingClientRect();
  return { cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
});
const touch = (type, spread) => cdp.send('Input.dispatchTouchEvent', {
  type,
  touchPoints: spread === null ? [] :
    [{ x: mid.cx - spread, y: mid.cy }, { x: mid.cx + spread, y: mid.cy }],
});
await touch('touchStart', 40);
await touch('touchMove', 130);
await page.waitForTimeout(300);
const after = await positions();

const zoom = await page.evaluate(() => window.__FH_WORLD__.zoom);
check('the pinch actually zoomed', zoom > 1.2, `zoom ${zoom.toFixed(2)}×`);
check('React wiped the styles it owns', wiped > 0, `${wiped} figures wiped`);

// Under a uniform zoom about the centre, every figure's distance from the
// centre scales by the same factor. Anything left behind breaks that ratio.
const centre = await page.evaluate(() => {
  const r = document.querySelector('.crowd-board').getBoundingClientRect();
  return [r.x + r.width / 2, r.y + r.height / 2];
});
const ratios = Object.keys(before).filter(k => after[k]).map(k => {
  const p = before[k], a = after[k];
  const db = Math.hypot(p[0] - centre[0], p[1] - centre[1]);
  const da = Math.hypot(a[0] - centre[0], a[1] - centre[1]);
  return db > 30 ? da / db : null;
}).filter(r => r !== null);

const lo = Math.min(...ratios), hi = Math.max(...ratios);
check('every figure moves by the same factor', hi - lo < 0.06,
  `spread ${lo.toFixed(3)}–${hi.toFixed(3)} over ${ratios.length} figures`);

const ratioOf = k => {
  const db = Math.hypot(before[k][0] - centre[0], before[k][1] - centre[1]);
  const da = Math.hypot(after[k][0] - centre[0], after[k][1] - centre[1]);
  return da / db;
};
const kingRatio = ratioOf(king), crowdMid = ratios.sort((a, b) => a - b)[Math.floor(ratios.length / 2)];
check('the king scales out with the crowd', Math.abs(kingRatio - crowdMid) < 0.03,
  `king ${kingRatio.toFixed(3)} vs crowd ${crowdMid.toFixed(3)}`);

await browser.close();
process.exit(done() ? 0 : 1);
