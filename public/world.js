(()=>{
  const st={board:null,panX:0,panY:0,userZoom:1,pointers:new Map(),pinch0:0,zoom0:1,dragged:false,queued:false,uid:0};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const liveAge=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  const round=()=>window.__FH_ROUND__?.get?.()||{age:liveAge(),seed:`fallback:${liveAge()}`};
  const population=a=>clamp(Math.round(44+a*2.45),44,220);
  const worldScale=a=>a<12?1:clamp(1+(a-12)*.036,1,2.72);
  const people=b=>[...b.querySelectorAll('img.crowd-figure:not(.harald-target)')];
  const sources=b=>people(b).filter(x=>!x.classList.contains('fh-extra-crowd')&&x.getAttribute('src'));

  function ensurePopulation(b,a,seed){
    const desired=Math.max(1,population(a)-1),base=sources(b);
    let all=people(b),extras=all.filter(x=>x.classList.contains('fh-extra-crowd'));
    while(all.length>desired&&extras.length){extras.pop().remove();all=people(b)}
    while(all.length<desired&&(base.length||window.__FH_VERIFIED_RUNTIME?.pool?.().length)){
      const i=all.length,s=hash(`${seed}|clone|${i}`);let im;
      if(base.length){im=base[s%base.length].cloneNode(false)}else{im=document.createElement('img');const pool=window.__FH_VERIFIED_RUNTIME?.pool?.()||[];if(pool.length)im.src=pool[s%pool.length]}
      im.classList.remove('harald-target');im.classList.add('crowd-figure','is-prop','fh-extra-crowd');im.removeAttribute('id');im.dataset.fhUid=`x${st.uid++}`;im.dataset.fhGenerated='1';im.alt='';im.draggable=false;b.appendChild(im);all.push(im)
    }
    all=people(b);all.forEach((img,i)=>img.dataset.fhSlot=String(i));
    document.documentElement.dataset.fhPopulation=String(all.length+1);
  }

  function stableKey(img,i){return img.classList.contains('harald-target')?'harald':`person:${img.dataset.fhSlot??i}`}
  function layout(b,a,seed){
    const figs=[...b.querySelectorAll('img.crowd-figure')];if(!figs.length)return;
    const r=b.getBoundingClientRect(),aspect=clamp(r.width/Math.max(1,r.height),.42,1.5),n=figs.length;
    const virtual=worldScale(a),cols=Math.max(4,Math.ceil(Math.sqrt((n*aspect)/(virtual*virtual)))),rows=Math.ceil(n/cols),slots=[];
    for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++){
      const h=hash(`${seed}|slot|${rr}|${c}`),jx=((h&255)/255-.5)*.42,jy=(((h>>>8)&255)/255-.5)*.35;
      slots.push({x:(c+.5+jx)/cols*100,y:(rr+.5+jy)/rows*100,k:hash(`${seed}|slotorder|${rr}|${c}`)})
    }
    slots.sort((x,y)=>x.k-y.k);
    const ordered=figs.map((img,i)=>({img,key:stableKey(img,i)})).sort((x,y)=>hash(`${seed}|${x.key}`)-hash(`${seed}|${y.key}`));
    ordered.forEach(({img},i)=>{const s=slots[i%slots.length];img.style.left=`${clamp(s.x,2.8,97.2).toFixed(2)}%`;img.style.top=`${clamp(s.y,2.8,97.2).toFixed(2)}%`;img.style.right='auto';img.style.bottom='auto';img.style.position='absolute';img.style.zIndex=img.classList.contains('harald-target')?'8':String(1+(hash(stableKey(img,i))%3))})
  }

  function limits(e){return{x:Math.max(0,(e-1)*49)+5,y:Math.max(0,(e-1)*49)+5}}
  function apply(){
    st.queued=false;const b=document.querySelector('.crowd-board');if(!b)return;
    if(st.board!==b){st.board=b;st.panX=st.panY=0;st.userZoom=1;st.pointers.clear();wire(b)}
    const rs=round(),a=rs.age,seed=rs.seed;ensurePopulation(b,a,seed);layout(b,a,seed);
    const base=worldScale(a),e=base*st.userZoom,lim=limits(e);st.panX=clamp(st.panX,-lim.x,lim.x);st.panY=clamp(st.panY,-lim.y,lim.y);
    b.dataset.fhNavigable=base>1.01?'1':'0';document.documentElement.dataset.fhWorldScale=e.toFixed(2);const r=b.getBoundingClientRect();
    b.querySelectorAll('img.crowd-figure').forEach(img=>{const left=parseFloat(img.style.left),top=parseFloat(img.style.top);if(!Number.isFinite(left)||!Number.isFinite(top))return;const dx=((left-50)/100*r.width*(e-1))+(st.panX/100*r.width),dy=((top-50)/100*r.height*(e-1))+(st.panY/100*r.height);img.style.setProperty('--fh-world-dx',`${dx.toFixed(1)}px`);img.style.setProperty('--fh-world-dy',`${dy.toFixed(1)}px`);const role=img.classList.contains('harald-target')?(parseFloat(img.style.getPropertyValue('--fh-harald-boost'))||1):(parseFloat(img.dataset.fhAssetScale)||1);img.style.setProperty('--fh-render-scale',String(role*st.userZoom));img.style.transform='translate(calc(-50% + var(--fh-world-dx,0px)),calc(-50% + var(--fh-world-dy,0px)))'});
    window.__FH_CROWD_FIX__?.schedule?.();
  }
  function schedule(){if(st.queued)return;st.queued=true;requestAnimationFrame(apply)}
  function dist(){const p=[...st.pointers.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}
  function wire(b){
    if(b.dataset.fhWorldWired)return;b.dataset.fhWorldWired='1';
    b.addEventListener('pointerdown',e=>{if(b.dataset.fhNavigable!=='1')return;st.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY});st.dragged=false;b.setPointerCapture?.(e.pointerId);if(st.pointers.size===2){st.pinch0=dist();st.zoom0=st.userZoom}},{passive:true});
    b.addEventListener('pointermove',e=>{const p=st.pointers.get(e.pointerId);if(!p)return;const nx=e.clientX,ny=e.clientY,dx=nx-p.x,dy=ny-p.y;p.x=nx;p.y=ny;if(Math.hypot(nx-p.sx,ny-p.sy)>7)st.dragged=true;const r=b.getBoundingClientRect();if(st.pointers.size>=2){const d=dist();if(st.pinch0>0)st.userZoom=clamp(st.zoom0*d/st.pinch0,.82,1.9)}else if(st.dragged){st.panX+=dx/r.width*100;st.panY+=dy/r.height*100}schedule()},{passive:true});
    const end=e=>{st.pointers.delete(e.pointerId);if(st.pointers.size<2){st.pinch0=0;st.zoom0=st.userZoom}};b.addEventListener('pointerup',end,{passive:true});b.addEventListener('pointercancel',end,{passive:true});b.addEventListener('click',e=>{if(st.dragged){e.preventDefault();e.stopImmediatePropagation();st.dragged=false}},true)
  }
  function style(){if(document.getElementById('fh-world-style'))return;const s=document.createElement('style');s.id='fh-world-style';s.textContent=`.crowd-board[data-fh-navigable="1"]{touch-action:none!important;cursor:grab}.crowd-board[data-fh-navigable="1"]:active{cursor:grabbing}.crowd-board img.crowd-figure{transform-origin:center!important;transition:none!important;animation:none!important}.fh-nav-hud{display:none!important}`;document.head.appendChild(s)}
  style();schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('resize',schedule,{passive:true});visualViewport?.addEventListener('resize',schedule,{passive:true});document.addEventListener('fh:round',()=>{st.panX=st.panY=0;st.userZoom=1;schedule()});window.__FH_WORLD__={schedule,population,get scale(){return worldScale(round().age)},get zoom(){return st.userZoom}};
})();
