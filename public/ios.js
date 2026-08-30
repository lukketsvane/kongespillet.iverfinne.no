(()=>{
  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS&&matchMedia('(min-width:701px)').matches)return;
  document.documentElement.classList.add('fh-ios');
  let meta=document.querySelector('meta[name="viewport"]');if(!meta){meta=document.createElement('meta');meta.name='viewport';document.head.appendChild(meta)}
  meta.content='width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content';
  // Full-bleed på telefon, målt i staden for gissa.
  //
  // All layout-CSS-en vår heng på `.game-shell.fh-compact`, og `fh-compact`
  // blir berre sett om `.game-shell` framleis finst oppstraums. Byter den
  // klassa namn, sluttar kvar einaste regel å gjelde utan eit lyd, og brettet
  // hamnar i ei smal spalte midt på skjermen. Så vi spør DOM-en i staden: gå
  // frå brettet og opp, og slakk på det som klemmer det saman.
  const SIDE=6,TOUCHED='fhIosWidened';
  const lim=(v,a,z)=>Math.max(a,Math.min(z,v));
  function relax(el){
    const cs=getComputedStyle(el),touched=[];
    if(parseFloat(cs.paddingLeft)>SIDE){el.style.setProperty('padding-left',`max(${SIDE}px,env(safe-area-inset-left))`,'important');touched.push('padding-left')}
    if(parseFloat(cs.paddingRight)>SIDE){el.style.setProperty('padding-right',`max(${SIDE}px,env(safe-area-inset-right))`,'important');touched.push('padding-right')}
    if(parseFloat(cs.marginLeft)>SIDE){el.style.setProperty('margin-left','0','important');touched.push('margin-left')}
    if(parseFloat(cs.marginRight)>SIDE){el.style.setProperty('margin-right','0','important');touched.push('margin-right')}
    const mw=parseFloat(cs.maxWidth);
    if(Number.isFinite(mw)&&mw<innerWidth){el.style.setProperty('max-width','none','important');touched.push('max-width')}
    // An explicit width narrower than the screen squeezes just as hard as a
    // max-width, and is what the first attempt at this missed.
    const w=parseFloat(cs.width);
    if(Number.isFinite(w)&&w<innerWidth-12){el.style.setProperty('width','auto','important');touched.push('width')}
    if(cs.overflowX!=='visible'){el.style.setProperty('overflow-x','visible','important');touched.push('overflow-x')}
    if(touched.length)el.dataset[TOUCHED]=[...new Set([...(el.dataset[TOUCHED]||'').split(',').filter(Boolean),...touched])].join(',');
  }
  function restore(){
    document.querySelectorAll('[data-fh-ios-widened]').forEach(el=>{
      (el.dataset[TOUCHED]||'').split(',').filter(Boolean).forEach(prop=>el.style.removeProperty(prop));
      delete el.dataset[TOUCHED];
    });
  }
  // Same problem from the other side: `html.fh-ios .crowd-board` sets
  // `height:auto;flex:1 1 0`, which only ever gives the board a height because
  // `.game-shell.fh-compact` makes the shell a fixed-height flex column. Miss
  // that class and the figures are all absolutely positioned, so the board
  // collapses to nothing. Measure the height too, and fill the screen from
  // wherever the board starts.
  const MIN_H=160,FOOT=34,BOTTOM=2;   // BOTTOM: litt luft mot skjermkanten
  function widen(){
    const b=document.querySelector('.crowd-board');
    if(!b)return;
    if(!matchMedia('(max-width:700px)').matches)return restore();
    for(let el=b.parentElement;el&&el!==document.documentElement;el=el.parentElement)relax(el);
    ['width:100%','max-width:none','margin-left:0','margin-right:0'].forEach(rule=>{
      const [prop,value]=rule.split(':');b.style.setProperty(prop,value,'important');
    });
    let r=b.getBoundingClientRect();
    // Loosening the ancestors is the tidy path, but it only works if we
    // guessed the squeezing property right. Verify, and if the board is still
    // short of the screen, place it against the edge outright.
    if(r.width<innerWidth-12||r.left>8){
      b.style.setProperty('position','relative','important');
      b.style.setProperty('width',`${innerWidth}px`,'important');
      b.style.setProperty('left',`${Math.round(-r.left)}px`,'important');
      r=b.getBoundingClientRect();
      if(Math.abs(r.left)>1){
        b.style.setProperty('left',`${Math.round(-r.left+parseFloat(b.style.left||0))}px`,'important');
        r=b.getBoundingClientRect();
      }
    }
    fitHeight(b);
  }
  // Lås sida til skjermen og gi brettet resten.
  //
  // Same problem som breidda: `.game-shell.fh-compact` skulle gjere skalet til
  // ei flex-kolonne med fast høgd, og gjer det ikkje, blir sida høgare enn
  // skjermen og du kan skrolle. Så vi måler i staden — set ei høgd på brettet,
  // sjekk om dokumentet framleis er høgare enn skjermen, og trekk frå
  // differansen til det stemmer. Ingenting å skrolle når ingenting stikk ut.
  function fitHeight(b){
    const doc=document.documentElement,body=document.body;
    const vh=Math.round(visualViewport?.height||innerHeight);
    doc.style.setProperty('height',`${vh}px`,'important');
    doc.style.setProperty('overflow','hidden','important');
    doc.style.setProperty('overscroll-behavior','none','important');
    if(body){
      body.style.setProperty('height',`${vh}px`,'important');
      body.style.setProperty('overflow','hidden','important');
      body.style.setProperty('overscroll-behavior','none','important');
      body.style.setProperty('margin','0','important');
    }
    b.style.setProperty('max-height','none','important');
    b.style.setProperty('min-height','0','important');
    b.style.setProperty('flex','0 0 auto','important');
    // Kor langt ned innhaldet faktisk rekk. scrollHeight duger ikkje: body har
    // overflow:hidden, så det som stikk ut blir klipt vekk og talet ser rett ut
    // sjølv når bunnteksten står under skjermkanten og ikkje kan nåast. Rektangla
    // fortel sanninga — klipping endrar ikkje utrekninga.
    const shell=(()=>{let el=b;while(el.parentElement&&el.parentElement!==document.body)el=el.parentElement;return el})();
    const reach=()=>Math.max(...[...shell.children].map(el=>el.getBoundingClientRect().bottom));
    let h=lim(Math.round(vh-b.getBoundingClientRect().top-FOOT),MIN_H,vh);
    b.style.setProperty('height',`${h}px`,'important');
    for(let i=0;i<6;i++){
      const over=Math.round(reach()-vh+BOTTOM);
      if(Math.abs(over)<=1)break;
      const next=lim(h-over,MIN_H,vh);
      if(next===h)break;
      h=next;
      b.style.setProperty('height',`${h}px`,'important');
    }
  }
  function viewport(){const v=window.visualViewport;const h=Math.round(v?.height||innerHeight),w=Math.round(v?.width||innerWidth),top=Math.round(v?.offsetTop||0);document.documentElement.style.setProperty('--fh-vvh',`${h}px`);document.documentElement.style.setProperty('--fh-vvw',`${w}px`);document.documentElement.style.setProperty('--fh-vvo',`${top}px`);document.body.classList.toggle('fh-game-live',!!document.querySelector('.crowd-board'))}
  const sync=()=>{viewport();widen()};
  sync();addEventListener('resize',sync,{passive:true});addEventListener('orientationchange',sync,{passive:true});visualViewport?.addEventListener('resize',sync,{passive:true});visualViewport?.addEventListener('scroll',viewport,{passive:true});new MutationObserver(sync).observe(document.documentElement,{childList:true,subtree:true});
  const s=document.createElement('style');s.id='fh-ios-style';s.textContent=`
    html.fh-ios,html.fh-ios body{box-sizing:border-box;width:100%;max-width:100%;margin:0;overflow-x:hidden;-webkit-text-size-adjust:100%;overscroll-behavior:none;background:#f7f3e9}
    html.fh-ios body{min-height:var(--fh-vvh,100dvh);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    html.fh-ios body.fh-game-live{height:var(--fh-vvh,100dvh);overflow:hidden}
    html.fh-ios button,html.fh-ios [role="button"]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    html.fh-ios button,html.fh-ios .masthead,html.fh-ios .fh-statbar,html.fh-ios .fh-crownblock,html.fh-ios .game-footer{-webkit-user-select:none;user-select:none}
    html.fh-ios .game-shell.fh-compact{box-sizing:border-box!important;width:100%!important;max-width:760px!important;height:var(--fh-vvh,100dvh)!important;min-height:0!important;max-height:var(--fh-vvh,100dvh)!important;margin:0 auto!important;padding-top:max(5px,env(safe-area-inset-top))!important;padding-right:max(8px,env(safe-area-inset-right))!important;padding-bottom:max(5px,env(safe-area-inset-bottom))!important;padding-left:max(8px,env(safe-area-inset-left))!important;display:flex!important;flex-direction:column!important;gap:2px!important;overflow:hidden!important}
    html.fh-ios .masthead{flex:0 0 auto!important;min-height:61px!important;margin:0!important;padding-bottom:3px!important}
    html.fh-ios .fh-statbar{flex:0 0 auto!important;min-height:44px!important;margin:0!important;padding:2px 0!important}
    html.fh-ios .fh-crownblock{flex:0 0 auto!important;min-height:33px!important;margin:0!important;padding:3px 0 4px!important}
    html.fh-ios .crowd-board{position:relative!important;box-sizing:border-box!important;flex:1 1 0!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:2px 0!important;overflow:hidden!important;contain:layout paint style;background:#fff!important}
    html.fh-ios .game-footer{flex:0 0 auto!important;min-height:25px!important;margin:0!important;padding:3px 0 max(1px,env(safe-area-inset-bottom))!important}
    html.fh-ios .fhm-overlay{width:var(--fh-vvw,100vw)!important;height:var(--fh-vvh,100dvh)!important;min-height:0!important;box-sizing:border-box!important;padding-top:max(6px,env(safe-area-inset-top))!important;padding-bottom:max(6px,env(safe-area-inset-bottom))!important}
    html.fh-ios .fhm-card{max-height:calc(var(--fh-vvh,100dvh) - 12px)!important;min-height:0!important;overflow:auto!important;-webkit-overflow-scrolling:touch}
    html.fh-ios .fhm-menu-button,html.fh-ios .fh-top{width:44px!important;height:44px!important;padding:12px!important;margin:-8px!important}
    html.fh-ios .fhm-actions button,html.fh-ios .fh-close{min-height:44px}
    @media(max-width:430px){
      html.fh-ios .masthead h1{font-size:clamp(34px,10.5vw,44px)!important;white-space:nowrap;line-height:.92!important}
      html.fh-ios .masthead p{font-size:13px!important;line-height:1!important;margin-top:2px!important}
      html.fh-ios .age-lockup{right:1px!important;top:0!important}html.fh-ios .age-lockup strong{font-size:clamp(50px,14.5vw,64px)!important;line-height:.78!important}
      html.fh-ios .fh-statbar{min-height:42px!important}html.fh-ios .fh-crownblock{min-height:31px!important}
    }
    @media(orientation:landscape) and (max-height:500px){
      html.fh-ios .masthead{min-height:45px!important}.masthead p{display:none!important}html.fh-ios .fh-statbar{min-height:34px!important}.fh-crownblock{min-height:27px!important;padding:1px 0!important}html.fh-ios .game-shell.fh-compact{gap:1px!important}
    }
  `;document.head.appendChild(s);
})();
