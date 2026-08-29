(()=>{
  const PEOPLE=["https://i.ibb.co/35JCrcYH/1945-11.webp","https://i.ibb.co/hxvZZvtn/1966-12.webp","https://i.ibb.co/FkY0KJtp/2024-11.webp","https://i.ibb.co/ZpGgF7pg/1952-01.webp","https://i.ibb.co/5hMW8tC6/1988-10.webp","https://i.ibb.co/Kvj5hwq/1945-01.webp","https://i.ibb.co/jkMF7MJY/2024-06.webp","https://i.ibb.co/FbTc3sjc/1943-01.webp","https://i.ibb.co/LdHfzw8s/1956-12.webp","https://i.ibb.co/m5TthtDv/1966-07.webp","https://i.ibb.co/jkvBcdXM/1994-12.webp","https://i.ibb.co/ccXvHWbc/1974-02.webp","https://i.ibb.co/TMw17MfQ/1945-06.webp","https://i.ibb.co/XfNY5CZH/1943-06.webp","https://i.ibb.co/8gdnQKkr/1943-11.webp","https://i.ibb.co/gFL2BXB5/1988-15.webp","https://i.ibb.co/Ps6zmX85/1974-07.webp","https://i.ibb.co/sJCBXZwM/2024-01.webp","https://i.ibb.co/0pycNX4L/1966-02.webp","https://i.ibb.co/wFy0y6Hj/2015-12.webp","https://i.ibb.co/fzXkN4qX/1988-05.webp","https://i.ibb.co/4nqgV7LQ/1994-07.webp","https://i.ibb.co/9RkQgwZ/1974-16.webp","https://i.ibb.co/YBMrmq85/1952-13.webp","https://i.ibb.co/Wvzb33rZ/1940-11.webp","https://i.ibb.co/ksvj1sNn/2015-07.webp","https://i.ibb.co/BKH3wBK6/1956-07.webp","https://i.ibb.co/zWqP21sB/1994-02.webp","https://i.ibb.co/fz52qs4R/1952-08.webp","https://i.ibb.co/VWkTD70j/1940-06.webp","https://i.ibb.co/3mvphmVH/2015-02.webp","https://i.ibb.co/ZzD1VhMS/1974-11.webp","https://i.ibb.co/RpvGLtCY/1945-13.webp","https://i.ibb.co/S444X7Kj/1956-02.webp","https://i.ibb.co/LHn3m3H/1966-14.webp","https://i.ibb.co/SXnp6nTY/1952-03.webp","https://i.ibb.co/pBmTt3v9/1940-01.webp","https://i.ibb.co/KcX4hq20/1943-13.webp","https://i.ibb.co/4nY0nT40/2024-13.webp","https://i.ibb.co/wFpg5tHT/2024-08.webp","https://i.ibb.co/6cNypMg1/1945-08.webp","https://i.ibb.co/HTVnL1XL/1945-03.webp","https://i.ibb.co/xq8JhM7j/1966-09.webp","https://i.ibb.co/qYt3YZH8/1974-04.webp","https://i.ibb.co/v6BT5fpt/1988-12.webp","https://i.ibb.co/2X9mcYH/1943-08.webp","https://i.ibb.co/nq8d5P05/1994-14.webp","https://i.ibb.co/BV6g3pd7/2024-03.webp","https://i.ibb.co/fVqZcsZx/1966-04.webp","https://i.ibb.co/pvBKRLdr/1988-07.webp","https://i.ibb.co/SDy5w7b8/1943-03.webp","https://i.ibb.co/fVy8hWGT/1956-14.webp","https://i.ibb.co/mCNrwrwT/1994-09.webp","https://i.ibb.co/RpgL9jwq/2015-14.webp","https://i.ibb.co/CpxjF2vY/1952-15.webp","https://i.ibb.co/5hxmp2bg/1988-02.webp","https://i.ibb.co/QjJt5KtV/1940-13.webp","https://i.ibb.co/hRh8C8b6/2015-09.webp","https://i.ibb.co/CZ8bJXP/1994-04.webp","https://i.ibb.co/hF0XNp9F/1956-09.webp","https://i.ibb.co/SXCNdq2V/1940-08.webp","https://i.ibb.co/wNLZh3Y0/1952-10.webp","https://i.ibb.co/3YBfBznJ/1974-13.webp","https://i.ibb.co/hRysyh63/1956-04.webp","https://i.ibb.co/VY74mSwX/2015-04.webp","https://i.ibb.co/gFjYGBkZ/1945-15.webp","https://i.ibb.co/B2y1K4S7/1952-05.webp","https://i.ibb.co/G3tGWRM0/1966-16.webp","https://i.ibb.co/DJcq6ys/1940-03.webp","https://i.ibb.co/jkt30mzM/1943-15.webp","https://i.ibb.co/Q32tTt4w/2024-15.webp","https://i.ibb.co/KpJ9Tmrp/2024-10.webp","https://i.ibb.co/sJCCQFzw/1945-10.webp","https://i.ibb.co/3y8RbV2M/1945-05.webp","https://i.ibb.co/5WxTwsxY/1966-11.webp","https://i.ibb.co/N67djgky/1988-14.webp","https://i.ibb.co/nsL9xFzH/1943-10.webp","https://i.ibb.co/8L4vnrXB/1974-06.webp","https://i.ibb.co/MktmV3yw/2024-05.webp","https://i.ibb.co/tw275dZg/1994-16.webp","https://i.ibb.co/5hVsSxms/1966-06.webp","https://i.ibb.co/jvqMfZt2/1988-09.webp","https://i.ibb.co/m5yvRCJT/1943-05.webp","https://i.ibb.co/CsTjbf70/1974-01.webp","https://i.ibb.co/7JzD4nRg/2015-16.webp","https://i.ibb.co/yMhpwmD/1994-11.webp","https://i.ibb.co/qYMGc3rk/1966-01.webp","https://i.ibb.co/VYVZKPfJ/1988-04.webp","https://i.ibb.co/Mb4rR38/1940-15.webp","https://i.ibb.co/S4y06TsS/1956-11.webp","https://i.ibb.co/sdzFjQhJ/2015-11.webp","https://i.ibb.co/fzQNzfqY/1994-06.webp","https://i.ibb.co/fY28Cvq6/1952-12.webp","https://i.ibb.co/RkL25ZBf/1974-15.webp","https://i.ibb.co/Jj9X3PRX/1940-10.webp","https://i.ibb.co/LzMBpZ4P/1956-06.webp","https://i.ibb.co/RG2MwHn0/2015-06.webp","https://i.ibb.co/39D8KFBH/1994-01.webp","https://i.ibb.co/gZqJWVxK/1952-07.webp","https://i.ibb.co/ycCQYFvV/1974-10.webp","https://i.ibb.co/tMn3jTFx/1940-05.webp","https://i.ibb.co/5XT3C8Nm/1956-01.webp","https://i.ibb.co/7N6PWPZt/2015-01.webp","https://i.ibb.co/9H1R44T2/2024-12.webp","https://i.ibb.co/m5ZP6RtN/1945-12.webp","https://i.ibb.co/DP5r7YtH/1952-02.webp","https://i.ibb.co/B2T5xDtd/1966-13.webp","https://i.ibb.co/C3CYcStc/1988-16.webp","https://i.ibb.co/whxydPB0/1943-12.webp","https://i.ibb.co/b5Zyv9c0/1974-08.webp","https://i.ibb.co/gZ29vtWM/2024-07.webp","https://i.ibb.co/zWGrnsnZ/1945-07.webp","https://i.ibb.co/kVChrxk1/1945-02.webp","https://i.ibb.co/pB7WpGHr/1966-08.webp","https://i.ibb.co/BHjVX5F7/1988-11.webp","https://i.ibb.co/JR9D0PXS/1943-07.webp","https://i.ibb.co/GQtyr70c/2024-02.webp","https://i.ibb.co/cXxfZ19g/1974-03.webp","https://i.ibb.co/1tTb2QVY/1994-13.webp","https://i.ibb.co/cX8WCp8j/1966-03.webp","https://i.ibb.co/8nDF6nQ1/1988-06.webp","https://i.ibb.co/fV8TbDZG/1943-02.webp","https://i.ibb.co/NgP5KJb6/1956-13.webp","https://i.ibb.co/yc6Gv6tF/2015-13.webp","https://i.ibb.co/Z1pyMFRG/1994-08.webp","https://i.ibb.co/LhdfSH6J/1952-14.webp","https://i.ibb.co/gLCLnrMc/1988-01.webp","https://i.ibb.co/QjDym1MT/1940-12.webp","https://i.ibb.co/CpT83LFC/1956-08.webp","https://i.ibb.co/d0P2VD2m/2015-08.webp","https://i.ibb.co/GfXHCyd3/1994-03.webp","https://i.ibb.co/TD1cmkJS/1952-09.webp","https://i.ibb.co/k2kQMkLL/1974-12.webp","https://i.ibb.co/XxSfczt1/1940-07.webp","https://i.ibb.co/k2dNr8xD/1956-03.webp","https://i.ibb.co/GZjsfB4/2015-03.webp","https://i.ibb.co/qM7VPzXX/1945-14.webp","https://i.ibb.co/Zp6TZ2vf/1952-04.webp","https://i.ibb.co/F4L7vnbt/1966-15.webp","https://i.ibb.co/YFMy1bqj/1940-02.webp","https://i.ibb.co/5xLKN5q3/1943-14.webp","https://i.ibb.co/hp7mvMR/2024-14.webp","https://i.ibb.co/WWGw3RyC/2024-09.webp","https://i.ibb.co/fYW7NyVr/1945-09.webp","https://i.ibb.co/7Jh8bLVT/1945-04.webp","https://i.ibb.co/qLbcByt4/1966-10.webp","https://i.ibb.co/1GG3YVP4/1988-13.webp","https://i.ibb.co/0jzvJrLJ/1943-09.webp","https://i.ibb.co/1YpqHgyf/1974-05.webp","https://i.ibb.co/B5dqQ2kX/2024-04.webp","https://i.ibb.co/pv8nSGqj/1994-15.webp","https://i.ibb.co/bjXbL9Zw/1966-05.webp","https://i.ibb.co/TMqD995Q/1988-08.webp","https://i.ibb.co/bg1xhCjy/1943-04.webp","https://i.ibb.co/7JgBqLVF/1956-15.webp","https://i.ibb.co/hRqHvGYc/2015-15.webp","https://i.ibb.co/3yTSMDL9/1994-10.webp","https://i.ibb.co/8LgcQXSG/1952-16.webp","https://i.ibb.co/JwNtxZKS/1988-03.webp","https://i.ibb.co/FLX0GtTw/1940-14.webp","https://i.ibb.co/bMKKYXBd/1956-10.webp","https://i.ibb.co/Gf83Vnks/2015-10.webp","https://i.ibb.co/bjgCFZgK/1994-05.webp","https://i.ibb.co/JRhXk9Yg/1952-11.webp","https://i.ibb.co/23NDh5f3/1974-14.webp","https://i.ibb.co/SXjWJkSq/1940-09.webp","https://i.ibb.co/0jNHkMDn/1956-05.webp","https://i.ibb.co/k26P80Jv/2015-05.webp","https://i.ibb.co/7F0SRdr/1945-16.webp","https://i.ibb.co/Fb4BSgkq/1952-06.webp","https://i.ibb.co/sdH6915j/1974-09.webp","https://i.ibb.co/xKmqw0xb/1940-04.webp","https://i.ibb.co/39pYLZqZ/1943-16.webp","https://i.ibb.co/xStV9fXX/2024-16.webp"];
  const HARALD=[{"src":"https://i.ibb.co/5hxKrdBx/harald-age00-1937.webp","age":0,"year":1937},{"src":"https://i.ibb.co/DPtn6hHB/harald-age10-1947.webp","age":10,"year":1947},{"src":"https://i.ibb.co/bMqD79Rb/harald-age20-1957.webp","age":20,"year":1957},{"src":"https://i.ibb.co/mVsdbGXk/harald-age30-1967.webp","age":30,"year":1967},{"src":"https://i.ibb.co/9mFdzLQM/harald-age40-1977.webp","age":40,"year":1977},{"src":"https://i.ibb.co/ksS359sy/harald-age50-1987.webp","age":50,"year":1987},{"src":"https://i.ibb.co/ns17h0HY/harald-age60-1997.webp","age":60,"year":1997},{"src":"https://i.ibb.co/DgWs69BK/harald-age70-2007.webp","age":70,"year":2007},{"src":"https://i.ibb.co/F4VhzWBf/harald-age80-2017.webp","age":80,"year":2017},{"src":"https://i.ibb.co/4gTByZq2/harald-age89-2026.webp","age":89,"year":2026}];
  const ERAS=[1940,1943,1945,1952,1956,1966,1974,1988,1994,2015,2024];
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const age=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  const year=()=>1937+age();
  const srcYear=src=>num(src.match(/\/(\d{4})-/)?.[1]);
  const byYear=new Map(ERAS.map(y=>[y,PEOPLE.filter(src=>srcYear(src)===y)]));
  const nearest=(v,list)=>list.reduce((best,x)=>Math.abs(x-v)<Math.abs(best-v)?x:best,list[0]);
  const eraFor=y=>nearest(y,ERAS);
  const haraldFor=a=>HARALD.reduce((best,x)=>Math.abs(x.age-a)<Math.abs(best.age-a)?x:best,HARALD[0]);
  const st={board:null,era:null,harald:null,round:0,queued:false,uid:0};

  window.__FH_CROWD=PEOPLE.slice();
  window.__FH_REAL_CHARACTERS={people:PEOPLE.slice(),harald:HARALD.map(x=>({...x})),eras:ERAS.slice()};

  function beginRound(board){
    st.board=board;
    st.era=eraFor(year());
    st.harald=haraldFor(age());
    st.round++;
    board.dataset.fhRealRound=String(st.round);
  }
  function ensureRound(board){
    if(st.board!==board||st.era===null||!st.harald)beginRound(board);
  }
  function physicalHarald(a){
    if(a<=2)return .67;
    if(a<=6)return .76;
    if(a<=12)return .86;
    if(a<=18)return .94;
    return 1.04;
  }
  function setImg(img,src,target=false){
    if(!img||!src)return;
    img.alt=target?'Kong Harald':'';
    img.draggable=false;
    img.decoding='async';
    img.loading='eager';
    img.classList.add('crowd-figure','fh-real-character');
    img.dataset.fhBroken='0';
    img.style.visibility='visible';
    img.onload=()=>{img.dataset.fhBroken='0';img.dataset.fhRetries='0';img.style.visibility='visible';img.classList.remove('fh-harald-placeholder')};
    const retry=()=>{
      if(!img.isConnected)return;
      img.dataset.fhBroken='1';
      img.style.visibility='hidden';
      const tries=(+img.dataset.fhRetries||0)+1;
      img.dataset.fhRetries=String(tries);
      if(target){
        // Harald må aldri bli usynleg. Utan dette blir han ståande som eit tomt
        // felt — anten gøymd heilt, eller un-gøymd att av mutasjonsstøyen frå
        // world.js og teikna som ein tom boks. I begge tilfelle ser ikkje
        // spelaren det eine han skal finne. Prøv portrettet på nytt, gå så over
        // til eit anna, og teikn til slutt ein synleg markør sjølv.
        const alts=HARALD.filter(x=>x.src!==src);
        const next=tries<=2?src:alts.length?alts[hash(`${st.round}|harald|${tries}`)%alts.length].src:src;
        if(tries>2+alts.length){img.dataset.fhBroken='0';img.style.visibility='visible';img.classList.add('fh-harald-placeholder');return}
        setTimeout(()=>{if(img.isConnected)img.src=next},120*Math.min(tries,4));
        return;
      }
      const p=byYear.get(st.era)||PEOPLE;
      const next=p[hash(`${st.round}|retry|${img.dataset.fhUid||''}|${Date.now()>>12}`)%p.length];
      if(next&&next!==img.src)setTimeout(()=>{img.dataset.fhBroken='0';img.style.visibility='visible';img.src=next},80);
    };
    img.onerror=retry;
    if(img.getAttribute('src')!==src)img.src=src;
  }
  function distribute(board){
    ensureRound(board);
    const pool=byYear.get(st.era)||PEOPLE;
    const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target)')];
    figures.forEach((img,i)=>{
      if(!img.dataset.fhUid)img.dataset.fhUid=`r${st.round}-c${i}`;
      const src=pool[hash(`${st.round}|${st.era}|${img.dataset.fhUid}`)%pool.length];
      img.dataset.fhAssetScale='1';
      img.dataset.fhRealEra=String(st.era);
      img.classList.remove('fh-fallback-crowd','fh-verified-crowd');
      setImg(img,src,false);
    });
    board.dataset.fhQualityReady='1';
  }
  function target(board){
    ensureRound(board);
    const img=board.querySelector('img.harald-target');
    if(!img)return;
    const h=st.harald;
    img.style.setProperty('--fh-harald-boost',String(physicalHarald(h.age)));
    img.dataset.fhHaraldAge=String(h.age);
    setImg(img,h.src,true);
  }
  function advanceAfterCorrect(board){
    setTimeout(()=>{
      if(!board.isConnected)return;
      beginRound(board);
      schedule();
      window.__FH_WORLD__?.advanceRound?.();
    },180);
  }
  function wire(board){
    if(board.dataset.fhRealWired)return;
    board.dataset.fhRealWired='1';
    board.addEventListener('click',e=>{
      const t=e.target;
      if(t instanceof HTMLImageElement&&t.classList.contains('harald-target'))advanceAfterCorrect(board);
    },true);
  }
  function style(){
    if(document.getElementById('fh-real-character-style'))return;
    const s=document.createElement('style');
    s.id='fh-real-character-style';
    s.textContent=`
      .crowd-board,.crowd-board img{filter:none!important}
      .crowd-board img.crowd-figure{image-rendering:auto!important;object-fit:contain!important;animation:none!important;transition:none!important;color:transparent!important;font-size:0!important}
      .crowd-board img.fh-real-character{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;max-width:18%!important;scale:var(--fh-render-scale,1)!important}
      .crowd-board img.harald-target{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;max-width:18%!important;object-fit:contain!important;scale:var(--fh-render-scale,1)!important;z-index:7!important}
      .crowd-board img[data-fh-broken="1"]{display:none!important}
      .crowd-board img.harald-target.fh-harald-placeholder{display:block!important;visibility:visible!important;background:#c9b071;border:2px solid #6b5836;border-radius:4px;min-width:26px}
      @media(max-width:700px){.crowd-board{--fh-crowd-body-h:9%}.crowd-board img.fh-real-character,.crowd-board img.harald-target{max-width:20%!important}}
    `;
    document.head.appendChild(s);
  }
  function run(){
    st.queued=false;
    style();
    const board=document.querySelector('.crowd-board');
    if(!board)return;
    ensureRound(board);wire(board);distribute(board);target(board);
    window.__FH_WORLD__?.schedule?.();
  }
  function schedule(){if(st.queued)return;st.queued=true;requestAnimationFrame(run)}
  style();schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_VERIFIED_RUNTIME={schedule,pool:()=>byYear.get(st.era)||PEOPLE,get assets(){return PEOPLE.slice()}};
})();
