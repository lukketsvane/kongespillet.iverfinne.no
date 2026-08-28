// Folk. Kvar figur er ein liten spesifikasjon som blir teikna med blekk-primitiva.
// Ingen bilete blir lasta ned: heile folkemengda er generert i kode.

import { INK, SKIN, HAIR, CLOTH, PANTS, shape, line, blob, dot, arcPts, groundShadow } from './draw.js';

const HAIRSTYLES = ['short', 'short', 'short', 'bob', 'long', 'bun', 'ponytail', 'spiky', 'bald', 'curly'];
const HAT_W = [[null, 58], ['cap', 12], ['brim', 8], ['beanie', 9], ['bucket', 4], ['top', 3], ['party', 3], ['helmet', 3]];
const POSES = ['stand', 'stand', 'stand', 'walk', 'walk', 'wave', 'point', 'pocket', 'both'];

export function makePerson(rng, opts = {}) {
  const kind = opts.kind || rng.weighted([['adult', 76], ['child', 16], ['elder', 8]]);
  const h = kind === 'child' ? rng.range(21, 28) : kind === 'elder' ? rng.range(33, 39) : rng.range(36, 45);
  const p = {
    kind,
    h,
    skin: rng.pick(SKIN),
    hair: kind === 'elder' ? rng.pick(['#8f9195', '#e8e6e0', '#c9c6bd']) : rng.pick(HAIR),
    hairStyle: rng.pick(HAIRSTYLES),
    coat: rng.pick(CLOTH),
    coatStyle: rng.weighted([['jacket', 46], ['sweater', 22], ['coat', 14], ['dress', 12], ['suit', 6]]),
    pants: rng.pick(PANTS),
    shoes: rng.pick(['#2b2b2d', '#3a3a3c', '#6b4a2a', '#8a8f96']),
    hat: rng.weighted(HAT_W),
    glasses: rng.chance(0.16),
    beard: kind === 'adult' && rng.chance(0.12),
    scarf: rng.chance(0.1) ? rng.pick(CLOTH) : null,
    sash: rng.chance(0.02) ? rng.pick(['#d4453a', '#3a6ea5', '#6aa84f']) : null,
    pose: rng.pick(POSES),
    flip: rng.chance(0.5),
    stout: rng.range(0.9, 1.12),
    prop: opts.prop || null,
    tilt: rng.range(-0.05, 0.05),
  };
  if (kind === 'child') {
    p.hat = rng.chance(0.3) ? rng.pick(['cap', 'beanie', 'party', 'bucket']) : null;
    p.coatStyle = rng.weighted([['jacket', 60], ['sweater', 30], ['dress', 10]]);
    p.glasses = rng.chance(0.06);
  }

  return p;
}

function limb(ctx, rng, a, b, w, color, ink = INK) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (w / 2);
  const ny = (dx / len) * (w / 2);
  shape(
    ctx,
    rng,
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    { fill: color, ink, lw: 0.9, jitter: 0.35 }
  );
}

function handAt(ctx, rng, x, y, r, skin) {
  blob(ctx, rng, x, y, r, { fill: skin, lw: 0.85, jitter: 0.3, n: 8 });
}

// Kvar peikar hendene, gitt positur.
function armTargets(p, m) {
  const { bw, shoulderY, hipY, headCy, headR, h } = m;
  const sx = bw * 0.46;
  const down = [
    [-sx - bw * 0.18, hipY + h * 0.10],
    [sx + bw * 0.18, hipY + h * 0.10],
  ];
  switch (p.pose) {
    case 'wave':
      return [down[0], [sx + bw * 0.62, headCy - headR * 0.55]];
    case 'both':
    case 'macarena':
      return [
        [-sx - bw * 0.75, headCy - headR * 0.35],
        [sx + bw * 0.75, headCy - headR * 0.35],
      ];
    case 'point':
      return [down[0], [sx + bw * 1.05, shoulderY + h * 0.03]];
    case 'pocket':
      return [
        [-sx - bw * 0.05, hipY + h * 0.03],
        [sx + bw * 0.05, hipY + h * 0.03],
      ];
    case 'walk':
      return [
        [-sx - bw * 0.28, hipY + h * 0.13],
        [sx + bw * 0.1, hipY + h * 0.05],
      ];
    case 'crystal':
      return [down[0], [sx + bw * 0.7, shoulderY + h * 0.02]];
    case 'guard':
      return [
        [-bw * 0.1, hipY + h * 0.14],
        [bw * 0.12, hipY + h * 0.16],
      ];
    case 'camera':
      return [
        [-bw * 0.42, headCy + headR * 0.5],
        [bw * 0.42, headCy + headR * 0.5],
      ];
    case 'bouquet':
      return [
        [-sx - bw * 0.1, hipY + h * 0.04],
        [sx * 0.2, hipY - h * 0.02],
      ];
    default:
      return down;
  }
}

