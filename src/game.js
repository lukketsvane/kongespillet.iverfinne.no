// Kongespillet: FINN HARALD
// Du er Kong Harald og har rota deg bort i din eigen folkemengd.
// Finn deg sjølv og tinga på lista — og hugs å vinke, elles renn folkegunsten ut.

import { makeRng, randomSeed } from './rng.js';
import { generateBoard, renderBoard, WORLD_W, WORLD_H, ITEMS } from './board.js';
import { makePerson, drawPerson } from './people.js';
import { itemIcon } from './icons.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { line, shape, blob } from './draw.js';

const $ = (sel) => document.querySelector(sel);

const cv = $('#board');
const ctx = cv.getContext('2d');

const state = {
  phase: 'menu', // menu | play | clear | over
  level: 1,
  score: 0,
  best: Number(localStorage.getItem('finnharald.best') || 0),
  pop: 72,
  combo: 0,
  seed: 0,
  board: null,
  boardCanvas: null,
  levelTime: 0,
  waveEff: 1,
  waveT: -99,
  waveAnim: 0,
  flash: 0,
  hints: 3,
  ring: null,
  hazards: { press: null, durek: null, ksv: null },
  timers: { press: 8, durek: 16, ksv: 24 },
  view: { x: 0, y: 0, scale: 1, min: 0.2, max: 2.4 },
  dpr: Math.min(2, window.devicePixelRatio || 1),
};

// --------------------------------------------------------------- lerret

function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  cv.width = Math.round(r.width * state.dpr);
  cv.height = Math.round(r.height * state.dpr);
  cv.style.width = r.width + 'px';
  cv.style.height = r.height + 'px';
  const fit = Math.min(r.width / WORLD_W, r.height / WORLD_H);
  state.view.min = fit;
  state.view.max = Math.max(fit * 5, 2.6);
  if (state.view.scale < fit) state.view.scale = fit;
  clampView();
}

function cssSize() {
  return { w: cv.width / state.dpr, h: cv.height / state.dpr };
}

function clampView() {
  const { w, h } = cssSize();
  const v = state.view;
  v.scale = Math.max(v.min, Math.min(v.max, v.scale));
  const vw = w / v.scale;
  const vh = h / v.scale;
  v.x = vw >= WORLD_W ? (WORLD_W - vw) / 2 : Math.max(0, Math.min(WORLD_W - vw, v.x));
  v.y = vh >= WORLD_H ? (WORLD_H - vh) / 2 : Math.max(0, Math.min(WORLD_H - vh, v.y));
}

function toWorld(sx, sy) {
  return { x: state.view.x + sx / state.view.scale, y: state.view.y + sy / state.view.scale };
}

function zoomAt(sx, sy, factor) {
  const before = toWorld(sx, sy);
  state.view.scale *= factor;
  clampView();
  const after = toWorld(sx, sy);
  state.view.x += before.x - after.x;
  state.view.y += before.y - after.y;
  clampView();
}

function centerOn(wx, wy, scale) {
  const { w, h } = cssSize();
  if (scale) state.view.scale = scale;
  state.view.x = wx - w / state.view.scale / 2;
  state.view.y = wy - h / state.view.scale / 2;
  clampView();
}

// --------------------------------------------------------------- sprites

// Farane blir teikna éin gong til eit lite lerret og deretter berre flytta.
function sprite(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = Math.round(w * state.dpr);
  c.height = Math.round(h * state.dpr);
  const g = c.getContext('2d');
  g.scale(state.dpr, state.dpr);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  draw(g);
  return { canvas: c, w, h };
}

function personSprite(variant, seed, scale = 1) {
  const rng = makeRng(seed);
  const p = makePerson(rng, { variant });
  const w = 90;
  const h = p.h * scale + 20;
  return {
    ...sprite(w, h, (g) => drawPerson(g, makeRng(seed + 5), p, w / 2, h - 6, scale)),
    anchorX: w / 2,
    anchorY: h - 6,
  };
}

