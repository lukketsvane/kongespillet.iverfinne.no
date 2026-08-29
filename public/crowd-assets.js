(()=>{
  const CLEAN=[
    '/clean-crowd/bunadperson.png','/clean-crowd/demonstrant.png','/clean-crowd/eldre-dame.png','/clean-crowd/eldre-herre.png','/clean-crowd/fotograf.png','/clean-crowd/journalist.png','/clean-crowd/jublande.png','/clean-crowd/mann-med-flagg.png','/clean-crowd/oslobuar.png','/clean-crowd/paparazzi.png','/clean-crowd/radgivar.png','/clean-crowd/republikanar.png','/clean-crowd/skeptikar.png','/clean-crowd/turist.png','/clean-crowd/ungdom.png','/clean-crowd/vakt.png','/clean-crowd/to-barn.png','/clean-crowd/barn.png','/clean-crowd/folk.png','/clean-crowd/protestar.png','/clean-crowd/slottsvakt.png','/clean-crowd/sonja.png','/clean-crowd/statsminister-ap.png','/clean-crowd/statsminister-h.png'
  ];
  const HARALD=['/clean-harald/baby.png','/clean-harald/gut.png','/clean-harald/kadett.png','/clean-harald/ung-dress.png','/clean-harald/vaksen-dress.png','/clean-harald/galla.png','/clean-harald/galla-orden.png','/clean-harald/regnfrakk.png','/clean-harald/gamal-boblejakke.png','/clean-harald/gamal-stokk.png'];
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const age=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  let GOOD=[],ready=null,queued=false,runId=0;
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=11)return HARALD[1];if(a<=18)return HARALD[2];if(a<=30)return HARALD[3];if(a<=58)return HARALD[4];if(a<=72)return HARALD[5];if(a<=80)return HARALD[7];if(a<=88)return HARALD[8];return HARALD[9]}
  function haraldScale(a){if(a<=2)return .62;if(a<=6)return .72;if(a<=11)return .82;if(a<=18)return .92;return 1.02}
  function preload(src){return new Promise(resolve=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im.naturalWidth>=24&&im.naturalHeight>=60?src:null);im.onerror=()=>resolve(null);im.src=src})}
  function prepare(){if(ready)return ready;ready=Promise.all(CLEAN.map(preload)).then(a=>GOOD=a.filter(Boolean));return ready}
  function setSource(img,src,isTarget=false){
    if(!img||!src)return;img.alt=isTarget?'Kong Harald':'';img.draggable=false;img.decoding='async';img.loading='eager';img.dataset.fhReady='0';img.style.visibility='hidden';
    img.onload=()=>{if(!img.isConnected)return;img.dataset.fhReady='1';img.dataset.fhBroken='0';img.style.visibility='visible';window.__FH_WORLD__?.schedule?.()};
    img.onerror=()=>{img.dataset.fhBroken='1';img.style.visibility='hidden';if(isTarget){if(img.dataset.fhTargetFallback!=='1'){img.dataset.fhTargetFallback='1';img.src='/clean-harald/vaksen-dress.png'}}else img.remove()};
    if(img.getAttribute('src')!==src)img.src=src;else if(img.complete&&img.naturalWidth>0)img.onload();
  }
  async function distribute(board){
    const id=++runId,good=await prepare();if(id!==runId||!board.isConnected||!good.length)return;
    const a=age(),figs=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')];
    figs.forEach((img,i)=>{const uid=img.dataset.fhUid||String(i),src=good[hash(`${a}|${uid}|clean`)%good.length];img.classList.add('fh-quality-crowd');img.classList.remove('fh-fallback-crowd');img.dataset.fhAssetScale='1';setSource(img,src,false)});
    board.dataset.fhQualityReady='1';
  }
  function target(board){const a=age(),img=board.querySelector('img.harald-target');if(!img)return;img.classList.add('fh-quality-crowd');img.style.setProperty('--fh-harald-boost',String(haraldScale(a)));setSource(img,haraldForAge(a),true)}
  function style(){if(document.getElementById('fh-quality-crowd-style'))return;const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`
    .crowd-board,.crowd-board img{filter:none!important}.crowd-board img.crowd-figure{image-rendering:auto!important;backface-visibility:hidden!important;animation:none!important;transition:none!important;object-fit:contain!important;font-size:0!important;color:transparent!important}
    .crowd-board img.crowd-figure:not([data-fh-ready="1"]){visibility:hidden!important}.crowd-board img.fh-quality-crowd{height:var(--fh-crowd-body-h,7.8%)!important;width:auto!important;max-width:14%!important;scale:var(--fh-render-scale,1)!important}.crowd-board img.harald-target{height:var(--fh-crowd-body-h,7.8%)!important;width:auto!important;max-width:14%!important;scale:var(--fh-render-scale,1)!important;z-index:8!important}
    @media(max-width:700px){.crowd-board{--fh-crowd-body-h:7.8%}.crowd-board img.fh-quality-crowd,.crowd-board img.harald-target{max-width:15%!important}}
  `;document.head.appendChild(s)}
  async function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;await distribute(board);target(board);window.__FH_WORLD__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  prepare().then(schedule);schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});window.__FH_VERIFIED_RUNTIME={schedule,get assets(){return GOOD.slice()},pool(){return GOOD.slice()}};
})();