function drawHair(ctx, rng, p, m) {
  const { headCx, headCy, headR } = m;
  const c = p.hair;
  const o = { fill: c, ink: INK, lw: 0.85, jitter: 0.4 };
  switch (p.hairStyle) {
    case 'bald':
      if (rng.chance(0.6)) {
        line(ctx, rng, arcPts(headCx, headCy, headR * 1.0, Math.PI * 0.75, Math.PI * 1.25, 6), { lw: 0.8 });
      }
      break;
    case 'bob':
      shape(ctx, rng, [
        ...arcPts(headCx, headCy, headR * 1.12, Math.PI, Math.PI * 2, 10),
        [headCx + headR * 1.12, headCy + headR * 0.85],
        [headCx + headR * 0.72, headCy + headR * 0.7],
        [headCx, headCy - headR * 0.15],
        [headCx - headR * 0.72, headCy + headR * 0.7],
        [headCx - headR * 1.12, headCy + headR * 0.85],
      ], o);
      break;
    case 'long':
      shape(ctx, rng, [
        ...arcPts(headCx, headCy, headR * 1.14, Math.PI, Math.PI * 2, 10),
        [headCx + headR * 1.2, headCy + headR * 1.9],
        [headCx + headR * 0.6, headCy + headR * 1.7],
        [headCx, headCy + headR * 0.3],
        [headCx - headR * 0.6, headCy + headR * 1.7],
        [headCx - headR * 1.2, headCy + headR * 1.9],
      ], o);
      break;
    case 'bun':
      blob(ctx, rng, headCx + headR * 0.1, headCy - headR * 1.25, headR * 0.46, o);
      shape(ctx, rng, arcPts(headCx, headCy, headR * 1.08, Math.PI * 0.95, Math.PI * 2.05, 10).concat([
        [headCx + headR * 0.8, headCy - headR * 0.15],
        [headCx - headR * 0.8, headCy - headR * 0.15],
      ]), o);
      break;
    case 'ponytail':
      blob(ctx, rng, headCx + headR * 1.25, headCy - headR * 0.1, headR * 0.4, o);
      shape(ctx, rng, arcPts(headCx, headCy, headR * 1.08, Math.PI, Math.PI * 2, 10).concat([
        [headCx + headR * 0.85, headCy - headR * 0.1],
        [headCx - headR * 0.85, headCy - headR * 0.1],
      ]), o);
      break;
    case 'spiky': {
      const pts = [];
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI + (Math.PI * i) / n;
        const r = headR * (i % 2 === 0 ? 1.3 : 1.02);
        pts.push([headCx + Math.cos(a) * r, headCy + Math.sin(a) * r]);
      }
      pts.push([headCx + headR * 0.9, headCy - headR * 0.05], [headCx - headR * 0.9, headCy - headR * 0.05]);
      shape(ctx, rng, pts, { ...o, sharp: true });
      break;
    }
    case 'curly': {
      const n = 6;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI * 1.05 + (Math.PI * 0.9 * i) / n;
        blob(ctx, rng, headCx + Math.cos(a) * headR * 0.98, headCy + Math.sin(a) * headR * 0.98, headR * 0.36, o);
      }
      break;
    }
    default:
      shape(ctx, rng, arcPts(headCx, headCy, headR * 1.09, Math.PI * 0.98, Math.PI * 2.02, 10).concat([
        [headCx + headR * 0.86, headCy - headR * 0.22],
        [headCx - headR * 0.86, headCy - headR * 0.22],
      ]), o);
  }
}

