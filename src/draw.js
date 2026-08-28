// Handteikna blekk-primitiv. Alt i spelet er teikna med desse, slik at
// figurane får den same skjelvande penneskrifta som på plakaten.

export const INK = '#1d1b18';

export const SKIN = ['#f7dcc0', '#f0cca6', '#e0ab7d', '#c08757', '#a06a44', '#7c4e33'];
export const HAIR = ['#2f2419', '#4b3722', '#6b4a2a', '#a5773a', '#e0bb63', '#c96a3a', '#8f9195', '#e8e6e0', '#1b1b1b'];
export const CLOTH = [
  '#d4453a', '#e2604a', '#3a6ea5', '#6fa8d0', '#1f3f66', '#f2c53d', '#f0a63c',
  '#6aa84f', '#3f6b45', '#8e6bab', '#e79ab4', '#8a8f96', '#2f2f31', '#8a5a34',
  '#4aa3a3', '#efe3c8', '#b8452f', '#cfd6db',
];
export const PANTS = ['#3b5772', '#2f3a4a', '#6b6f76', '#8a5a34', '#43524a', '#9aa3ab', '#2b2b2d', '#c9b892'];

// --- geometri ------------------------------------------------------------

export function wob(pts, rng, amt) {
  if (!amt) return pts;
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i++) {
    out[i] = [pts[i][0] + (rng.f() - 0.5) * amt, pts[i][1] + (rng.f() - 0.5) * amt];
  }
  return out;
}

export function traceOpen(ctx, pts) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (pts.length === 2) {
    ctx.lineTo(pts[1][0], pts[1][1]);
    return;
  }
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last[0], last[1]);
}

export function traceClosed(ctx, pts) {
  const n = pts.length;
  if (n < 3) return;
  ctx.beginPath();
  ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const c = pts[i];
    const nx = pts[(i + 1) % n];
    ctx.quadraticCurveTo(c[0], c[1], (c[0] + nx[0]) / 2, (c[1] + nx[1]) / 2);
  }
  ctx.closePath();
}

// Teikn ei lukka form: fyll + blekkstrek.
export function shape(ctx, rng, pts, { fill = null, ink = INK, lw = 1.05, jitter = 0.5, sharp = false } = {}) {
  const p = wob(pts, rng, jitter);
  if (sharp) {
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
  } else {
    traceClosed(ctx, p);
  }
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (ink) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

export function line(ctx, rng, pts, { ink = INK, lw = 1.05, jitter = 0.45, cap = 'round' } = {}) {
  const p = wob(pts, rng, jitter);
  traceOpen(ctx, p);
  ctx.strokeStyle = ink;
  ctx.lineWidth = lw;
  ctx.lineCap = cap;
  ctx.stroke();
}

export function circlePts(cx, cy, r, n = 14, squash = 1) {
  const pts = new Array(n);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts[i] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash];
  }
  return pts;
}

export function blob(ctx, rng, cx, cy, r, opts = {}) {
  shape(ctx, rng, circlePts(cx, cy, r, opts.n || 14, opts.squash || 1), opts);
}

export function dot(ctx, x, y, r, color = INK) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

// Bogeform brukt til smil, hår, vatn.
export function arcPts(cx, cy, r, a0, a1, n = 8, squash = 1) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * squash]);
  }
  return pts;
}

export function rectPts(x, y, w, h) {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

// Lett skravering — brukt på skugge under føtene.
export function groundShadow(ctx, x, y, w) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.ellipse(x, y + 1, w * 0.55, w * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  ctx.restore();
}
