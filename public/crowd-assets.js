(()=>{
  const FALLBACK=[...new Set(window.__FH_CROWD||[])].filter(src=>typeof src==='string'&&(src.startsWith('data:image/')||src.startsWith('/')));
  const HARALD=['/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'];
  const CHILD=new Set([15,31,32,48,83,90,129,130,151]),TEEN=new Set([104,127,139]),SEATED=new Set([14]);
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const analysis=new Map();let fallbackReady=null,GOOD=[];
  function age(){return Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent))}
  function year(){return 1937+age()}
  function verified(){return [...(window.__FH_VERIFIED||[])].filter(a=>a&&typeof a.src==='string')}
  function pool(y){const all=verified();const exact=all.filter(a=>y>=(a.from??1944)&&y<=(a.to??1962));if(exact.length)return exact;if(y<1944)return all.filter(a=>(a.from??9999)<=1950).slice(0,8);return []}
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=12)return HARALD[1];if(a<=30)return HARALD[2];if(a<=59)return HARALD[3];if(a<=73)return HARALD[4];if(a<=82)return HARALD[11];return HARALD[12]}
  function physicalHarald(a){if(a<=2)return .70;if(a<=6)return .78;if(a<=12)return .88;if(a<=30)return .98;return 1.03}
  function roleScale(a){if(SEATED.has(+a.id))return .80;if(CHILD.has(+a.id))return .72;if(TEEN.has(+a.id))return .86;return 1}
  function visualScale(a){const cleanup=clamp(+a.visualScale||1,.94,1.10);return clamp(cleanup*roleScale(a),.68,1.10)}
  function inspect(src){
    if(analysis.has(src))return analysis.get(src);
    const p=new Promise(resolve=>{const im=new Image();im.decoding='async';im.onload=()=>{
      try{
        const max=112,s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s));
        const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,w,h);const d=g.getImageData(0,0,w,h).data;
        const corner=[0,(w-1)*4,(h-1)*w*4,((h-1)*w+w-1)*4].map(i=>d[i+3]);const transparent=corner.some(a=>a<80);
        let x0=w,y0=h,x1=-1,y1=-1,count=0,top=0,bottom=0,left=0,right=0;
        for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=d[i+3],fg=transparent?a>28:(a>28&&(d[i]<244||d[i+1]<244||d[i+2]<244));if(!fg)continue;count++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);if(y<=1)top++;if(y>=h-2)bottom++;if(x<=1)left++;if(x>=w-2)right++}
        if(x1<0||count<20)return resolve({ok:false,scale:1});
        const bh=y1-y0+1,bw=x1-x0+1,fillH=bh/h,fillW=bw/w,edge=Math.max(top,bottom)/Math.max(1,w),side=Math.max(left,right)/Math.max(1,h);
        const low=im.naturalHeight<135||im.naturalWidth<38;const cropped=edge>.035||side>.05;const tiny=fillH<.42||fillW<.12;
        resolve({ok:!low&&!cropped&&!tiny,scale:clamp(.91/fillH,.88,1.38),fillH,fillW,nw:im.naturalWidth,nh:im.naturalHeight});
      }catch{resolve({ok:true,scale:1})}
    };im.onerror=()=>resolve({ok:false,scale:1});im.src=src});analysis.set(src,p);return p
  }
  function prepareFallback(){if(fallbackReady)return fallbackReady;fallbackReady=Promise.all(FALLBACK.map(async src=>({src,m:await inspect(src)}))).then(rows=>{GOOD=rows.filter(x=>x.m.ok);if(GOOD.length<8)GOOD=rows.filter(x=>x.m.nh>=120);return GOOD});return fallbackReady}
  function remember(img){if(!img.dataset.fhOriginal)img.dataset.fhOriginal=img.dataset.originalSprite||img.getAttribute('src')||'';return img.dataset.fhOriginal}
  function assignVerified(img,a){remember(img);const key=`v${a.id}`;img.dataset.fhQualityKey=key;img.classList.add('fh-quality-crowd','fh-verified-crowd','is-prop');img.classList.remove('fh-fallback-crowd');img.dataset.fhAssetScale=String(visualScale(a));img.style.visibility='visible';img.decoding='async';img.loading='eager';if(img.getAttribute('src')!==a.src)img.src=a.src}
  function assignFallback(img,row){remember(img);if(!row?.src)return;const key=`f${hash(row.src)}`;img.dataset.fhQualityKey=key;img.classList.add('fh-quality-crowd','fh-fallback-crowd','is-prop');img.classList.remove('fh-verified-crowd');img.dataset.fhAssetScale=String(row.m?.scale||1);img.style.visibility='visible';img.decoding='async';img.loading='eager';if(img.getAttribute('src')!==row.src)img.src=row.src}
  async function distribute(board,y){
    const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')];if(!figures.length)return;figures.forEach(remember);
    const good=await prepareFallback(),p=pool(y),era=Math.floor((y-1937)/6);if(!board.isConnected)return;
    const vp=p.map(a=>({a,k:hash(`${era}|verified|${a.id}`)})).sort((a,b)=>a.k-b.k);
    figures.forEach((img,i)=>{const chooseVerified=vp.length&&(hash(`${era}|mix|${img.dataset.fhUid||i}`)%100)<46;if(chooseVerified)assignVerified(img,vp[hash(`${era}|v|${img.dataset.fhUid||i}`)%vp.length].a);else if(good.length)assignFallback(img,good[hash(`${era}|f|${img.dataset.fhUid||i}`)%good.length])});
    board.dataset.fhQualityReady='1';
  }
  async function target(board){const a=age(),img=board.querySelector('img.harald-target');if(!img)return;const src=haraldForAge(a);if(src&&img.getAttribute('src')!==src)img.src=src;const m=await inspect(src);if(!img.isConnected)return;img.style.setProperty('--fh-harald-boost',String(clamp(physicalHarald(a)*(m?.scale||1),.68,1.52)));img.style.visibility='visible'}
  function style(){if(document.getElementById('fh-quality-crowd-style'))return;const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`
    html[data-fh-mono="1"] .crowd-board,.crowd-board{filter:none!important}.crowd-board[data-fh-mono="1"] img.crowd-figure,.crowd-board img.crowd-figure{filter:none!important}
    .crowd-board img.crowd-figure{image-rendering:auto!important;backface-visibility:hidden!important;animation:none!important;transition:none!important;will-change:auto!important;object-fit:contain!important}
    .crowd-board:not([data-fh-quality-ready="1"]) img.crowd-figure:not(.harald-target){opacity:0!important}
    .crowd-board img.fh-quality-crowd{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;max-width:18%!important;scale:var(--fh-render-scale,1)!important}
    .crowd-board img.harald-target{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;max-width:18%!important;object-fit:contain!important;scale:var(--fh-render-scale,1)!important;z-index:7!important}
    @media(max-width:700px){.crowd-board{--fh-crowd-body-h:9.0%}.crowd-board img.fh-quality-crowd,.crowd-board img.harald-target{max-width:20%!important}}
  `;document.head.appendChild(s)}
  let queued=false,runId=0;
  async function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;const id=++runId,y=year();await window.__FH_VERIFIED_LOADER?.ensure?.(Math.max(1937,y));if(id!==runId||!board.isConnected)return;await distribute(board,y);await target(board);window.__FH_VERIFIED_LOADER?.prefetch?.(y+4);window.__FH_WORLD__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  prepareFallback();schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});addEventListener('fh-verified-loaded',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});window.__FH_VERIFIED_RUNTIME={get assets(){return verified()},pool,schedule,inspect};
})();
