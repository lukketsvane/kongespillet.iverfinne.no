(()=>{
  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];
  const CHILD=new Set([15,31,32,48,83,90,129,130,151]),TEEN=new Set([104,127,139]),SEATED=new Set([14]);
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const cropCache=new Map();let atlasImagePromise=null;
  const age=()=>Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent)),year=()=>1937+age();
  function atlas(){return window.__FH_VERIFIED_ATLAS||null}
  function allVerified(){return atlas()?.assets||[]}
  function pool(y){return allVerified().filter(a=>y>=a.from&&y<=a.to)}
  function roleScale(a){if(SEATED.has(+a.id))return .8;if(CHILD.has(+a.id))return .74;if(TEEN.has(+a.id))return .88;return 1}
  function visualScale(a){return Math.max(.68,Math.min(1.1,(+a.visualScale||1)*roleScale(a)))}
  function loadAtlasImage(){if(atlasImagePromise)return atlasImagePromise;const A=atlas();if(!A)return Promise.resolve(null);atlasImagePromise=new Promise(resolve=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=A.src});return atlasImagePromise}
  function crop(a){if(cropCache.has(a.id))return cropCache.get(a.id);const p=loadAtlasImage().then(im=>{if(!im)return null;const c=document.createElement('canvas');c.width=a.w;c.height=a.h;const g=c.getContext('2d',{alpha:true});g.drawImage(im,a.x,a.y,a.w,a.h,0,0,a.w,a.h);return c.toDataURL('image/png')}).catch(()=>null);cropCache.set(a.id,p);return p}
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=12)return HARALD[1];if(a<=30)return HARALD[2];if(a<=59)return HARALD[3];if(a<=73)return HARALD[4];if(a<=82)return HARALD[11];return HARALD[12]}
  function original(img){return img.dataset.fhOriginal||img.dataset.originalSprite||img.getAttribute('src')||''}
  function restore(img){const src=original(img);if(src&&img.getAttribute('src')!==src)img.src=src;delete img.dataset.fhVerifiedId;delete img.dataset.fhVerifiedYear;img.classList.remove('fh-verified-crowd','fh-real-crowd');img.style.removeProperty('--fh-asset-scale');img.style.removeProperty('clip-path')}
  async function assign(img,a,token){if(!img.dataset.fhOriginal)img.dataset.fhOriginal=img.dataset.originalSprite||img.getAttribute('src')||'';const src=await crop(a);if(!src||!img.isConnected||img.dataset.fhAssignToken!==token)return;img.dataset.fhVerifiedId=String(a.id);img.dataset.fhVerifiedYear=String(a.year);img.classList.add('fh-verified-crowd','fh-real-crowd','is-prop');img.style.setProperty('--fh-asset-scale',String(visualScale(a)));if(a.clip)img.style.clipPath=a.clip;else img.style.removeProperty('clip-path');img.decoding='async';img.loading='eager';if(img.getAttribute('src')!==src)img.src=src}
  function distribute(board,y){const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')];if(!figures.length)return;const p=pool(y);if(y<1944||!p.length){figures.forEach(restore);return}figures.forEach((img,i)=>{const a=p[hash(`${y}|${img.dataset.fhUid||i}|${i}`)%p.length],token=`${y}:${a.id}:${i}`;img.dataset.fhAssignToken=token;assign(img,a,token)})}
  function target(board){const a=age(),img=board.querySelector('img.harald-target');if(!img)return;const src=haraldForAge(a);if(src&&img.getAttribute('src')!==src)img.src=src;img.style.removeProperty('clip-path')}
  function style(){if(document.getElementById('fh-quality-crowd-style'))return;const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`
    html[data-fh-mono="1"] .crowd-board,.crowd-board{filter:none!important}.crowd-board[data-fh-mono="1"] img.crowd-figure,.crowd-board img.crowd-figure{filter:none!important}
    .crowd-board img.crowd-figure{image-rendering:auto;backface-visibility:hidden;object-fit:contain!important;transform:translate(-50%,-50%)!important;transform-origin:center!important}
    .crowd-board img.fh-verified-crowd{height:calc(var(--fh-person-px,70px)*var(--fh-asset-scale,1))!important;width:auto!important;max-width:none!important}.crowd-board img.fh-extra-crowd:not(.fh-verified-crowd){height:var(--fh-person-px,70px)!important;width:auto!important;max-width:none!important}.crowd-board img.harald-target{height:var(--fh-harald-px,76px)!important;width:auto!important;max-width:none!important;scale:1!important;z-index:6!important}
  `;document.head.appendChild(s)}
  let queued=false,runId=0;
  async function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;const id=++runId,y=year();await window.__FH_VERIFIED_LOADER?.ensure?.(y);if(id!==runId||!board.isConnected)return;distribute(board,y);target(board);window.__FH_VERIFIED_LOADER?.prefetch?.(y+5);window.__FH_EXPLORE__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('fh-verified-atlas-ready',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});window.__FH_VERIFIED_RUNTIME={get assets(){return allVerified()},pool,schedule};
})();
