(()=>{
  const HARALD=[
    '/game-assets/harald/01_baby_harald.png','/game-assets/harald/02_child_harald.png','/game-assets/harald/03_young_prince.png','/game-assets/harald/04_gala_uniform.png','/game-assets/harald/05_wave.png','/game-assets/harald/06_speech_podium.png','/game-assets/harald/07_walk_left.png','/game-assets/harald/08_walk_right.png','/game-assets/harald/09_worried.png','/game-assets/harald/10_happy.png','/game-assets/harald/11_rubber_boots.png','/game-assets/harald/12_with_cane.png','/game-assets/harald/13_old_with_cane.png','/game-assets/harald/14_balcony_wave.png','/game-assets/harald/15_in_sira.png','/game-assets/harald/16_reading_newspaper.png','/game-assets/harald/17_victory_pose.png','/game-assets/harald/18_game_over.png'
  ];
  const CHILD=new Set([15,31,32,48,83,90,129,130,151]);
  const TEEN=new Set([104,127,139]);
  const SEATED=new Set([14]);
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};

  function age(){return Math.max(0,num(document.querySelector('.age-lockup strong')?.textContent))}
  function year(){
    const labels=[...document.querySelectorAll('*')].filter(x=>x.children.length===0&&x.textContent?.trim()==='ÅR');
    for(const label of labels){
      let p=label.parentElement;
      for(let d=0;p&&d<4;d++,p=p.parentElement){
        const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^(19|20)\d{2}$/.test((x.textContent||'').trim()));
        if(v)return num(v.textContent);
      }
    }
    return 1937+age();
  }
  function allVerified(){return [...(window.__FH_VERIFIED||[])].filter(a=>a&&typeof a.src==='string')}
  function pool(y){return allVerified().filter(a=>y>=a.from&&y<=a.to)}
  function haraldForAge(a){if(a<=2)return HARALD[0];if(a<=12)return HARALD[1];if(a<=30)return HARALD[2];if(a<=59)return HARALD[3];if(a<=73)return HARALD[4];if(a<=82)return HARALD[11];return HARALD[12]}
  function roleScale(a){if(SEATED.has(+a.id))return .78;if(CHILD.has(+a.id))return .72;if(TEEN.has(+a.id))return .86;return 1}
  function visualScale(a){const cleanup=Math.max(.94,Math.min(1.12,+a.visualScale||1));return Math.max(.66,Math.min(1.12,cleanup*roleScale(a)))}
  function original(img){return img.dataset.fhOriginal||img.dataset.originalSprite||img.getAttribute('src')||''}
  function restore(img){
    const src=original(img);if(src&&img.getAttribute('src')!==src)img.src=src;
    delete img.dataset.fhVerifiedId;delete img.dataset.fhVerifiedYear;
    img.classList.remove('fh-verified-crowd','fh-real-crowd');
    img.style.removeProperty('--fh-asset-scale');img.style.removeProperty('--fh-asset-aspect');
  }
  function assign(img,a){
    if(!img.dataset.fhOriginal)img.dataset.fhOriginal=img.dataset.originalSprite||img.getAttribute('src')||'';
    if(img.dataset.fhVerifiedId===String(a.id)&&img.getAttribute('src')===a.src)return;
    img.dataset.fhVerifiedId=String(a.id);img.dataset.fhVerifiedYear=String(a.year);
    img.classList.add('fh-verified-crowd','fh-real-crowd','is-prop');
    img.style.setProperty('--fh-asset-scale',String(visualScale(a)));img.style.setProperty('--fh-asset-aspect',String(a.aspect||.45));
    img.decoding='async';img.loading='eager';img.src=a.src;
  }
  function distribute(board,y){
    const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target):not(.fh-extra-crowd)')];if(!figures.length)return;
    const p=pool(y);
    if(y<1944||!p.length){figures.forEach(restore);return}
    const fs=figures.map((img,i)=>({img,k:hash(`${y}|figure|${img.style.left}|${img.style.top}|${i}`)})).sort((a,b)=>a.k-b.k);
    const ps=p.map(a=>({a,k:hash(`${y}|asset|${a.id}`)})).sort((a,b)=>a.k-b.k);
    const count=Math.min(fs.length,ps.length);
    for(let i=0;i<count;i++)assign(fs[i].img,ps[i].a);
    for(let i=count;i<fs.length;i++)restore(fs[i].img);
  }
  function target(board){const a=age(),img=board.querySelector('img.harald-target');if(!img)return;const src=haraldForAge(a);if(src&&img.getAttribute('src')!==src)img.src=src}
  function style(){
    if(document.getElementById('fh-quality-crowd-style'))return;
    const s=document.createElement('style');s.id='fh-quality-crowd-style';s.textContent=`
      html[data-fh-mono="1"] .crowd-board,.crowd-board{filter:none!important}
      .crowd-board[data-fh-mono="1"] img.crowd-figure,.crowd-board img.crowd-figure{filter:none!important}
      .crowd-board img.crowd-figure{image-rendering:auto;-webkit-transform:translateZ(0);backface-visibility:hidden}
      .crowd-board img.fh-verified-crowd{height:calc(var(--fh-crowd-body-h,9.4%) * var(--fh-asset-scale,1))!important;width:auto!important;max-width:18%!important;object-fit:contain!important}
      .crowd-board img.harald-target{height:var(--fh-harald-h,8.4%)!important;width:auto!important;max-width:15%!important;object-fit:contain!important}
      @media(max-width:700px){.crowd-board{--fh-crowd-body-h:9.8%;--fh-harald-h:8.8%}.crowd-board img.fh-verified-crowd{max-width:20%!important}}
    `;document.head.appendChild(s);
  }
  let queued=false;
  async function run(){queued=false;style();const board=document.querySelector('.crowd-board');if(!board)return;const y=year();await window.__FH_VERIFIED_LOADER?.ensure?.(y);if(!board.isConnected)return;distribute(board,y);target(board);window.__FH_VERIFIED_LOADER?.prefetch?.(y+5)}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  addEventListener('fh-verified-loaded',schedule);document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_VERIFIED_RUNTIME={get assets(){return allVerified()},pool,schedule};
})();
