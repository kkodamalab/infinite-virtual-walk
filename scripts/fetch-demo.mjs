// Explicitly bundled, attributed CC / public-domain images. No generated detections.
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('public/assets',{recursive:true});
const records=[];
const clean=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').trim();
for(const [category,query] of [['building','Tokyo architecture building'],['bus','city bus'],['bicycle','bicycle street'],['traffic light','traffic lights']]){
const p=new URLSearchParams({action:'query',generator:'search',gsrsearch:`${query} filetype:bitmap`,gsrnamespace:'6',gsrlimit:'18',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480',format:'json'});
const data=await(await fetch(`https://commons.wikimedia.org/w/api.php?${p}`)).json();let count=0;
for(const page of Object.values(data.query?.pages||{})){if(count>=10)break;const info=page.imageinfo?.[0],m=info?.extmetadata||{},license=clean(m.LicenseShortName?.value);if(!info||!/^(CC BY|CC0|Public domain)/i.test(license)||/NC|ND/i.test(license))continue;
try{const r=await fetch(info.thumburl||info.url);if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error(String(r.status));const buffer=Buffer.from(await r.arrayBuffer());const filename=`${category.replaceAll(' ','-')}-${count}.jpg`;await writeFile(`public/assets/${filename}`,buffer);records.push({category,id:`demo-${category.replaceAll(' ','-')}-${count}`,url:`./public/assets/${filename}`,sourceUrl:info.descriptionurl,license,licenseUrl:m.LicenseUrl?.value||'',author:clean(m.Artist?.value),attribution:clean(m.Credit?.value),keyword:query,provider:'Bundled Commons demo',retrievedAt:new Date().toISOString(),themes:[]});count++;}catch(e){console.log('skip',page.pageid,e.message);}}
console.log(category,count);await new Promise(r=>setTimeout(r,500));}
await writeFile('public/demo-images.json',JSON.stringify(records,null,2));await writeFile('public/IMAGE-CREDITS.md','# Bundled demo image credits\n\nImages retain their original licenses. Collage crops and effects modify their appearance. Review source pages before public exhibition.\n\n'+records.map(r=>`- ${r.url}: [source](${r.sourceUrl}) — ${r.author} — [${r.license}](${r.licenseUrl||r.sourceUrl})`).join('\n'));
if(records.length<4)throw Error('Insufficient licensed demo images');
