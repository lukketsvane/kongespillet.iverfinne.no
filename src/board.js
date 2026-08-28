// Brettgenerator. Kvar runde blir folkemengda trekt på nytt frå eit frø,
// og tinga frå ressurs-arka blir gøymde i han.

import { makeRng } from './rng.js';
import { makePerson, drawPerson } from './people.js';
import { drawProp } from './props.js';
import { OBJECTS, HARALDS, FOLK, drawArt, artWidth } from './assets.js';

export const WORLD_W = 1900;
export const WORLD_H = 1240;

// Sjekklista: alt kongen kan ha mist i mengda.
export const ITEMS = Object.entries(OBJECTS)
  .filter(([, o]) => !o.bonus)
  .map(([key, o]) => ({
    key,
    count: key === 'krone' ? 3 : 1,
    label: key === 'krone' ? '3 kroner' : /^[A-ZÆØÅ]/.test(o.label) ? o.label : '1 ' + o.label,
  }));

const BONUS = ['hjarte', 'hjarte', 'stjerne'];
const SMATT = ['hund', 'ballong', 'veske', 'rev', 'maake', 'tuba', 'gitar'];
const SCENERY = ['blomsterkasse', 'fontene', 'bod'];

// Kor mange ting på lista, kor tett folkemengda står, kor mange lokkedyr.
export function levelPlan(level) {
  return {
    itemCount: Math.min(ITEMS.length, 2 + level),
    rows: Math.min(21, 14 + Math.floor(level * 0.9)),
    gap: Math.max(3, 28 - level * 3.2),
    decoys: 10 + level * 4,
    folk: 6 + level * 2,
    bonus: 3,
  };
}

