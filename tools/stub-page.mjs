// The shared stub for offline tests.
//
// The real game is served from an upstream site this repo only proxies, so the
// tests cannot load it. They instead recreate the small piece of DOM that our
// injected scripts actually read — the age lockup, the ÅR/SCORE/STREAK stats
// and a crowd board — and run the real public/*.js against it.
import { readFileSync } from 'node:fs';

export const PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// A 2x2 opaque PNG, used to fulfil intercepted image requests.
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEklEQVR4nGP8z4AATAxQxlAQAB1' +
  'IARGdaz3FAAAAAElFTkSuQmCC', 'base64');

export const CHROME =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/opt/pw-browsers/chromium';

export const script = name =>
  readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');

// `squeezed` reproduces what a phone actually shows when the upstream shell
// stops matching `.game-shell.fh-compact`: the board is left in a narrow,
// centred column with wide gutters, instead of filling the screen.
// `renamed` is the situation the live game is actually in: the upstream board
// and figures no longer carry the class names every one of our scripts keys
// off, so all of them quietly do nothing.
export function stubHtml({ age = 30, figures = 12, squeezed = false, tall = false, renamed = false } = {}) {
  const boardClass = renamed ? 'stage-area' : 'crowd-board';
  const figClass = renamed ? 'person' : 'crowd-figure';
  const kingClass = renamed ? 'person' : 'crowd-figure harald-target';
  // `tall` makes the page overflow the screen the way it does on a phone when
  // the shell never becomes a fixed-height flex column: the board keeps its own
  // height and the footer is pushed off the bottom.
  const board = tall
    ? 'position:relative;width:100%;height:1100px;background:#eee'
    : squeezed
      ? 'position:relative;width:100%;height:60vh;background:#eee'
      : 'position:relative;width:900px;height:520px;background:#eee';
  // Two ways a shell can squeeze the board. `padding` is max-width plus
  // gutters; `width` is an explicit narrow width, which a fix that only
  // relaxes max-width and padding would miss entirely.
  const shell = squeezed === 'width'
    ? '.game-shell{box-sizing:border-box;width:290px;margin:0 auto}'
    : squeezed
      ? '.game-shell{box-sizing:border-box;max-width:300px;margin:0 auto;padding:0 46px}'
      : '';
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font:14px system-ui}
    ${shell}
    .${boardClass.split(' ')[0]}{${board}}
    .${boardClass.split(' ')[0]} img{position:absolute;height:8.7%}
    .statrow{display:flex;gap:20px;padding:8px}
  </style>
  <div class="game-shell">
    <header class="masthead"><h1>Finn Harald</h1>
      <div class="age-lockup"><strong>${age}</strong><span>år</span></div></header>
    <div class="statrow">
      <div class="stat"><b>ÅR</b><span>${1937 + age}</span></div>
      <div class="stat"><b>SCORE</b><span>1200</span></div>
      <div class="stat"><b>STREAK</b><span>3</span></div>
      <div class="stat"><b>FOLK</b><span>40</span></div>
    </div>
    <div class="${boardClass}">
      <img class="${kingClass}" ${renamed ? 'alt="Kong Harald"' : ''} src="${PIXEL}" style="left:50%;top:50%">
      ${Array.from({ length: figures }, (_, i) =>
        `<img class="${figClass}" src="${PIXEL}" style="left:${8 + i * 7}%;top:${20 + (i % 4) * 18}%">`).join('')}
    </div>
    <footer class="game-footer" style="padding:8px 0;font:12px system-ui;color:#6e695e">
      <div style="display:flex;justify-content:space-between">TID 1.0 s<span>FOLK 18</span></div>
      <p style="margin:8px 0 0;font:italic 14px Georgia">Jo raskare du finn han, jo lengre lever kongen.</p>
    </footer>
  </div>`;
}

export function reporter() {
  const results = [];
  return {
    check(name, ok, detail) {
      results.push(ok);
      console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
    },
    done() {
      const passed = results.filter(Boolean).length;
      console.log(`\n${passed}/${results.length} passed`);
      return passed === results.length;
    },
  };
}
