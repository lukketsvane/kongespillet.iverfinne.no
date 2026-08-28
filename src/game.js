// Kong Harald — vink eller gå under.
// Du er kongen, bortkomen i di eiga folkemengd. Finn tinga dine, hald
// folkekjærleiken og verdigheita oppe, og hugs å vinke når pressa knipsar.

import { makeRng, randomSeed } from './rng.js';
import { generateBoard, renderBoard, WORLD_W, WORLD_H, ITEMS } from './board.js';
import { itemIcon } from './icons.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { loadAssets, drawArt, artUrl, artWidth, IMG } from './assets.js';

const $ = (sel) => document.querySelector(sel);

const cv = $('#board');
const ctx = cv.getContext('2d');

const START_LIVES = 3;

const state = {
  phase: 'lasting', // lasting | menu | play | pause | clear | over
  level: 1,
  score: 0,
  best: Number(localStorage.getItem('kongespelet.best') || 0),
  folk: 72,
  verd: 88,
  lives: START_LIVES,
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
  hazards: { press: null, sjaman: null, vakt: null, storm: null },
  timers: { press: 8, sjaman: 16, vakt: 24, storm: 20 },
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
  state.hazards = { press: null, sjaman: null, vakt: null, storm: null };
  state.timers = {
    press: Math.max(5, 11 - level * 0.6),
    sjaman: level >= 2 ? 15 : 999,
    vakt: level >= 3 ? 22 : 999,
    storm: level >= 2 ? 26 : 999,
  };
  hideStorm();
  buildChecklist();
  const { w: cw } = cssSize();
  state.view.scale = cw < 780 ? Math.max(state.view.min, cw / 620) : state.view.min;
  centerOn(WORLD_W / 2, WORLD_H / 2);
  updateHud();
  $('#seedTag').textContent = 'brett #' + state.seed.toString(36);
}

function startGame(seed) {
  state.phase = 'play';
  state.score = 0;
  state.folk = 72;
  state.verd = 88;
  state.lives = START_LIVES;
  state.hints = 3;
  newLevel(1, seed);
  hideOverlay();
}

// --------------------------------------------------------------- sjekkliste

function iconFor(key) {
  return key === 'harald' ? itemIcon('harald') : artUrl(key);
}

function buildChecklist() {
  const wrap = $('#checklist');
  wrap.innerHTML = '';
  const counts = new Map();
  for (const t of state.board.targets) {
    if (t.item === 'harald' || t.kind === 'bonus') continue;
    counts.set(t.item, (counts.get(t.item) || 0) + 1);
  }
  const meta = new Map(ITEMS.map((i) => [i.key, i]));

  const h = chip('harald', 'Harald sjølv');
  h.classList.add('is-harald');
  wrap.appendChild(h);
  for (const [key] of counts) wrap.appendChild(chip(key, meta.get(key).label));
  updateChecklist();
}

function chip(key, label) {
  const el = document.createElement('div');
  el.className = 'chip';
  el.dataset.key = key;
  el.innerHTML = `<span class="tick" aria-hidden="true"></span><img alt="" src="${iconFor(key)}"><span class="lbl">${label}</span><span class="cnt"></span>`;
  return el;
}

