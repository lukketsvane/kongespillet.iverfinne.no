(()=>{
  const assets=[...new Set(window.__FH_CROWD||[])].filter(src=>
    typeof src==='string'&&(src.startsWith('data:image/webp;base64,')||src.startsWith('/'))
  );
  if(!assets.length)return;

  // The imported packs were appended in this order: 40 court/17-May figures, then 145 Lillehammer figures.
  // If an older build has a different count, gracefully fall back to the complete pool.
  const OL_COUNT=145;
  const split=Math.max(0,assets.length-OL_COUNT);
  const hoff=split?assets.slice(0,split):assets;
  const lillehammer=assets.length>=OL_COUNT?assets.slice(split):assets;

  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];

  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  const n=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  function visibleAge(){return Math.max(0,n(document.querySelector('.age-lockup strong')?.textContent))}
  function visibleYear(){
    const labels=[...document.querySelectorAll('*')].filter(el=>el.children.length===0&&el.textContent?.trim()==='ÅR');
    for(const label of labels){
      const parent=label.parentElement;
      const value=[...(parent?.querySelectorAll('*')||[])].find(el=>el.children.length===0&&/^\s*(19|20)\d{2}\s*$/.test(el.textContent||''));
      if(value)return n(value.textContent);
    }
    return 1937+visibleAge();
  }
  function poolForYear(year){
    // Before Lillehammer, keep the game's own period-neutral line figures rather than inserting
    // recognisably modern court/OL people into 1939/1941. 1994 is deliberately OL-heavy.
    if(year<1994)return null;
    if(year===1994)return lillehammer.length?lillehammer:assets;
    return hoff.length?hoff:assets;
  }
  function spriteForAge(age){
    if(age<=2)return HARALD[0];
    if(age<=12)return HARALD[1];
    if(age<=30)return HARALD[2];
    if(age<=59)return HARALD[3];
    if(age<=73)return HARALD[4];
    if(age<=82)return HARALD[11];
    return HARALD[12];
  }

  function preload(){
    if(window.__FH_ASSET_PRELOAD)return window.__FH_ASSET_PRELOAD;
    const queue=[...new Set([...assets,...HARALD,'/game-assets/ui/crown.png'])];
    const state=window.__FH_ASSET_PRELOAD={total:queue.length,loaded:0,failed:0,done:false,promise:null};
    state.promise=new Promise(resolve=>{
      let i=0;
      const step=()=>{
        if(i>=queue.length){state.done=true;document.documentElement.dataset.fhAssetsReady='1';resolve(state);return}
        const img=new Image();let settled=false;
        const finish=ok=>{if(settled)return;settled=true;ok?state.loaded++:state.failed++;img.onload=img.onerror=null;i++;setTimeout(step,0)};
        img.decoding='async';img.onload=()=>finish(true);img.onerror=()=>finish(false);img.src=queue[i];
        if(img.complete)finish(img.naturalWidth>0);
      };
      const start=()=>step();
      if('requestIdleCallback'in window)requestIdleCallback(start,{timeout:900});else setTimeout(start,300);
    });
    return state;
  }

  function restoreOriginal(img){
    const original=img.dataset.fhCrowdOriginal||img.dataset.originalSprite;
    if(original&&img.getAttribute('src')!==original)img.src=original;
    img.classList.remove('fh-real-crowd','fh-ready-crowd');
    img.style.visibility='visible';
    img.style.opacity='';
  }
  function chooseAsset(img,i,pool){
    const original=img.dataset.originalSprite||img.dataset.fhCrowdOriginal||img.getAttribute('src')||'';
    return hash(`${original}|${img.style.left}|${img.style.top}|${i}`)%pool.length;
  }
  function applyOne(img,i,pool){
    if(img.classList.contains('harald-target')||img.classList.contains('fh-extra-crowd'))return;
    const current=img.getAttribute('src')||'';
    if(!img.dataset.fhCrowdOriginal)img.dataset.fhCrowdOriginal=img.dataset.originalSprite||current;
    if(!pool){restoreOriginal(img);return}

    let idx=Number(img.dataset.fhCrowdAsset);
    if(!Number.isFinite(idx))idx=chooseAsset(img,i,pool);
    idx=((idx%pool.length)+pool.length)%pool.length;
    const target=pool[idx];
    if(img.dataset.fhReady==='1'&&current===target)return;

    img.classList.add('is-prop','fh-real-crowd');
    img.dataset.fhCrowdAsset=String(idx);img.decoding='async';img.loading='eager';
    const reveal=()=>{img.dataset.fhReady='1';img.classList.add('fh-ready-crowd');img.style.visibility='visible';img.onload=img.onerror=null};
    const fail=()=>{const next=(idx+1)%pool.length;img.dataset.fhCrowdAsset=String(next);img.onload=reveal;img.onerror=()=>{img.style.visibility='hidden';img.onload=img.onerror=null};img.src=pool[next]};
    img.dataset.fhReady='0';img.classList.remove('fh-ready-crowd');img.style.visibility='hidden';img.onload=reveal;img.onerror=fail;
    if(current!==target)img.src=target;else if(img.complete&&img.naturalWidth>0)reveal();
  }

  function tuneDifficulty(board){
    const age=visibleAge();
    // From ~84% of the old target at age 0 down to 56%; transform changes the real hit area too.
    const scale=Math.max(.56,.84-Math.log2(age+1)*.047);
    document.documentElement.style.setProperty('--fh-target-scale',String(scale));
    document.documentElement.dataset.fhMono=visibleYear()<1972?'1':'0';
    const target=board?.querySelector('img.harald-target');
    const src=spriteForAge(age);
    if(target&&src&&target.getAttribute('src')!==src)target.src=src;
  }

  function ensureExtraCrowd(board,pool){
    if(!board)return;
    const age=visibleAge();
    const desired=8+Math.min(18,Math.floor(age/4));
    let extras=[...board.querySelectorAll('img.fh-extra-crowd')];
    while(extras.length>desired){extras.pop()?.remove()}
    const originals=[...board.querySelectorAll('img.crowd-figure:not(.harald-target):not(.fh-extra-crowd)')];
    if(!originals.length&&!pool)return;
    for(let i=extras.length;i<desired;i++){
      const img=document.createElement('img');
      img.className='crowd-figure is-prop fh-extra-crowd';
      const seed=hash(`${visibleYear()}|${i}|extra`);
      const chosenPool=pool||originals.map(x=>x.dataset.fhCrowdOriginal||x.dataset.originalSprite||x.src).filter(Boolean);
      if(!chosenPool.length)break;
      img.src=chosenPool[seed%chosenPool.length];
      img.alt='';img.decoding='async';img.draggable=false;
      // Keep the target searchable but remove the giant empty patches visible in the screenshots.
      const left=4+(seed%9000)/100;
      const top=5+((seed>>>9)%8600)/100;
      const size=8+((seed>>>18)%600)/100;
      img.style.left=`${left}%`;img.style.top=`${top}%`;img.style.width=`${size}%`;img.style.height='auto';
      img.style.zIndex=String(1+(seed%3));
      board.appendChild(img);extras.push(img);
    }
  }

  function applyCrowd(){
    const board=document.querySelector('.crowd-board');if(!board)return;
    const year=visibleYear(),pool=poolForYear(year);
    board.querySelectorAll('img.crowd-figure').forEach((img,i)=>applyOne(img,i,pool));
    ensureExtraCrowd(board,pool);
    tuneDifficulty(board);
  }

  function style(){
    if(document.getElementById('fh-crowd-style'))return;
    const s=document.createElement('style');s.id='fh-crowd-style';s.textContent=`
      .crowd-board{contain:layout paint style;overflow:hidden}
      .crowd-figure{backface-visibility:hidden;image-rendering:auto}
      .crowd-figure.fh-real-crowd{opacity:0!important;transition:opacity 45ms linear;will-change:auto}
      .crowd-figure.fh-real-crowd.fh-ready-crowd{opacity:1!important}
      .harald-target{scale:var(--fh-target-scale,.84);transform-origin:center;z-index:4!important}
      .fh-extra-crowd{display:block!important;position:absolute!important;pointer-events:none!important;object-fit:contain;transform:translate(-50%,-50%);opacity:.94}
      html[data-fh-mono="1"] .crowd-board{filter:grayscale(1) contrast(1.055)}
      .game-footer{grid-template-columns:auto auto!important;justify-content:space-between!important}
      .game-footer>p,.first-instruction{display:none!important}.game-footer .record{justify-self:end}
      @media (max-width:700px),(pointer:coarse){.crowd-figure.is-wandering{animation:none!important;transition:none!important}.fh-extra-crowd{opacity:.91}}
    `;document.head.appendChild(s);
  }

  let scheduled=false;
  function run(){scheduled=false;style();applyCrowd()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(run)}
  preload();schedule();
  const root=document.querySelector('.game-shell')||document.documentElement;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_CROWD_RUNTIME={assets,hoff,lillehammer,preload:window.__FH_ASSET_PRELOAD,schedule};
})();
