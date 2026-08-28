(()=>{
  // Embedded or same-origin only: no remote placeholders, no broken image boxes.
  const assets=[...new Set(window.__FH_CROWD||[])].filter(src=>
    typeof src==='string' && (src.startsWith('data:image/webp;base64,') || src.startsWith('/'))
  );
  if(!assets.length)return;

  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];
  const UI=['/game-assets/ui/crown.png','/game-assets/ui/flag.png','/game-assets/ui/cane.png','/game-assets/ui/rubber_boots.png','/game-assets/ui/microphone.png'];

  function hash(s){
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  // Three decode workers keeps startup predictable on iPhone while still warming everything early.
  function preload(){
    if(window.__FH_ASSET_PRELOAD)return;
    const queue=[...new Set([...assets,...HARALD,...UI])];
    const state=window.__FH_ASSET_PRELOAD={total:queue.length,loaded:0,failed:0,done:false};
    let cursor=0;
    const worker=async()=>{
      while(cursor<queue.length){
        const src=queue[cursor++];
        await new Promise(resolve=>{
          const img=new Image();
          let settled=false;
          const finish=ok=>{
            if(settled)return;
            settled=true;
            ok?state.loaded++:state.failed++;
            img.onload=img.onerror=null;
            resolve();
          };
          img.decoding='async';
          img.onload=()=>finish(true);
          img.onerror=()=>finish(false);
          img.src=src;
          if(img.complete)finish(img.naturalWidth>0);
        });
      }
    };
    state.promise=Promise.all(Array.from({length:Math.min(3,queue.length)},worker)).then(()=>{
      state.done=true;
      document.documentElement.dataset.fhAssetsReady='1';
      return state;
    });
  }

  function chooseAsset(img,i){
    const original=img.dataset.originalSprite || img.dataset.fhCrowdOriginal || img.getAttribute('src') || '';
    const seed=`${original}|${img.style.left}|${img.style.top}|${i}`;
    return hash(seed)%assets.length;
  }

  function applyOne(img,i){
    if(img.classList.contains('is-prop')&&!img.classList.contains('fh-real-crowd'))return;

    const current=img.getAttribute('src')||'';
    if(!img.dataset.fhCrowdOriginal){
      img.dataset.fhCrowdOriginal=img.dataset.originalSprite || current;
    }

    if(img.dataset.fhReady==='1' && assets.includes(current))return;

    let n=Number(img.dataset.fhCrowdAsset);
    if(!Number.isFinite(n))n=chooseAsset(img,i);
    n=((n%assets.length)+assets.length)%assets.length;

    img.classList.add('is-prop','fh-real-crowd');
    img.dataset.fhCrowdAsset=String(n);
    img.dataset.fhReady='0';
    img.decoding='async';
    img.loading='eager';

    const reveal=()=>{
      img.dataset.fhReady='1';
      img.classList.add('fh-ready-crowd');
      img.onload=img.onerror=null;
    };
    const retry=()=>{
      const next=(n+1)%assets.length;
      img.dataset.fhCrowdAsset=String(next);
      img.onload=reveal;
      img.onerror=()=>{
        img.style.visibility='hidden';
        img.onload=img.onerror=null;
      };
      img.src=assets[next];
    };

    img.classList.remove('fh-ready-crowd');
    img.style.visibility='visible';
    img.onload=reveal;
    img.onerror=retry;
    if(current!==assets[n])img.src=assets[n];
    else if(img.complete && img.naturalWidth>0)reveal();
  }

  function applyCrowd(){
    const board=document.querySelector('.crowd-board');
    if(!board)return;
    board.querySelectorAll('img.crowd-figure').forEach(applyOne);
  }

  function cleanUI(){
    document.querySelectorAll('.game-footer>p,.first-instruction').forEach(el=>el.remove());
  }

  // Preserve the base game's crowd ramp. Difficulty gets a cheap composited scale only;
  // never create extra runtime image nodes.
  function tuneDifficulty(){
    const age=Math.max(0,Number(document.querySelector('.age-lockup strong')?.textContent)||0);
    const scale=age===0?1:Math.max(.82,1-Math.log2(age+1)*.026);
    document.documentElement.style.setProperty('--fh-target-scale',String(scale));
  }

  function style(){
    if(document.getElementById('fh-crowd-style'))return;
    const s=document.createElement('style');
    s.id='fh-crowd-style';
    s.textContent=`
      .crowd-board{contain:layout paint style}
      .crowd-figure{backface-visibility:hidden;image-rendering:auto}
      .crowd-figure.fh-real-crowd{opacity:0!important;transition:opacity 60ms linear;will-change:auto}
      .crowd-figure.fh-real-crowd.fh-ready-crowd{opacity:1!important}
      .harald-target{scale:var(--fh-target-scale,1)}
      .game-footer{grid-template-columns:auto auto!important;justify-content:space-between!important}
      .game-footer>p,.first-instruction{display:none!important}
      .game-footer .record{justify-self:end}
      .fh-extra-crowd{display:none!important}
      @media (max-width:700px),(pointer:coarse){
        .crowd-figure.is-wandering{animation:none!important;transition:none!important}
      }
    `;
    document.head.appendChild(s);
  }

  let scheduled=false;
  function run(){
    scheduled=false;
    style();
    cleanUI();
    document.querySelectorAll('.fh-extra-crowd').forEach(el=>el.remove());
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
  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden)schedule();
  });

  document.addEventListener('pointerup',event=>{
    if(event.target instanceof Element&&event.target.closest('.harald-target')){
      window.setTimeout(schedule,280);
    }
  },true);

  window.__FH_CROWD_RUNTIME={assets,preload:window.__FH_ASSET_PRELOAD,schedule};
})();