function updateChecklist() {
  if (!state.board) return;
  const byItem = new Map();
  for (const t of state.board.targets) {
    if (t.kind === 'bonus') continue;
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
  $('#folkbar').style.width = Math.max(0, Math.min(100, state.folk)) + '%';
  $('#verdbar').style.width = Math.max(0, Math.min(100, state.verd)) + '%';
  $('#folkbar').classList.toggle('low', state.folk < 30);
  $('#verdbar').classList.toggle('low', state.verd < 30);
  $('#hintBtn').textContent = `Hint (${state.hints})`;
  $('#hintBtn').disabled = state.hints <= 0 || state.phase !== 'play';

  const lives = $('#lives');
  if (lives.childElementCount !== START_LIVES) {
    lives.innerHTML = '';
    for (let i = 0; i < START_LIVES; i++) lives.appendChild(document.createElement('img'));
  }
  [...lives.children].forEach((el, i) => {
    const want = artUrl(i < state.lives ? 'liv-full' : 'liv-tom');
    if (el.getAttribute('src') !== want) el.src = want;
    el.alt = '';
  });
}

let toastT = null;
function toast(msg, kind = '', face = null) {
  const el = $('#toast');
  el.innerHTML = (face ? `<img src="${artUrl(face)}" alt="">` : '') + `<span>${msg}</span>`;
  el.className = 'show ' + kind;
  clearTimeout(toastT);
  toastT = setTimeout(() => (el.className = ''), 1900);
}

let eventT = null;
function eventPanel(kind, text, art) {
  const el = $('#event');
  el.innerHTML =
    `<img class="bg" src="${artUrl(kind === 'ok' ? 'panel-ok' : 'panel-feil')}" alt="">` +
    `<span>${text}</span>` +
    (art ? `<img class="art" src="${artUrl(art)}" alt="">` : '');
  el.className = 'show ' + kind;
  clearTimeout(eventT);
  eventT = setTimeout(() => (el.className = ''), 2300);
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
  if (state.phase === 'clear') return nextLevel();
  if (state.phase !== 'play') return;
  const now = state.levelTime;
  if (now - state.waveT < 0.45) return;
  state.waveT = now;
  state.waveAnim = 1;
  const eff = state.waveEff;
  state.folk = Math.min(100, state.folk + 13 * eff);
  state.waveEff = Math.max(0.12, eff * 0.55);
  sfx.wave();
  if (eff < 0.34) {
    state.verd = Math.max(0, state.verd - 5);
    toast('Han vinkar litt for ivrig no.', 'bad', 'skeptikar');
  }
  updateHud();
}

function wavedRecently(win = 1.2) {
  return state.levelTime - state.waveT < win;
}

// --------------------------------------------------------------- farar

function spawnPress() {
  const rng = makeRng(randomSeed());
  state.hazards.press = {
    x: rng.range(140, WORLD_W - 140),
    y: rng.range(150, WORLD_H - 80),
    t: 0,
    warn: Math.max(1.2, 2.5 - state.level * 0.1),
    fired: false,
    art: rng.chance(0.5) ? 'paparazzi' : 'journalist',
    h: 68,
  };
  sfx.warn();
  eventPanel('feil', 'PRESSA KJEM — VINK!', 'utropsteikn');
}

function resolvePress() {
  state.flash = 1;
  sfx.flash();
  if (wavedRecently()) {
    state.folk = Math.min(100, state.folk + 16);
    state.verd = Math.min(100, state.verd + 6);
    state.score += 220;
    eventPanel('ok', '«Kongen i storform»', 'avisframside');
  } else {
    state.folk -= 14;
    state.verd -= 10;
    state.combo = 0;
    eventPanel('feil', '«Sur konge på torget»', 'sladrespalte');
  }
  updateHud();
}

function spawnSjaman() {
  const rng = makeRng(randomSeed());
  state.hazards.sjaman = {
    x: rng.range(220, WORLD_W - 220),
    y: rng.range(220, WORLD_H - 120),
    vx: rng.range(-16, 16),
    vy: rng.range(-8, 8),
    t: 0,
    life: 15,
    h: 74,
  };
  sfx.durek();
  toast('Sjamanen held seanse. Sikta blir tåkete.', 'warn', 'tankeboble');
}

function spawnVakt() {
  const dir = Math.random() < 0.5 ? 1 : -1;
  const n = 9 + Math.floor(Math.random() * 4);
  const w = n * 40 + 24;
  state.hazards.vakt = {
    n, w, h: 80,
    y: 170 + Math.random() * (WORLD_H - 330),
    x: dir > 0 ? -w : WORLD_W,
    dir,
    speed: 140 + state.level * 12,
  };
  toast('Vaktene sperrar av. Ingen ser noko no.', 'warn');
}

const STORMS = [
  { art: 'some-storm', text: 'Kommentarfeltet kokar.' },
  { art: 'kommentarfelt', text: 'Nokon har sterke meiningar om deg.' },
  { art: 'skandalesky', text: 'Skandalesky over Slottsplassen.' },
  { art: 'regnstorm', text: 'Regn over heile seremonien.' },
  { art: 'kongehusbrak', text: 'Bråk i kongehuset.' },
];

function spawnStorm() {
  const s = STORMS[Math.floor(Math.random() * STORMS.length)];
  state.hazards.storm = { ...s, t: 0 };
  const el = $('#storm');
  el.hidden = false;
  el.className = 'show';
  el.innerHTML = `<img src="${artUrl(s.art)}" alt=""><span>${s.text}</span><b>klikk vekk</b>`;
  sfx.warn();
}

function hideStorm() {
  state.hazards.storm = null;
  const el = $('#storm');
  el.className = '';
  el.hidden = true;
}

$('#storm').addEventListener('click', () => {
  if (!state.hazards.storm) return;
  state.score += 140;
  state.verd = Math.min(100, state.verd + 6);
  sfx.found();
  toast('Du lét stormen gå over. +140', 'good', 'tommel-opp');
  hideStorm();
  updateHud();
});

// --------------------------------------------------------------- treff

function hitTest(wx, wy) {
  const hz = state.hazards;
  if (hz.sjaman && Math.hypot(wx - hz.sjaman.x, wy - hz.sjaman.y - 34) < 40) return { type: 'sjaman' };
  if (hz.press && !hz.press.fired && Math.hypot(wx - hz.press.x, wy - hz.press.y - 32) < 36) return { type: 'press' };
  if (hz.vakt) {
    const k = hz.vakt;
    if (wy > k.y - k.h && wy < k.y + 8 && wx > k.x && wx < k.x + k.w) return { type: 'blocked' };
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

  if (hit.type === 'sjaman') {
    state.hazards.sjaman = null;
    state.score += 260;
    state.verd = Math.min(100, state.verd + 8);
    sfx.found();
    toast('Du takka nei til krystallen. +260', 'good', 'tommel-opp');
    return updateHud();
  }
  if (hit.type === 'press') {
    state.hazards.press = null;
    state.score += 120;
    sfx.found();
    toast('Livvakta tok linsa. +120', 'good', 'smilefjes');
    return updateHud();
  }
  if (hit.type === 'blocked') {
    toast('«Ingenting å sjå her.»', 'bad');
    return sfx.miss();
  }
  if (hit.type === 'target') {
    const t = hit.target;
    t.found = true;
    sfx.found();
    if (t.kind === 'bonus') {
      if (t.item === 'hjarte') {
        state.folk = Math.min(100, state.folk + 18);
        toast('Eit hjarte frå folket.', 'good', 'hjarte-lite');
      } else {
        state.verd = Math.min(100, state.verd + 20);
        toast('Ei stjerne på brystet.', 'good', 'stjerne');
      }
      state.score += 90;
      return updateHud();
    }
    state.combo = Math.min(5, state.combo + 1);
    const pts = (t.item === 'harald' ? 500 : 130) * state.combo;
    state.score += pts;
    state.folk = Math.min(100, state.folk + (t.item === 'harald' ? 12 : 5));
    state.verd = Math.min(100, state.verd + 3);
    toast(t.item === 'harald' ? `DER ER HAN! +${pts}` : `Funne! +${pts} (x${state.combo})`, 'good', 'applaus');
    updateChecklist();
    updateHud();
    if (state.board.targets.every((q) => q.found || q.kind === 'bonus')) levelClear();
    return;
  }

  state.combo = 0;
  state.folk -= 2;
  state.verd -= 3;
  sfx.miss();
  state.ring = { x, y, t: 0, bad: true };
  updateHud();
}

function useHint() {
  if (state.hints <= 0 || state.phase !== 'play') return;
  const left = state.board.targets.filter((t) => !t.found && t.kind !== 'bonus');
  if (!left.length) return;
  const t = left[Math.floor(Math.random() * left.length)];
  state.hints--;
  state.verd -= 6;
  state.ring = { x: t.x, y: t.y, t: 0, bad: false, big: true };
  centerOn(t.x, t.y, Math.max(state.view.scale, state.view.min * 2));
  toast('Hoffet peikar i rett retning.', '', 'radgivar');
  updateHud();
}

// --------------------------------------------------------------- liv og slutt

function loseLife(why) {
  state.lives--;
  state.combo = 0;
  sfx.lose();
  if (state.lives <= 0) return gameOver(why);
  state.folk = 58;
  state.verd = 72;
  state.hazards = { press: null, sjaman: null, vakt: null, storm: null };
  hideStorm();
  eventPanel('feil', why + ' Eitt liv borte.', 'radgivar');
  updateHud();
}

function levelClear() {
  state.phase = 'clear';
  const timeBonus = Math.max(0, Math.round(600 - state.levelTime * 6));
  const meterBonus = Math.round((state.folk + state.verd) * 4);
  state.score += timeBonus + meterBonus;
  sfx.win();
  saveBest();
  showOverlay(`
    <div class="card">
      <img class="hurra" src="${artUrl('hurra')}" alt="">
      <h2>Nivå ${state.level} klart</h2>
      <p class="lead">Alt funne på ${state.levelTime.toFixed(1)} s.</p>
      <ul class="tally">
        <li><span>Tidsbonus</span><b>+${timeBonus}</b></li>
        <li><span>Folk og verdigheit</span><b>+${meterBonus}</b></li>
        <li><span>Sum</span><b>${Math.round(state.score)}</b></li>
      </ul>
      <p class="lead">Og no: <b>vink til folket</b>.</p>
      <button class="btn big" id="nextBtn">👋 VINK OG GÅ VIDARE</button>
      <p class="fine">(eller trykk mellomrom)</p>
      <img class="cheer" src="${artUrl('folkemengd')}" alt="">
    </div>`);
  $('#nextBtn').onclick = () => nextLevel();
  updateHud();
}

function nextLevel() {
  hideOverlay();
  state.phase = 'play';
  state.folk = Math.min(100, state.folk + 10);
  state.verd = Math.min(100, state.verd + 8);
  newLevel(state.level + 1);
}

function gameOver(why) {
  state.phase = 'over';
  saveBest();
  showOverlay(`
    <div class="card">
      <img class="hero" src="${artUrl('sladrespalte')}" alt="">
      <h2>Gått under</h2>
      <p class="lead">${why}</p>
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
    localStorage.setItem('kongespelet.best', String(state.best));
  }
}

// --------------------------------------------------------------- oppdatering

function update(dt) {
  state.waveAnim = Math.max(0, state.waveAnim - dt * 1.6);
  state.flash = Math.max(0, state.flash - dt * 3);
  if (state.phase !== 'play') return;

  state.levelTime += dt;
  state.waveEff = Math.min(1, state.waveEff + dt * 0.14);
  if (state.ring) {
    state.ring.t += dt;
    if (state.ring.t > (state.ring.big ? 2.6 : 0.5)) state.ring = null;
  }

  let folkDrain = 1.3 + state.level * 0.2;
  let verdDrain = 0.35;
  const hz = state.hazards;

  if (hz.press) {
    hz.press.t += dt;
    if (!hz.press.fired && hz.press.t > hz.press.warn) {
      hz.press.fired = true;
      resolvePress();
    }
    if (hz.press.t > hz.press.warn + 1.2) state.hazards.press = null;
  } else if ((state.timers.press -= dt) <= 0) {
    spawnPress();
    state.timers.press = Math.max(6, 13 - state.level * 0.7) + Math.random() * 4;
  }

  if (hz.sjaman) {
    const d = hz.sjaman;
    d.t += dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x < 140 || d.x > WORLD_W - 140) d.vx *= -1;
    if (d.y < 180 || d.y > WORLD_H - 80) d.vy *= -1;
    verdDrain += 1.2;
    if (d.t > d.life) state.hazards.sjaman = null;
  } else if ((state.timers.sjaman -= dt) <= 0) {
    spawnSjaman();
    state.timers.sjaman = 22 + Math.random() * 10;
  }

  if (hz.vakt) {
    hz.vakt.x += hz.vakt.dir * hz.vakt.speed * dt;
    if (hz.vakt.dir > 0 ? hz.vakt.x > WORLD_W : hz.vakt.x + hz.vakt.w < 0) state.hazards.vakt = null;
  } else if ((state.timers.vakt -= dt) <= 0) {
    spawnVakt();
    state.timers.vakt = 26 + Math.random() * 12;
  }

  if (hz.storm) {
    hz.storm.t += dt;
    verdDrain += 1.5;
    folkDrain += 0.4;
  } else if ((state.timers.storm -= dt) <= 0) {
    spawnStorm();
    state.timers.storm = 24 + Math.random() * 14;
  }

  state.folk -= folkDrain * dt;
  state.verd -= verdDrain * dt;

  if (state.folk <= 0) {
    state.folk = 0;
    loseLife('Folket snudde ryggen til.');
  } else if (state.verd <= 0) {
    state.verd = 0;
    loseLife('Verdigheita rakna.');
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
  ctx.drawImage(state.boardCanvas, 0, 0, WORLD_W, WORLD_H);

  ctx.lineWidth = 2.4 / v.scale;
  for (const t of state.board.targets) {
    if (!t.found || t.kind === 'bonus') continue;
    ctx.strokeStyle = t.item === 'harald' ? '#d4453a' : '#2f7a3f';
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.ring) {
    const r = state.ring;
    const k = r.big ? 1 - r.t / 2.6 : 1 - r.t / 0.5;
    ctx.strokeStyle = r.bad ? `rgba(200,60,50,${k})` : `rgba(40,90,190,${k})`;
    ctx.lineWidth = 3 / v.scale;
    ctx.beginPath();
    ctx.arc(r.x, r.y, (r.big ? 90 : 34) * (r.big ? 1 - k * 0.5 : 1 + (1 - k)), 0, Math.PI * 2);
    ctx.stroke();
  }

  const hz = state.hazards;

  if (hz.vakt) {
    const k = hz.vakt;
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(k.x, k.y - k.h + 12, k.w, k.h);
    ctx.restore();
    for (let i = 0; i < k.n; i++) drawArt(ctx, 'vakt', k.x + 26 + i * 40, k.y, k.h);
  }

  if (hz.sjaman) {
    const d = hz.sjaman;
    const rad = 70 + Math.min(1, d.t / 6) * 190;
    const g = ctx.createRadialGradient(d.x, d.y - 30, rad * 0.15, d.x, d.y - 30, rad);
    g.addColorStop(0, 'rgba(150,90,210,0.72)');
    g.addColorStop(0.55, 'rgba(150,90,210,0.4)');
    g.addColorStop(1, 'rgba(150,90,210,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(d.x, d.y - 30, rad, 0, Math.PI * 2);
    ctx.fill();
    drawArt(ctx, 'sjaman', d.x, d.y, d.h);
  }

  if (hz.press) {
    const p = hz.press;
    drawArt(ctx, p.art, p.x, p.y, p.h);
    if (!p.fired) {
      const k = 1 - (p.t % 0.6) / 0.6;
      ctx.strokeStyle = `rgba(212,69,58,${0.25 + k * 0.6})`;
      ctx.lineWidth = 3 / v.scale;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 32, 34 + (1 - k) * 24, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();

  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${state.flash * 0.75})`;
    ctx.fillRect(0, 0, w, h);
  }

  drawWaveHand(w, h);
  drawMinimap(w, h);
}

// Di eiga kongelege hand, nede i hjørnet.
function drawWaveHand(w, h) {
  const a = state.waveAnim;
  if (a < 0.02 || !IMG.vinkehand) return;
  const hh = Math.min(280, h * 0.44);
  const ww = artWidth('vinkehand', hh);
  ctx.save();
  ctx.translate(w - ww * 0.5 - 128, h + hh * 0.2 - hh * 0.28 * Math.min(1, a * 2));
  ctx.rotate(Math.sin(state.levelTime * 22) * 0.16 * a);
  ctx.drawImage(IMG.vinkehand, -ww / 2, -hh, ww, hh);
  ctx.restore();
}

function drawMinimap(w, h) {
  if (!state.board || state.view.scale <= state.view.min * 1.02) return;
  const mw = 116;
  const mh = (mw * WORLD_H) / WORLD_W;
  const x = 12;
  const y = h - mh - 12;
  ctx.save();
  ctx.globalAlpha = 0.92;
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
  ctx.strokeRect(x + (v.x / WORLD_W) * mw, y + (v.y / WORLD_H) * mh, ((cw / v.scale) / WORLD_W) * mw, ((ch / v.scale) / WORLD_H) * mh);
  ctx.restore();
}

// --------------------------------------------------------------- input

const ptrs = new Map();
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

cv.addEventListener('pointerup', (e) => {
  if (ptrs.size === 1 && !dragged) tap(e.offsetX, e.offsetY);
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) pinchDist = 0;
  last = null;
});
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
  } else if (e.key === 'p' || e.key === 'Escape') {
    togglePause();
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

function togglePause() {
  if (state.phase === 'play') {
    state.phase = 'pause';
    showOverlay(`<div class="card"><h2>Pause</h2><p class="lead">Folket ventar.</p>
      <button class="btn big" id="resumeBtn">Hald fram</button></div>`);
    $('#resumeBtn').onclick = togglePause;
  } else if (state.phase === 'pause') {
    state.phase = 'play';
    hideOverlay();
  }
}

$('#waveBtn').addEventListener('click', doWave);
$('#hintBtn').addEventListener('click', useHint);
$('#pauseBtn').addEventListener('click', togglePause);
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
  $('#muteBtn').firstElementChild.src = artUrl(isMuted() ? 'lyd-av' : 'lyd-pa');
});
$('#newBtn').addEventListener('click', () => {
  if (confirm('Byrje heilt på nytt?')) startGame();
});
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(() => resize()).observe(cv.parentElement);

