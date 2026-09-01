// The clock in public/enhance.js.
//
// The score is gone: the score was the age, and the number upstream computed
// said nothing a player could recognise. What sits in its place is a clock —
// and a clock that does not move is worse than the number it replaced.
//
// It stood still for the whole game. menu.js leaves a hidden `.fh-modal`
// sentinel behind when React wipes its overlay, and `gameActive()` treated any
// element with that class as a pause. So neither the clock nor the ageing —
// "han eldst medan du leitar", the game's own subtitle — ever ran.
import { chromium } from 'playwright';
import { CHROME, script, stubHtml, reporter } from './stub-page.mjs';

const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
await page.setContent(stubHtml({ age: 30 }));
await page.addScriptTag({ content: script('world.js') });
await page.addScriptTag({ content: script('enhance.js') });
await page.waitForTimeout(300);

const cell = () => page.evaluate(() => {
  const label = [...document.querySelectorAll('*')]
    .find(el => !el.children.length && /^(SCORE|KLOKKA)$/.test(el.textContent.trim()));
  if (!label) return null;
  const value = [...label.parentElement.children].find(el => el !== label);
  return { label: label.textContent.trim(), value: value?.textContent.trim() };
});

check('the score cell is a clock', (await cell())?.label === 'KLOKKA', JSON.stringify(await cell()));

// A hidden sentinel is not a pause. A visible sheet is.
await page.evaluate(() => {
  const s = document.createElement('i');
  s.className = 'fh-modal fh-menu-pause-sentinel';
  s.hidden = true;
  document.body.appendChild(s);
});

// The clock only starts once the player touches the board, so touch it.
const board = await page.$eval('.crowd-board', el => {
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await page.mouse.click(board.x, board.y);
await page.waitForTimeout(2400);
const running = await cell();
check('the clock runs past a hidden pause sentinel', running.value !== '0:00', `reads ${running.value}`);

const before = running.value;
await page.evaluate(() => {
  const m = document.createElement('div');
  m.className = 'fh-modal';
  m.style.cssText = 'position:fixed;inset:0;background:#fff';
  document.body.appendChild(m);
});
await page.waitForTimeout(1600);
check('and stops while a real sheet is open', (await cell()).value === before,
  `${before} → ${(await cell()).value}`);

await browser.close();
process.exit(done() ? 0 : 1);
