(()=>{
  const assets=[...new Set(window.__FH_CROWD||[])]
    .filter(src=>/^data:image\/(?:webp|png);base64,/i.test(src))
    .slice(0,24);
  if(!assets.length)return;

  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];
  const UI=['/game-assets/ui/crown.png','/game-assets/ui/flag.png','/game-assets/ui/cane.png','/game-assets/ui/rubber_boots.png','/game-assets/ui/microphone.png'];

  let ready=[];
  let scheduled=false;
  let observer=null;

  function hash(s){
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  function schedule(delay=0){
    if(delay){
      window.setTimeout(()=>schedule(),delay);
      return;
    }
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      run();
    });
  }

  function decodeOne(src){
    return new Promise(resolve=>{
      const img=new Image();
      img.decoding='async';
      let done=false;
      const finish=ok=>{
        if(done)return;
        done=true;
        img.onload=null;
        img.onerror=null;
        resolve(ok?src:null);
      };
      img.onload=()=>{
        if(typeof img.decode==='function'){
          img.decode().then(()=>finish(true)).catch(()=>finish(true));
        }else finish(true);
      };
      img.onerror=()=>finish(false);
      img.src=src;
      if(img.complete&&img.naturalWidth)finish(true);
    });
  }

  async function preloadCrowd(){
    const state=window.__FH_ASSET_PRELOAD={
      total:assets.length+HARALD.length+UI.length,
      loaded:0,
      failed:0,
      done:false
    };

    let cursor=0;
    const good=[];
    const worker=async()=>{
      while(cursor<assets.length){
        const src=assets[cursor++];
        const ok=await decodeOne(src);
        if(ok){
          good.push(ok);
          state.loaded++;
        }else state.failed++;
      }
    };

    await Promise.all(Array.from({length:Math.min(3,assets.length)},worker));
    ready=good;

    [...HARALD,...UI].forEach(src=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{state.loaded++};
      img.onerror=()=>{state.failed++};
      img.src=src;
    });

    state.done=true;
    state.crowdReady=ready.length;
    document.documentElement.dataset.fhAssetsReady='1';
    schedule();
  }

  function pick(seed){
    if(!ready.length)return null;
    return ready[hash(seed)%ready.length];
  }

  function applyCrowd(){
    if(!ready.length)return;
    const imgs=document.querySelectorAll('img.crowd-figure');
    imgs.forEach((img,i)=>{
      if(img.closest('.fh-extra-crowd'))return;
      if(img.classList.contains('is-prop')&&!img.classList.contains('fh-real-crowd'))return;

      const current=img.getAttribute('src')||'';
      const remembered=img.dataset.fhCrowdOriginal||'';
      const original=
        img.dataset.originalSprite||
        (current&&!current.startsWith('data:image/')?current:'')||
        remembered;

      if(!original)return;

      const key=`${original}|${img.style.left}|${img.style.top}|${i}`;
      if(img.dataset.fhCrowdKey===key&&img.classList.contains('fh-real-crowd'))return;

      const target=pick(key);
      if(!target)return;

      img.dataset.fhCrowdOriginal=original;
      img.dataset.fhCrowdKey=key;
      img.classList.add('is-prop','fh-real-crowd');
      img.decoding='async';
      img.loading='eager';

      if(current!==target){
        img.onerror=()=>{
          img.onerror=null;
          img.classList.remove('fh-real-crowd');
          if(original)img.src=original;
        };
        img.src=target;
      }
    });
  }

  function cleanUI(){
    document.querySelectorAll('.game-footer>p,.first-instruction').forEach(el=>el.remove());
  }

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
      .crowd-figure{image-rendering:auto;backface-visibility:hidden}
      .crowd-figure.is-prop.fh-real-crowd{opacity:1!important}
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

  function removeLegacyExtras(){
    document.querySelectorAll('.fh-extra-crowd').forEach(el=>el.remove());
  }

  function run(){
    style();
    cleanUI();
    removeLegacyExtras();
    tuneDifficulty();
    applyCrowd();
  }

  function watch(){
    const root=document.querySelector('.game-shell')||document.body;
    if(!root||observer)return;
    observer=new MutationObserver(mutations=>{
      for(const m of mutations){
        if(m.type==='childList'&&(m.addedNodes.length||m.removedNodes.length)){
          schedule();
          break;
        }
      }
    });
    observer.observe(root,{childList:true,subtree:true});
  }

  document.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||!img.matches('img.crowd-figure'))return;
    if(img.closest('.harald-target'))return;
    const fallback=pick(`${img.dataset.fhCrowdOriginal||img.src}|fallback`);
    if(fallback&&img.src!==fallback){
      img.onerror=null;
      img.src=fallback;
      img.classList.add('is-prop','fh-real-crowd');
    }else{
      img.style.visibility='hidden';
    }
  },true);

  document.addEventListener('pointerup',event=>{
    if(event.target instanceof Element&&event.target.closest('.harald-target'))schedule(280);
  },true);

  run();
  watch();
  preloadCrowd();
})();