function ksvSprite(count, seed = 9000) {
  const w = count * 44 + 24;
  const h = 74;
  return sprite(w, h, (g) => {
    for (let i = 0; i < count; i++) {
      const rng = makeRng(seed + i * 131);
      drawPerson(g, rng, makePerson(rng, { variant: 'ksv' }), 22 + i * 44, h - 6 + rng.range(-3, 3), 1.25);
    }
  });
}

// --------------------------------------------------------------- runde

function newLevel(level, seed) {
  state.level = level;
  state.seed = seed ?? randomSeed();
  state.board = generateBoard(state.seed, level);
  state.boardCanvas = renderBoard(state.board, state.dpr);
  state.levelTime = 0;
  state.combo = 0;
  state.waveEff = 1;
  state.ring = null;
  state.hazards = { press: null, durek: null, ksv: null };
  state.timers = {
    press: Math.max(5, 11 - level * 0.6),
    durek: level >= 2 ? 14 : 999,
    ksv: level >= 3 ? 20 : 999,
  };
  buildChecklist();
  // På smale skjermar startar vi innzooma — heile plakaten er uleseleg på ein telefon.
  const { w: cw } = cssSize();
  state.view.scale = cw < 780 ? Math.max(state.view.min, cw / 620) : state.view.min;
  centerOn(WORLD_W / 2, WORLD_H / 2);
  updateHud();
  $('#seedTag').textContent = 'brett #' + state.seed.toString(36);
}

function startGame(seed) {
  state.phase = 'play';
  state.score = 0;
  state.pop = 72;
  state.hints = 3;
  newLevel(1, seed);
  hideOverlay();
}

// --------------------------------------------------------------- sjekkliste

function buildChecklist() {
  const wrap = $('#checklist');
  wrap.innerHTML = '';
  const counts = new Map();
  for (const t of state.board.targets) {
    if (t.item === 'harald') continue;
    counts.set(t.item, (counts.get(t.item) || 0) + 1);
  }
  const meta = new Map(ITEMS.map((i) => [i.key, i]));

  const haraldEl = chip('harald', 'Harald sjølv');
  haraldEl.classList.add('is-harald');
  wrap.appendChild(haraldEl);

  for (const [key, n] of counts) {
    wrap.appendChild(chip(key, meta.get(key).label));
  }
  updateChecklist();
}

function chip(key, label) {
  const el = document.createElement('div');
  el.className = 'chip';
  el.dataset.key = key;
  el.innerHTML = `<span class="tick" aria-hidden="true"></span><img alt="" src="${itemIcon(key)}"><span class="lbl">${label}</span><span class="cnt"></span>`;
  return el;
}

function updateChecklist() {
  if (!state.board) return;
  const byItem = new Map();
  for (const t of state.board.targets) {
    const e = byItem.get(t.item) || { n: 0, f: 0 };
    e.n++;
    if (t.found) e.f++;
    byItem.set(t.item, e);
  }
  for (const el of document.querySelectorAll('.chip')) {
    const e = byItem.get(el.dataset.key);
    if (!e) continue;
    el.classList.toggle('done', e.f >= e.n);
    el.querySelector('.cnt').textContent = e.n > 1 ? `${e.f}/${e.n}` : '';
  }
}

// --------------------------------------------------------------- hud

function updateHud() {
  $('#lvl').textContent = state.level;
  $('#score').textContent = Math.round(state.score);
  $('#best').textContent = Math.max(state.best, Math.round(state.score));
  $('#popbar').style.width = Math.max(0, Math.min(100, state.pop)) + '%';
  $('#popbar').classList.toggle('low', state.pop < 30);
  $('#hintBtn').textContent = `Hint (${state.hints})`;
  $('#hintBtn').disabled = state.hints <= 0 || state.phase !== 'play';
}

let toastT = null;
function toast(msg, kind = '') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'show ' + kind;
  clearTimeout(toastT);
  toastT = setTimeout(() => (el.className = ''), 1700);
}

function showOverlay(html) {
  const o = $('#overlay');
  o.innerHTML = html;
  o.classList.add('show');
}
function hideOverlay() {
  $('#overlay').classList.remove('show');
  $('#overlay').innerHTML = '';
}

