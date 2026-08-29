(()=>{
  const MODE_KEY='finn-harald-mode';
  const mode=()=>{const k=localStorage.getItem(MODE_KEY)||'konge';return ['roleg','konge','panikk'].includes(k)?k:'konge'};
  function fit(board,img){
    if(!img.isConnected)return;
    const br=board.getBoundingClientRect(),r=img.getBoundingClientRect();if(!br.width||!r.width)return;
    const pad=5;let dx=0,dy=0;
    if(r.left<br.left+pad)dx+=(br.left+pad)-r.left;if(r.right>br.right-pad)dx+=(br.right-pad)-r.right;
    if(r.top<br.top+pad)dy+=(br.top+pad)-r.top;if(r.bottom>br.bottom-pad)dy+=(br.bottom-pad)-r.bottom;
    img.style.translate=`${Math.round(dx)}px ${Math.round(dy)}px`;
  }
  function style(){
    if(document.getElementById('fh-crowd-fix-style'))return;
    const s=document.createElement('style');s.id='fh-crowd-fix-style';s.textContent=`
      html[data-fh-mode="roleg"]{--fh-mode-target:1.13}html[data-fh-mode="konge"]{--fh-mode-target:1}html[data-fh-mode="panikk"]{--fh-mode-target:.86}
      .crowd-board img.harald-target{scale:calc(var(--fh-target-scale,.84)*var(--fh-mode-target,1))!important;transform-origin:center}
    `;document.head.appendChild(s)
  }
  let queued=false;
  function run(){queued=false;style();document.documentElement.dataset.fhMode=mode();const b=document.querySelector('.crowd-board');if(!b)return;requestAnimationFrame(()=>b.querySelectorAll('img.crowd-figure').forEach(i=>fit(b,i)))}
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','style','class']});
  addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_CROWD_FIX__={schedule};
})();
