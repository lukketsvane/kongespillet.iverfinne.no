// Brettgenerator. Kvar runde blir folkemengda trekt på nytt frå eit frø,
// og tinga på lista blir gøymde i han.

import { makeRng } from './rng.js';
import { makePerson, drawPerson } from './people.js';
import { drawProp, PROP_HIT } from './props.js';

export const WORLD_W = 1900;
export const WORLD_H = 1240;

// Lista nedst på plakaten.
export const ITEMS = [
  { key: 'krone', count: 3, label: '3 kroner', icon: 'krone', kind: 'person' },
  { key: 'baat', count: 1, label: '1 liten båt', icon: 'baat', kind: 'prop' },
  { key: 'flagg', count: 1, label: '1 flagg', icon: 'flagg', kind: 'prop' },
  { key: 'rev', count: 1, label: 'rev', icon: 'rev', kind: 'prop' },
  { key: 'sonja', count: 1, label: '1 Sonja', icon: 'sonja', kind: 'person' },
  { key: 'stokk', count: 1, label: '1 stokk', icon: 'stokk', kind: 'prop' },
  { key: 'stovel', count: 1, label: '1 gummistøvel', icon: 'stovel', kind: 'prop' },
  { key: 'sira', count: 1, label: '1 Sira', icon: 'sira', kind: 'prop' },
  { key: 'stovlar', count: 1, label: '2 gummistøvlar', icon: 'stovlar', kind: 'prop' },
  { key: 'mikrofon', count: 1, label: '1 mikrofon', icon: 'mikrofon', kind: 'prop' },
  { key: 'note', count: 1, label: '1 musikknote', icon: 'note', kind: 'prop' },
  { key: 'macarena', count: 1, label: '1 macarena', icon: 'macarena', kind: 'person' },
];

const DECOY_PROPS = ['hund', 'ballong', 'is', 'veske', 'paraply', 'maake', 'tuba', 'gitar', 'sko', 'blaabaat', 'danskflagg', 'gklave'];
const SCENERY = ['blomsterkasse', 'fontene', 'bod'];

// Kor mange ting på lista i dette nivået, og kor tett folkemengda står.
export function levelPlan(level) {
  const n = Math.min(ITEMS.length, 2 + level);
  return {
    itemCount: n,
    rows: Math.min(21, 14 + Math.floor(level * 0.9)),
    gap: Math.max(3, 28 - level * 3.2),
    decoys: 12 + level * 7,
    haralds: 1,
  };
}

export function generateBoard(seed, level) {
  const rng = makeRng(seed);
  const plan = levelPlan(level);
  const chosen = rng.shuffle(ITEMS).slice(0, plan.itemCount);

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
      if (rng.chance(0.022) && x < WORLD_W - 260) {
        const key = rng.pick(SCENERY);
        const w = key === 'fontene' ? 150 : key === 'bod' ? 140 : 110;
        slots.push({ type: 'scenery', key, x: x + w / 2, y: baseY + rng.range(-4, 4), s: s * 2.8, row: r });
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
  const addTarget = (item, x, y, r) => targets.push({ id: `${item}#${targets.length}`, item, x, y, r, found: false });

  // Harald sjølv: aldri heilt ute i kanten.
  const hi = takeSlot((s) => s.x > 180 && s.x < WORLD_W - 180 && s.y > 160 && s.y < WORLD_H - 120);
  slots[hi].person = makePerson(rng, { variant: 'harald' });
  slots[hi].s = 1.0;
  slots[hi].harald = true;
  const harald = { x: slots[hi].x, y: slots[hi].y };
  addTarget('harald', harald.x, harald.y - 26, 26);

  // Lokkedyr: fleire mørke dressar med skjerf/orden, men utan krone.
  const decoyKings = 3 + level;
  for (let i = 0; i < decoyKings; i++) {
    const di = takeSlot();
    const d = slots[di].person;
    d.coat = '#26262a';
    d.coatStyle = 'suit';
    d.pants = '#26262a';
    d.hair = rng.pick(['#e8e6e0', '#8f9195', '#2f2419']);
    d.sash = rng.chance(0.5) ? '#d4453a' : null;
    d.hat = rng.chance(0.35) ? 'top' : null;
    d.glasses = rng.chance(0.6);
    d.pose = rng.pick(['wave', 'stand', 'point']);
  }

  for (const item of chosen) {
    for (let c = 0; c < item.count; c++) {
      if (item.kind === 'person') {
        const i = takeSlot((s) => s.x > 90 && s.x < WORLD_W - 90);
        if (item.key === 'krone') {
          slots[i].person.hat = 'crown';
          slots[i].person.hatColor = '#f5cf2e';
        } else {
          slots[i].person = makePerson(rng, { variant: item.key });
        }
        slots[i].isTarget = item.key;
        const yTop = slots[i].y - slots[i].person.h * slots[i].s;
        addTarget(item.key, slots[i].x, item.key === 'krone' ? yTop - 4 : yTop + slots[i].person.h * slots[i].s * 0.5,
          item.key === 'krone' ? 15 : 24);
      } else {
        const i = takeSlot((s) => s.x > 80 && s.x < WORLD_W - 80);
        const host = slots[i];
        const side = rng.chance(0.5) ? -1 : 1;
        const px = host.x + side * rng.range(16, 26);
        const py = host.y + rng.range(-2, 6);
        const ps = item.key === 'sira' ? 0.85 : rng.range(0.6, 0.8);
        slots.push({ type: 'prop', key: item.key, x: px, y: py, s: ps, row: host.row, target: item.key });
        addTarget(item.key, px, py - 10 * ps, (PROP_HIT[item.key] || 15) * ps + 6);
      }
    }
  }

  // Lokkedyr-rekvisittar
  const chosenKeys = new Set(chosen.map((c) => c.key));
  for (let i = 0; i < plan.decoys; i++) {
    const idx = takeSlot();
    const host = slots[idx];
    if (!host || host.type !== 'person') continue;
    let key = rng.pick(DECOY_PROPS);
    // ikkje legg ut noko som er identisk med eit mål
    if (chosenKeys.has(key)) key = rng.pick(['hund', 'ballong', 'is', 'veske', 'paraply']);
    slots.push({
      type: 'prop', key,
      x: host.x + (rng.chance(0.5) ? -1 : 1) * rng.range(14, 26),
      y: host.y + rng.range(-2, 6),
      s: rng.range(0.55, 0.8),
      row: host.row,
    });
  }

  slots.sort((a, b) => a.y - b.y);

  return {
    seed, level, plan, slots, targets, harald,
    items: chosen,
    w: WORLD_W, h: WORLD_H,
  };
}

// Teiknar heile brettet ein gong til eit offscreen-lerret.
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
    else drawProp(ctx, rng, s.key, s.x, s.y, s.s);
  }
  return cv;
}