// --------------------------------------------------------------- vinking

function doWave() {
  if (state.phase === 'clear') {
    nextLevel();
    return;
  }
  if (state.phase !== 'play') return;
  const now = state.levelTime;
  if (now - state.waveT < 0.5) return;
  state.waveT = now;
  state.waveAnim = 1;
  const gain = 13 * state.waveEff;
  state.pop = Math.min(100, state.pop + gain);
  state.waveEff = Math.max(0.12, state.waveEff * 0.55);
  sfx.wave();
  if (gain < 4) toast('Folket ser at du vinkar på autopilot.', 'bad');
  updateHud();
}

function wavedRecently(win = 1.0) {
  return state.levelTime - state.waveT < win;
}

// --------------------------------------------------------------- farar

function spawnPress() {
  const rng = makeRng(randomSeed());
  const b = state.board;
  const x = rng.range(120, WORLD_W - 120);
  const y = rng.range(140, WORLD_H - 80);
  state.hazards.press = { x, y, t: 0, warn: Math.max(1.1, 2.4 - state.level * 0.1), fired: false, spr: personSprite('presse', rng.int(1, 1e6), 1.15) };
  sfx.warn();
  toast('PRESSA KJEM! Vink!', 'warn');
}

function resolvePress() {
  const good = wavedRecently(1.1);
  state.flash = 1;
  sfx.flash();
  if (good) {
    state.pop = Math.min(100, state.pop + 16);
    state.score += 220;
    toast('«Kongen i storform» — godt vinka!', 'good');
  } else {
    state.pop -= 15;
    state.combo = 0;
    toast('«Sur konge på torget». Au.', 'bad');
  }
  updateHud();
}

function spawnDurek() {
  const rng = makeRng(randomSeed());
  state.hazards.durek = {
    x: rng.range(200, WORLD_W - 200),
    y: rng.range(200, WORLD_H - 120),
    vx: rng.range(-16, 16),
    vy: rng.range(-8, 8),
    t: 0,
    life: 15,
    spr: personSprite('durek', rng.int(1, 1e6), 1.2),
  };
  sfx.durek();
  toast('Sjaman Durek held seanse. Sikta blir tåkete.', 'warn');
}

function spawnKsv() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const spr = ksvSprite(11 + Math.floor(Math.random() * 4), (Math.random() * 1e6) | 0);
  state.hazards.ksv = {
    y: 160 + Math.random() * (WORLD_H - 320),
    x: dir > 0 ? -spr.w : WORLD_W,
    dir,
    speed: 150 + state.level * 12,
    spr,
  };
  toast('KSV sperrar av. Ingen ser noko no.', 'warn');
}

// --------------------------------------------------------------- treff

