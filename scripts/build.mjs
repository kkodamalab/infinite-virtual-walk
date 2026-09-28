import {mkdir,cp,readFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','src','public']) await cp(name,`dist/${name}`,{recursive:true});
const html=await readFile('dist/index.html','utf8');
if(!html.includes('./src/app.js')) throw Error('Missing application entry');
console.log('Static build ready: dist/');
