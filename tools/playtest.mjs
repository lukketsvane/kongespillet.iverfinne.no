// Automatisk speletest: byggjer brett, klikkar på kvart mål, sjekkar at runda blir klar.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(root, url === '/' ? 'index.html' : url);
  if (!f.startsWith(root) || !fs.existsSync(f)) return res.writeHead(404).end('no');
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(4174, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()));
await page.goto('http://localhost:4174/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const results = [];
for (const level of [1, 3, 6, 9]) {
  const build = await page.evaluate((lv) => {
    const g = window.__game;
    g.startGame(4242 + lv);
    const t0 = performance.now();
    g.newLevel(lv, 777 + lv);
    const ms = performance.now() - t0;
    g.state.pop = 100;
    return {
      ms: Math.round(ms),
      slots: g.state.board.slots.length,
      people: g.state.board.slots.filter((s) => s.type === 'person').length,
      targets: g.state.board.targets.length,
    };
  }, level);

  // klikk på kvart mål via ekte museklikk
  const box = await page.locator('#board').boundingBox();
  let n = await page.evaluate(() => window.__game.state.board.targets.length);
  let clicked = 0;
  for (let i = 0; i < n; i++) {
    const pos = await page.evaluate((idx) => {
      const g = window.__game;
      const t = g.state.board.targets[idx];
      g.state.pop = 100;
      g.centerOn(t.x, t.y, 1.6);
      const v = g.state.view;
      return { sx: (t.x - v.x) * v.scale, sy: (t.y - v.y) * v.scale, item: t.item };
    }, i);
    await page.mouse.click(box.x + pos.sx, box.y + pos.sy);
    clicked++;
  }
  const after = await page.evaluate(() => {
    const g = window.__game;
    return {
      found: g.state.board.targets.filter((t) => t.found).length,
      missing: g.state.board.targets.filter((t) => !t.found).map((t) => t.item),
      phase: g.state.phase,
      score: Math.round(g.state.score),
    };
  });
  results.push({ level, ...build, clicked, ...after });
}

// vinke-mekanikken
const wave = await page.evaluate(() => {
  const g = window.__game;
  g.hideOverlay();
  g.startGame(5);
  g.state.pop = 40;
  const before = g.state.pop;
  g.doWave();
  const after1 = g.state.pop;
  g.state.levelTime += 1;
  g.doWave();
  return { before, after1: Math.round(after1 * 10) / 10, after2: Math.round(g.state.pop * 10) / 10 };
});

console.table(results);
console.log('vink:', wave);
console.log(errors.length ? errors.join('\n') : 'ingen js-feil');
await browser.close();
server.close();
process.exit(results.every((r) => r.found === r.targets) && !errors.length ? 0 : 1);
