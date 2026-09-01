(()=>{
  const st={board:null,age:-1,panX:0,panY:0,userZoom:1,pointers:new Map(),pinch0:0,zoom0:1,dragged:false,queued:false,uid:0,roundKey:null,roundAge:0,pos:new Map(),slotCss:'',layoutKey:'',spots:new Map()};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  // FNV blandar ikkje ferdig til slutt: to strengar som skil seg berre i siste
  // teiknet får hashar som ligg éin primtalsmultiplikasjon frå kvarandre, og i
  // ei mengd på eit par hundre er det nærmaste nabo. Sorterte vi figurane på
  // hashen aleine, hamna `d12-0`, `d12-1` og `d12-2` på tre punkt etter
  // kvarandre — og lokkedukkene stod på rad tvers over torget. Ei avslutta
  // blanding gjer siste teiknet like mykje verdt som dei andre.
  const mix=v=>{v=Math.imul(v^(v>>>16),2246822507);v=Math.imul(v^(v>>>13),3266489909);return (v^(v>>>16))>>>0};
  const shuffleKey=(seed,uid)=>mix(hash(`${seed}|${uid}`));
  const age=()=>Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent));
  // Vanskegraden.
  //
  // Før var tettleiken fast på 66 og verda voks berre med alderen — og sidan
  // runden aldri gjekk framover i det heile, stod begge stille: 66 personar på
  // éin skjerm, frå 1937 til krona fall av. No veks alt tre vegar samstundes,
  // og dei tre saman er heile kurva:
  //
  //   fleire folk  · 46 ved fødselen, 260 rundt 30 år
  //   mindre folk  · figurhøgda krympar frå 8,7 % til 4,9 % av brettet
  //   større torg  · frå éin skjerm til 2,6 skjermflater å leite over
  //
  // Rekninga bak: oppstraums fyller krona med 7,75 − 0,68·sekund når du finn
  // han, og tappar 2–4,75 i sekundet. Eit funn som tek meir enn tre sekund er
  // netto tap. Det er difor det held å gjere han vanskeleg å sjå — økonomien
  // gjer resten, og eit spel varer eit par minutt.
  const BASE_FIGURES=46;
  const MAX_FIGURES=260;                              // tak av omsyn til telefonen
  function span(a){return clamp(1+Math.max(0,a-6)*.028,1,1.6)}   // skjermar på tvers
  const population=a=>clamp(Math.round(BASE_FIGURES+a*7.2),BASE_FIGURES,MAX_FIGURES);
  const bodyHeight=a=>clamp(9.4-Math.log2(a+2)*.72,4.9,9.4);     // figurhøgd i % av brettet
  function difficulty(a){return span(a)}
  function roundKey(b){return b.dataset.fhRealRound||'0'}
  function roundAge(b,a){const k=roundKey(b);if(st.roundKey!==k){st.roundKey=k;st.roundAge=a}return st.roundAge}
  function advanceRound(){st.panX=st.panY=0;st.userZoom=1;st.roundKey=null;schedule()}
  function people(b){return [...b.querySelectorAll('img.crowd-figure:not(.harald-target),img.fh-figure:not(.harald-target)')]}
  // Alt som skal leggjast ut, kongen medrekna. Han er ein <button>, ikkje eit
  // <img>, så eit reint bilet-søk let han stå att der React sette han — og då
  // glir han frå mengda i det sekundet du dreg eller kniper.
  const isKing=el=>el.classList.contains('harald-target');
  function figures(b){return [...b.querySelectorAll('img.crowd-figure,img.fh-figure,.harald-target')]}
  function sources(b){return people(b).filter(x=>!x.classList.contains('fh-extra-crowd')&&!x.classList.contains('fh-decoy-king')&&x.getAttribute('src'))}
  function ensurePopulation(b,a){
    const desired=Math.max(1,population(a)-1),base=sources(b);let all=people(b),extras=all.filter(x=>x.classList.contains('fh-extra-crowd'));
    while(all.length>desired&&extras.length){extras.pop().remove();all=people(b)}
    while(all.length<desired&&base.length){const i=all.length,seed=hash(`${a}|clone|${i}`),src=base[seed%base.length],im=src.cloneNode(false);im.classList.remove('harald-target');im.classList.add('crowd-figure','is-prop','fh-extra-crowd');im.removeAttribute('id');im.dataset.fhUid=`x${st.uid++}`;im.dataset.fhGenerated='1';im.alt='';im.draggable=false;b.appendChild(im);all.push(im)}
    const count=all.length+1;document.documentElement.dataset.fhPopulation=String(count);updateCounter(count)
  }
  function updateCounter(count){const l=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&x.textContent?.trim()==='FOLK');if(!l)return;let p=l.parentElement;for(let d=0;p&&d<3;d++,p=p.parentElement){const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^\s*\d+\s*$/.test(x.textContent||''));if(v){v.textContent=String(count);return}}}
  function assignUids(figs){figs.forEach((el,i)=>{if(!el.dataset.fhUid)el.dataset.fhUid=isKing(el)?'harald':`o${i}`})}
  // Kvar figur ligg på left:50%/top:50%, og heile plasseringa skjer i transformen
  // ut frå --fh-x/--fh-y. Vi les aldri posisjonen tilbake frå DOM-en: React eig
  // dei opphavlege figurane og Harald, og skriv style-attributtet på nytt ved
  // kvar render. Les vi derifrå, blir dei elementa hoppa over medan klonane
  // våre held fram — og då glir mengda frå kongen.
  // Kvar figur får si eiga plassering. Det finst ingen plassar.
  //
  // Før låg punkta i ein tabell og figurane slo opp i han med `pts[i % lengd]`.
  // Det er bokstavleg talt eit fast tal plassar, og kom det fleire figurar enn
  // punkt, delte dei plass med kvarandre. Eit rutenett med slingring er same
  // sak: seks kolonnar er seks kolonnar uansett kor mykje du ristar på dei.
  //
  // No blir kvart punkt kasta for den figuren det høyrer til: kast nokre
  // kandidatar, ta den som ligg lengst frå alle som alt står der. Det gir mjuk,
  // ujamn fordeling utan rader, kolonnar eller faste posisjonar — og alltid
  // nøyaktig like mange plasseringar som det er figurar.
  function rng(seed){
    let h=hash(seed);
    return()=>{h=(h+0x6D2B79F5)>>>0;let t=h;t=Math.imul(t^(t>>>15),1|t);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
  }
  function place(n,ratio,rand,tries=14){
    const want=Math.sqrt(ratio/Math.max(1,n))*.78,pts=[];
    for(let i=0;i<n;i++){
      let best=null,bestD=-1;
      for(let t=0;t<tries;t++){
        const q=[rand()*ratio,rand()];
        let d=Infinity;
        for(let k=0;k<pts.length;k++){
          const dd=Math.hypot(pts[k][0]-q[0],pts[k][1]-q[1]);
          if(dd<d)d=dd;
        }
        if(d>bestD){bestD=d;best=q}
        if(d>=want)break;
      }
      pts.push(best);
    }
    // z følgjer y, så dei nedste står framfor — slik ei mengd ser ut.
    const INSET=3,span=100-INSET*2;
    return pts
      .map(q=>({x:INSET+q[0]/ratio*span,y:INSET+q[1]*span}))
      .sort((a,b)=>a.y-b.y)
      .map((q,i)=>({...q,z:1+i}));
  }
  // Sådd av runden, ikkje berre alderen: ein runde som blir vunnen før neste
  // år-tikk skal ikkje kome tilbake i nøyaktig same plassering.
  function layout(b,seed){
    const figs=figures(b);if(!figs.length)return;
    assignUids(figs);
    const r=b.getBoundingClientRect(),n=figs.length;
    const ratio=clamp(r.width/Math.max(1,r.height),.3,3.2);
    const key=`${seed}|${n}|${ratio.toFixed(2)}`;
    if(key!==st.layoutKey){
      st.layoutKey=key;
      const pts=place(n,ratio,rng(key));
      // Kongen skal vere gøymd, ikkje borte. Han får eit punkt frå den fjerdedelen
      // som har mest luft rundt seg, valt av same sådd — så han aldri hamnar heilt
      // under naboen, og heller ikkje alltid er den einaste med albogerom.
      const clearance=pts.map((p,i)=>{
        let d=Infinity;
        for(let j=0;j<pts.length;j++){if(i===j)continue;const dd=Math.hypot(p.x-pts[j].x,p.y-pts[j].y);if(dd<d)d=dd}
        return d;
      });
      const airy=pts.map((_,i)=>i).sort((a,c)=>clearance[c]-clearance[a]).slice(0,Math.max(1,Math.round(n*.25)));
      const kingPt=airy[Math.floor(rng(`${key}|konge`)()*airy.length)];
      const king=figs.find(isKing);
      const rest=figs.filter(el=>el!==king).sort((x,y)=>shuffleKey(seed,x.dataset.fhUid)-shuffleKey(seed,y.dataset.fhUid));
      st.spots=new Map();
      let k=0;
      for(let i=0;i<pts.length;i++){
        const el=(king&&i===kingPt)?king:rest[k++];
        if(el)st.spots.set(el.dataset.fhUid,pts[i]);
      }
    }
    st.pos.clear();
    figs.forEach((el,i)=>{
      const q=st.spots.get(el.dataset.fhUid);if(!q)return;
      const role=parseFloat(el.dataset.fhAssetScale)||1;
      el.dataset.fhSlot=String(i);
      // Kongen ligg fremst. Kamuflasjen er farge og storleik, ikkje at nokon
      // står i vegen: hamnar han bak ein nabo, kan trykket ditt hamne på
      // naboen i staden, og runden er ikkje til å vinne same kor godt du ser.
      st.pos.set(el.dataset.fhUid,{x:q.x,y:q.y,role,z:isKing(el)?900:q.z});
    });
    paintSlots();
  }
  // Plasseringa bur i eit stilark, ikkje i inline-stil, så ein React-render
  // ikkje kan vaske henne bort. Arket blir berre skrive om når noko faktisk
  // endrar seg.
  function paintSlots(){
    let css='';
    st.pos.forEach((v,uid)=>{css+=`.crowd-board [data-fh-uid="${uid}"]{left:${v.x.toFixed(2)}%!important;top:${v.y.toFixed(2)}%!important;--fh-x:${v.x.toFixed(2)};--fh-y:${v.y.toFixed(2)};--fh-role:${v.role};z-index:${v.z}!important}`});
    if(css===st.slotCss)return;
    st.slotCss=css;
    let el=document.getElementById('fh-world-slots');
    if(!el){el=document.createElement('style');el.id='fh-world-slots';document.head.appendChild(el)}
    el.textContent=css;
  }
  function limits(e){const extra=Math.max(0,(e-1)*52);return{x:extra+8,y:extra+10}}
  function apply(){
    st.queued=false;const b=document.querySelector('.crowd-board');if(!b)return;if(st.board!==b){st.board=b;st.panX=st.panY=0;st.userZoom=1;st.pointers.clear();st.roundKey=null;wire(b)}const a=age(),ra=roundAge(b,a);b.style.setProperty('--fh-crowd-body-h',bodyHeight(ra).toFixed(2)+'%');ensurePopulation(b,ra);layout(b,`${roundKey(b)}|${ra}`);
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
  function wire(b){if(b.dataset.fhWorldWired)return;b.dataset.fhWorldWired='1';b.addEventListener('pointerdown',e=>{if(b.dataset.fhNavigable!=='1')return;st.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,px:e.clientX,py:e.clientY});st.dragged=false;try{b.setPointerCapture?.(e.pointerId)}catch{}if(st.pointers.size===2){st.pinch0=dist();st.zoom0=st.userZoom}},{passive:true});b.addEventListener('pointermove',e=>{const p=st.pointers.get(e.pointerId);if(!p)return;const nx=e.clientX,ny=e.clientY,dx=nx-p.x,dy=ny-p.y;p.x=nx;p.y=ny;if(Math.hypot(nx-p.px,ny-p.py)>6)st.dragged=true;const r=b.getBoundingClientRect();if(st.pointers.size>=2){const d=dist();if(st.pinch0>0)st.userZoom=clamp(st.zoom0*d/st.pinch0,.8,3)}else if(st.dragged){st.panX+=dx/r.width*100;st.panY+=dy/r.height*100}schedule()},{passive:true});const end=e=>{st.pointers.delete(e.pointerId);if(st.pointers.size<2){st.pinch0=0;st.zoom0=st.userZoom}};b.addEventListener('pointerup',end,{passive:true});b.addEventListener('pointercancel',end,{passive:true});b.addEventListener('click',e=>{if(st.dragged){e.preventDefault();e.stopImmediatePropagation();st.dragged=false}},true)}
  function style(){if(document.getElementById('fh-world-style'))return;const s=document.createElement('style');s.id='fh-world-style';s.textContent=`
    .crowd-board img.crowd-figure,.crowd-board img.fh-figure,.crowd-board .harald-target{position:absolute!important;right:auto!important;bottom:auto!important;--fh-render-scale:calc(var(--fh-role,1) * var(--fh-zoom,1));translate:calc(-50% + (var(--fh-x,50) - 50) / 100 * var(--fh-w,0px) * var(--fh-e1,0) + var(--fh-panx,0) / 100 * var(--fh-w,0px)) calc(-50% + (var(--fh-y,50) - 50) / 100 * var(--fh-h,0px) * var(--fh-e1,0) + var(--fh-pany,0) / 100 * var(--fh-h,0px))!important;scale:var(--fh-render-scale,1)!important;transform:none!important}.crowd-board{position:relative!important;overflow:hidden!important}.crowd-board[data-fh-navigable="1"]{touch-action:none!important;cursor:grab}.crowd-board[data-fh-navigable="1"]:active{cursor:grabbing}.crowd-board img.crowd-figure,.crowd-board img.fh-figure,.crowd-board .harald-target{transform-origin:center!important;transition:none!important;animation:none!important}.fh-nav-hud{position:absolute;right:8px;bottom:8px;z-index:30;display:flex;gap:7px;align-items:center;padding:6px 8px;border:1px solid #bdb4a5;border-radius:9px;background:#fffdf7e8;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);pointer-events:none;color:#5f594f}.fh-nav-hud span{font:800 7px/1 system-ui;letter-spacing:.13em}.fh-nav-hud b{font:600 12px/1 Georgia}.fh-nav-hud.hint span{font-size:8px}
  `;document.head.appendChild(s)}
  style();schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('resize',schedule,{passive:true});visualViewport?.addEventListener('resize',schedule,{passive:true});window.__FH_WORLD__={schedule,advanceRound,population,bodyHeight,span,get scale(){return difficulty(st.board?roundAge(st.board,age()):age())},get zoom(){return st.userZoom}};
})();