function drawHat(ctx, rng, p, m) {
  const { headCx, headCy, headR } = m;
  const topY = headCy - headR * 1.05;
  switch (p.hat) {
    case 'cap':
      shape(ctx, rng, arcPts(headCx, headCy - headR * 0.1, headR * 1.16, Math.PI, Math.PI * 2, 10).concat([
        [headCx + headR * 1.1, headCy - headR * 0.1],
        [headCx - headR * 1.1, headCy - headR * 0.1],
      ]), { fill: p.coat, lw: 0.85, jitter: 0.35 });
      shape(ctx, rng, [
        [headCx + headR * 0.6, headCy - headR * 0.16],
        [headCx + headR * 1.9, headCy - headR * 0.25],
        [headCx + headR * 1.9, headCy - headR * 0.02],
        [headCx + headR * 0.6, headCy + headR * 0.02],
      ], { fill: p.coat, lw: 0.8, jitter: 0.3 });
      break;
    case 'brim':
      line(ctx, rng, [[headCx - headR * 1.7, topY + headR * 0.75], [headCx + headR * 1.7, topY + headR * 0.75]], { lw: 1.1 });
      shape(ctx, rng, [
        [headCx - headR * 1.65, topY + headR * 0.8],
        [headCx + headR * 1.65, topY + headR * 0.8],
        [headCx + headR * 1.65, topY + headR * 0.62],
        [headCx + headR * 0.85, topY + headR * 0.55],
        [headCx + headR * 0.7, topY - headR * 0.25],
        [headCx - headR * 0.7, topY - headR * 0.25],
        [headCx - headR * 0.85, topY + headR * 0.55],
        [headCx - headR * 1.65, topY + headR * 0.62],
      ], { fill: p.hatColor || '#c9a86a', lw: 0.9, jitter: 0.3, sharp: true });
      break;
    case 'top':
      shape(ctx, rng, [
        [headCx - headR * 1.5, topY + headR * 0.72],
        [headCx + headR * 1.5, topY + headR * 0.72],
        [headCx + headR * 1.5, topY + headR * 0.5],
        [headCx + headR * 0.82, topY + headR * 0.4],
        [headCx + headR * 0.82, topY - headR * 1.5],
        [headCx - headR * 0.82, topY - headR * 1.5],
        [headCx - headR * 0.82, topY + headR * 0.4],
        [headCx - headR * 1.5, topY + headR * 0.5],
      ], { fill: '#232326', lw: 0.9, jitter: 0.3, sharp: true });
      break;
    case 'beanie':
      shape(ctx, rng, arcPts(headCx, headCy - headR * 0.12, headR * 1.18, Math.PI * 0.96, Math.PI * 2.04, 10).concat([
        [headCx + headR * 1.12, headCy + headR * 0.08],
        [headCx - headR * 1.12, headCy + headR * 0.08],
      ]), { fill: p.hatColor || p.coat, lw: 0.85, jitter: 0.35 });
      blob(ctx, rng, headCx, topY - headR * 0.35, headR * 0.3, { fill: '#fbf7ec', lw: 0.8, jitter: 0.3 });
      break;
    case 'bucket':
      shape(ctx, rng, [
        [headCx - headR * 1.45, topY + headR * 0.9],
        [headCx + headR * 1.45, topY + headR * 0.9],
        [headCx + headR * 0.95, topY + headR * 0.45],
        [headCx + headR * 0.85, topY - headR * 0.5],
        [headCx - headR * 0.85, topY - headR * 0.5],
        [headCx - headR * 0.95, topY + headR * 0.45],
      ], { fill: p.hatColor || '#e6d9b8', lw: 0.9, jitter: 0.35 });
      break;
    case 'party':
      shape(ctx, rng, [
        [headCx - headR * 0.95, topY + headR * 0.35],
        [headCx + headR * 0.95, topY + headR * 0.35],
        [headCx, topY - headR * 1.75],
      ], { fill: p.hatColor || '#e2604a', lw: 0.9, jitter: 0.3, sharp: true });
      break;
    case 'helmet':
      shape(ctx, rng, arcPts(headCx, headCy - headR * 0.05, headR * 1.2, Math.PI, Math.PI * 2, 10).concat([
        [headCx + headR * 1.5, headCy - headR * 0.05],
        [headCx - headR * 1.5, headCy - headR * 0.05],
      ]), { fill: '#f2c53d', lw: 0.9, jitter: 0.3 });
      break;
    case 'crown':
      drawCrown(ctx, rng, headCx, topY + headR * 0.18, headR * 1.15);
      break;
    default:
      break;
  }
}

export function drawCrown(ctx, rng, cx, baseY, w) {
  const h = w * 0.95;
  const pts = [
    [cx - w * 0.5, baseY],
    [cx - w * 0.5, baseY - h * 0.45],
    [cx - w * 0.28, baseY - h * 0.12],
    [cx - w * 0.06, baseY - h * 0.95],
    [cx + w * 0.16, baseY - h * 0.12],
    [cx + w * 0.4, baseY - h * 0.95],
    [cx + w * 0.5, baseY - h * 0.1],
    [cx + w * 0.5, baseY],
  ];
  shape(ctx, rng, pts, { fill: '#f5cf2e', lw: 0.95, jitter: 0.25, sharp: true });
}

