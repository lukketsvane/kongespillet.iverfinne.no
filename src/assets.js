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

// Harald-brikkene. Kvar runde er det éin bestemt av dei som er gøymd i
// mengda — resten står der som lokkekongar.
export const HARALDS = {
  'harald-galla': { h: 54, label: 'Harald i gallauniform' },
  'harald-vinkar': { h: 54, label: 'Harald som vinkar' },
  'harald-talarstol': { h: 54, label: 'Harald på talarstol' },
  'harald-gaar-venstre': { h: 52, label: 'Harald på veg til venstre' },
  'harald-gaar-hogre': { h: 52, label: 'Harald på veg til høgre' },
  'harald-bekymra': { h: 54, label: 'ein bekymra Harald' },
  'harald-glad': { h: 54, label: 'ein glad Harald' },
  'harald-stovlar': { h: 54, label: 'Harald i gummistøvlar' },
  'harald-stokk': { h: 54, label: 'Harald med stokk' },
  'harald-gamal': { h: 54, label: 'gamal Harald med stokk' },
  'harald-avis': { h: 54, label: 'Harald som les avis' },
  'harald-siger': { h: 54, label: 'Harald i sigerposisjon' },
  'harald-balkong': { h: 56, label: 'Harald på balkongen' },
  'harald-sira': { h: 46, label: 'Harald i Sira' },
  'harald-prins': { h: 46, label: 'den unge prinsen' },
  'harald-barn': { h: 38, label: 'barne-Harald' },
  'harald-baby': { h: 30, label: 'baby-Harald' },
};

// Dei gamle person-cropsa frå teiknearka hadde med scan-støy, nabostrekar og
// feil bounding boxes. Dei er med vilje slått heilt av. Folkemengda blir i
// staden generert reint og tilfeldig i kode via people.js.
export const FOLK = [];

export const HAZARD_ART = ['paparazzi', 'journalist', 'sjaman', 'vakt', 'skandalesky', 'regnstorm', 'some-storm', 'kommentarfelt', 'demonstrant', 'republikanar'];

const UI_ART = [
  'logo', 'startknapp', 'vinkknapp', 'pause', 'restart', 'lyd-pa', 'lyd-av',
  'panel-feil', 'panel-ok', 'liv-full', 'liv-tom', 'arstal', 'poeng',
  'taleboble', 'tankeboble', 'lasting', 'hurra', 'vinkehand', 'balkong',
  'hjarte-lite', 'stjerne', 'tommel-opp', 'tommel-ned', 'smilefjes', 'sinne-sky',
  'applaus', 'svettedrope', 'harald', 'folkemengd', 'hero-banner',
  'avisframside', 'sladrespalte', 'tv-debatt', 'kongehusbrak', 'radgivar',
  'jublande', 'skeptikar', 'folk-lag', 'folk-hog', 'verd-lag', 'verd-hog',
  // frå det store master-arket
  'master/ikon/krone', 'master/panel/krona-fall-av', 'master/humor/pluss3', 'master/humor/minus3',
];

export const ALL = [...new Set([...Object.keys(OBJECTS), ...Object.keys(HARALDS), ...FOLK, ...HAZARD_ART, ...UI_ART, 'harald-gameover'])];

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
