// Smått og staffasje i folkemengda: hundar, ballongar, fontener, bodar.
// Tinga du skal finne kjem frå dei teikna ressurs-arka; dette er berre liv
// rundt dei, teikna med same blekk-penn som folka.

import { shape, line, blob, dot, circlePts, arcPts, rectPts } from './draw.js';

const P = {};

// --- smått i mengda -----------------------------------------------------






P.rev = (ctx, rng, u) => {
  const c = '#e07a2f';
  // hale
  shape(ctx, rng, [
    [-u * 0.7, -u * 0.35], [-u * 1.25, -u * 0.72], [-u * 1.42, -u * 0.42], [-u * 0.95, -u * 0.14],
  ], { fill: c, lw: 0.9, jitter: 0.3 });
  blob(ctx, rng, -u * 1.32, -u * 0.6, u * 0.16, { fill: '#fbf7ec', lw: 0.8, jitter: 0.25 });
  // kropp
  shape(ctx, rng, [
    [-u * 0.8, -u * 0.3], [-u * 0.2, -u * 0.52], [u * 0.5, -u * 0.46], [u * 0.62, -u * 0.16],
    [-u * 0.1, -u * 0.1], [-u * 0.75, -u * 0.08],
  ], { fill: c, lw: 0.95, jitter: 0.3 });
  // bein
  for (const bx of [-u * 0.6, -u * 0.2, u * 0.25, u * 0.5]) {
    line(ctx, rng, [[bx, -u * 0.14], [bx + u * 0.02, 0]], { lw: 1.5 });
  }
  // hovud
  shape(ctx, rng, [
    [u * 0.42, -u * 0.62], [u * 0.72, -u * 0.86], [u * 0.78, -u * 0.6],
    [u * 1.02, -u * 0.86], [u * 1.02, -u * 0.56], [u * 1.15, -u * 0.42],
    [u * 0.8, -u * 0.3], [u * 0.45, -u * 0.36],
  ], { fill: c, lw: 0.95, jitter: 0.28 });
  dot(ctx, u * 1.12, -u * 0.44, u * 0.07);
  dot(ctx, u * 0.86, -u * 0.56, u * 0.06);
};

P.hund = (ctx, rng, u) => {
  const c = rng.pick(['#8a5a34', '#c9a86a', '#3f3a35', '#e6e2d8']);
  shape(ctx, rng, [
    [-u * 0.75, -u * 0.34], [-u * 0.1, -u * 0.48], [u * 0.5, -u * 0.44], [u * 0.6, -u * 0.16], [-u * 0.7, -u * 0.1],
  ], { fill: c, lw: 0.95, jitter: 0.3 });
  for (const bx of [-u * 0.55, -u * 0.2, u * 0.2, u * 0.45]) line(ctx, rng, [[bx, -u * 0.12], [bx, 0]], { lw: 1.5 });
  line(ctx, rng, [[-u * 0.72, -u * 0.36], [-u * 0.95, -u * 0.62]], { lw: 1.4 });
  blob(ctx, rng, u * 0.68, -u * 0.62, u * 0.22, { fill: c, lw: 0.9, jitter: 0.25 });
  shape(ctx, rng, [[u * 0.58, -u * 0.78], [u * 0.52, -u * 0.5], [u * 0.72, -u * 0.6]], { fill: c, lw: 0.8, jitter: 0.2, sharp: true });
  dot(ctx, u * 0.78, -u * 0.62, u * 0.05);
};









// --- staffasje og lokkedyr ---------------------------------------------

P.ballong = (ctx, rng, u) => {
  const cols = ['#d4453a', '#3a6ea5', '#f2c53d'];
  for (let i = 0; i < 3; i++) {
    const bx = (i - 1) * u * 0.42;
    const by = -u * 1.5 - (i % 2) * u * 0.2;
    line(ctx, rng, [[0, 0], [bx, by + u * 0.3]], { lw: 0.6, jitter: 0.3 });
    blob(ctx, rng, bx, by, u * 0.32, { fill: cols[i], lw: 0.9, jitter: 0.25, squash: 1.15 });
  }
};


