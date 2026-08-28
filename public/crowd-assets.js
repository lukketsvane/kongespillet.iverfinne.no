(()=>{
  const assets=window.__FH_CROWD||[];
  if(!assets.length)return;

  function hash(s){
    let h=2166136261;
    for(let i=0;i<s.length;i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619);
    }
    return h>>>0;
  }

  function applyCrowd(){
    document.querySelectorAll('img.crowd-figure').forEach((img,i)=>{
      if(img.classList.contains('is-prop')&&!img.classList.contains('fh-real-crowd'))return;

      const current=img.getAttribute('src')||'';
      const original=img.dataset.originalSprite||(!current.startsWith('data:image/')?current:'')||img.dataset.fhCrowdOriginal||'';
      if(!original)return;

      if(original!==img.dataset.fhCrowdOriginal){
        img.dataset.fhCrowdOriginal=original;
        delete img.dataset.fhCrowdAsset;
      }

      const seed=`${img.dataset.fhCrowdOriginal}|${img.style.left}|${img.style.top}|${i}`;
      const n=hash(seed)%assets.length;
      const target=assets[n];

      img.classList.add('is-prop','fh-real-crowd');
      img.dataset.fhCrowdAsset=String(n);
      if(current!==target)img.setAttribute('src',target);
    });
  }

  function cleanUI(){
    document.querySelectorAll('.game-footer>p').forEach(p=>p.remove());
  }

  function style(){
    if(document.getElementById('fh-crowd-style'))return;
    const s=document.createElement('style');
    s.id='fh-crowd-style';
    s.textContent=`
      .crowd-figure.is-prop.fh-real-crowd{opacity:1!important}
      .game-footer{grid-template-columns:auto auto!important;justify-content:space-between!important}
      .game-footer>p{display:none!important}
      .game-footer .record{justify-self:end}
    `;
    document.head.appendChild(s);
  }

  function run(){
    style();
    cleanUI();
    applyCrowd();
  }

  run();
  new MutationObserver(run).observe(document.documentElement,{
    childList:true,
    subtree:true,
    attributes:true,
    attributeFilter:['src']
  });
})();
