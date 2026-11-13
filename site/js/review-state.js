// Device-local storage of "Réviser": one key 'mx-review-v1' (the state of review-model.js as JSON). No account, no
// network. Falls back to memory when storage is blocked or full (same approach as teacher-state.js). Stored data is
// read leniently: valid cards are kept, damaged ones dropped; text that is not JSON is set aside under
// 'mx-review-v1-damaged' before the first write, never silently overwritten. Emits 'mx-review-change'.
import {sanitize,emptyState} from './review-model.js';
export const KEY='mx-review-v1',DAMAGED=KEY+'-damaged';
const PROBE='mx-review-probe';
export function createReviewState(context=globalThis){
 const mem=new Map(),dirty=new Set();
 const read=k=>{
  if(dirty.has(k))return mem.get(k)??null;
  try{return context.localStorage.getItem(k);}catch{return mem.get(k)??null;}
 };
 const write=(k,v)=>{
  if(v===null)mem.delete(k);else mem.set(k,v);
  try{if(v===null)context.localStorage.removeItem(k);else context.localStorage.setItem(k,v);dirty.delete(k);}catch{dirty.add(k);}
 };
 const emit=kind=>{try{if(typeof context.CustomEvent==='function')context.dispatchEvent?.(new context.CustomEvent('mx-review-change',{detail:{kind}}));}catch{}};
 const api={
  // 'ok' only when storage accepts writes now and nothing is held back in memory.
  storageStatus(){
   if(dirty.size)return 'memory-only';
   try{context.localStorage.setItem(PROBE,'1');context.localStorage.removeItem(PROBE);return 'ok';}catch{return 'memory-only';}
  },
  // {state, dropped, damaged}: dropped counts the invalid cards left out, damaged is true when the text was not JSON.
  inspect(){
   const raw=read(KEY);
   if(raw===null)return {state:emptyState(),dropped:0,damaged:false};
   let data;try{data=JSON.parse(raw);}catch{return {state:emptyState(),dropped:0,damaged:true};}
   return {...sanitize(data),damaged:false};
  },
  load(){return api.inspect().state;},
  save(state,kind='save'){
   const raw=read(KEY);
   if(raw!==null&&read(DAMAGED)===null){try{JSON.parse(raw);}catch{write(DAMAGED,raw.slice(0,1000000));}}
   const clean=sanitize(state).state;
   write(KEY,JSON.stringify(clean));emit(kind);return clean;
  },
  // Reads the latest stored state, applies fn and saves the result: two open tabs do not erase each other's cards.
  update(fn,kind='update'){return api.save(fn(api.load()),kind);},
  clear(){write(KEY,null);write(DAMAGED,null);dirty.clear();mem.clear();emit('clear');},
 };
 return api;
}
const shared=createReviewState();
export const {storageStatus,inspect,load,save,update,clear}=shared;
