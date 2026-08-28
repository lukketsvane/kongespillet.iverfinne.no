// Teikna ressursar frå ark-a i assets/. Alt blir lasta før første brett.

export const IMG = {};

const BASE = './assets/';

// Ting kongen kan finne. Høgda er i verdskoordinatar — folket er ~40 høge.
export const OBJECTS = {
  krone: { h: 20, label: 'krone', plural: 'kroner' },
  stokk: { h: 32, label: 'stokk', plural: 'stokkar' },
  gummistovel: { h: 26, label: 'par gummistøvlar', plural: 'par gummistøvlar' },
  mikrofon: { h: 28, label: 'mikrofon', plural: 'mikrofonar' },
  talarstol: { h: 34, label: 'talarstol', plural: 'talarstolar' },
  statsradsmappe: { h: 22, label: 'statsrådsmappe', plural: 'statsrådsmapper' },
  flagg: { h: 32, label: 'flagg', plural: 'flagg' },
  medalje: { h: 24, label: 'medalje', plural: 'medaljar' },
  skraband: { h: 30, label: 'skråband', plural: 'skråband' },
  paraply: { h: 30, label: 'paraply', plural: 'paraplyar' },
  mobil: { h: 22, label: 'mobil', plural: 'mobilar' },
  avis: { h: 24, label: 'avis', plural: 'aviser' },
  seglarhanske: { h: 24, label: 'seglarhanske', plural: 'seglarhanskar' },
  sira: { h: 42, label: 'Sira', plural: 'Sira' },
  kongeskipet: { h: 46, label: 'Kongeskipet', plural: 'kongeskip' },
  pacemaker: { h: 20, label: 'pacemaker-batteri', plural: 'batteri' },
  kaffikopp: { h: 22, label: 'kaffikopp', plural: 'kaffikoppar' },
  blomsterbukett: { h: 30, label: 'bukett', plural: 'bukettar' },
  hjarte: { h: 22, label: 'hjarte', plural: 'hjarte', bonus: 'folk' },
  stjerne: { h: 22, label: 'stjerne', plural: 'stjerner', bonus: 'verd' },
};

// Folk frå arket som blir strødde inn i mengda som store, teikna figurar.
export const FOLK = [
  'barn', 'eldre-dame', 'mann-med-flagg', 'turist', 'ungdom', 'bunadperson',
  'skeptikar', 'jublande', 'fotograf', 'to-barn', 'eldre-herre', 'oslobuar',
];

export const HAZARD_ART = ['paparazzi', 'journalist', 'sjaman', 'vakt', 'skandalesky', 'regnstorm', 'some-storm', 'kommentarfelt', 'demonstrant', 'republikanar'];

const UI_ART = [
  'logo', 'startknapp', 'vinkknapp', 'pause', 'restart', 'lyd-pa', 'lyd-av',
  'panel-feil', 'panel-ok', 'liv-full', 'liv-tom', 'arstal', 'poeng',
  'taleboble', 'tankeboble', 'lasting', 'hurra', 'vinkehand', 'balkong',
  'hjarte-lite', 'stjerne', 'tommel-opp', 'tommel-ned', 'smilefjes', 'sinne-sky',
  'applaus', 'svettedrope', 'harald', 'folkemengd', 'hero-banner',
  'avisframside', 'sladrespalte', 'tv-debatt', 'kongehusbrak', 'radgivar',
  'jublande', 'skeptikar', 'folk-lag', 'folk-hog', 'verd-lag', 'verd-hog',
];

export const ALL = [...new Set([...Object.keys(OBJECTS), ...FOLK, ...HAZARD_ART, ...UI_ART])];

function load(name) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      IMG[name] = im;
      resolve(im);
    };
    im.onerror = () => {
      console.warn('fann ikkje ressurs', name);
      resolve(null);
    };
    im.src = BASE + name + '.png';
  });
}

export function loadAssets(onProgress) {
  let done = 0;
  return Promise.all(
    ALL.map((n) =>
      load(n).then((r) => {
        done++;
        if (onProgress) onProgress(done / ALL.length);
        return r;
      })
    )
  );
}

// Teikn ein ressurs med gitt høgd, forankra i føtene (x, y).
export function drawArt(ctx, name, x, y, h, opts = {}) {
  const im = IMG[name];
  if (!im) return;
  const w = (im.width / im.height) * h;
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  if (opts.flip) {
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(im, -w / 2, -h, w, h);
  } else {
    ctx.drawImage(im, x - w / 2, y - h, w, h);
  }
  ctx.restore();
}

export function artWidth(name, h) {
  const im = IMG[name];
  if (!im) return h;
  return (im.width / im.height) * h;
}

export function artUrl(name) {
  return BASE + name + '.png';
}
