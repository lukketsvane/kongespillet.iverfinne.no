(()=>{
  const CLEAN=['/clean-crowd/bunadperson.png','/clean-crowd/demonstrant.png','/clean-crowd/eldre-dame.png','/clean-crowd/eldre-herre.png','/clean-crowd/fotograf.png','/clean-crowd/journalist.png','/clean-crowd/jublande.png','/clean-crowd/mann-med-flagg.png','/clean-crowd/oslobuar.png','/clean-crowd/paparazzi.png','/clean-crowd/radgivar.png','/clean-crowd/republikanar.png','/clean-crowd/skeptikar.png','/clean-crowd/turist.png','/clean-crowd/ungdom.png','/clean-crowd/vakt.png','/clean-crowd/to-barn.png','/clean-crowd/barn.png','/clean-crowd/folk.png','/clean-crowd/protestar.png','/clean-crowd/slottsvakt.png','/clean-crowd/sonja.png','/clean-crowd/statsminister-ap.png','/clean-crowd/statsminister-h.png'];
  const HARALD=['/clean-harald/baby.png','/clean-harald/gut.png','/clean-harald/kadett.png','/clean-harald/ung-dress.png','/clean-harald/vaksen-dress.png','/clean-harald/galla.png','/clean-harald/galla-orden.png','/clean-harald/regnfrakk.png','/clean-harald/gamal-boblejakke.png','/clean-harald/gamal-stokk.png'];
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const liveAge=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  const round=()=>window.__FH_ROUND__?.get?.()||{age:liveAge(),seed:`fallback:${liveAge()}`};
  let queued=false;
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=11)return HARALD[1];if(a<=18)return HARALD[2];if(a<=30)return HARALD[3];if(a<=58)return HARALD[4];if(a<=72)return HARALD[5];if(a<=80)return HARALD[7];if(a<=88)return HARALD[8];return HARALD[9]}
  function haraldScale(a){if(a<=2)return .62;if(a<=6)return .72;if(a<=11)return .82;if(a<=18)return .92;return 1.02}
  function setSource(img,src,isTarget=false){
    if(!img||!src)return;img.alt=isTarget?'Kong Harald':'';img.draggable=false;img.decoding='async';img.loading='eager';img.classList.add('crowd-figure','fh-quality-crowd');img.dataset.fhReady='0';img.dataset.fhBroken='0';img.style.visibility='hidden';
    const reveal=()=>{if(!img.isConnected)return;img.dataset.fhReady='1';img.dataset.fhBroken='0';img.style.visibility='visible';img.dataset.fhTry='0';window.__FH_WORLD__?.schedule?.()};
    img.onload=reveal;img.onerror=()=>{if(!img.isConnected)return;const tries=(num(img.dataset.fhTry)||0)+1;img.dataset.fhTry=String(tries);img.dataset.fhBroken='1';img.style.visibility='hidden';if(isTarget){if(tries<3)setTimeout(()=>setSource(img,HARALD[Math.min(HARALD.length-1,4+tries)],true),60*tries);return}if(tries<3){const next=CLEAN[hash(`${img.dataset.fhSlot||'0'}|retry|${tries}`)%CLEAN.length];setTimeout(()=>setSource(img,next,false),60*tries)}else img.remove()};
    if(img.getAttribute('src')!==src)img.src=src;else if(img.complete&&img.naturalWidth>0)reveal();
  }
  function normalizeBoard(board){
    const target=board.querySelector('img.harald-target');[...board.querySelectorAll('img')].forEach(img=>{if(img!==target)img.classList.add('crowd-figure')});let figs=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')];
    if(!figs.length){for(let i=0;i<28;i++){const im=document.createElement('img');im.className='crowd-figure is-prop fh-extra-crowd';im.alt='';board.appendChild(im)}figs=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')]}
    figs.forEach((img,i)=>img.dataset.fhSlot=String(i));return figs;
  }
  function distribute(board){
    const rs=round(),figs=normalizeBoard(board);figs.forEach((img,i)=>{img.dataset.fhSlot=String(i);img.dataset.fhAssetScale='1';img.classList.remove('fh-fallback-crowd');const src=CLEAN[hash(`${rs.seed}|person:${i}`)%CLEAN.length];if(img.dataset.fhAssigned!==src||img.dataset.fhReady!=='1'){img.dataset.fhAssigned=src;setSource(img,src,false)}});board.dataset.fhQualityReady='1';
  }
  function target(board){const rs=round(),a=rs.age,img=board.querySelector('img.harald-target');if(!img)return;img.style.setProperty('--fh-harald-boost',String(haraldScale(a)));const src=haraldForAge(a);if(img.dataset.fhAssigned!==src||img.dataset.fhReady!=='1'){img.dataset.fhAssigned=src;setSource(img,src,true)}}
  function style(){if(document.getElementById('fh-quality-crowd-style'))return;const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`.crowd-board,.crowd-board img{filter:none!important}.crowd-board img.crowd-figure{image-rendering:auto!important;backface-visibility:hidden!important;animation:none!important;transition:none!important;object-fit:contain!important;font-size:0!important;color:transparent!important}.crowd-board img.crowd-figure[data-fh-broken="1"]{display:none!important}.crowd-board img.fh-quality-crowd{height:var(--fh-crowd-body-h,7.8%)!important;width:auto!important;max-width:14%!important;scale:var(--fh-render-scale,1)!important}.crowd-board img.harald-target{height:var(--fh-crowd-body-h,7.8%)!important;width:auto!important;max-width:14%!important;scale:var(--fh-render-scale,1)!important;z-index:8!important}@media(max-width:700px){.crowd-board{--fh-crowd-body-h:7.8%}.crowd-board img.fh-quality-crowd,.crowd-board img.harald-target{max-width:15%!important}}`;document.head.appendChild(s)}
  function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;distribute(board);target(board);window.__FH_WORLD__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  style();schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});document.addEventListener('fh:round',schedule);addEventListener('pageshow',schedule);window.__FH_VERIFIED_RUNTIME={schedule,get assets(){return CLEAN.slice()},pool(){return CLEAN.slice()}};
})();