function hitTest(wx, wy) {
  const hz = state.hazards;
  if (hz.durek) {
    const d = hz.durek;
    if (Math.hypot(wx - d.x, wy - d.y - 28) < 34) return { type: 'durek' };
  }
  if (hz.press && hz.press.fired === false) {
    const p = hz.press;
    if (Math.hypot(wx - p.x, wy - p.y - 26) < 30) return { type: 'press' };
  }
  if (hz.ksv) {
    const k = hz.ksv;
    if (wy > k.y - k.spr.h && wy < k.y + 10 && wx > k.x && wx < k.x + k.spr.w) return { type: 'blocked' };
  }
  let best = null;
  let bestD = Infinity;
  for (const t of state.board.targets) {
    if (t.found) continue;
    const d = Math.hypot(wx - t.x, wy - t.y);
    if (d < t.r && d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best ? { type: 'target', target: best } : { type: 'miss' };
}

function tap(sx, sy) {
  if (state.phase !== 'play') return;
  const { x, y } = toWorld(sx, sy);
  const hit = hitTest(x, y);

  if (hit.type === 'durek') {
    state.hazards.durek = null;
    state.score += 260;
    state.pop = Math.min(100, state.pop + 5);
    sfx.found();
    toast('Du takka nei til krystallen. +260', 'good');
    updateHud();
    return;
  }
  if (hit.type === 'press') {
    state.hazards.press = null;
    state.score += 120;
    sfx.found();
    toast('Livvakta tok linsa. +120', 'good');
    updateHud();
    return;
  }
  if (hit.type === 'blocked') {
    toast('KSV: «ingenting å sjå her».', 'bad');
    sfx.miss();
    return;
  }
  if (hit.type === 'target') {
    const t = hit.target;
    t.found = true;
    state.combo = Math.min(5, state.combo + 1);
    const pts = (t.item === 'harald' ? 500 : 130) * state.combo;
    state.score += pts;
    state.pop = Math.min(100, state.pop + (t.item === 'harald' ? 12 : 6));
    sfx.found();
    toast(t.item === 'harald' ? `DER ER HAN! +${pts}` : `Funne! +${pts} (x${state.combo})`, 'good');
    updateChecklist();
    updateHud();
    if (state.board.targets.every((q) => q.found)) levelClear();
    return;
  }

  state.combo = 0;
  state.pop -= 2.5;
  sfx.miss();
  state.ring = { x, y, t: 0, bad: true };
  updateHud();
}

function useHint() {
  if (state.hints <= 0 || state.phase !== 'play') return;
  const left = state.board.targets.filter((t) => !t.found);
  if (!left.length) return;
  const t = left[Math.floor(Math.random() * left.length)];
  state.hints--;
  state.pop -= 8;
  state.ring = { x: t.x, y: t.y, t: 0, bad: false, big: true };
  centerOn(t.x, t.y, Math.max(state.view.scale, state.view.min * 2));
  toast('Hoffet peikar i rett retning.', '');
  updateHud();
}

// --------------------------------------------------------------- rundeslutt

function levelClear() {
  state.phase = 'clear';
  const timeBonus = Math.max(0, Math.round(600 - state.levelTime * 6));
  const popBonus = Math.round(state.pop * 8);
  state.score += timeBonus + popBonus;
  sfx.win();
  saveBest();
  showOverlay(`
    <div class="card">
      <h2>Nivå ${state.level} klart</h2>
      <p class="lead">Alt funne på ${state.levelTime.toFixed(1)} s.</p>
      <ul class="tally">
        <li><span>Tidsbonus</span><b>+${timeBonus}</b></li>
        <li><span>Folkegunst</span><b>+${popBonus}</b></li>
        <li><span>Sum</span><b>${Math.round(state.score)}</b></li>
      </ul>
      <p class="lead">Og no: <b>vink til folket</b>.</p>
      <button class="btn big" id="nextBtn">👋 VINK OG GÅ VIDARE</button>
      <p class="fine">(eller trykk mellomrom)</p>
    </div>`);
  $('#nextBtn').onclick = () => nextLevel();
  updateHud();
}

function nextLevel() {
  hideOverlay();
  state.phase = 'play';
  state.pop = Math.min(100, state.pop + 10);
  newLevel(state.level + 1);
}

function gameOver() {
  state.phase = 'over';
  sfx.lose();
  saveBest();
  showOverlay(`
    <div class="card">
      <h2>Folket har snudd</h2>
      <p class="lead">Du vinka for lite, og pressa fekk siste ordet.</p>
      <ul class="tally">
        <li><span>Nivå</span><b>${state.level}</b></li>
        <li><span>Poeng</span><b>${Math.round(state.score)}</b></li>
        <li><span>Beste</span><b>${state.best}</b></li>
      </ul>
      <button class="btn big" id="againBtn">Prøv på nytt</button>
    </div>`);
  $('#againBtn').onclick = () => startGame();
}

function saveBest() {
  if (state.score > state.best) {
    state.best = Math.round(state.score);
    localStorage.setItem('finnharald.best', String(state.best));
  }
}

// --------------------------------------------------------------- oppdatering

function update(dt) {
  if (state.phase !== 'play') {
    state.waveAnim = Math.max(0, state.waveAnim - dt * 1.6);
    state.flash = Math.max(0, state.flash - dt * 3);
    return;
  }
  state.levelTime += dt;
  state.waveAnim = Math.max(0, state.waveAnim - dt * 1.6);
  state.flash = Math.max(0, state.flash - dt * 3);
  state.waveEff = Math.min(1, state.waveEff + dt * 0.14);
  if (state.ring) {
    state.ring.t += dt;
    if (state.ring.t > (state.ring.big ? 2.6 : 0.5)) state.ring = null;
  }

  // folkegunsten renn alltid litt ut
  let drain = 1.35 + state.level * 0.22;
  const hz = state.hazards;

  if (hz.press) {
    hz.press.t += dt;
    if (!hz.press.fired && hz.press.t > hz.press.warn) {
      hz.press.fired = true;
      resolvePress();
    }
    if (hz.press.t > hz.press.warn + 1.2) hz.press = state.hazards.press = null;
  } else {
    state.timers.press -= dt;
    if (state.timers.press <= 0) {
      spawnPress();
      state.timers.press = Math.max(6, 13 - state.level * 0.7) + Math.random() * 4;
    }
  }

  if (hz.durek) {
    const d = hz.durek;
    d.t += dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x < 120 || d.x > WORLD_W - 120) d.vx *= -1;
    if (d.y < 160 || d.y > WORLD_H - 80) d.vy *= -1;
    drain += 1.0;
    if (d.t > d.life) state.hazards.durek = null;
  } else {
    state.timers.durek -= dt;
    if (state.timers.durek <= 0) {
      spawnDurek();
      state.timers.durek = 22 + Math.random() * 10;
    }
  }

  if (hz.ksv) {
    hz.ksv.x += hz.ksv.dir * hz.ksv.speed * dt;
    if (hz.ksv.dir > 0 ? hz.ksv.x > WORLD_W : hz.ksv.x + hz.ksv.spr.w < 0) state.hazards.ksv = null;
  } else {
    state.timers.ksv -= dt;
    if (state.timers.ksv <= 0) {
      spawnKsv();
      state.timers.ksv = 26 + Math.random() * 12;
    }
  }

  state.pop -= drain * dt;
  if (state.pop <= 0) {
    state.pop = 0;
    gameOver();
  }
  updateHud();
}

// --------------------------------------------------------------- teikning

function draw() {
  const { w, h } = cssSize();
  const v = state.view;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, w, h);

  if (!state.board) return;

  ctx.save();
  ctx.scale(v.scale, v.scale);
  ctx.translate(-v.x, -v.y);

  // brettet
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(state.boardCanvas, 0, 0, WORLD_W, WORLD_H);

  // funne ting får ein blekkring
  ctx.lineWidth = 2.4 / v.scale;
  for (const t of state.board.targets) {
    if (!t.found) continue;
    ctx.strokeStyle = t.item === 'harald' ? '#d4453a' : '#2f7a3f';
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.ring) {
    const r = state.ring;
    const k = r.big ? 1 - r.t / 2.6 : 1 - r.t / 0.5;
    ctx.strokeStyle = r.bad ? 'rgba(200,60,50,' + k + ')' : 'rgba(40,90,190,' + k + ')';
    ctx.lineWidth = 3 / v.scale;
    ctx.beginPath();
    ctx.arc(r.x, r.y, (r.big ? 90 : 34) * (r.big ? 1 - k * 0.5 : 1 + (1 - k)), 0, Math.PI * 2);
    ctx.stroke();
  }

  const hz = state.hazards;

  // KSV-sperringa
  if (hz.ksv) {
    const k = hz.ksv;
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(k.x, k.y - k.spr.h + 8, k.spr.w, k.spr.h);
    ctx.restore();
    ctx.drawImage(k.spr.canvas, k.x, k.y - k.spr.h, k.spr.w, k.spr.h);
  }

  // sjaman Durek + tåke
  if (hz.durek) {
    const d = hz.durek;
    const rad = 60 + Math.min(1, d.t / 6) * 190;
    const g = ctx.createRadialGradient(d.x, d.y - 20, rad * 0.15, d.x, d.y - 20, rad);
    g.addColorStop(0, 'rgba(150,90,210,0.78)');
    g.addColorStop(0.55, 'rgba(150,90,210,0.42)');
    g.addColorStop(1, 'rgba(150,90,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y - 20, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(d.spr.canvas, d.x - d.spr.anchorX, d.y - d.spr.anchorY, d.spr.w, d.spr.h);
  }

  // pressefotograf
  if (hz.press) {
    const p = hz.press;
    ctx.drawImage(p.spr.canvas, p.x - p.spr.anchorX, p.y - p.spr.anchorY, p.spr.w, p.spr.h);
    if (!p.fired) {
      const k = 1 - (p.t % 0.6) / 0.6;
      ctx.strokeStyle = `rgba(212,69,58,${0.25 + k * 0.6})`;
      ctx.lineWidth = 3 / v.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 26, 26 + (1 - k) * 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();

  // blits frå kamera
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.75})`;
    ctx.fillRect(0, 0, w, h);
  }

  drawWaveHand(w, h);
  drawMinimap(w, h);
}

// Din eigen kongelege hand nede i hjørnet.
function drawWaveHand(w, h) {
  const a = state.waveAnim;
  if (a < 0.02) return;
  const swing = Math.sin(state.levelTime * 22) * 0.35 * a;
  ctx.save();
  ctx.translate(w - 168, h + 62 - 54 * Math.min(1, a * 2));
  ctx.rotate(-0.12 + swing);
  ctx.scale(1.5, 1.5);
  ctx.lineJoin = 'round';
  const rng = makeRng(4242);
  // erme
  shape(ctx, rng, [[-22, 0], [22, 0], [16, -62], [-16, -62]], { fill: '#26262a', lw: 1.4, jitter: 0.3 });
  shape(ctx, rng, [[-17, -58], [17, -58], [16, -68], [-16, -68]], { fill: '#fbf7ec', lw: 1.1, jitter: 0.25 });
  // hand
  blob(ctx, rng, 0, -86, 20, { fill: '#f0cca6', lw: 1.4, jitter: 0.4 });
  for (let i = 0; i < 4; i++) {
    const fx = -12 + i * 8;
    shape(ctx, rng, [[fx - 3.5, -96], [fx + 3.5, -96], [fx + 3.5, -112 + (i === 3 ? 5 : 0)], [fx - 3.5, -112 + (i === 3 ? 5 : 0)]], {
      fill: '#f0cca6', lw: 1.2, jitter: 0.3,
    });
  }
  shape(ctx, rng, [[16, -84], [26, -92], [30, -84], [20, -76]], { fill: '#f0cca6', lw: 1.2, jitter: 0.3 });
  if (a > 0.05) {
    ctx.globalAlpha = a;
    line(ctx, rng, [[-34, -104], [-44, -114]], { lw: 2 });
    line(ctx, rng, [[-30, -92], [-42, -96]], { lw: 2 });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Lite oversiktskart så du ikkje går deg bort i mengda.
function drawMinimap(w, h) {
  if (!state.board) return;
  // unødvendig når heile brettet alt er synleg
  if (state.view.scale <= state.view.min * 1.02) return;
  const mw = 116;
  const mh = (mw * WORLD_H) / WORLD_W;
  const x = 12;
  const y = h - mh - 12;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fffdf8';
  ctx.strokeStyle = 'rgba(30,28,24,0.45)';
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, mw, mh);
  ctx.strokeRect(x, y, mw, mh);
  ctx.globalAlpha = 0.5;
  ctx.drawImage(state.boardCanvas, x, y, mw, mh);
  ctx.globalAlpha = 1;
  const v = state.view;
  const { w: cw, h: ch } = cssSize();
  ctx.strokeStyle = '#d4453a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(
    x + (v.x / WORLD_W) * mw,
    y + (v.y / WORLD_H) * mh,
    ((cw / v.scale) / WORLD_W) * mw,
    ((ch / v.scale) / WORLD_H) * mh
  );
  ctx.restore();
}

// --------------------------------------------------------------- input

let ptrs = new Map();
let dragged = false;
let last = null;
let pinchDist = 0;

cv.addEventListener('pointerdown', (e) => {
  cv.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  dragged = false;
  last = { x: e.offsetX, y: e.offsetY };
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
  }
});

cv.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinchDist) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinchDist);
    pinchDist = d;
    dragged = true;
    return;
  }
  if (!last) return;
  const dx = e.offsetX - last.x;
  const dy = e.offsetY - last.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
  if (dragged) {
    state.view.x -= dx / state.view.scale;
    state.view.y -= dy / state.view.scale;
    clampView();
  }
  last = { x: e.offsetX, y: e.offsetY };
});

function endPointer(e) {
  if (ptrs.size === 1 && !dragged) tap(e.offsetX, e.offsetY);
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinchDist = 0;
  last = null;
}
cv.addEventListener('pointerup', endPointer);
cv.addEventListener('pointercancel', (e) => {
  ptrs.delete(e.pointerId);
  last = null;
});

cv.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomAt(e.offsetX, e.offsetY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    doWave();
  } else if (e.key === '+' || e.key === '=') {
    const { w, h } = cssSize();
    zoomAt(w / 2, h / 2, 1.2);
  } else if (e.key === '-') {
    const { w, h } = cssSize();
    zoomAt(w / 2, h / 2, 1 / 1.2);
  } else if (e.key === 'h') {
    useHint();
  } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault();
    const step = 90 / state.view.scale;
    if (e.key === 'ArrowLeft') state.view.x -= step;
    if (e.key === 'ArrowRight') state.view.x += step;
    if (e.key === 'ArrowUp') state.view.y -= step;
    if (e.key === 'ArrowDown') state.view.y += step;
    clampView();
  }
});

$('#waveBtn').addEventListener('click', doWave);
$('#hintBtn').addEventListener('click', useHint);
$('#zoomIn').addEventListener('click', () => {
  const { w, h } = cssSize();
  zoomAt(w / 2, h / 2, 1.35);
});
$('#zoomOut').addEventListener('click', () => {
  const { w, h } = cssSize();
  zoomAt(w / 2, h / 2, 1 / 1.35);
});
$('#muteBtn').addEventListener('click', () => {
  setMuted(!isMuted());
  $('#muteBtn').textContent = isMuted() ? '🔇' : '🔊';
});
$('#newBtn').addEventListener('click', () => {
  if (confirm('Byrje heilt på nytt?')) startGame();
});

window.addEventListener('resize', () => {
  resize();
});

// --------------------------------------------------------------- oppstart

function menu() {
  state.phase = 'menu';
  showOverlay(`
    <div class="card">
      <h2>Finn Harald!</h2>
      <p class="lead">Du er kongen. Du har rota deg bort i din eigen folkemengd,
      og no må du finne både deg sjølv og alt på lista.</p>
      <ul class="rules">
        <li><b>Klikk</b> på tinga på lista. Dra for å flytte deg, rull for å zoome.</li>
        <li><b>Vink</b> med <kbd>mellomrom</kbd> eller knappen. Folkegunsten renn ut heile tida.</li>
        <li><b>Pressa</b> ropar før dei knipsar — vink akkurat då.</li>
        <li><b>Sjaman Durek</b> tåkelegg torget. Klikk han vekk.</li>
        <li><b>KSV</b> sperrar av. Vent, eller leit ein annan stad.</li>
      </ul>
      <button class="btn big" id="playBtn">Start</button>
      <p class="fine">Nytt brett kvar gong. Beste: ${state.best}</p>
    </div>`);
  $('#playBtn').onclick = () => {
    const url = new URL(location.href);
    const s = url.searchParams.get('seed');
    startGame(s ? parseInt(s, 36) >>> 0 : undefined);
  };
}

let prev = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - prev) / 1000);
  prev = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

resize();
newLevel(1, randomSeed());
menu();
requestAnimationFrame(loop);

// hjelp til utviklingsverktøy/skjermbilete
window.__game = { state, startGame, newLevel, centerOn, hideOverlay, doWave, spawnPress, spawnDurek, spawnKsv };
