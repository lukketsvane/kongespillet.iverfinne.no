(()=>{
  const assets=[...new Set(window.__FH_CROWD||[])].filter(src=>
    typeof src==='string'&&(src.startsWith('data:image/webp;base64,')||src.startsWith('/'))
  );
  if(!assets.length)return;

  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];

  function hash(s){
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  function preload(){
    if(window.__FH_ASSET_PRELOAD)return window.__FH_ASSET_PRELOAD;
    const queue=[...new Set([...assets,...HARALD,'/game-assets/ui/crown.png'])];
    const state=window.__FH_ASSET_PRELOAD={total:queue.length,loaded:0,failed:0,done:false,promise:null};
    state.promise=new Promise(resolve=>{
      let i=0;
      const step=()=>{
        if(i>=queue.length){
          state.done=true;
          document.documentElement.dataset.fhAssetsReady='1';
          resolve(state);
          return;
        }
        const img=new Image();
        let settled=false;
        const finish=ok=>{
          if(settled)return;
          settled=true;
          ok?state.loaded++:state.failed++;
          img.onload=img.onerror=null;
          i++;
          setTimeout(step,0);
        };
        img.decoding='async';
        img.onload=()=>finish(true);
        img.onerror=()=>finish(false);
        img.src=queue[i];
        if(img.complete)finish(img.naturalWidth>0);
      };
      const start=()=>step();
      if('requestIdleCallback'in window)requestIdleCallback(start,{timeout:700});
      else setTimeout(start,350);
    });
    return state;
  }

  function chooseAsset(img,i){
    const original=img.dataset.originalSprite||img.dataset.fhCrowdOriginal||img.getAttribute('src')||'';
    return hash(`${original}|${img.style.left}|${img.style.top}|${i}`)%assets.length;
  }

  function applyOne(img,i){
    if(img.classList.contains('harald-target'))return;
    const current=img.getAttribute('src')||'';
    if(!img.dataset.fhCrowdOriginal)img.dataset.fhCrowdOriginal=img.dataset.originalSprite||current;

    let n=Number(img.dataset.fhCrowdAsset);
    if(!Number.isFinite(n))n=chooseAsset(img,i);
    n=((n%assets.length)+assets.length)%assets.length;
    const target=assets[n];

    if(img.dataset.fhReady==='1'&&current===target)return;

    img.classList.add('is-prop','fh-real-crowd');
    img.dataset.fhCrowdAsset=String(n);
    img.decoding='async';
    img.loading='eager';

    const reveal=()=>{
      img.dataset.fhReady='1';
      img.classList.add('fh-ready-crowd');
      img.style.visibility='visible';
      img.onload=img.onerror=null;
    };
    const fail=()=>{
      const next=(n+1)%assets.length;
      img.dataset.fhCrowdAsset=String(next);
      img.onload=reveal;
      img.onerror=()=>{
        img.style.visibility='hidden';
        img.onload=img.onerror=null;
      };
      img.src=assets[next];
    };

    img.dataset.fhReady='0';
    img.classList.remove('fh-ready-crowd');
    img.style.visibility='hidden';
    img.onload=reveal;
    img.onerror=fail;
    if(current!==target)img.src=target;
    else if(img.complete&&img.naturalWidth>0)reveal();
  }

  function tuneDifficulty(){
    const age=Math.max(0,Number(document.querySelector('.age-lockup strong')?.textContent)||0);
    const scale=age===0?1:Math.max(.78,1-Math.log2(age+1)*.03);
    document.documentElement.style.setProperty('--fh-target-scale',String(scale));
  }

  function applyCrowd(){
    const board=document.querySelector('.crowd-board');
    if(!board)return;
    board.querySelectorAll('img.crowd-figure').forEach(applyOne);
  }

  function style(){
    if(document.getElementById('fh-crowd-style'))return;
    const s=document.createElement('style');
    s.id='fh-crowd-style';
    s.textContent=`
      .crowd-board{contain:layout paint style}
      .crowd-figure{backface-visibility:hidden;image-rendering:auto}
      .crowd-figure.fh-real-crowd{opacity:0!important;transition:opacity 45ms linear;will-change:auto}
      .crowd-figure.fh-real-crowd.fh-ready-crowd{opacity:1!important}
      .harald-target{scale:var(--fh-target-scale,1);transform-origin:center}
      .game-footer{grid-template-columns:auto auto!important;justify-content:space-between!important}
      .game-footer>p,.first-instruction{display:none!important}
      .game-footer .record{justify-self:end}
      .fh-extra-crowd{display:none!important}
      @media (max-width:700px),(pointer:coarse){.crowd-figure.is-wandering{animation:none!important;transition:none!important}}
    `;
    document.head.appendChild(s);
  }

  let scheduled=false;
  function run(){
    scheduled=false;
    style();
    applyCrowd();
    tuneDifficulty();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(run);
  }

  preload();
  schedule();

  const root=document.querySelector('.game-shell')||document.documentElement;
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});

  window.__FH_CROWD_RUNTIME={assets,preload:window.__FH_ASSET_PRELOAD,schedule};
})();
