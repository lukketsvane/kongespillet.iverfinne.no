(()=>{
  function style(){if(document.getElementById('fh-crowd-fix-style'))return;const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
    .crowd-board,.crowd-board img{filter:none!important}.crowd-board img{animation:none!important;transition:none!important;color:transparent!important;font-size:0!important}.crowd-board img[data-fh-broken="1"]{display:none!important}.crowd-board img.crowd-figure:not([data-fh-ready="1"]){visibility:hidden!important}
  `;document.head.appendChild(s)}
  function reject(img){if(!img||!img.closest('.crowd-board'))return;img.alt='';img.dataset.fhBroken='1';img.style.visibility='hidden';if(!img.classList.contains('harald-target'))img.remove()}
  function sweep(){style();document.documentElement.dataset.fhMode='competition';const b=document.querySelector('.crowd-board');if(!b)return;b.querySelectorAll('img').forEach(img=>{img.alt=img.classList.contains('harald-target')?'Kong Harald':'';if(img.complete&&img.naturalWidth===0)reject(img)});window.__FH_WORLD__?.schedule?.()}
  document.addEventListener('error',e=>{const img=e.target;if(img instanceof HTMLImageElement&&img.closest('.crowd-board')){e.preventDefault();reject(img)}},true);
  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sweep()})}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true});window.__FH_CROWD_FIX__={schedule,reject};
})();
