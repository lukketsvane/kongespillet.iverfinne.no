// What the crowd placement has to be.
//
// The old layout put every figure on a jittered grid: 18 people fell into six
// tidy columns, which reads as a spreadsheet rather than a gathering. And the
// head count did not follow the world's area, so zooming out just spread the
// same few people thinner — at 30 years that was 69 people over 2.8 screens,
// about ten visible at a time in a lot of white.
import { chromium } from 'playwright';
import { CHROME, PNG, script, stubHtml, reporter } from './stub-page.mjs';

const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });

async function sample(age) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route('**://i.ibb.co/**', r =>
    route_ok(r));
  await page.setContent(stubHtml({ age }));
  await page.addScriptTag({ content: script('crowd-assets.js') });
  await page.addScriptTag({ content: script('world.js') });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const board = document.querySelector('.crowd-board').getBoundingClientRect();
    const els = [...document.querySelectorAll('.crowd-board img.crowd-figure')];
    const world = els.map(el => {
      const cs = getComputedStyle(el);
      return [parseFloat(cs.getPropertyValue('--fh-x')), parseFloat(cs.getPropertyValue('--fh-y'))];
    });
    const onScreen = els.filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > board.left && r.left < board.right &&
             r.bottom > board.top && r.top < board.bottom;
    }).length;
    // Rendered centres, so separation can be judged in pixels the player sees
    // rather than in world percent, which means different things at different
    // zoom levels.
    const screen = els.map(el => {
      const r = el.getBoundingClientRect();
      return [r.x + r.width / 2, r.y + r.height / 2, r.width];
    });
    return { world, screen, onScreen, total: els.length };
  });
  await page.close();
  return data;
}
const route_ok = r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG });

// How much of the width is actually occupied. A six-column grid fills only the
// handful of bins its columns land in, however many people are in it; a scatter
// reaches nearly all of them. Counting gaps between sorted values instead would
// collapse to one band as soon as the crowd is dense, and measure nothing.
const BINS = 25;
const occupied = vals => new Set(vals.map(v => Math.min(BINS - 1, Math.floor(v / 100 * BINS)))).size;
// Widest circle you could drop on the world without touching anyone.
const worstGap = pts => {
  let worst = 0;
  for (let gx = 0; gx <= 24; gx++) for (let gy = 0; gy <= 24; gy++) {
    const x = gx / 24 * 100, y = gy / 24 * 100;
    const d = Math.min(...pts.map(q => Math.hypot(q[0] - x, q[1] - y)));
    if (d > worst) worst = d;
  }
  return worst;
};

const seen = [];
for (const age of [0, 30, 60, 89]) {
  const { world, screen, onScreen, total } = await sample(age);
  seen.push({ age, onScreen, total });

  const distinct = new Set(world.map(q => `${q[0]}/${q[1]}`)).size;
  check(`age ${age}: every figure has its own spot`, distinct === total,
    `${distinct} distinct of ${total}`);

  const b = occupied(world.map(q => q[0]));
  check(`age ${age}: no column lattice`, b >= Math.min(BINS, total) * 0.7,
    `${b} of ${BINS} width bins occupied`);

  const gap = worstGap(world);
  check(`age ${age}: no dead zones`, gap < 22, `widest empty circle ${gap.toFixed(1)}% of the board`);

  let min = Infinity;
  for (let i = 0; i < screen.length; i++) for (let j = i + 1; j < screen.length; j++)
    min = Math.min(min, Math.hypot(screen[i][0] - screen[j][0], screen[i][1] - screen[j][1]));
  const w = screen[0]?.[2] || 26;
  check(`age ${age}: nobody is buried`, min > w * 0.5,
    `closest pair ${min.toFixed(0)}px, figures ${w.toFixed(0)}px wide`);
}

// The point of the whole model: the world grows, the density does not.
const counts = seen.map(s => s.onScreen);
const lo = Math.min(...counts), hi = Math.max(...counts);
check('a screenful stays as full at 89 as at 0', hi - lo < hi * 0.45,
  seen.map(s => `${s.age}y: ${s.onScreen}/${s.total}`).join('  '));
check('the crowd grows with the world', seen[3].total > seen[0].total * 2,
  `${seen[0].total} → ${seen[3].total} figures`);

await browser.close();
process.exit(done() ? 0 : 1);
