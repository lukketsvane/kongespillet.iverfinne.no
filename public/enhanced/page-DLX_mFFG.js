import OriginalGame from '/origin-assets/page-DLX_mFFG.js';

const BOARD_KEY = 'finn-harald-leaderboard-v3';
const fmt = new Intl.NumberFormat('nb-NO');

function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function random(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
const SKIN=['#f4ceb0','#e8b98f','#d7986e','#bd7955','#965f45','#754633'];
const COAT=['#cf4938','#2f6f9f','#e0a124','#3b8a70','#6c5790','#d16e88','#c9c2b2','#43515d','#809e4a','#6a3f35'];
const TROUSERS=['#253a4d','#44513c','#675245','#315679','#5c5565','#1d2c33'];
const HAIR=['#29211d','#875b37','#d5ad6e','#6b4030','#393430','#b6a17c','#8b8b83'];
const INK='#171717';

function personSvg(seedText){
  const r=random(hash(seedText)), pick=a=>a[Math.floor(r()*a.length)];
  const skin=pick(SKIN), coat=pick(COAT), trousers=pick(TROUSERS), hair=pick(HAIR);
  const cx=50+(r()-.5)*6, head=20+r()*5, body=41+r()*12;
  const skirt=r()<.26, hat=r()<.20, glasses=r()<.14, cane=r()<.07, bag=r()<.13, wave=r()<.15, scarf=r()<.10;
  const hairType=Math.floor(r()*4), hip=136, foot=210, legTop=skirt?146:hip;
  const leftHandY=wave?74:110, rightHandY=109;
  let hairSvg='';
  if(hairType===0) hairSvg=`<path d="M${cx-head/2+1} 31 Q${cx} 13 ${cx+head/2-1} 31" fill="${hair}" stroke="${INK}" stroke-width="2.5"/>`;
  if(hairType===1) hairSvg=`<path d="M${cx-head/2} 32 Q${cx-8} 14 ${cx+1} 20 Q${cx+9} 12 ${cx+head/2} 32" fill="${hair}" stroke="${INK}" stroke-width="2.5"/>`;
  if(hairType===2) hairSvg=`<path d="M${cx-head/2} 30 Q${cx} 17 ${cx+head/2} 30 L${cx+head/2-3} 38 Q${cx} 27 ${cx-head/2+3} 38Z" fill="${hair}" stroke="${INK}" stroke-width="2.5"/>`;
  if(hairType===3) hairSvg=`<path d="M${cx-head/2+2} 31 Q${cx} 18 ${cx+head/2-2} 31" fill="none" stroke="${hair}" stroke-width="5"/>`;
  const hatSvg=hat?`<path d="M${cx-17} 27 Q${cx} 21 ${cx+17} 27" fill="none" stroke="${INK}" stroke-width="3"/><path d="M${cx-11} 26 Q${cx} 8 ${cx+11} 26Z" fill="${coat}" stroke="${INK}" stroke-width="2.5"/>`:'';
  const glassesSvg=glasses?`<circle cx="${cx-6}" cy="37" r="4" fill="none" stroke="${INK}" stroke-width="1.8"/><circle cx="${cx+6}" cy="37" r="4" fill="none" stroke="${INK}" stroke-width="1.8"/><path d="M${cx-2} 37h4" stroke="${INK}" stroke-width="1.8"/>`:'';
  const torso=skirt?`<path d="M${cx-body/2} 69 Q${cx} 61 ${cx+body/2} 69 L${cx+28} 149 Q${cx} 156 ${cx-28} 149Z" fill="${coat}" stroke="${INK}" stroke-width="3"/>`:`<path d="M${cx-body/2} 69 Q${cx} 61 ${cx+body/2} 69 L${cx+body/2-4} ${hip} Q${cx} ${hip+6} ${cx-body/2+4} ${hip}Z" fill="${coat}" stroke="${INK}" stroke-width="3"/>`;
  const caneSvg=cane?`<path d="M${cx+33} 110 Q${cx+43} 102 ${cx+44} 112 L${cx+42} 204" fill="none" stroke="${INK}" stroke-width="3"/>`:'';
  const bagSvg=bag?`<rect x="${cx+22}" y="116" width="21" height="25" rx="4" fill="#a87645" stroke="${INK}" stroke-width="2.5"/><path d="M${cx+26} 116 Q${cx+33} 104 ${cx+39} 116" fill="none" stroke="${INK}" stroke-width="2"/>`:'';
  const scarfSvg=scarf?`<path d="M${cx-9} 59 Q${cx} 66 ${cx+9} 59 M${cx+5} 62l5 28" fill="none" stroke="#eee3c7" stroke-width="4"/>`:'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220"><g stroke-linecap="round" stroke-linejoin="round">
    <path d="M${cx-12} ${legTop} Q${cx-12} 176 ${cx-9} ${foot-7}" stroke="${trousers}" stroke-width="11" fill="none"/>
    <path d="M${cx+12} ${legTop} Q${cx+14} 176 ${cx+14} ${foot-7}" stroke="${trousers}" stroke-width="11" fill="none"/>
    <path d="M${cx-15} ${foot-2} Q${cx-7} ${foot+2} ${cx} ${foot-2}" stroke="${INK}" stroke-width="5" fill="none"/>
    <path d="M${cx+7} ${foot-2} Q${cx+14} ${foot+2} ${cx+21} ${foot-2}" stroke="${INK}" stroke-width="5" fill="none"/>
    ${torso}
    <path d="M${cx-body/2+3} 77 Q${cx-35} 91 ${cx-31} ${leftHandY}" stroke="${coat}" stroke-width="10" fill="none"/>
    <path d="M${cx+body/2-3} 77 Q${cx+34} 93 ${cx+31} ${rightHandY}" stroke="${coat}" stroke-width="10" fill="none"/>
    <circle cx="${cx-31}" cy="${leftHandY+2}" r="5" fill="${skin}" stroke="${INK}" stroke-width="2"/>
    <circle cx="${cx+31}" cy="${rightHandY+2}" r="5" fill="${skin}" stroke="${INK}" stroke-width="2"/>
    <rect x="${cx-5}" y="52" width="10" height="17" rx="5" fill="${skin}" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="${cx}" cy="36" rx="${head/2}" ry="${head/2+2}" fill="${skin}" stroke="${INK}" stroke-width="2.8"/>
    ${hairSvg}${hatSvg}<circle cx="${cx-6}" cy="36" r="1.5" fill="${INK}"/><circle cx="${cx+6}" cy="36" r="1.5" fill="${INK}"/>
    <path d="M${cx-6} 43 Q${cx} 47 ${cx+6} 43" fill="none" stroke="${INK}" stroke-width="1.8"/>${glassesSvg}${scarfSvg}${caneSvg}${bagSvg}
  </g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function improveCrowd(){
  document.querySelectorAll('img.crowd-figure:not(.is-prop)').forEach((img,i)=>{
    const current=img.getAttribute('src')||'';
    if(!current || current.startsWith('data:image/svg+xml')) return;
    img.dataset.fhOriginal=current;
    img.src=personSvg(`${current}|${img.style.left}|${img.style.top}|${i}`);
  });
}

function readBoard(){try{const v=JSON.parse(localStorage.getItem(BOARD_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function writeBoard(v){try{localStorage.setItem(BOARD_KEY,JSON.stringify(v))}catch{}}
function digits(v){return Number(String(v||'').replace(/[^0-9]/g,''))||0}

function renderRows(rows,current=''){
  return rows.map((r,i)=>`<li class="${`${r.age}-${r.score}-${r.streak}`===current?'is-current':''}"><b>${i+1}</b><strong>${r.age} år</strong><span>${fmt.format(r.score)}</span><em>×${r.streak}</em></li>`).join('')||'<li class="empty">Ingen fullførte liv enno</li>';
}

function captureGameOver(){
  const card=document.querySelector('.gameover-card');
  if(!card) return;
  const desc=card.querySelector('[data-slot="dialog-description"]')?.textContent||'';
  const age=digits(desc.match(/vart\s+(\d+)\s+år/i)?.[1]);
  const stats=[...card.querySelectorAll('.final-stats > div')];
  const score=digits(stats.find(x=>/SCORE/i.test(x.textContent||''))?.querySelector('strong')?.textContent);
  const streak=digits(stats.find(x=>/STREAK/i.test(x.textContent||''))?.querySelector('strong')?.textContent);
  if(!age&&!score) return;
  const sig=`${age}-${score}-${streak}`;
  let rows=readBoard();
  if(!card.dataset.fhCaptured){
    card.dataset.fhCaptured='1';
    rows.push({age,score,streak,at:Date.now()});
    rows.sort((a,b)=>b.age-a.age||b.score-a.score||b.streak-a.streak||a.at-b.at);
    rows=rows.slice(0,10); writeBoard(rows);
  }
  let box=card.querySelector('.fh-leaderboard');
  if(!box){box=document.createElement('section');box.className='fh-leaderboard';card.querySelector('.final-stats')?.insertAdjacentElement('afterend',box)}
  box.innerHTML=`<div class="fh-lb-title"><span>TOPPLISTE</span><small>på denne eininga</small></div><ol>${renderRows(rows.slice(0,5),sig)}</ol>`;
}

function showBoard(){
  document.querySelector('.fh-board-modal')?.remove();
  const rows=readBoard(), modal=document.createElement('div');
  modal.className='fh-board-modal';
  modal.innerHTML=`<div class="fh-board-sheet"><button class="fh-board-close" aria-label="Lukk">×</button><h2>TOPPLISTE</h2><p>Beste liv på denne eininga</p><ol>${renderRows(rows)}</ol></div>`;
  modal.addEventListener('pointerdown',e=>{if(e.target===modal||e.target.closest('.fh-board-close'))modal.remove()});
  document.body.appendChild(modal);
}

function ensureButton(){
  const mast=document.querySelector('.masthead'); if(!mast||mast.querySelector('.fh-board-button'))return;
  const b=document.createElement('button'); b.type='button'; b.className='fh-board-button'; b.textContent='TOPP 10'; b.addEventListener('click',showBoard); mast.appendChild(b);
}

function ensureStyle(){
  if(document.getElementById('fh-enhance-style'))return;
  const s=document.createElement('style');s.id='fh-enhance-style';s.textContent=`
  .masthead{position:relative}.fh-board-button{position:absolute;right:0;bottom:-1.15rem;border:0;background:transparent;color:#6e695e;font:700 9px/1 system-ui,sans-serif;letter-spacing:.18em;padding:8px 0;z-index:8;cursor:pointer}
  .fh-leaderboard{border-top:1px solid #d9d1c0;margin-top:2px;padding-top:12px}.fh-lb-title{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px}.fh-lb-title span{font:700 10px/1 system-ui,sans-serif;letter-spacing:.22em}.fh-lb-title small{font:italic 12px/1.2 Georgia,serif;color:#80796c}.fh-leaderboard ol,.fh-board-sheet ol{list-style:none;margin:0;padding:0}.fh-leaderboard li,.fh-board-sheet li{display:grid;grid-template-columns:24px 1fr 1fr 42px;gap:8px;align-items:baseline;padding:7px 4px;border-top:1px solid #ece6d9;font-family:Georgia,serif}.fh-leaderboard li.is-current{background:#f2ead8}.fh-leaderboard li b,.fh-board-sheet li b{font:700 10px system-ui,sans-serif;color:#888176}.fh-leaderboard li strong,.fh-board-sheet li strong{font-size:15px}.fh-leaderboard li span,.fh-board-sheet li span{text-align:right;font-variant-numeric:tabular-nums}.fh-leaderboard li em,.fh-board-sheet li em{text-align:right}.fh-leaderboard li.empty,.fh-board-sheet li.empty{display:block;text-align:center;color:#857e72;font-style:italic}
  .fh-board-modal{position:fixed;inset:0;z-index:9999;background:rgba(31,28,23,.42);display:grid;place-items:center;padding:18px}.fh-board-sheet{position:relative;width:min(430px,94vw);max-height:80vh;overflow:auto;background:#f7f3e9;border:1px solid #cfc6b5;box-shadow:0 20px 70px rgba(0,0,0,.25);padding:24px}.fh-board-sheet h2{font:500 28px/1 Georgia,serif;margin:0}.fh-board-sheet>p{font:italic 14px Georgia,serif;color:#756f64;margin:4px 0 18px}.fh-board-close{position:absolute;right:14px;top:10px;border:0;background:transparent;font:28px/1 Georgia,serif;color:#554f46;padding:5px 8px}`;document.head.appendChild(s);
}

function enhance(){ensureStyle();ensureButton();improveCrowd();captureGameOver()}
if(typeof window!=='undefined'){
  const start=()=>{enhance();const obs=new MutationObserver(enhance);obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']})};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
}
export default OriginalGame;
