// Finding the crowd when the class names change.
//
// Every crowd script keys off `.crowd-board`. When upstream stopped using that
// name, all of them did nothing at all — silently. The menu and the age clock
// key off `.masthead` and kept working, so the page looked healthy while the
// board was entirely ours-untouched: upstream's grid, upstream's head count,
// upstream's sprites. board.js finds the board by structure instead.
import { chromium } from 'playwright';
import { CHROME, script, stubHtml, reporter } from './stub-page.mjs';

const { check, done } = reporter();
const browser = await chromium.launch({ executablePath: CHROME });

async function open({ renamed, withBoardJs = true }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.setContent(stubHtml({ age: 30, renamed, figures: 17 }));
  if (withBoardJs) await page.addScriptTag({ content: script('board.js') });
  await page.addScriptTag({ content: script('world.js') });
  await page.addScriptTag({ content: script('ios.js') });
  await page.waitForTimeout(700);
  return page;
}
const state = page => page.evaluate(() => ({
  mode: document.documentElement.dataset.fhBoard || '-',
  board: !!document.querySelector('.crowd-board'),
  king: !!document.querySelector('img.harald-target'),
  laidOut: [...document.querySelectorAll('img')].filter(el => el.dataset.fhSlot !== undefined).length,
  width: Math.round(document.querySelector('.crowd-board')?.getBoundingClientRect().width || 0),
  vw: innerWidth,
}));

// Without board.js this is exactly the live failure: nothing happens.
let page = await open({ renamed: true, withBoardJs: false });
let s = await state(page);
check('renamed classes leave every crowd script inert', !s.board && s.laidOut === 0,
  `board found: ${s.board}, figures laid out: ${s.laidOut}`);
await page.close();

page = await open({ renamed: true });
s = await state(page);
check('the board is found by structure', s.board && s.mode === 'adopted', `mode ${s.mode}`);
check('the king is identified', s.king);
check('the crowd is laid out', s.laidOut > 100, `${s.laidOut} figures`);
check('the board fills the screen once found', s.width >= s.vw - 14,
  `${s.width}px of ${s.vw}px`);
await page.close();

// When upstream does use the names, nothing is adopted and nothing changes.
page = await open({ renamed: false });
s = await state(page);
check('native class names are left alone', s.mode === 'native', `mode ${s.mode}`);
check('and the crowd is still laid out', s.laidOut > 100, `${s.laidOut} figures`);
await page.close();

// A board we cannot read the king from must not have its images swapped, or
// the round becomes unwinnable.
page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.setContent(stubHtml({ age: 30, renamed: true, figures: 17 })
  .replace(' alt="Kong Harald"', ''));
await page.addScriptTag({ content: script('board.js') });
await page.waitForTimeout(500);
const noKing = await page.evaluate(() => ({
  mode: document.documentElement.dataset.fhBoard,
  swappable: document.querySelectorAll('.crowd-board img.crowd-figure').length,
  laidOutClass: document.querySelectorAll('.crowd-board img.fh-figure').length,
}));
check('an unidentifiable king blocks image swapping', noKing.swappable === 0,
  `mode ${noKing.mode}, ${noKing.swappable} swappable, ${noKing.laidOutClass} positionable`);
await page.close();

await browser.close();
process.exit(done() ? 0 : 1);