export function generateBoard(seed, level) {
  const rng = makeRng(seed);
  const plan = levelPlan(level);
  const chosen = rng.shuffle(ITEMS).slice(0, plan.itemCount);
  const chosenKeys = new Set(chosen.map((c) => c.key));

  const slots = [];
  const marginX = 34;
  const marginY = 54;
  const rowSpan = (WORLD_H - marginY * 2) / (plan.rows - 1);

  for (let r = 0; r < plan.rows; r++) {
    const baseY = marginY + r * rowSpan;
    const depth = r / (plan.rows - 1);
    let x = marginX + rng.range(0, 30);
    let guard = 0;
    while (x < WORLD_W - marginX && guard++ < 200) {
      const s = (0.82 + depth * 0.24) * rng.range(0.94, 1.06);
      if (rng.chance(0.009) && x < WORLD_W - 260) {
        const key = rng.pick(SCENERY);
        const w = key === 'fontene' ? 150 : key === 'bod' ? 140 : 110;
        slots.push({ type: 'scenery', key, x: x + w / 2, y: baseY + rng.range(-4, 4), s: s * 2.4, row: r });
        x += w + plan.gap;
        continue;
      }
      const person = makePerson(rng);
      const width = person.h * 0.3 * (person.stout || 1) * 1.7 * s;
      slots.push({
        type: 'person',
        person,
        x: x + width / 2,
        y: baseY + rng.range(-13, 13) + (person.kind === 'child' ? rng.range(0, 10) : 0),
        s,
        row: r,
      });
      x += width + rng.range(plan.gap * 0.35, plan.gap * 1.5);
    }
  }

  const peopleIdx = slots.map((s, i) => (s.type === 'person' ? i : -1)).filter((i) => i >= 0);
  const free = rng.shuffle(peopleIdx);
  let cursor = 0;
  const takeSlot = (pred) => {
    while (cursor < free.length) {
      const i = free[cursor++];
      if (!pred || pred(slots[i])) return i;
    }
    return free[0];
  };

  const targets = [];
  const addTarget = (item, x, y, r, kind) =>
    targets.push({ id: `${item}#${targets.length}`, item, x, y, r, kind, found: false });

  // Denne runden er det éin bestemt Harald som er gøymd.
  const haraldPool = rng.shuffle(Object.keys(HARALDS));
  const haraldKey = haraldPool[0];
  const placeHarald = (key, isTarget) => {
    const host = slots[takeSlot((s) => s.x > 150 && s.x < WORLD_W - 150 && s.y > 150 && s.y < WORLD_H - 110)];
    const h = HARALDS[key].h;
    const x = host.x + rng.range(-8, 8);
    const y = host.y + rng.range(0, 6);
    slots.push({ type: 'harald', key, x, y, h, row: host.row });
    return { x, y, h, r: Math.max(20, artWidth(key, h) * 0.55) };
  };

  const hp = placeHarald(haraldKey, true);
  const harald = { x: hp.x, y: hp.y, key: haraldKey };
  addTarget('harald', hp.x, hp.y - hp.h / 2, hp.r, 'harald');

  // Lokkekongar: alle dei andre brikkene, og nokre mørke dressar utan krone.
  const decoyHaralds = [];
  for (let i = 0; i < Math.min(haraldPool.length - 1, 3 + level); i++) {
    const key = haraldPool[1 + i];
    const d = placeHarald(key, false);
    decoyHaralds.push({ key, x: d.x, y: d.y - d.h / 2, r: d.r });
  }
  for (let i = 0; i < 3 + level; i++) {
    const d = slots[takeSlot()].person;
    d.coat = '#26262a';
    d.coatStyle = 'suit';
    d.pants = '#26262a';
    d.hair = rng.pick(['#e8e6e0', '#8f9195', '#2f2419']);
    d.sash = rng.chance(0.5) ? '#d4453a' : null;
    d.hat = rng.chance(0.35) ? 'top' : null;
    d.glasses = rng.chance(0.6);
    d.pose = rng.pick(['wave', 'stand', 'point']);
  }

  // Legg ein teikna ting ved sida av ein tilfeldig person.
  const placeArt = (key, isTarget) => {
    const host = slots[takeSlot((s) => s.x > 90 && s.x < WORLD_W - 90)];
    const o = OBJECTS[key];
    const h = o.h * rng.range(0.92, 1.08);
    const x = host.x + (rng.chance(0.5) ? -1 : 1) * rng.range(15, 27);
    const y = host.y + rng.range(-3, 7);
    slots.push({ type: 'art', key, x, y, h, row: host.row });
    if (isTarget) {
      const w = artWidth(key, h);
      addTarget(key, x, y - h / 2, Math.max(14, Math.max(w, h) * 0.55), 'art');
    }
    return { x, y, h };
  };

  for (const item of chosen) {
    for (let c = 0; c < item.count; c++) placeArt(item.key, true);
  }

  // Bonus: hjarte gir folkekjærleik, stjerne gir verdigheit.
  for (let i = 0; i < plan.bonus; i++) {
    const key = BONUS[i % BONUS.length];
    const p = placeArt(key, false);
    addTarget(key, p.x, p.y - p.h / 2, 17, 'bonus');
  }

  // Lokkedyr: dei same tinga, men ikkje på lista denne runden.
  const decoyPool = Object.keys(OBJECTS).filter((k) => !chosenKeys.has(k) && !OBJECTS[k].bonus);
  for (let i = 0; i < plan.decoys && decoyPool.length; i++) {
    placeArt(rng.pick(decoyPool), false);
  }

  // Teikna folk frå arket, strødde inn mellom dei andre.
  for (let i = 0; i < plan.folk; i++) {
    const host = slots[takeSlot()];
    if (!host) break;
    slots.push({
      type: 'folk',
      key: rng.pick(FOLK),
      x: host.x + rng.range(-10, 10),
      y: host.y + rng.range(0, 8),
      h: rng.range(46, 56),
      flip: rng.chance(0.4),
      row: host.row,
    });
  }

  // Litt smått i mengda, teikna i kode: hundar, ballongar, ein rev.
  for (let i = 0; i < 8 + level * 2; i++) {
    const host = slots[takeSlot()];
    if (!host || host.type !== 'person') continue;
    slots.push({
      type: 'prop',
      key: rng.pick(SMATT),
      x: host.x + (rng.chance(0.5) ? -1 : 1) * rng.range(14, 26),
      y: host.y + rng.range(-2, 6),
      s: rng.range(0.5, 0.72),
      row: host.row,
    });
  }

  slots.sort((a, b) => a.y - b.y);

  return { seed, level, plan, slots, targets, harald, haraldKey, decoyHaralds, items: chosen, w: WORLD_W, h: WORLD_H };
}

// Teiknar heile brettet ein gong til eit lerret utanfor skjermen.
export function renderBoard(board, dpr = 1) {
  const cv = document.createElement('canvas');
  cv.width = Math.round(WORLD_W * dpr);
  cv.height = Math.round(WORLD_H * dpr);
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const rng = makeRng(board.seed ^ 0x9e3779b9);
  for (const s of board.slots) {
    if (s.type === 'person') drawPerson(ctx, rng, s.person, s.x, s.y, s.s);
    else if (s.type === 'art' || s.type === 'harald') drawArt(ctx, s.key, s.x, s.y, s.h);
    else if (s.type === 'folk') drawArt(ctx, s.key, s.x, s.y, s.h, { flip: s.flip });
    else drawProp(ctx, rng, s.key, s.x, s.y, s.s);
  }
  return cv;
}
