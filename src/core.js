export const MODES=['RANDOM','CONVERGENCE','DIVERGENCE','EVOLUTION','OSCILLATION','MUTATION'];
export const FX=['negative','mosaic','threshold','edge','rgb','echo'];
export const THEMES=['現代日本','昭和風','ヨーロッパ風','未来都市'];
export const defaults=()=>({mode:'RANDOM',interval:120,cycles:6,mutation:30,seed:'walk-2026',transition:'FADE',transitionTime:2,background:'ARTIFICIAL',view:'PARALLEL',resolution:960,similarity:0.5,theme:0,fxTarget:'VIRTUAL',auto:'MANUAL',autoSpeed:1,linked:false,fx:Object.fromEntries(FX.map(n=>[n,{on:false,value:n==='mosaic'?18:n==='rgb'?8:0.5}])),echoDecay:0.8});
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export function random(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function chooseWorld(tracks,candidates,s,loop,previous={}){
 const rng=random(`${s.seed}:${loop}`),set={};const progress=clamp(loop/Math.max(1,s.cycles-1));
 for(const t of tracks){const list=candidates.filter(c=>c.objectId===t.id&&!c.excluded&&!c.loadError);if(!list.length)continue;const sorted=[...list].sort((a,b)=>(a.similarity??0)-(b.similarity??0)||a.id.localeCompare(b.id));let c;
  if(s.mode==='RANDOM'){const choices=list.filter(x=>x.id!==previous[t.id]);c=(choices.length?choices:list)[Math.floor(rng()*(choices.length||list.length))];}
  else if(s.mode==='MUTATION'){const prior=list.find(x=>x.id===previous[t.id]);const alternatives=list.filter(x=>x.id!==prior?.id);c=prior&&rng()>=s.mutation/100?prior:(alternatives.length?alternatives:list)[Math.floor(rng()*(alternatives.length||list.length))];}
  else if(s.mode==='EVOLUTION'){const themed=list.filter(x=>x.themes?.includes(THEMES[(loop+s.theme)%THEMES.length]));const pool=themed.length?themed:list;c=pool[Math.floor(rng()*pool.length)];}
  else {let target=s.mode==='CONVERGENCE'?progress:s.mode==='DIVERGENCE'?1-progress:s.mode==='OSCILLATION'?(1-Math.cos(loop*2*Math.PI/Math.max(2,s.cycles)))/2:s.similarity;c=sorted[Math.round(target*(sorted.length-1))];}
  set[t.id]=c.id;
 }return set;
}
export function boxAt(track,time){if(time<track.start||time>track.end)return null;const p=track.trajectory;if(!p.length)return null;let a=p[0],b=p.at(-1);for(let i=1;i<p.length;i++){if(p[i].time>=time){a=p[i-1];b=p[i];break;}}const f=clamp((time-a.time)/Math.max(.0001,b.time-a.time));return a.box.map((v,i)=>v+(b.box[i]-v)*f);}
export function iou(a,b){const w=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])),h=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));return w*h/(a[2]*a[3]+b[2]*b[3]-w*h||1);}
export class Tracker{
 constructor(gap=1.5){this.tracks=[];this.gap=gap;this.next=1;}
 update(detections,time){const used=new Set();for(const d of detections){let best=null,score=.18;for(const t of this.tracks){if(used.has(t.id)||t.category!==d.category||time-t.end>this.gap)continue;const v=iou(t.trajectory.at(-1).box,d.box);if(v>score){best=t;score=v;}}
 if(!best){best={id:`object-${this.next++}`,category:d.category,confidence:d.confidence,start:time,end:time,trajectory:[],source:'detected',representative:d.representative||null,features:d.features||null};this.tracks.push(best);}best.end=time;best.confidence=Math.max(best.confidence,d.confidence);best.trajectory.push({time,box:d.box});used.add(best.id);}return this.tracks;}
}
export function effectiveFX(s,loop,time=0){const f=structuredClone(s.fx);let strength=1;const p=clamp(loop/Math.max(1,s.cycles-1));const phase=Math.floor(loop*s.autoSpeed+time*s.autoSpeed/30);
 if(s.linked&&['CONVERGENCE','DIVERGENCE'].includes(s.mode)){strength=s.mode==='CONVERGENCE'?1-p:p;f.negative.on=f.mosaic.on=true;f.negative.value=strength;f.mosaic.value=1+strength*45;if(strength===0)for(const n of FX)f[n].on=false;return f;}
 if(s.auto==='CONVERGE')strength=clamp(1-(loop+time/s.interval)*s.autoSpeed/Math.max(1,s.cycles-1));
 if(s.auto==='CYCLE')for(let i=0;i<FX.length;i++)f[FX[i]].on=(phase+i)%3===0;
 if(s.auto==='RANDOM'){const rng=random(`${s.seed}:fx:${phase}`);for(const n of FX){f[n].on=rng()>.45;f[n].value=rng()*(n==='mosaic'?Math.max(1,s.fx[n].value):n==='rgb'?s.fx[n].value:Math.min(1,s.fx[n].value));}}
 for(const n of FX){if(strength===0)f[n].on=false;f[n].value=n==='mosaic'?1+(f[n].value-1)*strength:f[n].value*strength;}return f;
}
export function validateSettings(input){const d=defaults(),s={...d,...input,fx:structuredClone(d.fx)};const enums={mode:MODES,interval:[30,60,120,300],transition:['CUT','FADE','SPATIAL'],view:['REAL','MIRROR','PARALLEL','SPLIT','SWITCH'],background:['ORIGINAL','ARTIFICIAL'],fxTarget:['REAL','VIRTUAL','BOTH','OBJECTS'],auto:['MANUAL','CYCLE','CONVERGE','RANDOM'],resolution:[640,960,1920]};for(const[k,values]of Object.entries(enums))if(!values.includes(s[k]))s[k]=d[k];for(const[k,min,max]of [['cycles',2,30],['mutation',0,100],['transitionTime',0,10],['similarity',0,1],['theme',0,3],['autoSpeed',.1,4],['echoDecay',.05,5]])s[k]=Number.isFinite(+s[k])?clamp(+s[k],min,max):d[k];s.seed=String(s.seed).slice(0,100);s.linked=!!s.linked;for(const n of FX){const f=input?.fx?.[n];if(f)s.fx[n]={on:!!f.on,value:Number.isFinite(+f.value)?clamp(+f.value,0,n==='mosaic'?80:n==='rgb'?40:1):d.fx[n].value};}return s;}
export function validateProject(p){if(!p||p.version!==1||!Array.isArray(p.tracks)||!Array.isArray(p.candidates)||p.tracks.length>5000||p.candidates.length>50000||!Number.isFinite(p.duration)||p.duration<=0||p.duration>86400)throw Error('対応していないプロジェクト形式です');const ids=new Set();for(const t of p.tracks){if(typeof t.id!=='string'||ids.has(t.id)||typeof t.category!=='string'||!Number.isFinite(t.start)||!Number.isFinite(t.end)||t.start<0||t.end<t.start||!Array.isArray(t.trajectory)||!t.trajectory.length)throw Error('物体データが不正です');ids.add(t.id);let last=-1;for(const point of t.trajectory){if(!Number.isFinite(point.time)||point.time<last||!Array.isArray(point.box)||point.box.length!==4||point.box.some(v=>!Number.isFinite(v)||v<0||v>1))throw Error('軌跡データが不正です');last=point.time;}}
 const imageIds=new Set();for(const c of p.candidates){if(typeof c.id!=='string'||imageIds.has(c.id)||!ids.has(c.objectId)||!safeImageURL(c.url)||c.similarity!=null&&(!Number.isFinite(c.similarity)||c.similarity<0||c.similarity>1))throw Error('候補画像が不正です');imageIds.add(c.id);}return{...p,settings:validateSettings(p.settings)};}
export function safeImageURL(url){return typeof url==='string'&&(/^(https:\/\/|data:image\/(png|jpeg|webp);base64,|\.\/public\/assets\/)/.test(url));}
export function safeLink(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:'#';}catch{return '#';}}
export const searchable=category=>!/(person|people|face|plate|number.?plate|license.?plate|人物|顔|ナンバー|個人)/i.test(category);
export function preset(name){const s=defaults();if(name==='REALITY'){s.mode='CONVERGENCE';s.cycles=2;}if(name==='DIGITAL DECAY'){s.mode='DIVERGENCE';for(const n of ['mosaic','rgb','echo'])s.fx[n].on=true;}if(name==='DREAM'){s.fx.mosaic={on:true,value:5};s.fx.echo={on:true,value:.35};}if(name==='RETURN TO REALITY'){s.mode='CONVERGENCE';s.linked=true;}if(name==='INFINITE CHAOS')s.auto='RANDOM';return s;}

