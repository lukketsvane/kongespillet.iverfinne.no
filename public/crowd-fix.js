(()=>{
  const MODE_KEY='finn-harald-mode';
  const BAD_LILLEHAMMER=new Set([49,50,139]); // zero-based: contaminated cut-outs 50, 51, 140
  const HOFF_CHILD=new Set([3,4,5,6,7,12,23,24,25]);
  const HOFF_GROUP=new Set([10,20,21,27]);
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const mode=()=>{const k=localStorage.getItem(MODE_KEY)||'konge';return ['roleg','konge','panikk'].includes(k)?k:'konge'};
  function year(){
    const labels=[...document.querySelectorAll('*')].filter(x=>x.children.length===0&&x.textContent?.trim()==='ÅR');
    for(const l of labels){
      let p=l.parentElement;
      for(let d=0;p&&d<3;d++,p=p.parentElement){
        const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^(19|20)\d{2}$/.test((x.textContent||'').trim()));
        if(v)return num(v.textContent);
      }
    }
    return 1937+num(document.querySelector('.age-lockup strong')?.textContent);
  }
  function nextGood(i){let n=(i+1)%145;while(BAD_LILLEHAMMER.has(n))n=(n+1)%145;return n}
  function repair(board){
    if(year()!==1994)return;
    let changed=false;
    board.querySelectorAll('img.fh-real-crowd[data-fh-crowd-asset]').forEach(img=>{
      const i=num(img.dataset.fhCrowdAsset);
      if(BAD_LILLEHAMMER.has(i)){
        img.dataset.fhCrowdAsset=String(nextGood(i));
        img.dataset.fhReady='0';
        changed=true;
      }
    });
    if(changed)window.__FH_CROWD_RUNTIME?.schedule?.();
  }
  function visualHeight(img,y){
    if(img.classList.contains('harald-target'))return 10.2;
    if(img.classList.contains('fh-extra-crowd'))return 9.05;
    if(!img.classList.contains('fh-real-crowd'))return null;
    const idx=num(img.dataset.fhCrowdAsset);
    if(y>1994&&HOFF_CHILD.has(idx))return 7.15;
    if(y>1994&&HOFF_GROUP.has(idx))return 8.55;
    const ar=(img.naturalWidth||1)/(img.naturalHeight||1);
    if(ar>.95)return 8.55;
    if(ar<.38)return 9.15;
    return 9.35;
  }
  function fit(board,img){
    if(!img.isConnected)return;
    const br=board.getBoundingClientRect(),r=img.getBoundingClientRect();
    if(!br.width||!r.width)return;
    const pad=4;let dx=0,dy=0;
    if(r.left<br.left+pad)dx+=(br.left+pad)-r.left;
    if(r.right>br.right-pad)dx+=(br.right-pad)-r.right;
    if(r.top<br.top+pad)dy+=(br.top+pad)-r.top;
    if(r.bottom>br.bottom-pad)dy+=(br.bottom-pad)-r.bottom;
    img.style.translate=`${Math.round(dx)}px ${Math.round(dy)}px`;
  }
  function normalise(board){
    const y=year();
    board.querySelectorAll('img.crowd-figure').forEach(img=>{
      const h=visualHeight(img,y);
      if(h)img.style.setProperty('--fh-normal-h',`${h}%`);
      requestAnimationFrame(()=>fit(board,img));
    });
  }
  function style(){
    if(document.getElementById('fh-crowd-fix-style'))return;
    const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
      html[data-fh-mono="1"] .crowd-board,.crowd-board{filter:none!important}
      .crowd-board img.fh-real-crowd{height:var(--fh-normal-h,9.35%)!important;width:auto!important;max-width:18%!important;object-fit:contain!important}
      .crowd-board img.fh-extra-crowd{height:var(--fh-normal-h,9.05%)!important;width:auto!important;max-width:18%!important;object-fit:contain!important}
      .crowd-board img.harald-target{height:var(--fh-normal-h,10.2%)!important;width:auto!important;max-width:16%!important;object-fit:contain!important;scale:calc(var(--fh-target-scale,.84)*var(--fh-mode-target,1))!important}
      html[data-fh-mode="roleg"]{--fh-mode-target:1.12}html[data-fh-mode="konge"]{--fh-mode-target:1}html[data-fh-mode="panikk"]{--fh-mode-target:.84}
    `;document.head.appendChild(s);
  }
  let queued=false;
  function run(){
    queued=false;style();document.documentElement.dataset.fhMode=mode();
    const board=document.querySelector('.crowd-board');if(!board)return;
    repair(board);normalise(board);
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-fh-crowd-asset','data-fh-ready']});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_CROWD_FIX__={schedule};
})();
