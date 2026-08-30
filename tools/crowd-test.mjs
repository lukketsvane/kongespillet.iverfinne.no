// The crowd contract in public/crowd-assets.js and public/world.js.
//
// Every figure is now loaded from an external image host, so the tests below
// intercept those requests: once fulfilled, once failed outright. A round must
// stay findable and stable in both cases.
import { chromium } from 'playwright';
import { CHROME, PNG, script, stubHtml, reporter } from './stub-page.mjs';

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
  const el = document.querySelector('img.harald-target');
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { display: cs.display, visibility: cs.visibility, w: r.width, h: r.height };
});
const shown = h => h && h.display !== 'none' && h.visibility !== 'hidden' && h.w > 0 && h.h > 0;

check('Harald is visible when images load', shown(await harald()));

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

// Finding Harald starts a new round: everyone gets a new spot. This has to be
// checked on an untouched age — the layout used to be seeded on the age alone,
// so a round won before the next tick came back in the exact same arrangement.
// Ticking the age first would change the seed and hide that entirely.
page = await open({ images: true });
let placed = await placements();
for (const round of [1, 2, 3]) {
  await page.evaluate(() => {
    const b = document.querySelector('.crowd-board');
    b.dataset.fhRealRound = String(Number(b.dataset.fhRealRound || 0) + 1);
    window.__FH_WORLD__?.advanceRound?.();
  });
  await page.waitForTimeout(350);
  const now = await placements();
  const keys = Object.keys(placed).filter(k => now[k]);
  const reshuffled = keys.filter(k => placed[k] !== now[k]).length;
  check(`round ${round}: every figure gets a new placement`, reshuffled > keys.length * 0.9,
    `${reshuffled} of ${keys.length} re-placed`);
  placed = now;
}
await page.close();

// With the image host unreachable Harald must still be findable. Left alone he
// is hidden outright; the mutation churn from world.js happens to un-hide him
// again, but only as an empty box with nothing drawn in it. Either way the
// player cannot see the one thing the round asks them to find, so the fallback
// has to be a deliberate visible marker rather than whatever the browser makes
// of a broken <img>.
page = await open({ images: false });
await page.waitForTimeout(3000);
const broken = await harald();
const marked = await page.evaluate(() =>
  document.querySelector('img.harald-target')?.classList.contains('fh-harald-placeholder') === true);
check('Harald is still on the board when the image host is dead', shown(broken),
  broken ? `display:${broken.display} ${Math.round(broken.w)}x${Math.round(broken.h)}` : 'no target');
check('Harald falls back to a drawn marker, not a broken image', marked);
await page.close();

await browser.close();
process.exit(done() ? 0 : 1);
