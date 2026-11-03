import {initialState,validateSnapshot} from './core.mjs';
const DATA_KEY='boardloom:workspace:v1';
const DB_NAME='boardloom-images';
const STORE='blobs';
let dbPromise;
export function openImages() {
  if(!('indexedDB' in globalThis))return Promise.reject(new Error('IndexedDB unavailable'));
  if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error('Cannot open image storage'));
  });
  return dbPromise;
}
async function dbOp(mode,action) {
  const db=await openImages();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
    const req=action(store);
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
export const putImage=(id,blob)=>dbOp('readwrite',s=>s.put(blob,id));
export const getImage=(id)=>dbOp('readonly',s=>s.get(id));
export const deleteImage=(id)=>dbOp('readwrite',s=>s.delete(id));
export function loadState() {
  try{const raw=localStorage.getItem(DATA_KEY);if(!raw)return initialState();const parsed=JSON.parse(raw);validateSnapshot(parsed);return parsed;}
  catch(error){console.warn('Boardloom: stored state invalid, using starter workspace',error);return initialState();}
}
export function saveState(state) {validateSnapshot(state);localStorage.setItem(DATA_KEY,JSON.stringify(state));}
const blobDataURL=(blob)=>new Promise((resolve,reject)=>{
  const reader=new FileReader(); reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);
});
function dataURLBlob(value) {
  if(typeof value!=='string'||!/^data:image\/(png|jpeg|gif|webp|avif);base64,/i.test(value))throw new Error('Invalid backup image');
  const [header,raw]=value.split(',',2);
  const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
  return new Blob([bytes],{type:header.slice(5).split(';')[0]});
}
export async function makeBackup(state) {
  const images={};
  for(const p of state.projects)for(const a of p.assets)if(a.imageKey){
    const blob=await getImage(a.imageKey);
    if(blob)images[a.imageKey]=await blobDataURL(blob);
  }
  return {format:'boardloom-backup',exportedAt:new Date().toISOString(),workspace:state,images};
}
export async function restoreBackup(backup){
  if(backup?.format!=='boardloom-backup')throw new Error('Not a Boardloom backup');
  validateSnapshot(backup.workspace);
  const blobs=[];
  for(const [key,value] of Object.entries(backup.images||{})){
    if(typeof key!=='string'||key.length>150)throw new Error('Invalid image key');
    blobs.push([key,dataURLBlob(value)]);
  }
  for(const [key,blob] of blobs)await putImage(key,blob);
  saveState(backup.workspace);
  return backup.workspace;
}
