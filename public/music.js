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
  let started=false;
  let hiddenPause=false;
  let consecutiveErrors=0;

  const audio=document.createElement('audio');
  audio.id='fh-music-audio';
  audio.preload='none';
  audio.volume=VOLUME;
  audio.playsInline=true;
  audio.setAttribute('aria-hidden','true');
  audio.style.display='none';
  document.body.appendChild(audio);

  function setTrack(i,autoplay=false){
    index=(i+TRACKS.length)%TRACKS.length;
    localStorage.setItem(TRACK_KEY,String(index));
    if(audio.src!==new URL(TRACKS[index],location.href).href){
      audio.src=TRACKS[index];
      audio.dataset.track=String(index+1);
      audio.load();
    }
    updateButton();
    if(autoplay&&!muted&&started)audio.play().catch(()=>{});
  }

  function next(){
    consecutiveErrors=0;
    setTrack(index+1,true);
  }

  function updateButton(){
    const b=document.querySelector('.fh-music');
    if(!b)return;
    b.textContent='♪';
    b.classList.toggle('is-muted',muted);
    b.setAttribute('aria-pressed',String(started&&!muted));
    b.setAttribute('aria-label',!started?'Start musikken':muted?'Slå på musikken':'Slå av musikken');
    b.title=!started?'Start musikk':muted?'Musikk av':'Musikk på';
  }

  function ensureButton(){
    const mast=document.querySelector('.masthead');
    if(!mast||mast.querySelector('.fh-music'))return;
    const b=document.createElement('button');
    b.type='button';
    b.className='fh-music';
    b.addEventListener('pointerdown',e=>e.stopPropagation());
    b.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      if(!started){
        started=true;
        muted=false;
        localStorage.setItem(MUTE_KEY,'0');
        setTrack(index,true);
        return;
      }
      muted=!muted;
      localStorage.setItem(MUTE_KEY,muted?'1':'0');
      if(muted)audio.pause();
      else{
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
      .fh-music{position:absolute;right:34px;bottom:-22px;width:30px;height:30px;display:grid;place-items:center;border:0;background:transparent;color:#6e695e;font:500 22px/1 Georgia;padding:0;z-index:9;transition:opacity 120ms linear}
      .fh-music.is-muted{opacity:.32}
      .fh-music:focus-visible{outline:1px solid #81796d;outline-offset:1px}
    `;
    document.head.appendChild(s);
  }

  audio.addEventListener('ended',next);
  audio.addEventListener('playing',()=>{consecutiveErrors=0;audio.dataset.state='playing';updateButton()});
  audio.addEventListener('pause',()=>{audio.dataset.state='paused';updateButton()});
  audio.addEventListener('error',()=>{
    if(!started||consecutiveErrors>=TRACKS.length-1){audio.dataset.state='error';return;}
    consecutiveErrors+=1;
    setTrack(index+1,!muted);
  });

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      if(!audio.paused){hiddenPause=true;audio.pause();}
    }else if(hiddenPause&&!muted&&started){
      hiddenPause=false;
      audio.play().catch(()=>{});
    }
  });

  const run=()=>{ensureStyle();ensureButton()};
  run();
  new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});

  window.__finnHaraldMusic={audio,tracks:TRACKS,get muted(){return muted},get track(){return index+1},get started(){return started}};
})();
