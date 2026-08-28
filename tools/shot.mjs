// Utviklingsverktøy: startar ein statisk server og tek skjermbilete av spelet.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const out = process.argv[3] || '/tmp/shot.png';
const script = process.argv[4] || '';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mjs': 'text/javascript' };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(root, url === '/' ? 'index.html' : url);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404).end('no');
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});

await new Promise((r) => server.listen(4173, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: Number(process.env.VW||1400), height: Number(process.env.VH||950) }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text());
});
await page.goto('http://localhost:4173/' + (process.env.PAGE||''), { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
if (script) await page.evaluate(script);
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' });
console.log(errors.length ? errors.join('\n') : 'ingen feil');
await browser.close();
server.close();
process.exit(0);
