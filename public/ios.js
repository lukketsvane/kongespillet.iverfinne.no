(()=>{
  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if(!isiOS&&matchMedia('(min-width:701px)').matches)return;
  document.documentElement.classList.add('fh-ios');
  let meta=document.querySelector('meta[name="viewport"]');if(!meta){meta=document.createElement('meta');meta.name='viewport';document.head.appendChild(meta)}
  meta.content='width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content';
  function viewport(){const v=window.visualViewport;const h=Math.round(v?.height||innerHeight),w=Math.round(v?.width||innerWidth),top=Math.round(v?.offsetTop||0);document.documentElement.style.setProperty('--fh-vvh',`${h}px`);document.documentElement.style.setProperty('--fh-vvw',`${w}px`);document.documentElement.style.setProperty('--fh-vvo',`${top}px`);document.body.classList.toggle('fh-game-live',!!document.querySelector('.crowd-board'))}
  viewport();addEventListener('resize',viewport,{passive:true});visualViewport?.addEventListener('resize',viewport,{passive:true});visualViewport?.addEventListener('scroll',viewport,{passive:true});new MutationObserver(viewport).observe(document.documentElement,{childList:true,subtree:true});
  const s=document.createElement('style');s.id='fh-ios-style';s.textContent=`
    html.fh-ios,html.fh-ios body{box-sizing:border-box;width:100%;max-width:100%;margin:0;overflow-x:hidden;-webkit-text-size-adjust:100%;overscroll-behavior:none;background:#f7f3e9}
    html.fh-ios body{min-height:var(--fh-vvh,100dvh);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
    html.fh-ios body.fh-game-live{height:var(--fh-vvh,100dvh);overflow:hidden}
    html.fh-ios button,html.fh-ios [role="button"]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    html.fh-ios button,html.fh-ios .masthead,html.fh-ios .fh-statbar,html.fh-ios .fh-crownblock,html.fh-ios .game-footer{-webkit-user-select:none;user-select:none}
    html.fh-ios .game-shell.fh-compact{box-sizing:border-box!important;width:100%!important;max-width:760px!important;height:var(--fh-vvh,100dvh)!important;min-height:0!important;max-height:var(--fh-vvh,100dvh)!important;margin:0 auto!important;padding-top:max(5px,env(safe-area-inset-top))!important;padding-right:max(8px,env(safe-area-inset-right))!important;padding-bottom:max(5px,env(safe-area-inset-bottom))!important;padding-left:max(8px,env(safe-area-inset-left))!important;display:flex!important;flex-direction:column!important;gap:2px!important;overflow:hidden!important}
    html.fh-ios .masthead{flex:0 0 auto!important;min-height:61px!important;margin:0!important;padding-bottom:3px!important}
    html.fh-ios .fh-statbar{flex:0 0 auto!important;min-height:44px!important;margin:0!important;padding:2px 0!important}
    html.fh-ios .fh-crownblock{flex:0 0 auto!important;min-height:33px!important;margin:0!important;padding:3px 0 4px!important}
    html.fh-ios .crowd-board{position:relative!important;box-sizing:border-box!important;flex:1 1 0!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:2px 0!important;overflow:hidden!important;contain:layout paint style;background:#fff!important}
    html.fh-ios .game-footer{flex:0 0 auto!important;min-height:25px!important;margin:0!important;padding:3px 0 max(1px,env(safe-area-inset-bottom))!important}
    html.fh-ios .fhm-overlay{width:var(--fh-vvw,100vw)!important;height:var(--fh-vvh,100dvh)!important;min-height:0!important;box-sizing:border-box!important;padding-top:max(6px,env(safe-area-inset-top))!important;padding-bottom:max(6px,env(safe-area-inset-bottom))!important}
    html.fh-ios .fhm-card{max-height:calc(var(--fh-vvh,100dvh) - 12px)!important;min-height:0!important;overflow:auto!important;-webkit-overflow-scrolling:touch}
    html.fh-ios .fhm-menu-button,html.fh-ios .fh-top{width:44px!important;height:44px!important;padding:12px!important;margin:-8px!important}
    html.fh-ios .fhm-actions button,html.fh-ios .fh-close{min-height:44px}
    @media(max-width:430px){
      html.fh-ios .masthead h1{font-size:clamp(34px,10.5vw,44px)!important;white-space:nowrap;line-height:.92!important}
      html.fh-ios .masthead p{font-size:13px!important;line-height:1!important;margin-top:2px!important}
      html.fh-ios .age-lockup{right:1px!important;top:0!important}html.fh-ios .age-lockup strong{font-size:clamp(50px,14.5vw,64px)!important;line-height:.78!important}
      html.fh-ios .fh-statbar{min-height:42px!important}html.fh-ios .fh-crownblock{min-height:31px!important}
    }
    @media(orientation:landscape) and (max-height:500px){
      html.fh-ios .masthead{min-height:45px!important}.masthead p{display:none!important}html.fh-ios .fh-statbar{min-height:34px!important}.fh-crownblock{min-height:27px!important;padding:1px 0!important}html.fh-ios .game-shell.fh-compact{gap:1px!important}
    }
  `;document.head.appendChild(s);
})();
