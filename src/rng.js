// Deterministisk tilfeldiggjerar. Same frø => same folkemengd.
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed) {
  const f = mulberry32(seed >>> 0);
  const r = {
    seed,
    f,
    // flyttal i [a,b)
    range: (a, b) => a + f() * (b - a),
    // heiltal i [a,b]
    int: (a, b) => Math.floor(a + f() * (b - a + 1)),
    chance: (p) => f() < p,
    pick: (arr) => arr[Math.floor(f() * arr.length)],
    // vektlagt val: [[verdi, vekt], ...]
    weighted(pairs) {
      let sum = 0;
      for (const p of pairs) sum += p[1];
      let x = f() * sum;
      for (const p of pairs) {
        x -= p[1];
        if (x <= 0) return p[0];
      }
      return pairs[pairs.length - 1][0];
    },
    // omtrent normalfordelt
    gauss: (mu = 0, sd = 1) => {
      const u = 1 - f();
      const v = f();
      return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(f() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
  };
  return r;
}

export function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}
