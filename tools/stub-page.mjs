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
export function stubHtml({ age = 30, figures = 12, squeezed = false } = {}) {
  const board = squeezed
    ? 'position:relative;width:100%;height:60vh;background:#eee'
    : 'position:relative;width:900px;height:520px;background:#eee';
  const shell = squeezed
    ? '.game-shell{box-sizing:border-box;max-width:300px;margin:0 auto;padding:0 46px}'
    : '';
  return `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font:14px system-ui}
    ${shell}
    .crowd-board{${board}}
    .crowd-board img{position:absolute;height:8.7%}
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
    <div class="crowd-board">
      <img class="crowd-figure harald-target" src="${PIXEL}" style="left:50%;top:50%">
      ${Array.from({ length: figures }, (_, i) =>
        `<img class="crowd-figure" src="${PIXEL}" style="left:${8 + i * 7}%;top:${20 + (i % 4) * 18}%">`).join('')}
    </div>
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