function drawFace(ctx, rng, p, m) {
  const { headCx, headCy, headR } = m;
  const ex = headR * 0.36;
  const ey = headCy - headR * 0.05;
  dot(ctx, headCx - ex, ey, Math.max(0.7, headR * 0.11));
  dot(ctx, headCx + ex, ey, Math.max(0.7, headR * 0.11));
  if (p.pose !== 'camera') {
    line(ctx, rng, arcPts(headCx, headCy + headR * 0.12, headR * 0.42, 0.25 * Math.PI, 0.75 * Math.PI, 5), {
      lw: 0.85,
      jitter: 0.2,
    });
  }
  if (p.beard) {
    shape(ctx, rng, arcPts(headCx, headCy + headR * 0.18, headR * 0.85, 0.1 * Math.PI, 0.9 * Math.PI, 8).concat([
      [headCx, headCy + headR * 1.35],
    ]), { fill: p.hair, lw: 0.8, jitter: 0.35 });
  }
  if (p.glasses === 'shades') {
    shape(ctx, rng, [
      [headCx - headR * 0.75, ey - headR * 0.28],
      [headCx + headR * 0.75, ey - headR * 0.28],
      [headCx + headR * 0.7, ey + headR * 0.3],
      [headCx - headR * 0.7, ey + headR * 0.3],
    ], { fill: '#1c1c1e', lw: 0.8, jitter: 0.2 });
  } else if (p.glasses) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.arc(headCx - ex, ey, headR * 0.3, 0, Math.PI * 2);
    ctx.moveTo(headCx + ex + headR * 0.3, ey);
    ctx.arc(headCx + ex, ey, headR * 0.3, 0, Math.PI * 2);
    ctx.moveTo(headCx - ex + headR * 0.3, ey);
    ctx.lineTo(headCx + ex - headR * 0.3, ey);
    ctx.stroke();
  }
}

