(()=>{
  const state={board:null,world:null,zoom:1,lastBase:1,lastW:0,lastH:0,pinch:null,uid:0};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const age=()=>Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent));
  const population=a=>clamp(Math.round(18+a*1.9),18,140);
  const worldBase=a=>a<8?1:clamp(Math.sqrt(population(a)/26),1,2.45);
  function ensureWorld(board){
    let world=board.querySelector(':scope > .fh-world');
    if(!world){world=document.createElement('div');world.className='fh-world';board.insertBefore(world,board.firstChild)}
    [...board.querySelectorAll('img.crowd-figure')].forEach(img=>{if(img.parentElement!==world)world.appendChild(img)});
    state.world=world;return world;
  }
  function sources(world){return [...world.querySelectorAll('img.crowd-figure:not(.harald-target):not(.fh-extra-crowd)')].filter(x=>x.getAttribute('src'))}
  function ensurePopulation(board,world,a){
    const desired=Math.max(1,population(a)-1);let extras=[...world.querySelectorAll('img.fh-extra-crowd')];
    while(extras.length&&world.querySelectorAll('img.crowd-figure:not(.harald-target)').length>desired){extras.pop().remove()}
    let people=[...world.querySelectorAll('img.crowd-figure:not(.harald-target)')],src=sources(world);if(!src.length)src=people;
    while(people.length<desired&&src.length){const i=people.length,seed=hash(`${a}|extra|${i}`),base=src[seed%src.length];const img=base.cloneNode(false);img.classList.remove('harald-target');img.classList.add('crowd-figure','is-prop','fh-extra-crowd');img.removeAttribute('id');img.dataset.fhUid=`x${state.uid++}`;img.dataset.fhGenerated='1';img.alt='';img.draggable=false;world.appendChild(img);people.push(img)}
    document.documentElement.dataset.fhPopulation=String(people.length+1);updatePeopleCounter(people.length+1)
  }
  function updatePeopleCounter(count){const label=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&x.textContent?.trim()==='FOLK');if(!label)return;let p=label.parentElement;for(let d=0;p&&d<3;d++,p=p.parentElement){const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^\s*\d+\s*$/.test(x.textContent||''));if(v){v.textContent=String(count);return}}}
  function assignUids(figs){figs.forEach((img,i)=>{if(!img.dataset.fhUid)img.dataset.fhUid=img.classList.contains('harald-target')?'harald':`o${i}`})}
  function layout(world,a){
    const figs=[...world.querySelectorAll('img.crowd-figure')];if(!figs.length)return;assignUids(figs);
    const board=state.board,aspect=Math.max(.52,Math.min(1.7,(board.clientWidth||1)/(board.clientHeight||1))),n=figs.length,cols=Math.max(3,Math.ceil(Math.sqrt(n*aspect))),rows=Math.ceil(n/cols),slots=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const seed=hash(`${a}|slot|${r}|${c}`),jx=((seed&255)/255-.5)*.34,jy=(((seed>>>8)&255)/255-.5)*.28;slots.push({x:(c+.5+jx)/cols*100,y:(r+.5+jy)/rows*100,k:hash(`${a}|slotorder|${r}|${c}`)})}
    slots.sort((x,y)=>x.k-y.k);figs.sort((x,y)=>hash(`${a}|${x.dataset.fhUid}`)-hash(`${a}|${y.dataset.fhUid}`));
    figs.forEach((img,i)=>{const s=slots[i%slots.length];img.style.left=`${clamp(s.x,2.6,97.4).toFixed(2)}%`;img.style.top=`${clamp(s.y,2.5,97.5).toFixed(2)}%`;img.style.right='auto';img.style.bottom='auto';img.style.translate='';img.style.position='absolute';img.style.zIndex=img.classList.contains('harald-target')?'6':String(1+(hash(img.dataset.fhUid)%3))})
  }
  function personSize(board,a,zoom){const base=clamp(board.clientHeight*.084,52,80);board.style.setProperty('--fh-person-px',`${(base*zoom).toFixed(1)}px`);const factor=a<=2?1.12:a<=6?1.08:a<=15?1.06:1.05;board.style.setProperty('--fh-harald-px',`${(base*factor*zoom).toFixed(1)}px`)}
  function renderStage(board,world,a,focus){
    const base=worldBase(a),zoom=state.zoom,effective=base*zoom,oldW=state.lastW||world.offsetWidth||board.clientWidth,oldH=state.lastH||world.offsetHeight||board.clientHeight;
    let rx=.5,ry=.5;if(focus){rx=focus.rx;ry=focus.ry}else if(oldW&&oldH){rx=(board.scrollLeft+board.clientWidth/2)/oldW;ry=(board.scrollTop+board.clientHeight/2)/oldH}
    const w=Math.max(board.clientWidth,Math.round(board.clientWidth*effective)),h=Math.max(board.clientHeight,Math.round(board.clientHeight*effective));world.style.width=`${w}px`;world.style.height=`${h}px`;state.lastW=w;state.lastH=h;state.lastBase=base;personSize(board,a,zoom);
    board.dataset.fhExplore=base>1.02?'1':'0';document.documentElement.dataset.fhWorld=effective.toFixed(2);updateHint(board,base);
    requestAnimationFrame(()=>{board.scrollLeft=clamp(rx*w-board.clientWidth/2,0,Math.max(0,w-board.clientWidth));board.scrollTop=clamp(ry*h-board.clientHeight/2,0,Math.max(0,h-board.clientHeight))})
  }
  function updateHint(board,base){let h=board.parentElement?.querySelector('.fh-explore-hint');if(base<=1.02){h?.remove();return}if(!h){h=document.createElement('div');h.className='fh-explore-hint';h.textContent='Dra for å leite · knip for å zoome';board.insertAdjacentElement('afterend',h)}h.dataset.level=base>1.8?'wide':'mid'}
  function pinchSetup(board){if(board.dataset.fhPinch)return;board.dataset.fhPinch='1';
    board.addEventListener('touchstart',e=>{if(e.touches.length!==2)return;const [a,b]=e.touches,d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r=board.getBoundingClientRect(),cx=(a.clientX+b.clientX)/2-r.left+board.scrollLeft,cy=(a.clientY+b.clientY)/2-r.top+board.scrollTop;state.pinch={d,z:state.zoom,rx:cx/(state.lastW||board.clientWidth),ry:cy/(state.lastH||board.clientHeight)}},{passive:true});
    board.addEventListener('touchmove',e=>{if(e.touches.length!==2||!state.pinch)return;e.preventDefault();const [a,b]=e.touches,d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);state.zoom=clamp(state.pinch.z*d/state.pinch.d,.82,1.7);renderStage(board,state.world,age(),{rx:state.pinch.rx,ry:state.pinch.ry})},{passive:false});
    board.addEventListener('touchend',e=>{if(e.touches.length<2)state.pinch=null},{passive:true});
  }
  function style(){if(document.getElementById('fh-explore-style'))return;const s=document.createElement('style');s.id='fh-explore-style';s.textContent=`
    .crowd-board{position:relative!important;overflow:hidden!important}.crowd-board[data-fh-explore="1"]{overflow:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-x pan-y;border-color:#c9c0b0}.fh-world{position:relative;min-width:100%;min-height:100%;background:#fff;contain:layout paint}.fh-world img.crowd-figure{position:absolute!important;margin:0!important}.fh-explore-hint{flex:0 0 auto;text-align:center;padding:4px 0 1px;color:#8b8275;font:italic 11px/1.1 Georgia,serif;pointer-events:none}.fh-explore-hint[data-level="wide"]{color:#6d6559}.crowd-board::-webkit-scrollbar{display:none}.crowd-board{scrollbar-width:none}
  `;document.head.appendChild(s)}
  let scheduled=false;
  function run(){scheduled=false;style();const board=document.querySelector('.crowd-board');if(!board)return;if(state.board!==board){state.board=board;state.world=null;state.zoom=1;state.lastW=state.lastH=0}const a=age(),world=ensureWorld(board);ensurePopulation(board,world,a);layout(world,a);renderStage(board,world,a);pinchSetup(board);window.__FH_VERIFIED_RUNTIME?.schedule?.()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});window.__FH_EXPLORE__={schedule,population,worldBase,get zoom(){return state.zoom}};
})();
