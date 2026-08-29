(()=>{
  const FALLBACK=[...new Set(window.__FH_CROWD||[])].filter(src=>typeof src==='string'&&(src.startsWith('data:image/')||src.startsWith('/')));
  const HARALD=['/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'];
  const CHILD=new Set([15,31,32,48,83,90,129,130,151]),TEEN=new Set([104,127,139]),SEATED=new Set([14]);
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0,hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  function age(){return Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent))}
  function year(){return 1937+age()}
  function verified(){return [...(window.__FH_VERIFIED||[])].filter(a=>a&&typeof a.src==='string')}
  function pool(y){const exact=verified().filter(a=>y>=(a.from??1944)&&y<=(a.to??1962));if(exact.length)return exact;return []}
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=12)return HARALD[1];if(a<=30)return HARALD[2];if(a<=59)return HARALD[3];if(a<=73)return HARALD[4];if(a<=82)return HARALD[11];return HARALD[12]}
  function haraldBoost(a){if(a<=2)return 1.55;if(a<=12)return 1.35;if(a<=30)return 1.15;return 1.08}
  function roleScale(a){if(SEATED.has(+a.id))return .8;if(CHILD.has(+a.id))return .72;if(TEEN.has(+a.id))return .86;return 1}
  function visualScale(a){const cleanup=Math.max(.94,Math.min(1.12,+a.visualScale||1));return Math.max(.68,Math.min(1.12,cleanup*roleScale(a)))}
  function remember(img){if(!img.dataset.fhOriginal)img.dataset.fhOriginal=img.dataset.originalSprite||img.getAttribute('src')||'';return img.dataset.fhOriginal}
  function assignVerified(img,a){remember(img);const key=`v${a.id}`;if(img.dataset.fhQualityKey===key&&img.getAttribute('src')===a.src)return;img.dataset.fhQualityKey=key;img.classList.add('fh-quality-crowd','fh-verified-crowd','is-prop');img.classList.remove('fh-fallback-crowd');img.dataset.fhAssetScale=String(visualScale(a));img.decoding='async';img.loading='eager';img.src=a.src}
  function assignFallback(img,src){remember(img);if(!src)return;const key=`f${hash(src)}`;if(img.dataset.fhQualityKey===key&&img.getAttribute('src')===src)return;img.dataset.fhQualityKey=key;img.classList.add('fh-quality-crowd','fh-fallback-crowd','is-prop');img.classList.remove('fh-verified-crowd');img.dataset.fhAssetScale='1';img.decoding='async';img.loading='eager';img.src=src}
  function distribute(board,y){
    const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target):not(.fh-extra-crowd)')];if(!figures.length)return;
    figures.forEach(remember);
    const p=pool(y),era=Math.floor((y-1937)/6);
    const ordered=figures.map((img,i)=>({img,i,k:hash(`${era}|${img.dataset.fhOriginal}|${i}`)})).sort((a,b)=>a.k-b.k);
    const vp=p.map(a=>({a,k:hash(`${era}|verified|${a.id}`)})).sort((a,b)=>a.k-b.k);
    ordered.forEach((f,j)=>{if(vp.length&&j<Math.min(vp.length,Math.ceil(ordered.length*.45)))assignVerified(f.img,vp[j%vp.length].a);else if(FALLBACK.length)assignFallback(f.img,FALLBACK[hash(`${era}|fallback|${f.i}|${f.img.dataset.fhOriginal}`)%FALLBACK.length]);});
  }
  function target(board){const a=age(),img=board.querySelector('img.harald-target');if(!img)return;const src=haraldForAge(a);img.style.setProperty('--fh-harald-boost',String(haraldBoost(a)));if(src&&img.getAttribute('src')!==src)img.src=src}
  function style(){if(document.getElementById('fh-quality-crowd-style'))return;const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`
    html[data-fh-mono="1"] .crowd-board,.crowd-board{filter:none!important}.crowd-board[data-fh-mono="1"] img.crowd-figure,.crowd-board img.crowd-figure{filter:none!important}
    .crowd-board img.crowd-figure{image-rendering:auto!important;backface-visibility:hidden!important;animation:none!important;transition:none!important;will-change:auto!important;object-fit:contain!important}
    .crowd-board img.fh-quality-crowd{height:var(--fh-crowd-body-h,8.35%)!important;width:auto!important;max-width:17%!important}
    .crowd-board img.harald-target{height:var(--fh-harald-h,9.8%)!important;width:auto!important;max-width:18%!important;object-fit:contain!important;scale:var(--fh-render-scale,1)!important;z-index:4!important}
    .crowd-board img.crowd-figure:not(.harald-target){scale:var(--fh-render-scale,1)!important}
    @media(max-width:700px){.crowd-board{--fh-crowd-body-h:8.05%;--fh-harald-h:9.7%}.crowd-board img.fh-quality-crowd{max-width:18%!important}.crowd-board img.harald-target{max-width:19%!important}}
  `;document.head.appendChild(s)}
  let queued=false;
  async function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;const y=year();await window.__FH_VERIFIED_LOADER?.ensure?.(y);if(!board.isConnected)return;distribute(board,y);target(board);window.__FH_VERIFIED_LOADER?.prefetch?.(y+4);window.__FH_WORLD__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('fh-verified-loaded',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});window.__FH_VERIFIED_RUNTIME={get assets(){return verified()},pool,schedule};
})();
