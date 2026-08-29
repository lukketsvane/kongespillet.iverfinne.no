(()=>{
const PLAYER_KEY='finn-harald-player-id',fmt=new Intl.NumberFormat('nb-NO');
const clock={baseAge:0,offset:0,lastRendered:null,lastTick:performance.now(),bank:0,armed:false,lastBoard:null};
const leaderboardIcon=()=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V12h5v7M9 19V6h6v13M15 19v-9h5v9M3 19.5h18"/></svg>';
function playerId(){let id=localStorage.getItem(PLAYER_KEY);if(!id){id=crypto.randomUUID();localStorage.setItem(PLAYER_KEY,id)}return id}
function num(x){return Number(String(x||'').replace(/[^0-9.-]/g,''))||0}
async function board(method='GET',payload){const id=playerId(),opt={method,headers:{'Content-Type':'application/json'}};if(payload)opt.body=JSON.stringify({playerId:id,...payload});const url=method==='GET'?`/api/leaderboard?playerId=${encodeURIComponent(id)}`:'/api/leaderboard';const r=await fetch(url,opt);if(!r.ok)throw new Error('leaderboard');return r.json()}
function row(r){return `<li class="${r.isYou?'you':''}"><b>#${fmt.format(r.rank)}</b><strong>${r.age} år${r.isYou?'<i>DU</i>':''}</strong><span>${fmt.format(r.score)}</span><em>×${r.streak}</em></li>`}
function rowHead(){return '<div class="fh-cols"><b>PLASS</b><b>ALDER</b><b>SCORE</b><b>STREAK</b></div>'}
function renderBoard(data){const top=(data.top||[]).map(row).join('')||'<li class="empty">Ingen resultat enno</li>',near=(data.nearby||[]).map(row).join('');return `<header><h2>VERDSLISTE</h2><p>${fmt.format(data.total||0)} spelarar · alder først, score ved lik alder</p></header><div class="fh-section"><h3>TOPP 10</h3>${rowHead()}<ol>${top}</ol></div>${near?`<div class="fh-gap">⋯</div><div class="fh-section fh-near"><h3>DIN PLASS <small>#${fmt.format(data.player.rank)}</small></h3>${rowHead()}<ol>${near}</ol></div>`:''}`}
async function openBoard(){document.querySelector('.fh-modal')?.remove();const m=document.createElement('div');m.className='fh-modal';m.innerHTML='<section class="fh-sheet"><button class="fh-close" aria-label="Lukk">×</button><div class="fh-scroll"><p class="fh-loading">Hentar verdslista …</p></div></section>';m.addEventListener('pointerdown',e=>{if(e.target===m||e.target.closest('.fh-close'))m.remove()});document.body.appendChild(m);try{const data=await board();const sc=m.querySelector('.fh-scroll');if(sc)sc.innerHTML=renderBoard(data)}catch{const sc=m.querySelector('.fh-scroll');if(sc)sc.innerHTML='<p class="fh-loading">Kunne ikkje hente verdslista.</p>'}}
function button(){const mast=document.querySelector('.masthead');if(!mast||mast.querySelector('.fh-top'))return;const b=document.createElement('button');b.type='button';b.className='fh-top';b.innerHTML=leaderboardIcon();b.setAttribute('aria-label','Opne verdslista');b.title='Verdslista';b.onclick=openBoard;mast.appendChild(b)}

function ageEl(){return document.querySelector('.age-lockup strong')}
function effectiveAge(){return Math.max(0,Math.round(clock.baseAge+clock.offset))}
function leaf(text){return [...document.querySelectorAll('*')].find(el=>el.children.length===0&&el.textContent?.trim()===text)}
function valueNearLabel(label,re){
  if(!label)return null;
  let p=label.parentElement;
  for(let depth=0;p&&depth<4;depth++,p=p.parentElement){
    const v=[...p.querySelectorAll('*')].find(el=>el.children.length===0&&re.test((el.textContent||'').trim()));
    if(v)return v;
  }
  return null;
}
function yearEl(){return valueNearLabel(leaf('ÅR'),/^(19|20)\d{2}$/)}
function scoreValue(){return num(valueNearLabel(leaf('SCORE'),/^[\d .]+$/)?.textContent)}
function syncBaseAge(){
  const el=ageEl();if(!el)return;
  const shown=num(el.textContent);
  if(clock.lastRendered===null){clock.baseAge=shown;clock.lastRendered=shown;clock.lastBoard=document.querySelector('.crowd-board');return}
  if(shown!==clock.lastRendered){clock.baseAge=Math.max(0,shown)}
}
function paintAge(){
  const el=ageEl();if(!el)return;
  const age=effectiveAge();clock.lastRendered=age;
  if(num(el.textContent)!==age)el.textContent=String(age);
  const y=yearEl(),year=1937+age;if(y&&num(y.textContent)!==year)y.textContent=String(year);
  document.documentElement.dataset.fhEffectiveAge=String(age);
  window.__FH_DIFFICULTY__={age,year,offset:clock.offset,baseAge:clock.baseAge};
}
function resetClockIfNewGame(){
  const b=document.querySelector('.crowd-board');
  if(b&&clock.lastBoard&&b!==clock.lastBoard){clock.baseAge=num(ageEl()?.textContent);clock.offset=0;clock.bank=0;clock.lastRendered=null;clock.lastTick=performance.now()}
  if(b)clock.lastBoard=b;
}
function gameActive(){return !!document.querySelector('.crowd-board')&&!document.querySelector('.gameover-card,.fh-modal')&&document.visibilityState!=='hidden'}
function ageStepMs(age){return Math.max(7000,10500-age*42)}
function tick(now=performance.now()){
  resetClockIfNewGame();syncBaseAge();
  const dt=Math.min(1000,Math.max(0,now-clock.lastTick));clock.lastTick=now;
  if(gameActive()&&clock.armed){
    clock.bank+=dt;
    const step=ageStepMs(effectiveAge());
    while(clock.bank>=step){clock.bank-=step;clock.offset+=1}
  }
  paintAge();
}
function flashPenalty(years=1){
  clock.offset+=years;clock.bank=0;paintAge();
  let tag=document.querySelector('.fh-age-penalty');if(!tag){tag=document.createElement('div');tag.className='fh-age-penalty';document.body.appendChild(tag)}
  tag.textContent=`+${years} ÅR`;tag.classList.remove('show');requestAnimationFrame(()=>tag.classList.add('show'));setTimeout(()=>tag.classList.remove('show'),650);
}
function wireMistakes(){
  const b=document.querySelector('.crowd-board');if(!b||b.dataset.fhHardWired)return;b.dataset.fhHardWired='1';
  b.addEventListener('pointerdown',()=>{clock.armed=true;syncBaseAge();const beforeAge=clock.baseAge,beforeScore=scoreValue();setTimeout(()=>{syncBaseAge();const afterScore=scoreValue();if(gameActive()&&clock.baseAge<=beforeAge&&afterScore<=beforeScore)flashPenalty(1)},520)},{passive:true});
}

function smallestCommon(elements){
  if(!elements.length)return null;let p=elements[0].parentElement;
  while(p&&!elements.every(e=>p.contains(e)))p=p.parentElement;
  return p;
}
function tagLayout(){
  const labels=['ÅR','SCORE','STREAK'].map(leaf).filter(Boolean),stats=smallestCommon(labels);if(stats)stats.classList.add('fh-statbar');
  const crown=leaf('KRONA');if(crown){let p=crown.parentElement;for(let i=0;p&&i<4;i++,p=p.parentElement){if(/%/.test(p.textContent||'')){p.classList.add('fh-crownblock');break}}}
  document.querySelector('.game-shell')?.classList.add('fh-compact');
}

function gameover(){
  const card=document.querySelector('.gameover-card');if(!card||card.dataset.lbState)return;
  const textEl=card.querySelector('[data-slot="dialog-description"]'),text=textEl?.textContent||'';
  const internalAge=num(text.match(/vart\s+(\d+)\s+år/i)?.[1]);
  const age=Math.max(internalAge,effectiveAge());
  if(textEl&&internalAge&&age!==internalAge)textEl.textContent=text.replace(/vart\s+\d+\s+år/i,`vart ${age} år`);
  const stats=[...card.querySelectorAll('.final-stats>div')],score=num(stats.find(x=>/SCORE/i.test(x.textContent||''))?.querySelector('strong')?.textContent),streak=num(stats.find(x=>/STREAK/i.test(x.textContent||''))?.querySelector('strong')?.textContent);
  if(!age&&!score)return;card.dataset.lbState='saving';let box=document.createElement('section');box.className='fh-result-rank';box.innerHTML='<span>VERDSLISTE</span><strong>…</strong>';card.querySelector('.final-stats')?.insertAdjacentElement('afterend',box);
  board('POST',{age,score,streak}).then(data=>{card.dataset.lbState='saved';const rank=data.player?.rank;if(box.isConnected)box.innerHTML=`<span>VERDSLISTE</span><strong>${rank?'#'+fmt.format(rank):'—'}</strong><button type="button">SJÅ LISTA</button>`;box.querySelector('button')?.addEventListener('click',openBoard)}).catch(()=>{card.dataset.lbState='error';if(box.isConnected)box.innerHTML='<span>VERDSLISTE</span><strong>—</strong>'});
}

function style(){if(document.getElementById('fh-style'))return;const s=document.createElement('style');s.id='fh-style';s.textContent=`
.first-instruction{display:none!important}.masthead{position:relative}.fh-top{position:absolute;right:0;bottom:-18px;width:30px;height:30px;display:grid;place-items:center;border:0;background:transparent;color:#6e695e;padding:6px;z-index:9}.fh-top svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.fh-top:focus-visible{outline:1px solid #81796d;outline-offset:1px}
.fh-age-penalty{position:fixed;left:50%;top:54%;z-index:99998;transform:translate(-50%,-50%) scale(.95);opacity:0;pointer-events:none;font:600 18px/1 system-ui;letter-spacing:.16em;color:#8b2c25;text-shadow:0 1px #fff;transition:opacity .16s,transform .22s}.fh-age-penalty.show{opacity:.62;transform:translate(-50%,-50%) scale(1)}
.fh-result-rank{display:grid;grid-template-columns:1fr auto auto;align-items:baseline;gap:12px;border-top:1px solid #d9d1c0;padding:11px 0 2px}.fh-result-rank span{font:700 9px system-ui;letter-spacing:.18em;color:#6e695e}.fh-result-rank strong{font:600 18px Georgia}.fh-result-rank button{border:0;background:none;padding:5px 0;font:700 9px system-ui;letter-spacing:.12em;color:#6e695e}
.fh-modal{position:fixed;inset:0;z-index:99999;background:#1f1c1770;display:grid;place-items:center;padding:16px}.fh-sheet{position:relative;width:min(460px,95vw);max-height:84vh;background:#f7f3e9;border:1px solid #cfc6b5;box-shadow:0 20px 70px #0005;overflow:hidden}.fh-scroll{max-height:84vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:24px 22px 28px}.fh-close{position:absolute;right:9px;top:7px;z-index:2;border:0;background:#f7f3e9d9;font:30px/1 Georgia;color:#554f46;padding:5px 9px}.fh-scroll header{padding-right:32px}.fh-scroll h2{font:500 30px/1 Georgia;margin:0}.fh-scroll header p{font:italic 13px/1.35 Georgia;color:#756f64;margin:5px 0 20px}.fh-section h3{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 6px;font:700 10px/1 system-ui;letter-spacing:.2em}.fh-section h3 small{font:600 12px/1 Georgia;letter-spacing:0}.fh-cols,.fh-section li{display:grid;grid-template-columns:58px 1fr 1fr 50px;gap:7px;align-items:baseline}.fh-cols{padding:5px 4px;color:#938b7d;border-bottom:1px solid #d8d0c0}.fh-cols b{font:700 8px/1 system-ui;letter-spacing:.1em}.fh-cols b:nth-child(3),.fh-cols b:nth-child(4){text-align:right}.fh-section ol{list-style:none;margin:0;padding:0}.fh-section li{padding:9px 4px;border-bottom:1px solid #e7e0d3;font-family:Georgia}.fh-section li>b{font:700 11px system-ui;color:#81796d}.fh-section li strong{font-size:15px;font-weight:600;white-space:nowrap}.fh-section li strong i{display:inline-block;margin-left:6px;padding:2px 4px;background:#1b1b19;color:#f7f3e9;font:700 7px/1 system-ui;letter-spacing:.12em;vertical-align:2px}.fh-section li span,.fh-section li em{text-align:right;font-variant-numeric:tabular-nums}.fh-section li.you{background:#efe4cb}.fh-section li.empty{display:block;text-align:center;color:#81796d;font-style:italic}.fh-gap{text-align:center;padding:13px 0 10px;color:#9b9385;letter-spacing:.35em}.fh-near{padding-top:2px}.fh-loading{padding:38px 8px;text-align:center;font:italic 14px Georgia;color:#756f64}
@media(max-width:700px){
  html,body{overscroll-behavior:none}.game-shell.fh-compact{padding:5px 10px 7px!important;gap:3px!important;max-width:none!important;width:auto!important}
  .masthead{min-height:64px!important;margin:0!important;padding:1px 0 5px!important}.masthead h1{font-size:clamp(35px,10.5vw,46px)!important;line-height:.92!important;margin:0!important}.masthead p{font-size:14px!important;line-height:1.05!important;margin:3px 0 0!important}
  .age-lockup{top:0!important;right:2px!important}.age-lockup strong{font-size:clamp(52px,15vw,67px)!important;line-height:.78!important}.age-lockup span{font-size:13px!important}
  .fh-top{right:3px!important;bottom:-9px!important;width:27px!important;height:27px!important;padding:5px!important}
  .fh-statbar{min-height:48px!important;margin:0!important;padding:3px 0!important}.fh-statbar>*{padding-top:2px!important;padding-bottom:2px!important}
  .fh-crownblock{margin:0!important;padding:5px 0 6px!important;min-height:37px!important}
  .crowd-board{margin-top:3px!important;height:calc(100dvh - 238px)!important;min-height:54dvh!important;max-height:none!important}
  .game-footer{padding:5px 0 0!important;margin:0!important;min-height:28px!important}
  .fh-scroll{padding-left:15px;padding-right:15px}.fh-cols,.fh-section li{grid-template-columns:52px 1fr .9fr 44px;gap:5px}
}
`;document.head.appendChild(s)}

function run(){style();button();tagLayout();wireMistakes();syncBaseAge();paintAge();gameover()}
function start(){run();clock.lastTick=performance.now();setInterval(()=>tick(performance.now()),250);new MutationObserver(()=>requestAnimationFrame(run)).observe(document.documentElement,{childList:true,subtree:true})}
document.readyState==='loading'?addEventListener('DOMContentLoaded',start,{once:true}):start();
})();