P.veske = (ctx, rng, u) => {
  shape(ctx, rng, rectPts(-u * 0.35, -u * 0.55, u * 0.7, u * 0.55), { fill: rng.pick(['#8a5a34', '#2f2f31', '#d4453a']), lw: 0.9, jitter: 0.25 });
  line(ctx, rng, arcPts(0, -u * 0.55, u * 0.24, Math.PI, Math.PI * 2, 6), { lw: 0.9 });
};


P.blomsterkasse = (ctx, rng, u) => {
  const w = u * 2.2;
  shape(ctx, rng, [[-w * 0.5, -u * 0.55], [w * 0.5, -u * 0.55], [w * 0.44, 0], [-w * 0.44, 0]], {
    fill: '#c9a86a', lw: 1.0, jitter: 0.35,
  });
  ctx.save();
  ctx.strokeStyle = '#8a5a34';
  ctx.lineWidth = 0.6;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.5 + (w * i) / 5, -u * 0.55);
    ctx.lineTo(-w * 0.44 + (w * 0.88 * i) / 5, 0);
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 9; i++) {
    const fx = -w * 0.4 + (w * 0.8 * i) / 8;
    line(ctx, rng, [[fx, -u * 0.55], [fx + rng.range(-2, 2), -u * 1.0]], { ink: '#4f7a43', lw: 0.8 });
    dot(ctx, fx, -u * 1.05, u * 0.16, rng.pick(['#d4453a', '#f2c53d', '#e79ab4', '#fbf7ec']));
  }
};

P.fontene = (ctx, rng, u) => {
  const w = u * 3.2;
  // kar
  shape(ctx, rng, [
    [-w * 0.5, -u * 0.15], [w * 0.5, -u * 0.15], [w * 0.42, u * 0.5], [-w * 0.42, u * 0.5],
  ], { fill: '#f2efe6', lw: 1.2, jitter: 0.4 });
  shape(ctx, rng, circlePts(0, -u * 0.15, w * 0.5, 20, 0.22), { fill: '#cfe4f2', lw: 1.1, jitter: 0.35 });
  shape(ctx, rng, circlePts(0, -u * 0.15, w * 0.42, 18, 0.2), { fill: '#a9d2ea', ink: null });
  // søyle og øvre skål
  shape(ctx, rng, [[-u * 0.16, -u * 0.25], [u * 0.16, -u * 0.25], [u * 0.12, -u * 0.95], [-u * 0.12, -u * 0.95]], {
    fill: '#f2efe6', lw: 1.0, jitter: 0.3,
  });
  shape(ctx, rng, circlePts(0, -u * 1.0, u * 0.55, 14, 0.3), { fill: '#e8e3d6', lw: 1.0, jitter: 0.3 });
  // stråler
  for (let i = -2; i <= 2; i++) {
    if (!i) continue;
    line(ctx, rng, [
      [0, -u * 1.15], [i * u * 0.42, -u * 1.85 + Math.abs(i) * u * 0.18], [i * u * 0.9, -u * 0.35],
    ], { ink: '#5b9dd9', lw: 1.1, jitter: 0.35 });
  }
  line(ctx, rng, [[0, -u * 1.1], [0, -u * 2.15]], { ink: '#5b9dd9', lw: 1.3, jitter: 0.35 });
  for (let i = 0; i < 5; i++) {
    dot(ctx, rng.range(-w * 0.4, w * 0.4), -u * rng.range(1.4, 2.1), u * 0.07, '#7fc0e8');
  }
};

