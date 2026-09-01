(()=>{
  const PEOPLE=["https://i.ibb.co/35JCrcYH/1945-11.webp","https://i.ibb.co/hxvZZvtn/1966-12.webp","https://i.ibb.co/FkY0KJtp/2024-11.webp","https://i.ibb.co/ZpGgF7pg/1952-01.webp","https://i.ibb.co/5hMW8tC6/1988-10.webp","https://i.ibb.co/Kvj5hwq/1945-01.webp","https://i.ibb.co/jkMF7MJY/2024-06.webp","https://i.ibb.co/FbTc3sjc/1943-01.webp","https://i.ibb.co/LdHfzw8s/1956-12.webp","https://i.ibb.co/m5TthtDv/1966-07.webp","https://i.ibb.co/jkvBcdXM/1994-12.webp","https://i.ibb.co/ccXvHWbc/1974-02.webp","https://i.ibb.co/TMw17MfQ/1945-06.webp","https://i.ibb.co/XfNY5CZH/1943-06.webp","https://i.ibb.co/8gdnQKkr/1943-11.webp","https://i.ibb.co/gFL2BXB5/1988-15.webp","https://i.ibb.co/Ps6zmX85/1974-07.webp","https://i.ibb.co/sJCBXZwM/2024-01.webp","https://i.ibb.co/0pycNX4L/1966-02.webp","https://i.ibb.co/wFy0y6Hj/2015-12.webp","https://i.ibb.co/fzXkN4qX/1988-05.webp","https://i.ibb.co/4nqgV7LQ/1994-07.webp","https://i.ibb.co/9RkQgwZ/1974-16.webp","https://i.ibb.co/YBMrmq85/1952-13.webp","https://i.ibb.co/Wvzb33rZ/1940-11.webp","https://i.ibb.co/ksvj1sNn/2015-07.webp","https://i.ibb.co/BKH3wBK6/1956-07.webp","https://i.ibb.co/zWqP21sB/1994-02.webp","https://i.ibb.co/fz52qs4R/1952-08.webp","https://i.ibb.co/VWkTD70j/1940-06.webp","https://i.ibb.co/3mvphmVH/2015-02.webp","https://i.ibb.co/ZzD1VhMS/1974-11.webp","https://i.ibb.co/RpvGLtCY/1945-13.webp","https://i.ibb.co/S444X7Kj/1956-02.webp","https://i.ibb.co/LHn3m3H/1966-14.webp","https://i.ibb.co/SXnp6nTY/1952-03.webp","https://i.ibb.co/pBmTt3v9/1940-01.webp","https://i.ibb.co/KcX4hq20/1943-13.webp","https://i.ibb.co/4nY0nT40/2024-13.webp","https://i.ibb.co/wFpg5tHT/2024-08.webp","https://i.ibb.co/6cNypMg1/1945-08.webp","https://i.ibb.co/HTVnL1XL/1945-03.webp","https://i.ibb.co/xq8JhM7j/1966-09.webp","https://i.ibb.co/qYt3YZH8/1974-04.webp","https://i.ibb.co/v6BT5fpt/1988-12.webp","https://i.ibb.co/2X9mcYH/1943-08.webp","https://i.ibb.co/nq8d5P05/1994-14.webp","https://i.ibb.co/BV6g3pd7/2024-03.webp","https://i.ibb.co/fVqZcsZx/1966-04.webp","https://i.ibb.co/pvBKRLdr/1988-07.webp","https://i.ibb.co/SDy5w7b8/1943-03.webp","https://i.ibb.co/fVy8hWGT/1956-14.webp","https://i.ibb.co/mCNrwrwT/1994-09.webp","https://i.ibb.co/RpgL9jwq/2015-14.webp","https://i.ibb.co/CpxjF2vY/1952-15.webp","https://i.ibb.co/5hxmp2bg/1988-02.webp","https://i.ibb.co/QjJt5KtV/1940-13.webp","https://i.ibb.co/hRh8C8b6/2015-09.webp","https://i.ibb.co/CZ8bJXP/1994-04.webp","https://i.ibb.co/hF0XNp9F/1956-09.webp","https://i.ibb.co/SXCNdq2V/1940-08.webp","https://i.ibb.co/wNLZh3Y0/1952-10.webp","https://i.ibb.co/3YBfBznJ/1974-13.webp","https://i.ibb.co/hRysyh63/1956-04.webp","https://i.ibb.co/VY74mSwX/2015-04.webp","https://i.ibb.co/gFjYGBkZ/1945-15.webp","https://i.ibb.co/B2y1K4S7/1952-05.webp","https://i.ibb.co/G3tGWRM0/1966-16.webp","https://i.ibb.co/DJcq6ys/1940-03.webp","https://i.ibb.co/jkt30mzM/1943-15.webp","https://i.ibb.co/Q32tTt4w/2024-15.webp","https://i.ibb.co/KpJ9Tmrp/2024-10.webp","https://i.ibb.co/sJCCQFzw/1945-10.webp","https://i.ibb.co/3y8RbV2M/1945-05.webp","https://i.ibb.co/5WxTwsxY/1966-11.webp","https://i.ibb.co/N67djgky/1988-14.webp","https://i.ibb.co/nsL9xFzH/1943-10.webp","https://i.ibb.co/8L4vnrXB/1974-06.webp","https://i.ibb.co/MktmV3yw/2024-05.webp","https://i.ibb.co/tw275dZg/1994-16.webp","https://i.ibb.co/5hVsSxms/1966-06.webp","https://i.ibb.co/jvqMfZt2/1988-09.webp","https://i.ibb.co/m5yvRCJT/1943-05.webp","https://i.ibb.co/CsTjbf70/1974-01.webp","https://i.ibb.co/7JzD4nRg/2015-16.webp","https://i.ibb.co/yMhpwmD/1994-11.webp","https://i.ibb.co/qYMGc3rk/1966-01.webp","https://i.ibb.co/VYVZKPfJ/1988-04.webp","https://i.ibb.co/Mb4rR38/1940-15.webp","https://i.ibb.co/S4y06TsS/1956-11.webp","https://i.ibb.co/sdzFjQhJ/2015-11.webp","https://i.ibb.co/fzQNzfqY/1994-06.webp","https://i.ibb.co/fY28Cvq6/1952-12.webp","https://i.ibb.co/RkL25ZBf/1974-15.webp","https://i.ibb.co/Jj9X3PRX/1940-10.webp","https://i.ibb.co/LzMBpZ4P/1956-06.webp","https://i.ibb.co/RG2MwHn0/2015-06.webp","https://i.ibb.co/39D8KFBH/1994-01.webp","https://i.ibb.co/gZqJWVxK/1952-07.webp","https://i.ibb.co/ycCQYFvV/1974-10.webp","https://i.ibb.co/tMn3jTFx/1940-05.webp","https://i.ibb.co/5XT3C8Nm/1956-01.webp","https://i.ibb.co/7N6PWPZt/2015-01.webp","https://i.ibb.co/9H1R44T2/2024-12.webp","https://i.ibb.co/m5ZP6RtN/1945-12.webp","https://i.ibb.co/DP5r7YtH/1952-02.webp","https://i.ibb.co/B2T5xDtd/1966-13.webp","https://i.ibb.co/C3CYcStc/1988-16.webp","https://i.ibb.co/whxydPB0/1943-12.webp","https://i.ibb.co/b5Zyv9c0/1974-08.webp","https://i.ibb.co/gZ29vtWM/2024-07.webp","https://i.ibb.co/zWGrnsnZ/1945-07.webp","https://i.ibb.co/kVChrxk1/1945-02.webp","https://i.ibb.co/pB7WpGHr/1966-08.webp","https://i.ibb.co/BHjVX5F7/1988-11.webp","https://i.ibb.co/JR9D0PXS/1943-07.webp","https://i.ibb.co/GQtyr70c/2024-02.webp","https://i.ibb.co/cXxfZ19g/1974-03.webp","https://i.ibb.co/1tTb2QVY/1994-13.webp","https://i.ibb.co/cX8WCp8j/1966-03.webp","https://i.ibb.co/8nDF6nQ1/1988-06.webp","https://i.ibb.co/fV8TbDZG/1943-02.webp","https://i.ibb.co/NgP5KJb6/1956-13.webp","https://i.ibb.co/yc6Gv6tF/2015-13.webp","https://i.ibb.co/Z1pyMFRG/1994-08.webp","https://i.ibb.co/LhdfSH6J/1952-14.webp","https://i.ibb.co/gLCLnrMc/1988-01.webp","https://i.ibb.co/QjDym1MT/1940-12.webp","https://i.ibb.co/CpT83LFC/1956-08.webp","https://i.ibb.co/d0P2VD2m/2015-08.webp","https://i.ibb.co/GfXHCyd3/1994-03.webp","https://i.ibb.co/TD1cmkJS/1952-09.webp","https://i.ibb.co/k2kQMkLL/1974-12.webp","https://i.ibb.co/XxSfczt1/1940-07.webp","https://i.ibb.co/k2dNr8xD/1956-03.webp","https://i.ibb.co/GZjsfB4/2015-03.webp","https://i.ibb.co/qM7VPzXX/1945-14.webp","https://i.ibb.co/Zp6TZ2vf/1952-04.webp","https://i.ibb.co/F4L7vnbt/1966-15.webp","https://i.ibb.co/YFMy1bqj/1940-02.webp","https://i.ibb.co/5xLKN5q3/1943-14.webp","https://i.ibb.co/hp7mvMR/2024-14.webp","https://i.ibb.co/WWGw3RyC/2024-09.webp","https://i.ibb.co/fYW7NyVr/1945-09.webp","https://i.ibb.co/7Jh8bLVT/1945-04.webp","https://i.ibb.co/qLbcByt4/1966-10.webp","https://i.ibb.co/1GG3YVP4/1988-13.webp","https://i.ibb.co/0jzvJrLJ/1943-09.webp","https://i.ibb.co/1YpqHgyf/1974-05.webp","https://i.ibb.co/B5dqQ2kX/2024-04.webp","https://i.ibb.co/pv8nSGqj/1994-15.webp","https://i.ibb.co/bjXbL9Zw/1966-05.webp","https://i.ibb.co/TMqD995Q/1988-08.webp","https://i.ibb.co/bg1xhCjy/1943-04.webp","https://i.ibb.co/7JgBqLVF/1956-15.webp","https://i.ibb.co/hRqHvGYc/2015-15.webp","https://i.ibb.co/3yTSMDL9/1994-10.webp","https://i.ibb.co/8LgcQXSG/1952-16.webp","https://i.ibb.co/JwNtxZKS/1988-03.webp","https://i.ibb.co/FLX0GtTw/1940-14.webp","https://i.ibb.co/bMKKYXBd/1956-10.webp","https://i.ibb.co/Gf83Vnks/2015-10.webp","https://i.ibb.co/bjgCFZgK/1994-05.webp","https://i.ibb.co/JRhXk9Yg/1952-11.webp","https://i.ibb.co/23NDh5f3/1974-14.webp","https://i.ibb.co/SXjWJkSq/1940-09.webp","https://i.ibb.co/0jNHkMDn/1956-05.webp","https://i.ibb.co/k26P80Jv/2015-05.webp","https://i.ibb.co/7F0SRdr/1945-16.webp","https://i.ibb.co/Fb4BSgkq/1952-06.webp","https://i.ibb.co/sdH6915j/1974-09.webp","https://i.ibb.co/xKmqw0xb/1940-04.webp","https://i.ibb.co/39pYLZqZ/1943-16.webp","https://i.ibb.co/xStV9fXX/2024-16.webp"];
  const HARALD=[{"src":"https://i.ibb.co/5hxKrdBx/harald-age00-1937.webp","age":0,"year":1937},{"src":"https://i.ibb.co/DPtn6hHB/harald-age10-1947.webp","age":10,"year":1947},{"src":"https://i.ibb.co/bMqD79Rb/harald-age20-1957.webp","age":20,"year":1957},{"src":"https://i.ibb.co/mVsdbGXk/harald-age30-1967.webp","age":30,"year":1967},{"src":"https://i.ibb.co/9mFdzLQM/harald-age40-1977.webp","age":40,"year":1977},{"src":"https://i.ibb.co/ksS359sy/harald-age50-1987.webp","age":50,"year":1987},{"src":"https://i.ibb.co/ns17h0HY/harald-age60-1997.webp","age":60,"year":1997},{"src":"https://i.ibb.co/DgWs69BK/harald-age70-2007.webp","age":70,"year":2007},{"src":"https://i.ibb.co/F4VhzWBf/harald-age80-2017.webp","age":80,"year":2017},{"src":"https://i.ibb.co/4gTByZq2/harald-age89-2026.webp","age":89,"year":2026}];
  const ERAS=[1940,1943,1945,1952,1956,1966,1974,1988,1994,2015,2024];
  // Farge-TV kom til Noreg i 1972, og det er den datoen torget skal skifte på.
  //
  // Arka sjølve er ikkje til å stole på her: 1940, 1943 og 1956 er blyant og
  // grått, men 1952 og 1966 er teikna i full farge, og 1945 ligg ein stad
  // imellom. Lét vi arka bestemme, kom fargen i 1949, forsvann i 1954 og kom
  // att i 1963. Så vi avgjer det sjølve — eitt grått filter over heile brettet
  // til 1972, og så slepp vi det.
  const COLOUR_YEAR=1972;
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const age=()=>Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent));
  const srcYear=src=>num(src.match(/\/(\d{4})-/)?.[1]);
  const byYear=new Map(ERAS.map(y=>[y,PEOPLE.filter(src=>srcYear(src)===y)]));
  const nearest=(v,list)=>list.reduce((best,x)=>Math.abs(x-v)<Math.abs(best-v)?x:best,list[0]);
  const eraFor=y=>nearest(y,ERAS);
  const haraldFor=a=>HARALD.reduce((best,x)=>Math.abs(x.age-a)<Math.abs(best.age-a)?x:best,HARALD[0]);

  // Kongen slik oppstraums teiknar han: eitt portrett per aldersbolk. Vi byter
  // han ikkje ut — men vi låner dei andre bolkane til lokkedukker, slik at
  // «den vesle med krone» ikkje lenger er eit svar i seg sjølv.
  const SPRITES=n=>`/game-assets/harald/${n}`;
  const BRACKETS=[
    ['01_baby_harald.png'],
    ['01_baby_harald.png','02_child_harald.png'],
    ['02_child_harald.png'],
    ['03_young_prince.png','07_walk_left.png','08_walk_right.png'],
    ['04_gala_uniform.png','05_wave.png','10_happy.png','16_reading_newspaper.png','15_in_sira.png'],
    ['04_gala_uniform.png','05_wave.png','06_speech_podium.png','10_happy.png','11_rubber_boots.png','14_balcony_wave.png'],
    ['10_happy.png','11_rubber_boots.png','12_with_cane.png','16_reading_newspaper.png','05_wave.png'],
    ['12_with_cane.png','13_old_with_cane.png','09_worried.png'],
    ['18_game_over.png','13_old_with_cane.png','12_with_cane.png'],
  ];
  const bracketOf=a=>a<=3?0:a<=5?1:a<=17?2:a<=30?3:a<=53?4:a<=69?5:a<=84?6:a<=99?7:8;
  // Berre bolkar to steg unna. Ein baby eller ein olding ved sida av ein konge
  // på 40 er til å skilje frå kvarandre om du ser etter — ein annan positur frå
  // same bolk er det ikkje, og då er runden eit lotteri.
  function decoyPool(a){
    const cur=bracketOf(a),near=new Set();
    for(let i=cur-1;i<=cur+1;i++)(BRACKETS[i]||[]).forEach(x=>near.add(x));
    const out=new Set();
    BRACKETS.forEach((list,i)=>{if(Math.abs(i-cur)<2)return;list.forEach(x=>{if(!near.has(x))out.add(x)})});
    return [...out];
  }
  const decoyCount=a=>clamp(Math.floor((a-6)/7),0,5);

  const st={board:null,era:null,harald:null,round:0,age:0,queued:false,uid:0,colourShown:false};

  window.__FH_CROWD=PEOPLE.slice();
  window.__FH_REAL_CHARACTERS={people:PEOPLE.slice(),harald:HARALD.map(x=>({...x})),eras:ERAS.slice()};

  const kingEl=board=>board.querySelector('.harald-target');
  const kingImg=el=>el&&(el.tagName==='IMG'?el:el.querySelector('img'));

  // ---------------------------------------------------------------- runden
  //
  // Runden er oppstraums si eiga folkemengd, ikkje eit tal vi tel sjølve.
  // React byggjer heile mengda på nytt kvar gong kongen blir funnen — nye
  // nøklar, nye DOM-element — og dei kjem inn utan `data-fh-uid`. Det er
  // signalet som ikkje kan gå tapt.
  //
  // Før hang runden på ein klikk-lyttar som såg etter `img.harald-target`.
  // Kongen er ein `<button class="harald-target">` med biletet inni, så
  // lyttaren fyrte aldri, og runde-nummeret stod stille frå 1937 til krona
  // fall av: same utlegg, same folketal, same epoke, heile spelet. Det såg ut
  // som eit spel der berre ein handfull figurar bytte plass — for det var
  // nettopp det som skjedde.
  function isNewCrowd(board){
    if(st.board!==board||st.era===null)return true;
    for(const im of board.querySelectorAll('img.crowd-figure,img.fh-figure')){
      if(!im.dataset.fhUid&&!im.classList.contains('fh-extra-crowd'))return true;
    }
    return false;
  }
  function beginRound(board){
    const a=age();
    st.board=board;
    st.age=a;
    st.era=eraFor(1937+a);
    st.harald=haraldFor(a);
    st.round++;
    board.dataset.fhRealRound=String(st.round);
    board.dataset.fhRealEra=String(st.era);
    document.documentElement.dataset.fhCrowdRound=String(st.round);
    document.documentElement.dataset.fhEra=String(st.era);
  }
  function ensureRound(board){
    if(isNewCrowd(board))beginRound(board);
  }

  // Same filter er òg kamuflasjen hans. Kongen er den einaste teikna i farge på
  // eit grått torg, så dei første åra er han til å peike ut med lukka auge —
  // og det skal han vere, det er dei første rundane. Så kryp det grå innover
  // han òg, og frå han er ti år er han teikna som alle andre. I 1972 kjem
  // fargen tilbake til heile torget, hans eigen medrekna, og då er det mengda
  // som gøymer han.
  function eraGrey(a,year){
    return year>=COLOUR_YEAR?0:clamp((a-2)/8,0,1);
  }

  function setImg(img,src){
    if(!img||!src)return;
    img.alt='';
    img.draggable=false;
    img.decoding='async';
    img.loading='eager';
    img.classList.add('crowd-figure','fh-real-character');
    img.dataset.fhBroken='0';
    img.style.visibility='visible';
    img.onload=()=>{img.dataset.fhBroken='0';img.dataset.fhRetries='0';img.style.visibility='visible'};
    img.onerror=()=>{
      if(!img.isConnected)return;
      img.dataset.fhBroken='1';
      img.style.visibility='hidden';
      const tries=(+img.dataset.fhRetries||0)+1;
      img.dataset.fhRetries=String(tries);
      const p=byYear.get(st.era)||PEOPLE;
      const next=p[hash(`${st.round}|retry|${img.dataset.fhUid||''}|${tries}`)%p.length];
      if(next&&next!==img.src)setTimeout(()=>{img.dataset.fhBroken='0';img.style.visibility='visible';img.src=next},80*Math.min(tries,4));
    };
    if(img.getAttribute('src')!==src)img.src=src;
  }
  function distribute(board){
    const pool=byYear.get(st.era)||PEOPLE;
    const figures=[...board.querySelectorAll('img.crowd-figure:not(.harald-target):not(.fh-decoy-king)')];
    figures.forEach((img,i)=>{
      if(!img.dataset.fhUid)img.dataset.fhUid=`r${st.round}-c${i}`;
      const src=pool[hash(`${st.round}|${st.era}|${img.dataset.fhUid}`)%pool.length];
      img.dataset.fhAssetScale='1';
      img.dataset.fhRealEra=String(st.era);
      img.classList.remove('fh-fallback-crowd','fh-verified-crowd');
      setImg(img,src);
    });
    board.dataset.fhQualityReady='1';
  }
  // Lokkedukkene høyrer til runden. Dei blir kasta og laga på nytt kvar gong,
  // så dei aldri blir ståande att frå eit brett som ikkje finst lenger.
  function decoys(board){
    const want=decoyCount(st.age),pool=decoyPool(st.age);
    const have=[...board.querySelectorAll('img.fh-decoy-king')];
    const stale=have.filter(im=>im.dataset.fhRound!==String(st.round));
    stale.forEach(im=>im.remove());
    const live=have.length-stale.length;
    if(!pool.length)return;
    for(let i=live;i<want;i++){
      const im=document.createElement('img');
      im.className='crowd-figure fh-decoy-king';
      im.alt='';
      im.draggable=false;
      im.decoding='async';
      im.dataset.fhUid=`d${st.round}-${i}`;
      im.dataset.fhRound=String(st.round);
      im.dataset.fhGenerated='1';
      im.src=SPRITES(pool[hash(`${st.round}|decoy|${i}`)%pool.length]);
      board.appendChild(im);
    }
  }
  // Kongen sjølv rører vi ikkje biletet til — oppstraums vel eit portrett som
  // høver alderen hans, og lokkedukkene er henta frå same teiknar. Det vi gjer
  // er å la han vere like høg som alle andre, og å ta fargen frå han medan han
  // veks.
  function target(board){
    const el=kingEl(board);
    if(!el)return;
    if(!el.dataset.fhUid)el.dataset.fhUid='harald';
    el.dataset.fhHaraldAge=String(st.age);
    el.style.setProperty('--fh-role','1');
  }
  // Eitt filter på brettet, ikkje eitt per figur: 260 filtrerte element er 260
  // eigne teikneflater, medan brettet er ei.
  function tint(board){
    const year=1937+st.age,g=eraGrey(st.age,year);
    board.style.setProperty('--fh-era-grey',g.toFixed(3));
    document.documentElement.dataset.fhColourTv=year>=COLOUR_YEAR?'1':'0';
    if(year>=COLOUR_YEAR&&!st.colourShown){st.colourShown=true;announceColour()}
  }
  function announceColour(){
    const el=document.createElement('div');
    el.className='fh-colour-tv';
    el.innerHTML='<b>1972</b><span>FARGE-TV</span>';
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),700)},2200);
  }
  // Ein andre veg inn i ny runde, for dei tilfella der React skulle finne på å
  // bruke om att elementa sine: sjølve trykket på kongen.
  function wire(board){
    if(board.dataset.fhRealWired)return;
    board.dataset.fhRealWired='1';
    board.addEventListener('click',e=>{
      if(!e.target.closest?.('.harald-target'))return;
      setTimeout(()=>{if(board.isConnected){ensureRound(board);schedule()}},260);
    },true);
  }
  function style(){
    if(document.getElementById('fh-real-character-style'))return;
    const s=document.createElement('style');
    s.id='fh-real-character-style';
    s.textContent=`
      .crowd-board{filter:grayscale(var(--fh-era-grey,0))!important}
      .crowd-board img{filter:none!important}
      .crowd-board img.crowd-figure{image-rendering:auto!important;object-fit:contain!important;animation:none!important;transition:none!important;color:transparent!important;font-size:0!important}
      .crowd-board img.fh-real-character,.crowd-board img.fh-decoy-king{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;max-width:18%!important}
      .crowd-board .harald-target{height:var(--fh-crowd-body-h,8.7%)!important;width:auto!important;min-width:0!important;max-width:18%!important;padding:0!important;border:0!important;background:none!important;box-shadow:none!important;line-height:0!important}
      .crowd-board .harald-target img{height:100%!important;width:auto!important;max-width:none!important;display:block!important;object-fit:contain!important}
      .crowd-board img[data-fh-broken="1"]{display:none!important}
      .fh-colour-tv{position:fixed;left:50%;top:46%;z-index:99997;transform:translate(-50%,-50%) scale(.96);opacity:0;pointer-events:none;text-align:center;padding:16px 30px 14px;border-radius:16px;background:#fffdf7ee;box-shadow:0 12px 40px #3d332526;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:opacity .3s,transform .45s}
      .fh-colour-tv.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
      .fh-colour-tv b{display:block;font:500 46px/1 Georgia,serif;background:linear-gradient(90deg,#c8452f,#d99a1e,#3f8f57,#2f6fae);-webkit-background-clip:text;background-clip:text;color:transparent}
      .fh-colour-tv span{display:block;margin-top:5px;font:800 10px/1 system-ui;letter-spacing:.34em;color:#5f594f}
      @media(max-width:700px){.crowd-board{--fh-crowd-body-h:9%}.crowd-board img.fh-real-character,.crowd-board img.fh-decoy-king,.crowd-board .harald-target{max-width:20%!important}}
    `;
    document.head.appendChild(s);
  }
  function run(){
    st.queued=false;
    style();
    const board=document.querySelector('.crowd-board');
    if(!board)return;
    ensureRound(board);wire(board);distribute(board);decoys(board);target(board);tint(board);
    window.__FH_WORLD__?.schedule?.();
  }
  function schedule(){if(st.queued)return;st.queued=true;requestAnimationFrame(run)}
  style();schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.__FH_VERIFIED_RUNTIME={schedule,pool:()=>byYear.get(st.era)||PEOPLE,get assets(){return PEOPLE.slice()},get era(){return st.era},get round(){return st.round}};
})();
