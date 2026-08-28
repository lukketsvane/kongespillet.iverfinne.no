import OriginalGame from '/origin-assets/page-DLX_mFFG.js';

const KEY = 'finn-harald-leaderboard-v2';
const CLEAN_ATTR = 'data-fh-clean';

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let x = seed || 1;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

const skin = ['#f2c7a5','#e7b58e','#d79d74','#b97654','#8c563e','#f0c9ac'];
const coats = ['#d94735','#2d6fa3','#e6a21d','#2f8a70','#694f93','#da6f92','#d7d0bd','#36424d','#7d9f4d'];
const dark = '#171717';

function cleanPerson(seedText) {
  const seed = hashString(seedText);
  const r = rng(seed);
  const pick = a => a[Math.floor(r() * a.length)];
  const s = pick(skin), c = pick(coats), pants = pick(['#26384a','#3f4d36','#6b5141','#294f75','#57505f','#18262f']);
  const hair = pick(['#2a211c','#8a5f36','#d9b36c','#6b3d2e','#35312d','#b7a07a']);
  const body = 42 + r()*10, head = 20 + r()*4, cx = 50 + (r()-.5)*5;
  const shoulder = 67, hip = 136, foot = 210;
  const skirt = r() < .24, hat = r() < .18, glasses = r() < .13, cane = r() < .06, bag = r() < .12;
  const armLift = r() < .12;
  const hairType = Math.floor(r()*4);
  const face = `M${cx-6} 41 Q${cx} 45 ${cx+6} 41`;
  const hairPath = hairType===0
    ? `<path d="M${cx-head/2+2} 31 Q${cx} 12 ${cx+head/2-2} 31" fill="${hair}" stroke="${dark}" stroke-width="2.4"/>`
    : hairType===1
    ? `<path d="M${cx-head/2+1} 31 Q${cx-7} 14 ${cx+2} 20 Q${cx+10} 12 ${cx+head/2} 32" fill="${hair}" stroke="${dark}" stroke-width="2.4"/>`
    : hairType===2
    ? `<path d="M${cx-head/2} 30 Q${cx} 17 ${cx+head/2} 30 L${cx+head/2-3} 36 Q${cx} 26 ${cx-head/2+3} 36Z" fill="${hair}" stroke="${dark}" stroke-width="2.4"/>`
    : `<path d="M${cx-head/2+2} 31 Q${cx} 18 ${cx+head/2-1} 31" fill="none" stroke="${hair}" stroke-width="5" stroke-linecap="round"/>`;
  const hatSvg = hat ? `<path d="M${cx-17} 27 Q${cx} 20 ${cx+17} 27" fill="none" stroke="${dark}" stroke-width="3"/><path d="M${cx-11} 26 Q${cx} 7 ${cx+11} 26Z" fill="${c}" stroke="${dark}" stroke-width="2.5"/>` : '';
  const glassesSvg = glasses ? `<circle cx="${cx-6}" cy="37" r="4.2" fill="none" stroke="${dark}" stroke-width="1.8"/><circle cx="${cx+6}" cy="37" r="4.2" fill="none" stroke="${dark}" stroke-width="1.8"/><path d="M${cx-2} 37h4" stroke="${dark}" stroke-width="1.8"/>` : '';
  const torso = skirt
    ? `<path d="M${cx-body/2} 68 Q${cx} 61 ${cx+body/2} 68 L${cx+28} 148 Q${cx} 156 ${cx-28} 148Z" fill="${c}" stroke="${dark}" stroke-width="3"/>`
    : `<path d="M${cx-body/2} 68 Q${cx} 61 ${cx+body/2} 68 L${cx+body/2-4} ${hip} Q${cx} ${hip+6} ${cx-body/2+4} ${hip}Z" fill="${c}" stroke="${dark}" stroke-width="3"/>`;
  const legTop = skirt ? 145 : hip;
  const armY = armLift ? 83 : 109;
  const arm2Y = armLift ? 112 : 109;
  const caneSvg = cane ? `<path d="M${cx+32} 108 Q${cx+42} 101 ${cx+43} 111 L${cx+42} 202" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>` : '';
  const bagSvg = bag ? `<rect x="${cx+23}" y="112" width="20" height="24" rx="4" fill="#a97442" stroke="${dark}" stroke-width="2.5"/><path d="M${cx+27} 112 Q${cx+33} 100 ${cx+39} 112" fill="none" stroke="${dark}" stroke-width="2"/>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">
  <g stroke-linecap="round" stroke-linejoin="round">
    <path d="M${cx-10} ${foot-2} Q${cx-5} ${foot+3} ${cx+1} ${foot-1}" stroke="${dark}" stroke-width="5" fill="none"/>
    <path d="M${cx+5} ${foot-1} Q${cx+12} ${foot+3} ${cx+17} ${foot-2}" stroke="${dark}" stroke-width="5" fill="none"/>
    <path d="M${cx-12} ${legTop} Q${cx-12} 176 ${cx-9} ${foot-6}" stroke="${pants}" stroke-width="11" fill="none"/>
    <path d="M${cx+12} ${legTop} Q${cx+14} 176 ${cx+14} ${foot-6}" stroke="${pants}" stroke-width="11" fill="none"/>
    ${torso}
    <path d="M${cx-body/2+3} 76 Q${cx-35} 91 ${cx-31} ${armY}" stroke="${c}" stroke-width="10" fill="none"/>
    <path d="M${cx+body/2-3} 76 Q${cx+34} 92 ${cx+31} ${arm2Y}" stroke="${c}" stroke-width="10" fill="none"/>
    <circle cx="${cx-31}" cy="${armY+2}" r="5" fill="${s}" stroke="${dark}" stroke-width="2"/>
    <circle cx="${cx+31}" cy="${arm2Y+2}" r="5" fill="${s}" stroke="${dark}" stroke-width="2"/>
    <rect x="${cx-5}" y="52" width="10" height="16" rx="5" fill="${s}" stroke="${dark}" stroke-width="2"/>
    <ellipse cx="${cx}" cy="36" rx="${head/2}" ry="${head/2+2}" fill="${s}" stroke="${dark}" stroke-width="2.8"/>
    ${hairPath}${hatSvg}
    <circle cx="${cx-6}" cy="36" r="1.5" fill="${dark}"/><circle cx="${cx+6}" cy="36" r="1.5" fill="${dark}"/>
    <path d="${face}" fill="none" stroke="${dark}" stroke-width="1.8"/>
    ${glassesSvg}${caneSvg}${bagSvg}
  </g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function improveCrowd() {
  document.querySelectorAll('img.crowd-figure:not(.is-prop)').forEach((img, i) => {
    const original = img.getAttribute('src') || '';
    if (img.getAttribute(CLEAN_ATTR) === original) return;
    const seed = `${original}|${img.style.left}|${img.style.top}|${i}`;
    img.setAttribute(CLEAN_ATTR, original);
    img.src = cleanPerson(seed);
  });
}

function getBoard() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function setBoard(rows) { try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch {} }
function numberFrom(text) { return Number(String(text || '').replace(/[^0-9]/g, '')) || 0; }

let lastSaved = '';
function captureGameOver() {
  const card = document.querySelector('.gameover-card');
  if (!card) return;
  const desc = card.querySelector('[data-slot="dialog-description"]')?.textContent || '';
  const age = numberFrom(desc.match(/vart\s+(\d+)\s+år/i)?.[1] || desc);
  const stat = [...card.querySelectorAll('.final-stats > div')];
  const scoreNode = stat.find(x => /SCORE/i.test(x.textContent || ''))?.querySelector('strong');
  const streakNode = stat.find(x => /STREAK/i.test(x.textContent || ''))?.querySelector('strong');
  const score = numberFrom(scoreNode?.textContent);
  const streak = numberFrom(streakNode?.textContent);
  if (!age && !score) return;
  const sig = `${age}-${score}-${streak}`;
  let rows = getBoard();
  if (sig !== lastSaved) {
    lastSaved = sig;
    rows.push({ age, score, streak, at: Date.now() });
    rows.sort((a,b) => b.age-a.age || b.score-a.score || b.streak-a.streak || a.at-b.at);
    rows = rows.slice(0, 10);
    setBoard(rows);
  }
  renderLeaderboard(card, rows, sig);
}

function renderLeaderboard(card, rows = getBoard(), sig = '') {
  let box = card.querySelector('.fh-leaderboard');
  if (!box) {
    box = document.createElement('section');
    box.className = 'fh-leaderboard';
    card.querySelector('.final-stats')?.insertAdjacentElement('afterend', box);
  }
  box.innerHTML = `<div class="fh-lb-title"><span>TOPPLISTE</span><small>på denne eininga</small></div>` +
    `<ol>${rows.slice(0,5).map((r,i)=>`<li class="${`${r.age}-${r.score}-${r.streak}`===sig?'is-current':''}"><b>${i+1}</b><strong>${r.age} år</strong><span>${new Intl.NumberFormat('nb-NO').format(r.score)}</span><em>×${r.streak}</em></li>`).join('') || '<li class="empty">Ingen fullførte liv enno</li>'}</ol>`;
}

function showBoard() {
  let modal = document.querySelector('.fh-board-modal');
  if (modal) { modal.remove(); return; }
  const rows = getBoard();
  modal = document.createElement('div');
  modal.className = 'fh-board-modal';
  modal.innerHTML = `<div class="fh-board-sheet"><button class="fh-board-close" aria-label="Lukk">×</button><h2>TOPPLISTE</h2><p>Beste liv på denne eininga</p><ol>${rows.map((r,i)=>`<li><b>${i+1}</b><strong>${r.age} år</strong><span>${new Intl.NumberFormat('nb-NO').format(r.score)}</span><em>×${r.streak}</em></li>`).join('') || '<li class="empty">Spel eit liv først</li>'}</ol></div>`;
  modal.addEventListener('pointerdown', e => { if (e.target === modal || e.target.closest('.fh-board-close')) modal.remove(); });
  document.body.appendChild(modal);
}

function ensureButton() {
  const mast = document.querySelector('.masthead');
  if (!mast || mast.querySelector('.fh-board-button')) return;
  const b = document.createElement('button');
  b.className = 'fh-board-button'; b.type = 'button'; b.textContent = 'TOPP 10';
  b.addEventListener('click', showBoard);
  mast.appendChild(b);
}

function ensureStyle() {
  if (document.getElementById('fh-enhance-style')) return;
  const style = document.createElement('style'); style.id = 'fh-enhance-style';
  style.textContent = `
    .masthead{position:relative}.fh-board-button{position:absolute;right:0;bottom:-1.2rem;border:0;background:transparent;color:#6e695e;font:700 9px/1 system-ui,sans-serif;letter-spacing:.18em;padding:8px 0;z-index:8;cursor:pointer}
    .fh-leaderboard{border-top:1px solid #d9d1c0;margin-top:2px;padding-top:12px}.fh-lb-title{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px}.fh-lb-title span{font:700 10px/1 system-ui,sans-serif;letter-spacing:.22em}.fh-lb-title small{font:italic 12px/1.2 Georgia,serif;color:#80796c}.fh-leaderboard ol,.fh-board-sheet ol{list-style:none;margin:0;padding:0}.fh-leaderboard li,.fh-board-sheet li{display:grid;grid-template-columns:24px 1fr 1fr 42px;gap:8px;align-items:baseline;padding:7px 4px;border-top:1px solid #ece6d9;font-family:Georgia,serif}.fh-leaderboard li.is-current{background:#f2ead8}.fh-leaderboard li b,.fh-board-sheet li b{font:700 10px system-ui,sans-serif;color:#888176}.fh-leaderboard li strong,.fh-board-sheet li strong{font-size:15px}.fh-leaderboard li span,.fh-board-sheet li span{text-align:right;font-variant-numeric:tabular-nums}.fh-leaderboard li em,.fh-board-sheet li em{text-align:right}.fh-leaderboard li.empty,.fh-board-sheet li.empty{display:block;text-align:center;color:#857e72;font-style:italic}
    .fh-board-modal{position:fixed;inset:0;z-index:9999;background:rgba(31,28,23,.42);display:grid;place-items:center;padding:18px}.fh-board-sheet{position:relative;width:min(430px,94vw);max-height:80vh;overflow:auto;background:#f7f3e9;border:1px solid #cfc6b5;box-shadow:0 20px 70px rgba(0,0,0,.25);padding:24px}.fh-board-sheet h2{font:500 28px/1 Georgia,serif;margin:0}.fh-board-sheet>p{font:italic 14px Georgia,serif;color:#756f64;margin:4px 0 18px}.fh-board-close{position:absolute;right:14px;top:10px;border:0;background:transparent;font:28px/1 Georgia,serif;color:#554f46;padding:5px 8px}
  `;
  document.head.appendChild(style);
}

function enhance() {
  ensureStyle(); ensureButton(); improveCrowd(); captureGameOver();
}

if (typeof window !== 'undefined') {
  const start = () => {
    enhance();
    const mo = new MutationObserver(enhance);
    mo.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['src'] });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start, {once:true}) : start();
}

export default OriginalGame;