// Hovudteikninga. (0,0) er mellom føtene; figuren veks oppover.
export function drawPerson(ctx, rng, p, x, y, s = 1) {
  const h = p.h;
  const headR = h * 0.155;
  const headCy = -(h - headR);
  const headCx = 0;
  const shoulderY = headCy + headR * 1.15;
  const hipY = -h * 0.42;
  const bw = h * 0.3 * (p.stout || 1);
  const m = { headCx, headCy, headR, shoulderY, hipY, bw, h };

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * (p.flip ? -1 : 1), s);
  ctx.rotate(p.tilt || 0);
  ctx.lineJoin = 'round';

  groundShadow(ctx, 0, 0, bw * 1.4);

  // bein
  const legW = h * 0.095;
  const spread = p.pose === 'walk' || p.pose === 'macarena' ? h * 0.12 : h * 0.03;
  const lFoot = [-bw * 0.2 - spread, -h * 0.02];
  const rFoot = [bw * 0.2 + spread * 0.4, -h * 0.02];
  limb(ctx, rng, [-bw * 0.2, hipY], lFoot, legW, p.coatStyle === 'dress' ? p.skin : p.pants);
  limb(ctx, rng, [bw * 0.2, hipY], rFoot, legW, p.coatStyle === 'dress' ? p.skin : p.pants);
  blob(ctx, rng, lFoot[0], 0, h * 0.062, { fill: p.shoes, lw: 0.85, jitter: 0.3, squash: 0.62, n: 9 });
  blob(ctx, rng, rFoot[0], 0, h * 0.062, { fill: p.shoes, lw: 0.85, jitter: 0.3, squash: 0.62, n: 9 });

  const arms = armTargets(p, m);
  const armW = h * 0.082;
  const handR = h * 0.052;
  const shoulderL = [-bw * 0.44, shoulderY + h * 0.02];
  const shoulderR = [bw * 0.44, shoulderY + h * 0.02];

  // bakarm
  limb(ctx, rng, shoulderL, arms[0], armW, p.coat);
  handAt(ctx, rng, arms[0][0], arms[0][1], handR, p.skin);

  // overkropp
  const torsoBottom = p.coatStyle === 'coat' ? hipY - h * 0.16 : hipY;
  const flare = p.coatStyle === 'dress' ? 1.5 : p.coatStyle === 'coat' ? 1.2 : 1.06;
  shape(ctx, rng, [
    [-bw * 0.5, shoulderY],
    [-bw * 0.42, shoulderY - h * 0.02],
    [bw * 0.42, shoulderY - h * 0.02],
    [bw * 0.5, shoulderY],
    [bw * 0.52 * flare, torsoBottom],
    [-bw * 0.52 * flare, torsoBottom],
  ], { fill: p.coat, lw: 1.0, jitter: 0.4 });

  if (p.coatStyle === 'suit') {
    line(ctx, rng, [[0, shoulderY - h * 0.01], [0, torsoBottom]], { lw: 0.8, jitter: 0.25 });
    shape(ctx, rng, [
      [-bw * 0.14, shoulderY],
      [bw * 0.14, shoulderY],
      [0, shoulderY + h * 0.09],
    ], { fill: '#fbf7ec', lw: 0.7, jitter: 0.2, sharp: true });
  }
  if (p.coatStyle === 'sweater') {
    line(ctx, rng, [[-bw * 0.4, shoulderY + h * 0.09], [bw * 0.4, shoulderY + h * 0.09]], { lw: 0.7, jitter: 0.3 });
  }
  if (p.sash) {
    shape(ctx, rng, [
      [-bw * 0.46, shoulderY + h * 0.01],
      [-bw * 0.28, shoulderY - h * 0.01],
      [bw * 0.55, torsoBottom + h * 0.02],
      [bw * 0.4, torsoBottom + h * 0.06],
    ], { fill: p.sash, lw: 0.75, jitter: 0.25, sharp: true });
  }
  if (p.scarf) {
    shape(ctx, rng, [
      [-bw * 0.36, shoulderY + h * 0.005],
      [bw * 0.36, shoulderY + h * 0.005],
      [bw * 0.3, shoulderY + h * 0.06],
      [-bw * 0.3, shoulderY + h * 0.06],
    ], { fill: p.scarf, lw: 0.7, jitter: 0.25 });
  }

  // framarm
  limb(ctx, rng, shoulderR, arms[1], armW, p.coat);
  handAt(ctx, rng, arms[1][0], arms[1][1], handR, p.skin);

  // hals + hovud
  limb(ctx, rng, [0, shoulderY + h * 0.01], [0, headCy + headR * 0.75], h * 0.075, p.skin);
  if (p.hairStyle === 'long' || p.hairStyle === 'bob') drawHair(ctx, rng, p, m);
  blob(ctx, rng, headCx, headCy, headR, { fill: p.skin, lw: 1.0, jitter: 0.35, n: 16 });
  if (p.hairStyle !== 'long' && p.hairStyle !== 'bob') drawHair(ctx, rng, p, m);
  drawFace(ctx, rng, p, m);
  if (p.hat) drawHat(ctx, rng, p, m);

  if (p.earpiece) {
    line(ctx, rng, [[headCx + headR * 0.9, headCy + headR * 0.1], [bw * 0.3, shoulderY + h * 0.05]], { lw: 0.7, jitter: 0.2 });
  }

  // pose-spesifikke rekvisittar
  if (p.pose === 'camera') {
    shape(ctx, rng, [
      [-headR * 0.85, headCy - headR * 0.35],
      [headR * 0.85, headCy - headR * 0.35],
      [headR * 0.85, headCy + headR * 0.45],
      [-headR * 0.85, headCy + headR * 0.45],
    ], { fill: '#2b2b2d', lw: 0.9, jitter: 0.25 });
    blob(ctx, rng, headR * 0.15, headCy + headR * 0.05, headR * 0.42, { fill: '#6fa8d0', lw: 0.8, jitter: 0.2 });
  }
  if (p.pose === 'crystal') {
    const hand = arms[1];
    shape(ctx, rng, [
      [hand[0], hand[1] - h * 0.14],
      [hand[0] + h * 0.05, hand[1] - h * 0.06],
      [hand[0], hand[1] + h * 0.01],
      [hand[0] - h * 0.05, hand[1] - h * 0.06],
    ], { fill: '#c9a6f0', lw: 0.85, jitter: 0.2, sharp: true });
  }
  if (p.pose === 'bouquet') {
    const hand = arms[1];
    for (let i = 0; i < 5; i++) {
      dot(ctx, hand[0] + (i - 2) * h * 0.035, hand[1] - h * 0.05 - (i % 2) * h * 0.03, h * 0.03, ['#e2604a', '#f2c53d', '#e79ab4'][i % 3]);
    }
    line(ctx, rng, [[hand[0], hand[1]], [hand[0], hand[1] - h * 0.05]], { lw: 0.8 });
  }

  ctx.restore();
}
