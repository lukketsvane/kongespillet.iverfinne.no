(()=>{
  const TRACKS=[
    '/music/finnharald_ost_1.mp3',
    '/music/finnharald_ost_2.mp3',
    '/music/finnharald_ost_3.mp3',
    '/music/finnharald_ost_4.mp3'
  ];
  const MUTE_KEY='finn-harald-music-muted';
  const TRACK_KEY='finn-harald-music-track';
  const VOLUME=.28;

  let index=Math.max(0,Math.min(TRACKS.length-1,Number(localStorage.getItem(TRACK_KEY))||0));
  let muted=localStorage.getItem(MUTE_KEY)==='1';
  let unlocked=false;
  let hiddenPause=false;
  let consecutiveErrors=0;

  const audio=document.createElement('audio');
  audio.id='fh-music-audio';
  audio.preload='metadata';
  audio.volume=VOLUME;
  audio.playsInline=true;
  audio.setAttribute('aria-hidden','true');
  audio.style.display='none';
  document.body.appendChild(audio);

  function setTrack(i,autoplay=false){
    index=(i+TRACKS.length)%TRACKS.length;
    localStorage.setItem(TRACK_KEY,String(index));
    audio.src=TRACKS[index];
    audio.dataset.track=String(index+1);
    audio.load();
    updateButton();
    if(autoplay&&!muted&&unlocked) audio.play().catch(()=>{});
  }

  function next(){
    consecutiveErrors=0;
    setTrack(index+1,true);
  }

  function updateButton(){
    const b=document.querySelector('.fh-music');
    if(!b)return;
    b.textContent=muted?'♪ MUSIKK AV':'♪ MUSIKK PÅ';
    b.setAttribute('aria-pressed',String(!muted));
    b.setAttribute('aria-label',muted?'Slå på musikken':'Slå av musikken');
    b.title=`Lydspor ${index+1} av ${TRACKS.length}`;
  }

  function ensureButton(){
    const mast=document.querySelector('.masthead');
    if(!mast||mast.querySelector('.fh-music'))return;
    const b=document.createElement('button');
    b.type='button';
    b.className='fh-music';
    b.addEventListener('pointerdown',e=>e.stopPropagation());
    b.addEventListener('click',e=>{
      e.stopPropagation();
      unlocked=true;
      muted=!muted;
      localStorage.setItem(MUTE_KEY,muted?'1':'0');
      if(muted){
        audio.pause();
      }else{
        audio.volume=VOLUME;
        audio.play().catch(()=>{});
      }
      updateButton();
    });
    mast.appendChild(b);
    updateButton();
  }

  function ensureStyle(){
    if(document.getElementById('fh-music-style'))return;
    const s=document.createElement('style');
    s.id='fh-music-style';
    s.textContent=`
      .masthead{position:relative}
      .fh-music{position:absolute;right:82px;bottom:-18px;border:0;background:transparent;color:#6e695e;font:700 9px/1 system-ui;letter-spacing:.11em;padding:7px 0;z-index:9;white-space:nowrap}
      .fh-music:focus-visible{outline:1px solid #81796d;outline-offset:3px}
      @media(max-width:380px){.fh-music{right:76px;font-size:8px}}
    `;
    document.head.appendChild(s);
  }

  function unlock(){
    if(muted)return;
    unlocked=true;
    audio.volume=VOLUME;
    audio.play().then(removeUnlockListeners).catch(()=>{});
  }

  function removeUnlockListeners(){
    document.removeEventListener('pointerdown',unlock,true);
    document.removeEventListener('touchend',unlock,true);
    document.removeEventListener('keydown',unlock,true);
  }

  audio.addEventListener('ended',next);
  audio.addEventListener('playing',()=>{consecutiveErrors=0;audio.dataset.state='playing';updateButton()});
  audio.addEventListener('pause',()=>{audio.dataset.state='paused'});
  audio.addEventListener('error',()=>{
    if(consecutiveErrors>=TRACKS.length-1){audio.dataset.state='error';return;}
    consecutiveErrors+=1;
    setTrack(index+1,!muted&&unlocked);
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      if(!audio.paused){hiddenPause=true;audio.pause();}
    }else if(hiddenPause&&!muted&&unlocked){
      hiddenPause=false;
      audio.play().catch(()=>{});
    }
  });

  const run=()=>{ensureStyle();ensureButton()};
  setTrack(index,false);
  run();
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});

  document.addEventListener('pointerdown',unlock,true);
  document.addEventListener('touchend',unlock,true);
  document.addEventListener('keydown',unlock,true);

  window.__finnHaraldMusic={audio,tracks:TRACKS,get muted(){return muted},get track(){return index+1}};
})();