// --------------------------------------------------------------- oppstart

function menu() {
  state.phase = 'menu';
  showOverlay(`
    <div class="card menu">
      <img class="hero" src="${artUrl('hero-banner')}" alt="Kong Harald">
      <p class="lead">Du er kongen. Du har rota deg bort i di eiga folkemengd,
      og no må du finne både deg sjølv og alt du har mist.</p>
      <ul class="rules">
        <li><b>Klikk</b> på tinga på lista. Dra for å flytte deg, rull for å zoome.</li>
        <li><b>Vink</b> med <kbd>mellomrom</kbd>. Folkekjærleiken renn ut heile tida —
        men vinkar du i eitt sett, ryk <b>verdigheita</b>.</li>
        <li><b>Pressa</b> ropar før dei knipsar. Vink akkurat då.</li>
        <li><b>Sjamanen</b> tåkelegg torget, <b>vaktene</b> sperrar av, og
        kommentarfeltet kokar. Klikk deg ut av det.</li>
        <li><b>Hjarte</b> gir folkekjærleik, <b>stjerner</b> gir verdigheit.</li>
      </ul>
      <button class="btn start" id="playBtn"><img src="${artUrl('startknapp')}" alt="Start"></button>
      <p class="fine">Nytt brett kvar gong. Beste: ${state.best}</p>
    </div>`);
  $('#playBtn').onclick = () => {
    const s = new URL(location.href).searchParams.get('seed');
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
showOverlay(`<div class="card"><img class="spin" src="${artUrl('lasting')}" alt=""><p class="lead">Lastar folkemengda…</p></div>`);
loadAssets().then(() => {
  newLevel(1, randomSeed());
  menu();
  requestAnimationFrame(loop);
});

// krokar for utviklingsverktøy
window.__game = { state, startGame, newLevel, centerOn, hideOverlay, doWave, spawnPress, spawnSjaman, spawnVakt, spawnStorm };
