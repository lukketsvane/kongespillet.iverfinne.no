(()=>{
  const st={board:null,serial:0,age:0,seed:'0:0',queued:false};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const liveAge=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  function publish(board){
    if(!board)return;
    board.dataset.fhRoundSeed=st.seed;
    board.dataset.fhRoundAge=String(st.age);
    document.documentElement.dataset.fhRoundSeed=st.seed;
    document.documentElement.dataset.fhRoundAge=String(st.age);
  }
  function begin(board,reason='board'){
    if(!board)return;
    st.board=board;st.serial+=1;st.age=liveAge();st.seed=`${st.serial}:${st.age}`;publish(board);wire(board);
    window.__FH_VERIFIED_RUNTIME?.schedule?.();window.__FH_WORLD__?.schedule?.();
    document.dispatchEvent(new CustomEvent('fh:round',{detail:{seed:st.seed,age:st.age,reason}}));
  }
  function ensure(){
    st.queued=false;
    const board=document.querySelector('.crowd-board');if(!board)return null;
    if(st.board!==board||!board.dataset.fhRoundSeed)begin(board,'board');else{publish(board);wire(board)}
    return{seed:st.seed,age:st.age,serial:st.serial};
  }
  function advance(board){
    if(board!==document.querySelector('.crowd-board'))return;
    st.serial+=1;st.age=liveAge();st.seed=`${st.serial}:${st.age}`;publish(board);
    window.__FH_VERIFIED_RUNTIME?.schedule?.();window.__FH_WORLD__?.schedule?.();
    document.dispatchEvent(new CustomEvent('fh:round',{detail:{seed:st.seed,age:st.age,reason:'found'}}));
  }
  function wire(board){
    if(board.dataset.fhRoundLockWired)return;board.dataset.fhRoundLockWired='1';
    board.addEventListener('click',e=>{
      const t=e.target instanceof Element?e.target.closest('img.harald-target'):null;
      if(!t)return;
      setTimeout(()=>advance(board),80);
    },true);
  }
  function schedule(){if(st.queued)return;st.queued=true;requestAnimationFrame(ensure)}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.__FH_ROUND__={get(){return ensure()||{seed:st.seed,age:st.age,serial:st.serial}},schedule,advance};
})();
