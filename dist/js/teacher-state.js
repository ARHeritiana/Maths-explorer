// Device-local teacher state: entry choice, class + chapter, recent items, favorites, automatismes settings.
// No account, no network, no analytics. Keys 'mx-teacher-*'. Falls back to memory when storage is blocked or full.
import {currentCourse,rememberCourse} from './navigation-state.js';
import {liveChapterCourse} from './live-curriculum.js';
export const VERSION=1,RECENT_MAX=20,FAVORITES_MAX=200;
const K={entry:'mx-teacher-entry',chapter:'mx-teacher-chapter',recent:'mx-teacher-recent',favorites:'mx-teacher-favorites',tools:'mx-teacher-tools'};
const PROBE='mx-teacher-probe',ENTRIES=['teacher','student'];
const str=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n;
const safeHref=h=>str(h,500)&&/^(#|\/|\.\/|\.\.\/|https?:\/\/)/.test(h);
// Returns a clean item {type,id,title,href,at} or null.
export function cleanItem(x){
 if(!x||typeof x!=='object'||!str(x.type,40)||!str(x.id,200)||!str(x.title,200)||!safeHref(x.href))return null;
 return {type:x.type,id:x.id,title:x.title,href:x.href,at:Number.isFinite(x.at)?x.at:0};
}
const cleanList=(a,max)=>{
 const seen=new Set(),out=[];
 for(const x of Array.isArray(a)?a:[]){const i=cleanItem(x);if(!i)continue;const k=i.type+'\n'+i.id;if(seen.has(k))continue;seen.add(k);out.push(i);if(out.length>=max)break;}
 return out;
};
const prim=v=>v===null||['string','boolean'].includes(typeof v)||(typeof v==='number'&&Number.isFinite(v));
const cleanValue=(v,depth)=>{
 if(prim(v))return v;
 if(depth>3)return undefined;
 if(Array.isArray(v)){const a=v.map(x=>cleanValue(x,depth+1));return v.length<=100&&a.every(x=>x!==undefined)?a:undefined;}
 if(v&&typeof v==='object'&&Object.getPrototypeOf(v)===Object.prototype)return cleanTools(v,depth+1);
 return undefined;
};
function cleanTools(o,depth=0){
 const out={};
 if(!o||typeof o!=='object'||Array.isArray(o))return out;
 for(const [k,v] of Object.entries(o)){
  if(k==='__proto__'||k==='constructor'||k==='prototype'||k.length>60)continue;
  const c=cleanValue(v,depth);if(c!==undefined)out[k]=c;
 }
 return out;
}
export function createTeacherState(context=globalThis){
 const mem=new Map(),dirty=new Set();
 const read=k=>{
  if(dirty.has(k))return mem.get(k)??null;
  try{return context.localStorage.getItem(k);}catch{return mem.get(k)??null;}
 };
 const write=(k,v)=>{
  if(v===null)mem.delete(k);else mem.set(k,v);
  try{if(v===null)context.localStorage.removeItem(k);else context.localStorage.setItem(k,v);dirty.delete(k);}catch{dirty.add(k);}
 };
 const readJSON=(k,fallback)=>{const r=read(k);if(r===null)return fallback;try{return JSON.parse(r);}catch{return fallback;}};
 const emit=kind=>{if(typeof context.CustomEvent==='function')context.dispatchEvent?.(new context.CustomEvent('mx-teacher-change',{detail:{kind}}));};
 const api={
  // 'ok' only when storage accepts writes now and nothing is held back in memory.
  storageStatus(){
   if(dirty.size)return 'memory-only';
   try{context.localStorage.setItem(PROBE,'1');context.localStorage.removeItem(PROBE);return 'ok';}catch{return 'memory-only';}
  },
  getEntry(){const v=read(K.entry);return ENTRIES.includes(v)?v:'';},
  setEntry(v){
   if(v!==''&&!ENTRIES.includes(v))return false;
   const changed=api.getEntry()!==v;write(K.entry,v||null);if(changed)emit('entry');return true;
  },
  // Chapter ids come from the live catalogue. A chapter only counts while it belongs to the selected class.
  getChapter(){
   const id=read(K.chapter),course=id?liveChapterCourse(id):'';
   if(!course)return '';
   const now=currentCourse('',context);
   return !now||now===course?id:'';
  },
  getClassroom(){const chapter=api.getChapter();return {course:chapter?liveChapterCourse(chapter):currentCourse('',context),chapter};},
  // '' clears the chapter (the class stays). An unknown or unpublished id is ignored and returns false.
  setChapter(id){
   if(id===''){const had=api.getChapter();write(K.chapter,null);if(had)emit('chapter');return true;}
   const course=liveChapterCourse(id);if(!course)return false;
   rememberCourse(course,context);write(K.chapter,id);emit('chapter');return true;
  },
  // Class and chapter move together; a chapter of another class is inert, never a hidden filter.
  setClassroom({course='',chapter=''}={}){
   if(chapter)return api.setChapter(chapter);
   rememberCourse(course,context);write(K.chapter,null);emit('chapter');return true;
  },
  getRecent(){return cleanList(readJSON(K.recent,[]),RECENT_MAX);},
  addRecent(item){
   const i=cleanItem({...item,at:item?.at??Date.now()});if(!i)return false;
   const rest=api.getRecent().filter(x=>!(x.type===i.type&&x.id===i.id));
   write(K.recent,JSON.stringify([i,...rest].slice(0,RECENT_MAX)));emit('recent');return true;
  },
  clearRecent(){write(K.recent,null);emit('recent');},
  getFavorites(){return cleanList(readJSON(K.favorites,[]),FAVORITES_MAX);},
  isFavorite(type,id){return api.getFavorites().some(x=>x.type===type&&x.id===id);},
  addFavorite(item){
   const i=cleanItem({...item,at:item?.at??Date.now()});if(!i)return false;
   const list=api.getFavorites();
   if(list.some(x=>x.type===i.type&&x.id===i.id))return true;
   if(list.length>=FAVORITES_MAX)return false;
   write(K.favorites,JSON.stringify([i,...list]));emit('favorites');return true;
  },
  removeFavorite(type,id){
   const list=api.getFavorites(),next=list.filter(x=>!(x.type===type&&x.id===id));
   if(next.length===list.length)return false;
   write(K.favorites,JSON.stringify(next));emit('favorites');return true;
  },
  // Returns true when the item is a favorite afterwards.
  toggleFavorite(item){
   if(item&&api.isFavorite(item.type,item.id)){api.removeFavorite(item.type,item.id);return false;}
   return api.addFavorite(item);
  },
  getTools(){return cleanTools(readJSON(K.tools,{}));},
  // Merges the patch into the stored settings; a null value removes that key. Returns the new settings.
  setTools(patch){
   const next={...api.getTools(),...cleanTools(patch)};
   for(const k of Object.keys(next))if(next[k]===null)delete next[k];
   write(K.tools,JSON.stringify(next));emit('tools');return next;
  },
  exportState(){
   return {version:VERSION,entry:api.getEntry(),course:currentCourse('',context),chapter:api.getChapter(),recent:api.getRecent(),favorites:api.getFavorites(),tools:api.getTools()};
  },
  // Applies the valid parts of a snapshot (object or JSON string). Malformed parts are skipped and counted.
  importState(data){
   if(typeof data==='string'){try{data=JSON.parse(data);}catch{return {ok:false,applied:[],rejected:1};}}
   if(!data||typeof data!=='object'||Array.isArray(data)||!Number.isInteger(data.version)||data.version<1||data.version>VERSION)return {ok:false,applied:[],rejected:1};
   const applied=[];let rejected=0;
   if('entry' in data){if(data.entry===''||ENTRIES.includes(data.entry)){write(K.entry,data.entry||null);applied.push('entry');}else rejected++;}
   if(typeof data.course==='string'&&data.course){
    rememberCourse(data.course,context);
    if(currentCourse('',context)===data.course)applied.push('course');else rejected++;
   }
   if('chapter' in data){
    if(data.chapter===''){write(K.chapter,null);applied.push('chapter');}
    else if(typeof data.chapter==='string'&&liveChapterCourse(data.chapter)){rememberCourse(liveChapterCourse(data.chapter),context);write(K.chapter,data.chapter);applied.push('chapter');}
    else rejected++;
   }
   for(const [key,max] of [['recent',RECENT_MAX],['favorites',FAVORITES_MAX]]){
    if(!(key in data))continue;
    if(!Array.isArray(data[key])){rejected++;continue;}
    const list=cleanList(data[key],max);rejected+=data[key].length-list.length;
    write(K[key],JSON.stringify(list));applied.push(key);
   }
   if('tools' in data){
    if(data.tools&&typeof data.tools==='object'&&!Array.isArray(data.tools)){write(K.tools,JSON.stringify(cleanTools(data.tools)));applied.push('tools');}
    else rejected++;
   }
   if(applied.length)emit('import');
   return {ok:true,applied,rejected};
  },
  // Deletes everything this module stores, including the shared class memory.
  clearAll(){
   for(const k of Object.values(K))write(k,null);
   dirty.clear();mem.clear();rememberCourse('',context);emit('clear');
  },
 };
 return api;
}
const shared=createTeacherState();
export const {storageStatus,getEntry,setEntry,getChapter,getClassroom,setChapter,setClassroom,getRecent,addRecent,clearRecent,getFavorites,isFavorite,addFavorite,removeFavorite,toggleFavorite,getTools,setTools,exportState,importState,clearAll}=shared;
