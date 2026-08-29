(()=>{
  // First verified pack is deliberately allowed a few years earlier than its 1944 hint:
  // it is visually much cleaner and historically closer than the broken legacy cut-outs.
  const chunks=[{src:'/verified-assets-01.js',from:1937,to:1962,ids:[64,63,80,81,82]}];
  const own=document.currentScript?.src||'';let v='';try{v=new URL(own,location.href).searchParams.get('v')||''}catch{}
  const loaded=new Map();
  function load(c){if(loaded.has(c.src))return loaded.get(c.src);const p=new Promise(resolve=>{const s=document.createElement('script');s.src=c.src+(v?'?v='+encodeURIComponent(v):'');s.async=true;s.onload=()=>{dispatchEvent(new Event('fh-verified-loaded'));resolve(true)};s.onerror=()=>resolve(false);document.head.appendChild(s)});loaded.set(c.src,p);return p}
  function matches(y){return chunks.filter(c=>y>=c.from&&y<=c.to)}
  async function ensure(y){const a=matches(+y||0);if(!a.length)return window.__FH_VERIFIED||[];await Promise.all(a.map(load));return window.__FH_VERIFIED||[]}
  function prefetch(y){const task=()=>matches(+y||0).forEach(load);if('requestIdleCallback'in window)requestIdleCallback(task,{timeout:1200});else setTimeout(task,400)}
  window.__FH_VERIFIED_LOADER={chunks,ensure,prefetch};
})();
