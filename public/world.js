(()=>{
  const st={board:null,age:-1,panX:0,panY:0,userZoom:1,pointers:new Map(),pinch0:0,zoom0:1,dragged:false,queued:false,uid:0,roundKey:null,roundAge:0,pos:new Map(),slotCss:'',layoutKey:'',points:[]};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const age=()=>Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent));
  // Folketalet følgjer arealet, ikkje alderen direkte.
  //
  // Før voks verda med `difficulty` medan folketalet voks for seg — så meir
  // zoom spreidde dei same få figurane tynnare utover. Ved 30 år var verda 2,8
  // skjermflater stor med 69 personar i, altså rundt ti synlege om gongen: eit
  // tomt rom å panorere rundt i, ikkje ei folkemengd. No er tettleiken fast, og
  // det er *arealet* som veks med alderen. Du ser like mange uansett kor gammal
  // Harald er — det er området som blir større.
  const DENSITY=66;                                   // figurar per skjermflate
  const MAX_FIGURES=260;                              // tak av omsyn til telefonen
  function span(a){return a<6?1:clamp(1+(a-6)*.0195,1,2.35)}   // skjermar på tvers
  const population=a=>clamp(Math.round(DENSITY*span(a)**2),DENSITY,MAX_FIGURES);
  function difficulty(a){return span(a)}
  // Folkemengda høyrer til runden, ikkje til klokka. crowd-assets.js låser
  // kjeldene til Harald er funnen; utan det same låset her ville kvart år-tikk
  // (kvart 7.-10. sekund) endre folketalet og stokke om heile brettet medan du
  // står midt i eit søk. Søkeområdet er låst til runden på same vis, så
  // ingenting rører seg før kongen er funnen — då veks verda med den nye alderen.
  function roundKey(b){return b.dataset.fhRealRound||'0'}
  function roundAge(b,a){const k=roundKey(b);if(st.roundKey!==k){st.roundKey=k;st.roundAge=a}return st.roundAge}
  function advanceRound(){st.panX=st.panY=0;st.userZoom=1;st.roundKey=null;schedule()}
  function people(b){return [...b.querySelectorAll('img.crowd-figure:not(.harald-target)')]}
  function sources(b){return people(b).filter(x=>!x.classList.contains('fh-extra-crowd')&&x.getAttribute('src'))}
  function ensurePopulation(b,a){
    const desired=Math.max(1,population(a)-1),base=sources(b);let all=people(b),extras=all.filter(x=>x.classList.contains('fh-extra-crowd'));
    while(all.length>desired&&extras.length){extras.pop().remove();all=people(b)}
    while(all.length<desired&&base.length){const i=all.length,seed=hash(`${a}|clone|${i}`),src=base[seed%base.length],im=src.cloneNode(false);im.classList.remove('harald-target');im.classList.add('crowd-figure','is-prop','fh-extra-crowd');im.removeAttribute('id');im.dataset.fhUid=`x${st.uid++}`;im.dataset.fhGenerated='1';im.alt='';im.draggable=false;b.appendChild(im);all.push(im)}
    const count=all.length+1;document.documentElement.dataset.fhPopulation=String(count);updateCounter(count)
  }
  function updateCounter(count){const l=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&x.textContent?.trim()==='FOLK');if(!l)return;let p=l.parentElement;for(let d=0;p&&d<3;d++,p=p.parentElement){const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^\s*\d+\s*$/.test(x.textContent||''));if(v){v.textContent=String(count);return}}}
  function assignUids(figs){figs.forEach((img,i)=>{if(!img.dataset.fhUid)img.dataset.fhUid=img.classList.contains('harald-target')?'harald':`o${i}`})}
  // Kvar figur ligg på left:50%/top:50%, og heile plasseringa skjer i transformen
  // ut frå --fh-x/--fh-y. Vi les aldri posisjonen tilbake frå DOM-en: React eig
  // dei opphavlege figurane og Harald, og skriv style-attributtet på nytt ved
  // kvar render. Les vi derifrå, blir dei elementa hoppa over medan klonane
  // våre held fram — og då glir mengda frå kongen.
  // Plasseringa er blå støy (Poisson-disc), ikkje eit rutenett.
  //
  // Eit rutenett med litt slingring les framleis som eit rutenett: det gamle
  // utlegget la 18 figurar i seks tydelege kolonnar med ±2 % slingring, og det
  // ser ut som eit rekneark, ikkje ei folkemengd. Poisson-disc trekkjer punkt
  // som held ein minsteavstand til kvarandre, så dekninga blir jamn utan at det
  // finst rader eller kolonnar å lese. Minsteavstanden gjer òg at ingen kan bli
  // heilt gøymd bak ein annan.
  function rng(seed){
    let h=hash(seed);
    return()=>{h=(h+0x6D2B79F5)>>>0;let t=h;t=Math.imul(t^(t>>>15),1|t);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
  }
  // Bridson: kast piler rundt aktive punkt, godta dei som held avstanden r.
  function darts(w,h,r,rand,k=16){
    const cell=r/Math.SQRT2,gw=Math.max(1,Math.ceil(w/cell)),gh=Math.max(1,Math.ceil(h/cell));
    const grid=new Int32Array(gw*gh).fill(-1),pts=[],active=[];
    const put=q=>{grid[Math.floor(q[1]/cell)*gw+Math.floor(q[0]/cell)]=pts.length;pts.push(q);active.push(pts.length-1)};
    const free=q=>{
      if(q[0]<0||q[0]>=w||q[1]<0||q[1]>=h)return false;
      const i=Math.floor(q[0]/cell),j=Math.floor(q[1]/cell);
      for(let jj=Math.max(0,j-2);jj<=Math.min(gh-1,j+2);jj++)
        for(let ii=Math.max(0,i-2);ii<=Math.min(gw-1,i+2);ii++){
          const idx=grid[jj*gw+ii];
          if(idx>=0&&Math.hypot(pts[idx][0]-q[0],pts[idx][1]-q[1])<r)return false;
        }
      return true;
    };
    put([rand()*w,rand()*h]);
    while(active.length){
      const ai=Math.floor(rand()*active.length),p=pts[active[ai]];
      let placed=false;
      for(let t=0;t<k;t++){
        const ang=rand()*Math.PI*2,d=r*(1+rand());
        const q=[p[0]+Math.cos(ang)*d,p[1]+Math.sin(ang)*d];
        if(free(q)){put(q);placed=true;break}
      }
      if(!placed)active.splice(ai,1);
    }
    return pts;
  }
  // Skrink radien til det er plass til alle, og legg dei ut i prosent av
  // brettet. z følgjer y, så dei nedste står framfor — slik ei mengd ser ut.
  function spread(n,ratio,rand){
    const INSET=3;
    // Finn ein radius som gir plass til alle, og hugs kva radius det blei.
    let r=Math.sqrt(ratio/Math.max(1,n))*1.06,used=r,pts=[];
    for(let i=0;i<9&&pts.length<n;i++,r*=.88){pts=darts(ratio,1,r,rand);used=r}
    for(let i=pts.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pts[i],pts[j]]=[pts[j],pts[i]]}
    // Rein blå støy er mekanisk jamn — like langt til naboen overalt. Ei
    // slingring på ein halv radius gir klyngjer og opningar slik folk faktisk
    // står, utan å opne dei store tomme felta eit tilfeldig utval ville late
    // etter seg. Halve radien er lite nok til at ingen blir heilt gøymd.
    const j=used*.5,keep=used*.66,span=100-INSET*2;
    const chosen=pts.slice(0,n);
    // Slingringa må ikkje føre nokon oppå ein annan. Godta eit kast berre om
    // det held minsteavstanden til alle andre; elles blir punktet ståande.
    const near=(q,skip)=>chosen.some((o,k)=>k!==skip&&Math.hypot(o[0]-q[0],o[1]-q[1])<keep);
    chosen.forEach((q,i)=>{
      const a=rand()*Math.PI*2,d=rand()*j;
      const t=[clamp(q[0]+Math.cos(a)*d,0,ratio),clamp(q[1]+Math.sin(a)*d,0,1)];
      if(!near(t,i))chosen[i]=t;
    });
    return chosen
      .map(q=>({x:q[0],y:q[1]}))
      .map(q=>({x:INSET+q.x/ratio*span,y:INSET+q.y*span}))
      .sort((a,b)=>a.y-b.y)
      .map((q,i)=>({...q,z:1+i}));
  }
  // Sådd av runden, ikkje berre alderen: ein runde som blir vunnen før neste
  // år-tikk skal ikkje kome tilbake i nøyaktig same plassering.
  function layout(b,seed){
    const figs=[...b.querySelectorAll('img.crowd-figure')];if(!figs.length)return;
    assignUids(figs);
    const r=b.getBoundingClientRect(),n=figs.length;
    const ratio=clamp(r.width/Math.max(1,r.height),.3,3.2);
    // Å trekkje punkta er for dyrt til å gjere kvar frame, og dei endrar seg
    // berre når runden, folketalet eller brettforma gjer det.
    const key=`${seed}|${n}|${ratio.toFixed(2)}`;
    if(key!==st.layoutKey){st.layoutKey=key;st.points=spread(n,ratio,rng(key))}
    const pts=st.points;if(!pts.length)return;
    figs.sort((x,y)=>hash(`${seed}|${x.dataset.fhUid}`)-hash(`${seed}|${y.dataset.fhUid}`));
    st.pos.clear();
    figs.forEach((img,i)=>{
      const q=pts[i%pts.length],king=img.classList.contains('harald-target');
      const role=king?(parseFloat(img.style.getPropertyValue('--fh-harald-boost'))||1):(parseFloat(img.dataset.fhAssetScale)||1);
      img.dataset.fhSlot=String(i);
      st.pos.set(i,{x:q.x,y:q.y,role,z:q.z});
    });
    paintSlots();
  }
  // Plasseringa bur i eit stilark, ikkje i inline-stil, så ein React-render
  // ikkje kan vaske henne bort. Arket blir berre skrive om når noko faktisk
  // endrar seg.
  function paintSlots(){
    let css='';
    st.pos.forEach((v,i)=>{css+=`.crowd-board img[data-fh-slot="${i}"]{left:${v.x.toFixed(2)}%!important;top:${v.y.toFixed(2)}%!important;--fh-x:${v.x.toFixed(2)};--fh-y:${v.y.toFixed(2)};--fh-role:${v.role};z-index:${v.z}!important}`});
    if(css===st.slotCss)return;
    st.slotCss=css;
    let el=document.getElementById('fh-world-slots');
    if(!el){el=document.createElement('style');el.id='fh-world-slots';document.head.appendChild(el)}
    el.textContent=css;
  }
  function limits(e){const extra=Math.max(0,(e-1)*52);return{x:extra+8,y:extra+10}}
  function apply(){
    st.queued=false;const b=document.querySelector('.crowd-board');if(!b)return;if(st.board!==b){st.board=b;st.panX=st.panY=0;st.userZoom=1;st.pointers.clear();st.roundKey=null;wire(b)}const a=age(),ra=roundAge(b,a);ensurePopulation(b,ra);layout(b,`${roundKey(b)}|${ra}`);
    const base=difficulty(ra),e=base*st.userZoom,lim=limits(e);st.panX=clamp(st.panX,-lim.x,lim.x);st.panY=clamp(st.panY,-lim.y,lim.y);b.dataset.fhNavigable=base>1.015?'1':'0';document.documentElement.dataset.fhWorldScale=e.toFixed(2);
    // Éi transform-formel i CSS, mata av seks delte variablar på <html>. Alle
    // figurane reknar ut plasseringa si frå dei same tala, så mengda og kongen
    // kan ikkje gli frå kvarandre — og React når ikkje <html>.
    const r=b.getBoundingClientRect(),root=document.documentElement.style;
    root.setProperty('--fh-w',`${r.width.toFixed(1)}px`);
    root.setProperty('--fh-h',`${r.height.toFixed(1)}px`);
    root.setProperty('--fh-e1',(e-1).toFixed(4));
    root.setProperty('--fh-panx',st.panX.toFixed(3));
    root.setProperty('--fh-pany',st.panY.toFixed(3));
    root.setProperty('--fh-zoom',st.userZoom.toFixed(4));
    hud(b,base);window.__FH_VERIFIED_RUNTIME?.schedule?.()
  }
  function schedule(){if(st.queued)return;st.queued=true;requestAnimationFrame(apply)}
  function hud(b,base){let h=b.querySelector('.fh-nav-hud');if(base<=1.015){h?.remove();return}if(!h){h=document.createElement('div');h.className='fh-nav-hud';h.innerHTML='<span>DRA</span><b>1.0×</b>';b.appendChild(h)}h.querySelector('b').textContent=`${st.userZoom.toFixed(1)}×`;if(!sessionStorage.getItem('fh-nav-seen')){h.classList.add('hint');h.querySelector('span').textContent='DRA · KNIP FOR Å ZOOME';setTimeout(()=>{h.classList.remove('hint');h.querySelector('span').textContent='DRA'},2300);sessionStorage.setItem('fh-nav-seen','1')}}
  function dist(){const p=[...st.pointers.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}
  function wire(b){if(b.dataset.fhWorldWired)return;b.dataset.fhWorldWired='1';b.addEventListener('pointerdown',e=>{if(b.dataset.fhNavigable!=='1')return;st.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY});st.dragged=false;try{b.setPointerCapture?.(e.pointerId)}catch{}if(st.pointers.size===2){st.pinch0=dist();st.zoom0=st.userZoom}},{passive:true});b.addEventListener('pointermove',e=>{const p=st.pointers.get(e.pointerId);if(!p)return;const nx=e.clientX,ny=e.clientY,dx=nx-p.x,dy=ny-p.y;p.x=nx;p.y=ny;if(Math.hypot(nx-p.px,ny-p.py)>6)st.dragged=true;const r=b.getBoundingClientRect();if(st.pointers.size>=2){const d=dist();if(st.pinch0>0)st.userZoom=clamp(st.zoom0*d/st.pinch0,.82,1.85)}else if(st.dragged){st.panX+=dx/r.width*100;st.panY+=dy/r.height*100}schedule()},{passive:true});const end=e=>{st.pointers.delete(e.pointerId);if(st.pointers.size<2){st.pinch0=0;st.zoom0=st.userZoom}};b.addEventListener('pointerup',end,{passive:true});b.addEventListener('pointercancel',end,{passive:true});b.addEventListener('click',e=>{if(st.dragged){e.preventDefault();e.stopImmediatePropagation();st.dragged=false}},true)}
  function style(){if(document.getElementById('fh-world-style'))return;const s=document.createElement('style');s.id='fh-world-style';s.textContent=`
    .crowd-board img.crowd-figure{position:absolute!important;right:auto!important;bottom:auto!important;--fh-render-scale:calc(var(--fh-role,1) * var(--fh-zoom,1));translate:calc(-50% + (var(--fh-x,50) - 50) / 100 * var(--fh-w,0px) * var(--fh-e1,0) + var(--fh-panx,0) / 100 * var(--fh-w,0px)) calc(-50% + (var(--fh-y,50) - 50) / 100 * var(--fh-h,0px) * var(--fh-e1,0) + var(--fh-pany,0) / 100 * var(--fh-h,0px))!important;scale:var(--fh-render-scale,1)!important;transform:none!important}.crowd-board{position:relative!important;overflow:hidden!important}.crowd-board[data-fh-navigable="1"]{touch-action:none!important;cursor:grab}.crowd-board[data-fh-navigable="1"]:active{cursor:grabbing}.crowd-board img.crowd-figure{transform-origin:center!important;transition:none!important;animation:none!important}.fh-nav-hud{position:absolute;right:8px;bottom:8px;z-index:30;display:flex;gap:7px;align-items:center;padding:6px 8px;border:1px solid #bdb4a5;border-radius:9px;background:#fffdf7e8;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);pointer-events:none;color:#5f594f}.fh-nav-hud span{font:800 7px/1 system-ui;letter-spacing:.13em}.fh-nav-hud b{font:600 12px/1 Georgia}.fh-nav-hud.hint span{font-size:8px}
  `;document.head.appendChild(s)}
  style();schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('resize',schedule,{passive:true});visualViewport?.addEventListener('resize',schedule,{passive:true});window.__FH_WORLD__={schedule,advanceRound,population,get scale(){return difficulty(st.board?roundAge(st.board,age()):age())},get zoom(){return st.userZoom}};
})();
