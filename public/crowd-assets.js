(()=>{
  const assets=[...new Set(window.__FH_CROWD||[])];
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

  function rng(seed){
    let x=seed||1;
    return()=>{
      x^=x<<13;x^=x>>>17;x^=x<<5;
      return(x>>>0)/4294967296;
    };
  }

  function preload(){
    if(window.__FH_ASSET_PRELOAD)return;
    const queue=[...new Set([...assets,...HARALD,...UI])];
    const state=window.__FH_ASSET_PRELOAD={total:queue.length,loaded:0,failed:0,done:false};
    let cursor=0;
    const worker=async()=>{
      while(cursor<queue.length){
        const src=queue[cursor++];
        try{
          const img=new Image();
          img.decoding='async';
          img.src=src;
          if(img.decode)await img.decode();
          else await new Promise(resolve=>{img.onload=img.onerror=resolve});
          state.loaded+=1;
        }catch{
          state.failed+=1;
        }
      }
    };
    state.promise=Promise.all(Array.from({length:Math.min(8,queue.length)},worker)).then(()=>{
      state.done=true;
      document.documentElement.dataset.fhAssetsReady='1';
      return state;
    });
  }

  function applyCrowd(){
    document.querySelectorAll('img.crowd-figure:not(.fh-extra-decoy)').forEach((img,i)=>{
      if(img.classList.contains('is-prop')&&!img.classList.contains('fh-real-crowd'))return;

      const current=img.getAttribute('src')||'';
      const original=img.dataset.originalSprite||(!current.startsWith('data:image/')?current:'')||img.dataset.fhCrowdOriginal||'';
      if(!original)return;

      if(original!==img.dataset.fhCrowdOriginal){
        img.dataset.fhCrowdOriginal=original;
        delete img.dataset.fhCrowdAsset;
      }

      const seed=`${img.dataset.fhCrowdOriginal}|${img.style.left}|${img.style.top}|${i}`;
      const n=hash(seed)%assets.length;
      const target=assets[n];

      img.classList.add('is-prop','fh-real-crowd');
      img.dataset.fhCrowdAsset=String(n);
      if(current!==target)img.setAttribute('src',target);
    });
  }

  function cleanUI(){
    document.querySelectorAll('.game-footer>p,.first-instruction').forEach(el=>el.remove());
  }

  function getAge(){
    return Math.max(0,Number(document.querySelector('.age-lockup strong')?.textContent)||0);
  }

  function basePeople(board){
    return board.querySelectorAll('img.crowd-figure.fh-real-crowd:not(.fh-extra-decoy),img.crowd-figure:not(.is-prop):not(.fh-extra-decoy)').length+1;
  }

  function harder(){
    const board=document.querySelector('.crowd-board');
    const target=board?.querySelector('.harald-target');
    if(!board||!target)return;

    const age=getAge();
    const targetLeft=target.style.left||'';
    const targetTop=target.style.top||'';
    const key=`${age}|${targetLeft}|${targetTop}`;

    const currentWidth=parseFloat(target.style.width)||10;
    const oldApplied=parseFloat(target.dataset.fhAppliedWidth||'');
    let baseWidth=parseFloat(target.dataset.fhBaseWidth||'');
    if(!Number.isFinite(baseWidth)||!Number.isFinite(oldApplied)||Math.abs(currentWidth-oldApplied)>.02){
      baseWidth=currentWidth;
      target.dataset.fhBaseWidth=String(baseWidth);
    }
    const targetFactor=age===0?1:Math.max(.68,1-Math.min(.32,Math.log2(age+1)*.045));
    const nextWidth=Math.max(3.8,baseWidth*targetFactor);
    target.dataset.fhAppliedWidth=String(nextWidth);
    if(Math.abs(currentWidth-nextWidth)>.02)target.style.width=`${nextWidth}%`;

    const originals=[...board.querySelectorAll('img.crowd-figure.fh-real-crowd:not(.fh-extra-decoy)')];
    const heights=originals.map(el=>parseFloat(el.style.height)).filter(Number.isFinite).sort((a,b)=>a-b);
    const median=heights.length?heights[Math.floor(heights.length/2)]:14;
    const extra=age===0?0:Math.min(110,Math.floor(age*1.15+Math.sqrt(age)*2.5));

    let holder=board.querySelector('.fh-extra-crowd');
    if(!holder){
      holder=document.createElement('div');
      holder.className='fh-extra-crowd';
      holder.setAttribute('aria-hidden','true');
      board.insertBefore(holder,target);
    }

    if(holder.dataset.round!==key||Number(holder.dataset.count)!==extra){
      holder.dataset.round=key;
      holder.dataset.count=String(extra);
      holder.replaceChildren();
      const random=rng(hash(`harder|${key}`));
      const frag=document.createDocumentFragment();
      for(let i=0;i<extra;i++){
        const img=document.createElement('img');
        const x=3.5+random()*93;
        const y=5+random()*90;
        const h=Math.max(6.2,median*(.72+random()*.52));
        const front=age>28&&random()<Math.min(.11,age/900);
        img.alt='';
        img.draggable=false;
        img.src=assets[Math.floor(random()*assets.length)];
        img.className='crowd-figure is-prop fh-real-crowd fh-extra-decoy';
        img.style.left=`${x}%`;
        img.style.top=`${y}%`;
        img.style.height=`${h}%`;
        img.style.zIndex=String(front?145+Math.floor(random()*15):10+Math.round(y));
        img.style.transform=`translate(-50%, -50%) rotate(${(-5+random()*10).toFixed(2)}deg) scaleX(${random()<.5?-1:1})`;
        frag.appendChild(img);
      }
      holder.appendChild(frag);
    }

    const total=basePeople(board)+extra;
    const folk=document.querySelector('.game-footer .record strong');
    if(folk&&folk.textContent!==String(total))folk.textContent=String(total);
    board.setAttribute('aria-label',`Folkemengd med ${total} menneske. Finn og trykk på Harald.`);
  }

  function style(){
    if(document.getElementById('fh-crowd-style'))return;
    const s=document.createElement('style');
    s.id='fh-crowd-style';
    s.textContent=`
      .crowd-figure.is-prop.fh-real-crowd{opacity:1!important}
      .fh-extra-crowd{position:absolute;inset:0;pointer-events:none}
      .fh-extra-crowd .fh-extra-decoy{pointer-events:auto;user-select:none;-webkit-user-select:none}
      .game-footer{grid-template-columns:auto auto!important;justify-content:space-between!important}
      .game-footer>p,.first-instruction{display:none!important}
      .game-footer .record{justify-self:end}
    `;
    document.head.appendChild(s);
  }

  function run(){
    style();
    cleanUI();
    applyCrowd();
    harder();
  }

  preload();
  run();
  new MutationObserver(run).observe(document.documentElement,{
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['src','style']
  });
})();
