// The miss penalty in public/enhance.js.
//
// The stub never raises SCORE, so every genuine tap must read as a miss — and
// panning or pinching, which is how you search once the world outgrows the
// screen, must not.
import { chromium } from 'playwright';
import { CHROME, script, stubHtml, reporter } from './stub-page.mjs';

const AGE = 30; // above the age-8 threshold where world.js turns panning on
const { check, done } = reporter();

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
await page.setContent(stubHtml({ age: AGE }));
await page.addScriptTag({ content: script('world.js') });
await page.addScriptTag({ content: script('enhance.js') });
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
const [dx, dy] = at(0.3, 0.5);
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
const [tx, ty] = at(0.5, 0.92);
await page.mouse.move(tx, ty);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(900);
after = await age();
check('a missed tap costs one year', after === before + 1, `${before} → ${after}`);

await browser.close();
process.exit(done() ? 0 : 1);
