(()=>{
  const chunks=[{"src":"/verified-assets-01.js","from":1944,"to":1962,"ids":[64,63,80,81,82]},{"src":"/verified-assets-02.js","from":1950,"to":1962,"ids":[83,84,85,86,87]},{"src":"/verified-assets-03.js","from":1950,"to":1962,"ids":[88,89,90,91,92]},{"src":"/verified-assets-04.js","from":1950,"to":1962,"ids":[93,94,95,96,97]},{"src":"/verified-assets-05.js","from":1950,"to":1980,"ids":[98,62,65,66,76]},{"src":"/verified-assets-06.js","from":1970,"to":1980,"ids":[79,132,133,134,135]},{"src":"/verified-assets-07.js","from":1970,"to":1980,"ids":[136,137,138,139,140]},{"src":"/verified-assets-08.js","from":1970,"to":1980,"ids":[141,142,143,144,145]},{"src":"/verified-assets-09.js","from":1970,"to":1991,"ids":[146,147,74,68,73]},{"src":"/verified-assets-10.js","from":1979,"to":1993,"ids":[77,72,99,100,101]},{"src":"/verified-assets-11.js","from":1983,"to":1993,"ids":[102,103,104,105,106]},{"src":"/verified-assets-12.js","from":1983,"to":1993,"ids":[107,108,109,110,111]},{"src":"/verified-assets-13.js","from":1983,"to":1999,"ids":[112,113,114,70,75]},{"src":"/verified-assets-14.js","from":1989,"to":1999,"ids":[126,127,128,129,130]},{"src":"/verified-assets-15.js","from":1989,"to":2015,"ids":[131,69,78,67,50]},{"src":"/verified-assets-16.js","from":2008,"to":2026,"ids":[13,14,15,16,25]},{"src":"/verified-assets-17.js","from":2008,"to":2026,"ids":[26,27,28,29,30]},{"src":"/verified-assets-18.js","from":2008,"to":2026,"ids":[31,32,33,46,47]},{"src":"/verified-assets-19.js","from":2008,"to":2026,"ids":[48,49,148,149,150]},{"src":"/verified-assets-20.js","from":2008,"to":2026,"ids":[151,152,153,154,155]},{"src":"/verified-assets-21.js","from":2008,"to":2026,"ids":[156,157,158,159,160]},{"src":"/verified-assets-22.js","from":2008,"to":2026,"ids":[161,162,163,71]}];
  const own=document.currentScript?.src||'';let v='';try{v=new URL(own,location.href).searchParams.get('v')||''}catch{}
  const loaded=new Map();
  function load(c){
    if(loaded.has(c.src))return loaded.get(c.src);
    const p=new Promise(resolve=>{const s=document.createElement('script');s.src=c.src+(v?'?v='+encodeURIComponent(v):'');s.async=true;s.onload=()=>resolve(true);s.onerror=()=>resolve(false);document.head.appendChild(s)});
    loaded.set(c.src,p);return p;
  }
  function matches(y){return chunks.filter(c=>y>=c.from&&y<=c.to)}
  async function ensure(y){const a=matches(+y||0);if(!a.length)return [];await Promise.all(a.map(load));return window.__FH_VERIFIED||[]}
  function prefetch(y){const task=()=>matches(+y||0).forEach(load);if('requestIdleCallback'in window)requestIdleCallback(task,{timeout:1400});else setTimeout(task,500)}
  window.__FH_VERIFIED_LOADER={chunks,ensure,prefetch};
})();
