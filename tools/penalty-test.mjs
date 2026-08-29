// Offline check of the miss penalty in public/enhance.js.
//
// The real game lives upstream, so this stubs just the DOM that enhance.js and
// world.js read: the age lockup, the ÅR/SCORE/STREAK stats and a crowd board.
// The stub never raises SCORE, so every genuine tap must read as a miss — and
// every pan or pinch must not.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const AGE = 30; // above the age-8 threshold where world.js turns panning on
const read = f => readFileSync(new URL(`../public/${f}`, import.meta.url), 'utf8');
const FIGURE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const page_html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;font:14px system-ui}
  .crowd-board{position:relative;width:900px;height:520px;background:#eee}
  .crowd-board img{position:absolute;height:8.7%}
  .statrow{display:flex;gap:20px;padding:8px}
</style>
<div class="game-shell">
  <header class="masthead"><h1>Finn Harald</h1>
    <div class="age-lockup"><strong>${AGE}</strong><span>år</span></div></header>
  <div class="statrow">
    <div class="stat"><b>ÅR</b><span>${1937 + AGE}</span></div>
    <div class="stat"><b>SCORE</b><span>1200</span></div>
    <div class="stat"><b>STREAK</b><span>3</span></div>
    <div class="stat"><b>FOLK</b><span>40</span></div>
  </div>
  <div class="crowd-board">
    <img class="crowd-figure harald-target" src="${FIGURE}" style="left:50%;top:50%">
    ${Array.from({ length: 12 }, (_, i) =>
      `<img class="crowd-figure" src="${FIGURE}" style="left:${8 + i * 7}%;top:${20 + (i % 4) * 18}%">`).join('')}
  </div>
</div>`;

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
await page.setContent(page_html);
await page.addScriptTag({ content: read('world.js') });
await page.addScriptTag({ content: read('enhance.js') });
await page.waitForTimeout(300);

const age = () => page.$eval('.age-lockup strong', el => Number(el.textContent));
const box = await page.$eval('.crowd-board', el => {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
const at = (fx, fy) => [box.x + box.w * fx, box.y + box.h * fy];

check('panning is enabled at age ' + AGE,
  await page.$eval('.crowd-board', el => el.dataset.fhNavigable) === '1');

// A drag across the board is searching, not a wrong click.
let before = await age();
let [dx, dy] = at(0.3, 0.5);
await page.mouse.move(dx, dy);
await page.mouse.down();
for (let i = 1; i <= 8; i++) await page.mouse.move(dx + i * 20, dy + i * 4);
await page.mouse.up();
await page.waitForTimeout(900);
let after = await age();
check('drag to pan costs no years', after === before, `${before} → ${after}`);

// Two fingers pinching is zooming, not a wrong click.
before = await age();
await page.evaluate(([x, y]) => {
  const b = document.querySelector('.crowd-board');
  const ev = (t, id, cx) => b.dispatchEvent(new PointerEvent(t, {
    pointerId: id, clientX: cx, clientY: y, bubbles: true, isPrimary: id === 1 }));
  ev('pointerdown', 1, x); ev('pointerdown', 2, x + 60);
  ev('pointermove', 1, x - 30); ev('pointermove', 2, x + 90);
  ev('pointerup', 1, x - 30); ev('pointerup', 2, x + 90);
}, at(0.5, 0.5));
await page.waitForTimeout(900);
after = await age();
check('pinch to zoom costs no years', after === before, `${before} → ${after}`);

// A real tap that finds nobody is a miss, and still costs a year.
before = await age();
const [tx, ty] = at(0.5, 0.92); // low strip, clear of the figure rows
await page.mouse.move(tx, ty);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(900);
after = await age();
check('a missed tap costs one year', after === before + 1, `${before} → ${after}`);

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
