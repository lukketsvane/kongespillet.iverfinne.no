(()=>{
  const good=()=>[...new Set(window.__FH_CROWD||[])].filter(x=>typeof x==='string'&&x.startsWith('data:image/'));
  let cursor=0;
  function repair(img){
    if(!img||img.dataset.fhRepairing==='1'||img.classList.contains('harald-target'))return;
    const pool=good();if(!pool.length){img.style.visibility='hidden';return}
    img.dataset.fhRepairing='1';img.classList.add('crowd-figure','fh-quality-crowd','fh-fallback-crowd','is-prop');
    img.alt='';img.removeAttribute('title');img.style.visibility='hidden';
    const src=pool[(cursor++)%pool.length];
    const done=()=>{img.dataset.fhRepairing='0';img.style.visibility='visible';window.__FH_WORLD__?.schedule?.()};
    img.addEventListener('load',done,{once:true});img.src=src;
  }
  function style(){if(document.getElementById('fh-crowd-fix-style'))return;const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
    .crowd-board,.crowd-board img{filter:none!important}
    .crowd-board img{animation:none!important;transition:none!important;color:transparent!important;text-indent:-9999px!important}
    .crowd-board img:not(.harald-target){font-size:0!important}
  `;document.head.appendChild(s)}
  function sweep(){
    style();document.documentElement.dataset.fhMode='competition';
    const b=document.querySelector('.crowd-board');if(!b)return;
    b.querySelectorAll('img').forEach(img=>{img.alt='';if(img.complete&&img.naturalWidth===0)repair(img)});
    window.__FH_WORLD__?.schedule?.();
  }
  document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.closest('.crowd-board')){e.preventDefault();repair(img)}},true);
  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sweep()})}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true});window.__FH_CROWD_FIX__={schedule,repair};
})();
