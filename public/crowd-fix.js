(()=>{
  function style(){if(document.getElementById('fh-crowd-fix-style'))return;const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
    .crowd-board img.harald-target{scale:1!important;filter:none!important}
    .crowd-board img.crowd-figure{filter:none!important}
    .crowd-board img.crowd-figure.is-wandering{animation:none!important;transition:none!important}
  `;document.head.appendChild(s)}
  let queued=false;
  function fit(board,img){if(!img.isConnected)return;const br=board.getBoundingClientRect(),r=img.getBoundingClientRect();if(!br.width||!r.width)return;const world=img.closest('.fh-world');if(world)return;const pad=5;let dx=0,dy=0;if(r.left<br.left+pad)dx+=(br.left+pad)-r.left;if(r.right>br.right-pad)dx+=(br.right-pad)-r.right;if(r.top<br.top+pad)dy+=(br.top+pad)-r.top;if(r.bottom>br.bottom-pad)dy+=(br.bottom-pad)-r.bottom;img.style.translate=`${Math.round(dx)}px ${Math.round(dy)}px`}
  function run(){queued=false;style();const b=document.querySelector('.crowd-board');if(!b)return;requestAnimationFrame(()=>b.querySelectorAll('img.crowd-figure').forEach(i=>fit(b,i)))}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});addEventListener('resize',schedule,{passive:true});window.__FH_CROWD_FIX__={schedule};
})();
