(()=>{
  // Finn folkemengda utan å stole på klassenamn.
  //
  // Alt som gjeld mengda — plassering, panorering, tettleik, breidd og høgd —
  // hang på `.crowd-board`. Finst ikkje den klassa oppstraums lenger, gjer
  // kvart einaste av dei skripta ingenting i det heile, heilt stille: du får
  // oppstraums sitt eige rutenett, deira folketal og deira figurar, og ingen
  // av rettingane våre kjem til. `.masthead` finst framleis, så menyen og
  // aldersklokka held fram med å virke, og det ser ut som alt er i orden.
  //
  // Så vi leitar oss fram i staden: figurane er mange bilete av liknande
  // storleik, og brettet er det djupaste elementet som held nesten alle. Finn
  // vi det, set vi klassa sjølve, og alt det andre virkar som før.
  const MIN_FIGURES=6;
  const looksLikeFigure=im=>{
    const r=im.getBoundingClientRect();
    return r.width>=8&&r.width<=240&&r.height>=14&&r.height<=460;
  };
  const depth=el=>{let d=0;for(let p=el;p;p=p.parentElement)d++;return d};

  function discover(){
    const imgs=[...document.images].filter(looksLikeFigure);
    if(imgs.length<MIN_FIGURES)return null;
    const score=new Map();
    imgs.forEach(im=>{
      for(let el=im.parentElement;el&&el!==document.body;el=el.parentElement)
        score.set(el,(score.get(el)||0)+1);
    });
    let best=null,bestDepth=-1;
    score.forEach((n,el)=>{
      if(n<imgs.length*.7)return;
      // Masthead-logoen er òg eit bilete. Eit element som held overskrifta er
      // sida, ikkje brettet.
      if(el.querySelector('h1'))return;
      const d=depth(el);
      if(d>bestDepth){bestDepth=d;best=el}
    });
    return best;
  }

  // Kongen kan vi ikkje gjette oss til. Finn vi han ikkje, lèt vi bileta vere
  // — å byte dei ut utan å vite kven som er kongen gjer runden uvinnbar.
  const KING=/harald|konge|king|target/i;
  function markKing(board){
    if(board.querySelector('img.harald-target'))return true;
    const hit=[...board.querySelectorAll('img')].find(im=>
      KING.test(im.getAttribute('alt')||'')||KING.test(im.id||'')||
      KING.test(im.className||'')||KING.test(im.getAttribute('src')||''));
    if(!hit)return false;
    hit.classList.add('harald-target');
    return true;
  }

  let queued=false,adopted=null;
  function run(){
    queued=false;
    // Vår eiga adopsjon skal ikkje forvekslast med at oppstraums har klassa:
    // gjer vi det, sluttar vi å merke figurar som kjem til seinare.
    const existing=document.querySelector('.crowd-board');
    if(existing&&existing!==adopted){document.documentElement.dataset.fhBoard='native';return}
    const board=adopted&&adopted.isConnected?adopted:discover();
    if(!board)return;
    if(adopted!==board){adopted=board;board.classList.add('crowd-board')}
    // Figurane får ei eiga klasse. `crowd-figure` ville late crowd-assets.js
    // byte ut bileta, og utan å vite kven kongen er ville det gjere runden
    // uvinnbar — så den klassa set vi berre når kongen faktisk er funnen.
    const king=markKing(board);
    [...board.querySelectorAll('img')].filter(looksLikeFigure).forEach(im=>{
      im.classList.add('fh-figure');
      if(king)im.classList.add('crowd-figure');
    });
    document.documentElement.dataset.fhBoard=king?'adopted':'adopted-nokings';
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',schedule,{passive:true});
  window.__FH_BOARD__={discover,schedule,get adopted(){return adopted}};
})();
