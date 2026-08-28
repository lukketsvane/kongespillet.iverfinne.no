// Små ikon til sjekklista — same teikningar som i folkemengda, berre i miniatyr.

import { makeRng } from './rng.js';
import { drawProp } from './props.js';
import { makePerson, drawPerson } from './people.js';

const cache = new Map();

export function itemIcon(key, size = 44, dpr = 2) {
  const ck = `${key}@${size}`;
  if (cache.has(ck)) return cache.get(ck);

  const cv = document.createElement('canvas');
  cv.width = size * dpr;
  cv.height = size * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const rng = makeRng(1234 + key.length * 977);

  if (key === 'sonja' || key === 'macarena' || key === 'harald') {
    const p = makePerson(makeRng(7), { variant: key });
    const s = (size * 0.86) / p.h;
    ctx.save();
    ctx.globalAlpha = 1;
    drawPerson(ctx, rng, p, size / 2, size * 0.94, s);
    ctx.restore();
  } else if (key === 'krone') {
    drawProp(ctx, rng, 'krone', size / 2, size * 0.7, size / 26);
  } else {
    const box = { sira: 0.34, flagg: 0.3, mikrofon: 0.3, rev: 0.3, stovlar: 0.34, note: 0.33, stokk: 0.3, baat: 0.36, stovel: 0.4 };
    const s = (size * (box[key] || 0.34)) / 14;
    const yBase = key === 'sira' ? size * 0.66 : key === 'flagg' || key === 'mikrofon' || key === 'stokk' || key === 'note' ? size * 0.92 : size * 0.78;
    drawProp(ctx, rng, key, size / 2 - (key === 'rev' ? size * 0.06 : 0), yBase, s);
  }

  const url = cv.toDataURL();
  cache.set(ck, url);
  return url;
}
