// The crowd contract in public/crowd-assets.js and public/world.js.
//
// Every figure is now loaded from an external image host, so the tests below
// intercept those requests: once fulfilled, once failed outright. A round must
// stay findable and stable in both cases.
import { chromium } from 'playwright';
import { CHROME, PNG, script, stubHtml, reporter, REBUILD_CROWD } from './stub-page.mjs';

const AGE = 30;
const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });

async function open({ images }) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  await page.route('**://i.ibb.co/**', route =>
    images ? route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
           : route.abort());
  await page.setContent(stubHtml({ age: AGE }));
  await page.addScriptTag({ content: script('crowd-assets.js') });
  await page.addScriptTag({ content: script('world.js') });
  await page.waitForTimeout(500);
  return page;
}

// world.js must actually expose what crowd-assets.js calls on a correct find.
// The call site uses ?.(), so a missing function fails silently.
let page = await open({ images: true });
check('world.js exposes advanceRound',
  await page.evaluate(() => typeof window.__FH_WORLD__?.advanceRound === 'function'));

const harald = () => page.evaluate(() => {
  const el = document.querySelector('.harald-target');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { display: cs.display, visibility: cs.visibility, w: r.width, h: r.height };
});
const shown = h => h && h.display !== 'none' && h.visibility !== 'hidden' && h.w > 0 && h.h > 0;

check('Harald is visible when images load', shown(await harald()));

// The king is upstream's own <button>, and every script that has to know which
// figure he is has to find him there. Left unfound, the round never advances,
// the crowd never moves and he never joins the pan.
check('the king is laid out with the crowd',
  await page.evaluate(() => document.querySelector('.harald-target')?.dataset.fhUid === 'harald'));

// Positions must hold while the clock ticks: crowd-assets.js locks the sources
// to the round, and the layout has to be locked to the same round.
// Measure where each figure actually renders. world.js keeps the layout in a
// stylesheet rather than inline styles, so reading el.style.left would compare
// empty strings and pass no matter what moved.
const snapshot = () => page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.crowd-board img.crowd-figure').forEach(el => {
    const r = el.getBoundingClientRect();
    out[el.dataset.fhUid || el.className] = `${r.x.toFixed(1)}/${r.y.toFixed(1)}`;
  });
  return out;
});
const count = () => page.$$eval('.crowd-board img.crowd-figure', els => els.length);

// Where world.js decided each figure belongs, independent of pan and zoom.
// Comparing rendered rects here would pass on nothing but advanceRound()'s
// recentring, which moves every figure without relaying anyone out.
const placements = () => page.evaluate(() => {
  const out = {};
  document.querySelectorAll('.crowd-board img.crowd-figure').forEach(el => {
    const cs = getComputedStyle(el);
    out[el.dataset.fhUid] = `${cs.getPropertyValue('--fh-x').trim()}/${cs.getPropertyValue('--fh-y').trim()}`;
  });
  return out;
});

const before = await snapshot(), beforeCount = await count(), placedBefore = await placements();
await page.evaluate(a => { document.querySelector('.age-lockup strong').textContent = String(a); }, AGE + 5);
await page.waitForTimeout(400);
const after = await snapshot(), afterCount = await count(), placedAfterTick = await placements();
const moved = Object.keys(before).filter(k => before[k] !== after[k]).length;
check('the crowd holds still while the age ticks', moved === 0, `${moved} of ${Object.keys(before).length} figures moved`);
check('the head count holds still while the age ticks', beforeCount === afterCount, `${beforeCount} → ${afterCount}`);

const drifted = Object.keys(placedBefore).filter(k => placedAfterTick[k] && placedAfterTick[k] !== placedBefore[k]).length;
check('placements hold still while the age ticks', drifted === 0,
  `${drifted} of ${Object.keys(placedBefore).length} re-placed`);

await page.close();

// Finding Harald starts a new round: everyone gets a new spot. React throws the
// whole crowd away and builds it again with new keys, so the new figures arrive
// as DOM nodes our scripts have never seen — that, not a click listener, is the
// signal. The old listener watched for `img.harald-target`, which the game has
// never had, so the round number never moved: one board, one head count and one
// era for the whole game.
page = await open({ images: true });
let placed = await placements();
let round = await page.$eval('.crowd-board', el => el.dataset.fhRealRound);
for (const n of [1, 2, 3]) {
  await page.evaluate(REBUILD_CROWD);
  await page.waitForTimeout(400);
  const nowRound = await page.$eval('.crowd-board', el => el.dataset.fhRealRound);
  check(`round ${n}: rebuilding the crowd counts as a new round`, nowRound !== round,
    `${round} → ${nowRound}`);
  round = nowRound;
  const now = await placements();
  const keys = Object.keys(placed).filter(k => now[k]);
  const reshuffled = keys.filter(k => placed[k] !== now[k]).length;
  check(`round ${n}: every figure gets a new placement`, reshuffled > keys.length * 0.9,
    `${reshuffled} of ${keys.length} re-placed`);
  placed = now;
}
await page.close();

// With the image host unreachable the round must still be findable. Harald's own
// portrait comes from the game's own origin, not the crowd's image host, so he
// survives it — but the crowd must not be left as a field of broken boxes, and
// the figures that do come back have to be real people.
page = await open({ images: false });
await page.waitForTimeout(3000);
const broken = await harald();
check('Harald is still on the board when the image host is dead', shown(broken),
  broken ? `display:${broken.display} ${Math.round(broken.w)}x${Math.round(broken.h)}` : 'no target');
// A figure whose image will not load is hidden and given another one to try,
// rather than left as a visible empty box in the middle of the crowd.
const retrying = await page.evaluate(() =>
  [...document.querySelectorAll('.crowd-board img.crowd-figure')]
    .filter(el => Number(el.dataset.fhRetries || 0) > 0).length);
check('the crowd keeps trying other pictures instead of standing empty',
  retrying > 0, `${retrying} figures retrying`);
await page.close();

await browser.close();
process.exit(done() ? 0 : 1);
