(()=>{
  const own=document.currentScript?.src||'';let v='';try{v=new URL(own,location.href).searchParams.get('v')||''}catch{}
  let promise=null;
  function ensure(y){
    if((+y||0)<1944)return Promise.resolve(window.__FH_VERIFIED_ATLAS||null);
    if(window.__FH_VERIFIED_ATLAS)return Promise.resolve(window.__FH_VERIFIED_ATLAS);
    if(promise)return promise;
    promise=new Promise(resolve=>{const s=document.createElement('script');s.src='/verified-atlas.js'+(v?'?v='+encodeURIComponent(v):'');s.async=true;s.onload=()=>resolve(window.__FH_VERIFIED_ATLAS||null);s.onerror=()=>resolve(null);document.head.appendChild(s)});return promise;
  }
  function prefetch(y){if((+y||0)<1942)return;const task=()=>ensure(Math.max(1944,+y||1944));if('requestIdleCallback'in window)requestIdleCallback(task,{timeout:1800});else setTimeout(task,700)}
  window.__FH_VERIFIED_LOADER={ensure,prefetch};
})();
