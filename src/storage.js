let database;
async function db(){if(database)return database;database=await new Promise((resolve,reject)=>{const r=indexedDB.open('infinite-virtual-walk',1);r.onupgradeneeded=()=>r.result.createObjectStore('data');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return database;}
export async function save(key,value){const d=await db();await new Promise((resolve,reject)=>{const tx=d.transaction('data','readwrite');tx.objectStore('data').put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('保存を中断しました'));});}
export async function read(key){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction('data').objectStore('data').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function capacity(){const e=await navigator.storage?.estimate?.();return e?{used:e.usage||0,total:e.quota||0}:null;}
export function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);}
