(()=>{
  const st={start:performance.now(),board:null,queued:false};
  const num=v=>Number(String(v||'').replace(/[^0-9.-]/g,''))||0;
  const pad=n=>String(n).padStart(2,'0');
  function age(){return Math.max(0,num(document.documentElement.dataset.fhEffectiveAge||document.querySelector('.age-lockup strong')?.textContent))}
  function score(){const label=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&x.textContent?.trim()==='SCORE');if(!label)return 0;let p=label.parentElement;for(let i=0;p&&i<4;i++,p=p.parentElement){const v=[...p.querySelectorAll('*')].find(x=>x.children.length===0&&/^\s*[\d .]+\s*$/.test(x.textContent||''));if(v)return num(v.textContent)}return 0}
  function elapsed(){const s=Math.floor((performance.now()-st.start)/1000);return `${pad(Math.floor(s/60))}:${pad(s%60)}`}
  function pause(){const candidates=[...document.querySelectorAll('button:not(.fh-pause):not(.fh-back)')];const b=candidates.find(x=>/pause/i.test((x.getAttribute('aria-label')||'')+' '+(x.textContent||'')));if(b)b.click();else window.__FH_MENU__?.show?.(true)}
  function menu(){window.__FH_MENU__?.show?.(true)}

  function mount(){
    const board=document.querySelector('.crowd-board');
    const active=!!board;
    document.body.classList.toggle('fh-ref-live',active);
    if(!active){document.querySelector('.fh-native-top')?.remove();document.querySelector('.fh-native-bottom')?.remove();st.board=null;return}
    if(st.board!==board){st.board=board;st.start=performance.now()}
    if(!document.querySelector('.fh-native-top')){
      const h=document.createElement('header');
      h.className='fh-native-top';
      h.innerHTML='<button class="fh-back" aria-label="Meny">‹</button><div class="fh-era"><b>1937</b><span>HARALD 0 ÅR</span></div><strong class="fh-clock">00:00</strong><button class="fh-pause" aria-label="Pause">Ⅱ</button>';
      document.body.appendChild(h);
      h.querySelector('.fh-back').onclick=menu;
      h.querySelector('.fh-pause').onclick=pause;
    }
    if(!document.querySelector('.fh-native-bottom')){
      const f=document.createElement('footer');
      f.className='fh-native-bottom';
      f.innerHTML='<span class="fh-people">FOLK 0</span><span class="fh-score">POENG 0</span>';
      document.body.appendChild(f);
    }
  }

  function update(){
    mount();if(!document.body.classList.contains('fh-ref-live'))return;
    const a=age(),year=1937+a,top=document.querySelector('.fh-native-top');
    if(top){
      top.querySelector('.fh-era b').textContent=String(year);
      top.querySelector('.fh-era span').textContent=`HARALD ${a} ÅR`;
      top.querySelector('.fh-clock').textContent=elapsed();
    }
    const foot=document.querySelector('.fh-native-bottom');
    if(foot){
      foot.querySelector('.fh-people').textContent=`FOLK ${document.documentElement.dataset.fhPopulation||'—'}`;
      foot.querySelector('.fh-score').textContent=`POENG ${score().toLocaleString('nb-NO')}`;
    }
  }

  function style(){
    if(document.getElementById('fh-reference-style'))return;
    const s=document.createElement('style');s.id='fh-reference-style';s.textContent=`
      body.fh-ref-live{background:#fff!important;overflow:hidden!important;height:var(--fh-vvh,100dvh)!important}
      .fh-ref-live .game-shell{padding:0!important;margin:0!important;max-width:none!important;width:100%!important;height:100%!important;overflow:visible!important}
      .fh-ref-live .masthead,.fh-ref-live .fh-statbar,.fh-ref-live .fh-crownblock,.fh-ref-live .game-footer,.fh-ref-live .fhm-menu-button,.fh-ref-live .fh-top{display:none!important}
      .fh-ref-live .crowd-board{position:fixed!important;z-index:10!important;left:0!important;right:0!important;top:calc(max(env(safe-area-inset-top),0px) + 78px)!important;bottom:calc(max(env(safe-area-inset-bottom),0px) + 34px)!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important;background:#fff!important;contain:layout paint style!important}
      .fh-native-top{position:fixed;z-index:200;left:0;right:0;top:0;height:calc(max(env(safe-area-inset-top),0px) + 78px);padding-top:max(env(safe-area-inset-top),0px);box-sizing:border-box;display:grid;grid-template-columns:54px 1fr auto 54px;align-items:center;gap:7px;padding-inline:max(10px,env(safe-area-inset-left));background:#fffdf9;border-bottom:1px solid #d8d4cb;color:#0d0d0d}
      .fh-native-top button{width:46px;height:46px;border:0;background:transparent;color:#111;font:600 40px/1 system-ui;display:grid;place-items:center;padding:0}
      .fh-native-top .fh-pause{border:1.5px solid #111;border-radius:12px;font-size:26px;font-weight:800}
      .fh-era{display:flex;flex-direction:column;min-width:0}.fh-era b{font:800 19px/1 system-ui}.fh-era span{font:650 11px/1.2 system-ui;letter-spacing:.08em;margin-top:4px;color:#5f5b54}
      .fh-clock{font:750 31px/1 system-ui;font-variant-numeric:tabular-nums;letter-spacing:.02em}
      .fh-native-bottom{position:fixed;z-index:200;left:0;right:0;bottom:0;height:calc(max(env(safe-area-inset-bottom),0px) + 34px);box-sizing:border-box;padding:0 max(16px,env(safe-area-inset-right)) max(env(safe-area-inset-bottom),0px) max(16px,env(safe-area-inset-left));display:flex;align-items:center;justify-content:space-between;background:#fffdf9;border-top:1px solid #d8d4cb;color:#676158;font:750 9px/1 system-ui;letter-spacing:.14em}
      .fh-ref-live .gameover-card{position:fixed!important;z-index:500!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(88vw,420px)!important;max-height:78dvh!important;overflow:auto!important;border-radius:28px!important;border:1.5px solid #e5ba2e!important;background:#fffdf8!important;box-shadow:0 24px 100px #0007!important;padding:28px!important}
      .fh-ref-live .gameover-card button{border-radius:14px!important;min-height:54px!important}
      @media(max-width:430px){
        .fh-native-top{grid-template-columns:48px 1fr auto 48px;height:calc(max(env(safe-area-inset-top),0px) + 72px);padding-inline:8px}
        .fh-ref-live .crowd-board{top:calc(max(env(safe-area-inset-top),0px) + 72px)!important;bottom:calc(max(env(safe-area-inset-bottom),0px) + 32px)!important}
        .fh-native-bottom{height:calc(max(env(safe-area-inset-bottom),0px) + 32px)}
        .fh-native-top button{width:42px;height:42px}.fh-native-top .fh-clock{font-size:27px}.fh-era b{font-size:17px}.fh-era span{font-size:10px}
      }
    `;document.head.appendChild(s)
  }

  style();update();setInterval(update,250);
  new MutationObserver(()=>{if(!st.queued){st.queued=true;requestAnimationFrame(()=>{st.queued=false;update()})}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
})();
