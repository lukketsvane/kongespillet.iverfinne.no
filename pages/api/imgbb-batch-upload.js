const REPO='lukketsvane/kongespillet.iverfinne.no';
const BRANCH='main';
const CROWD_FILES=['public/crowd-01.js','public/crowd-02.js','public/crowd-03.js','public/crowd-04.js','public/crowd-05.js'];
const IMAGE_EXT=/\.(png|webp|jpe?g|gif)$/i;

async function text(url){const r=await fetch(url,{headers:{'user-agent':'finn-harald-uploader'}});if(!r.ok)throw new Error(`fetch ${r.status}: ${url}`);return r.text()}
async function json(url){const r=await fetch(url,{headers:{'user-agent':'finn-harald-uploader','accept':'application/vnd.github+json'}});if(!r.ok)throw new Error(`fetch ${r.status}: ${url}`);return r.json()}
function safeName(s){return s.replace(/^.*\//,'').replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9_-]+/g,'_').slice(0,90)}

let sourceCache;
async function sources(){
  if(sourceCache)return sourceCache;
  const out=[];
  let n=1;
  for(const f of CROWD_FILES){
    const raw=`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${f}`;
    const js=await text(raw);
    const matches=js.match(/data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/=]+/g)||[];
    for(const uri of matches){
      const comma=uri.indexOf(',');
      out.push({name:`crowd_${String(n++).padStart(3,'0')}`,image:uri.slice(comma+1),kind:'base64'});
    }
  }
  const tree=await json(`https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`);
  const allowedPrefixes=['assets/','public/game-assets/','public/clean-crowd/','public/clean-harald/'];
  for(const e of tree.tree||[]){
    if(e.type!=='blob'||!IMAGE_EXT.test(e.path))continue;
    if(!allowedPrefixes.some(p=>e.path.startsWith(p)))continue;
    out.push({name:safeName(e.path),image:`https://raw.githubusercontent.com/${REPO}/${BRANCH}/${e.path}`,kind:'url',path:e.path});
  }
  const seen=new Set();
  sourceCache=out.filter(x=>{const k=x.kind==='url'?x.image:x.image.slice(0,96);if(seen.has(k))return false;seen.add(k);return true});
  return sourceCache;
}

async function uploadOne(item,key){
  const body=new URLSearchParams();
  body.set('key',key);body.set('image',item.image);body.set('name',item.name);
  const r=await fetch('https://api.imgbb.com/1/upload',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  let data;try{data=await r.json()}catch{data={}}
  if(!r.ok||!data?.success)throw new Error(data?.error?.message||`imgbb ${r.status}`);
  return {name:item.name,source:item.path||item.kind,url:data.data?.url||data.data?.display_url,display_url:data.data?.display_url,delete_url:data.data?.delete_url};
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const key=String(req.query.key||'').trim();
  if(!key)return res.status(400).json({error:'missing key'});
  const offset=Math.max(0,Number(req.query.offset)||0);
  const limit=Math.min(12,Math.max(1,Number(req.query.limit)||8));
  try{
    const all=await sources();
    const batch=all.slice(offset,offset+limit);
    const settled=await Promise.allSettled(batch.map(x=>uploadOne(x,key)));
    const results=settled.map((r,i)=>r.status==='fulfilled'?{ok:true,...r.value}:{ok:false,name:batch[i]?.name,error:String(r.reason?.message||r.reason)});
    res.status(200).json({total:all.length,offset,limit,count:batch.length,next:offset+batch.length<all.length?offset+batch.length:null,results});
  }catch(e){res.status(500).json({error:String(e?.message||e)});}
}
