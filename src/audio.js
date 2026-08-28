// Bittelita lydmotor — ingen lydfiler, berre oscillatorar.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(v) {
  muted = v;
}
export function isMuted() {
  return muted;
}

function tone(freq, dur, { type = 'sine', gain = 0.16, slide = 0, delay = 0 } = {}) {
  if (muted) return;
  const a = ac();
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  found() {
    tone(660, 0.12, { type: 'triangle' });
    tone(990, 0.18, { type: 'triangle', delay: 0.08 });
  },
  miss() {
    tone(150, 0.16, { type: 'sawtooth', gain: 0.07, slide: -60 });
  },
  wave() {
    tone(520, 0.1, { type: 'sine', gain: 0.1, slide: 180 });
  },
  flash() {
    tone(1400, 0.07, { type: 'square', gain: 0.06 });
    tone(1900, 0.05, { type: 'square', gain: 0.04, delay: 0.05 });
  },
  warn() {
    tone(320, 0.12, { type: 'square', gain: 0.07 });
    tone(260, 0.14, { type: 'square', gain: 0.07, delay: 0.15 });
  },
  durek() {
    tone(180, 0.5, { type: 'sine', gain: 0.09, slide: 90 });
    tone(233, 0.6, { type: 'sine', gain: 0.06, delay: 0.05 });
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', delay: i * 0.1, gain: 0.14 }));
  },
  lose() {
    [400, 330, 262, 196].forEach((f, i) => tone(f, 0.3, { type: 'sawtooth', delay: i * 0.14, gain: 0.09 }));
  },
  tick() {
    tone(880, 0.04, { type: 'sine', gain: 0.05 });
  },
};
