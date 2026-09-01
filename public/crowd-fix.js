(()=>{
  function style(){if(document.getElementById('fh-crowd-fix-style'))return;const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
    .crowd-board img.crowd-figure{animation:none!important;transition:none!important}
  `;document.head.appendChild(s)}
  let queued=false;
  function run(){queued=false;style();document.documentElement.dataset.fhMode='competition';window.__FH_WORLD__?.schedule?.()}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true});window.__FH_CROWD_FIX__={schedule};
})();