P.bod = (ctx, rng, u) => {
  const w = u * 3.0;
  // stolpar
  line(ctx, rng, [[-w * 0.45, -u * 2.3], [-w * 0.45, 0]], { lw: 1.4 });
  line(ctx, rng, [[w * 0.45, -u * 2.3], [w * 0.45, 0]], { lw: 1.4 });
  // disk
  shape(ctx, rng, rectPts(-w * 0.5, -u * 1.05, w, u * 0.22), { fill: '#e6dcc6', lw: 1.1, jitter: 0.3 });
  shape(ctx, rng, rectPts(-w * 0.45, -u * 0.83, w * 0.9, u * 0.83), { fill: '#cfd6db', lw: 1.0, jitter: 0.35 });
  ctx.save();
  ctx.strokeStyle = '#9aa3ab';
  ctx.lineWidth = 0.7;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.45 + (w * 0.9 * i) / 5, -u * 0.83);
    ctx.lineTo(-w * 0.45 + (w * 0.9 * i) / 5, 0);
    ctx.stroke();
  }
  ctx.restore();
  // varer på disken
  for (let i = 0; i < 6; i++) {
    const gx = -w * 0.36 + i * w * 0.145;
    if (rng.chance(0.5)) blob(ctx, rng, gx, -u * 1.2, u * 0.17, { fill: rng.pick(['#f2c53d', '#e2604a', '#6aa84f']), lw: 0.8, jitter: 0.25 });
    else shape(ctx, rng, rectPts(gx - u * 0.16, -u * 1.4, u * 0.32, u * 0.35), { fill: rng.pick(['#efe3c8', '#e79ab4']), lw: 0.8, jitter: 0.25 });
  }
  // markise
  for (let i = 0; i < 7; i++) {
    shape(ctx, rng, [
      [-w * 0.52 + (w * 1.04 * i) / 7, -u * 2.35],
      [-w * 0.52 + (w * 1.04 * (i + 1)) / 7, -u * 2.35],
      [-w * 0.52 + (w * 1.04 * (i + 1)) / 7, -u * 1.85],
      [-w * 0.52 + (w * 1.04 * i) / 7, -u * 1.85],
    ], { fill: i % 2 ? '#d4453a' : '#fbf7ec', lw: 0.85, jitter: 0.25, sharp: true });
  }
  line(ctx, rng, [[-w * 0.52, -u * 2.38], [w * 0.52, -u * 2.38]], { lw: 1.1 });
};

P.maake = (ctx, rng, u) => {
  shape(ctx, rng, [[-u * 0.5, -u * 0.3], [u * 0.1, -u * 0.55], [u * 0.5, -u * 0.36], [u * 0.1, -u * 0.16]], {
    fill: '#fbf7ec', lw: 0.9, jitter: 0.25,
  });
  blob(ctx, rng, u * 0.52, -u * 0.62, u * 0.18, { fill: '#fbf7ec', lw: 0.85, jitter: 0.2 });
  dot(ctx, u * 0.58, -u * 0.64, u * 0.05);
  line(ctx, rng, [[u * 0.66, -u * 0.6], [u * 0.82, -u * 0.56]], { ink: '#e8a33d', lw: 1.1 });
  line(ctx, rng, [[-u * 0.1, -u * 0.16], [-u * 0.05, 0]], { lw: 1.0 });
};

P.tuba = (ctx, rng, u) => {
  shape(ctx, rng, circlePts(0, -u * 0.7, u * 0.55, 14), { fill: '#e8c168', lw: 1.0, jitter: 0.3 });
  shape(ctx, rng, circlePts(0, -u * 0.7, u * 0.26, 12), { fill: '#c9a34a', lw: 0.8, jitter: 0.25 });
};

P.gitar = (ctx, rng, u) => {
  shape(ctx, rng, circlePts(0, -u * 0.2, u * 0.42, 14, 1.15), { fill: '#c9a86a', lw: 0.95, jitter: 0.3 });
  shape(ctx, rng, circlePts(u * 0.02, -u * 0.75, u * 0.3, 12, 1.1), { fill: '#c9a86a', lw: 0.9, jitter: 0.28 });
  line(ctx, rng, [[u * 0.02, -u * 1.0], [u * 0.05, -u * 1.6]], { lw: 1.4 });
  dot(ctx, 0, -u * 0.25, u * 0.13, '#5a4225');
};

export const PROP_KEYS = Object.keys(P);

export function drawProp(ctx, rng, key, x, y, s = 1) {
  const fn = P[key];
  if (!fn) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  fn(ctx, rng, 14 * s);
  ctx.restore();
}

