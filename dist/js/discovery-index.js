// Pure assembly and queries: rebuilding from the current registries removes stale routes and counts.
import {TOPICS, membershipsFor} from './topic-registry.js';
export const FORMAT_LABELS = {lab:['Laboratoire','Laboratory'], gallery:['Curiosité','Curiosity'], challenge:['Défi','Challenge'], biography:['Biographie','Biography'], story:['Histoire','Story'], timeline:['Chronologie','Timeline'], chapter:['Chapitre','Chapter'], lesson:['Leçon','Lesson'], workshop:['Atelier','Workshop'], pdf:['PDF','PDF'], html:['HTML','HTML']};
const pair = value => Array.isArray(value)?value:[String(value || ''),String(value || '')];
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function buildDiscoveryIndex({labs=[],challenges=[],chapters=[],libraryChapters=[],biographies=[],stories=[],people=[],advances=[],university={sections:[]},enrichment=[],courses=[]}={}) {
  const records = new Map();
  function add(record, kind, route, extra={}) {
    const title=pair(record.title || record.name), memberships=membershipsFor(record,kind);
    const item={id:route,route,title,summary:pair(record.intro || record.dek || record.summary || ''),memberships,
      concepts:[...new Set([...(record.concepts || []),...(typeof record.topic==='string'?[record.topic]:[]),...memberships.map(k=>k.split('/')[1])])],
      level:pair(record.level || extra.level || ['Pour tous','For everyone']),difficulty:record.difficulty || null,format:kind,formats:[...new Set([kind,...(record.formats || []).map(f=>f.toLowerCase()),...(record.files?.length?['pdf']:[])])],
      related:[],preview:record.preview || {kind:TOPICS.find(t=>t.id===memberships[0].split('/')[0]).preview,ref:route},...extra,
      links:[...(record.links || []),...(extra.links || [])]};
    records.set(route,item);
  }
  labs.forEach(x=>add(x,x.custom?'gallery':'lab',`#${x.custom?'gallery':'lab'}/${x.id}`));
  challenges.forEach(x=>add(x,'challenge',`#challenges/${x.id}`));
  chapters.forEach(x=>add(x,'chapter',`#chapter/${x.id}`,{level:pair(courses.find(c=>c.id===x.course)?.title || x.course),links:(x.labs || []).map(ref=>'#lab/'+ref.split('/')[0])}));
  const chapterIds=new Set(chapters.map(x=>x.id));
  libraryChapters.filter(x=>!chapterIds.has(x.id)).forEach(x=>add(x,'chapter',`#library/${x.id}`,{level:pair(courses.find(c=>c.id===x.course)?.title || x.course),links:(x.labs || []).map(ref=>'#lab/'+ref.split('/')[0])}));
  biographies.forEach(x=>add(x,'biography',`#biographies/${x.id}`));
  stories.forEach(x=>add(x,x.kind==='lesson'?'lesson':'story',`#stories/${x.id}`,{links:x.who?[`#biographies/${x.who}`]:[]}));
  people.forEach(x=>add(x,'timeline',`#history/people/${x.id}`,{links:advances.filter(e=>e.people.includes(x.id)).map(e=>`#history/advances/${e.id}`)}));
  advances.forEach(x=>add(x,'timeline',`#history/advances/${x.id}`,{links:x.people.map(id=>`#history/people/${id}`)}));
  for(const section of university.sections || []) for(const x of section.sequences || []) add(x,'lesson',`#university/${x.id}`,{level:['Université','University']});
  enrichment.forEach(x=>add(x,'workshop',`#library/explore-${x.id}`));
  // Declare a relationship once; both ends resolve to canonical records. Unknown/deleted targets are discarded.
  for(const item of records.values()) for(const target of item.links) {
    const canonical=target.startsWith('#lab/')?target.split('/').slice(0,2).join('/'):target;
    const other=records.get(canonical);
    if(other && other!==item) {item.related.push(other.route);other.related.push(item.route);}
  }
  // History has mathematical memberships too, inherited from the existing verified cross-links.
  for(const item of records.values()) if(['biography','story','timeline','lesson'].includes(item.format)) {
    item.memberships=[...new Set([...item.memberships,...item.related.flatMap(route=>records.get(route).memberships.filter(k=>!k.startsWith('history/')))])];
  }
  return [...records.values()].map(item=>({...item,related:[...new Set(item.related)].sort(),links:undefined}));
}
export function filterDiscovery(index,{topic='',subtopic='',query='',format='',level=''}={}) {
  const terms=normalize(query).trim().split(/\s+/).filter(Boolean);
  return index.filter(item=>(!topic || item.memberships.some(m=>m===`${topic}/${subtopic}` || !subtopic&&m.startsWith(topic+'/')))
    && (!format || item.formats.includes(format)) && (!level || item.level.includes(level))
    && terms.every(term=>normalize([item.title,item.summary,item.concepts,item.level,item.memberships].flat(Infinity).join(' ')).includes(term)));
}
export const topicCounts = index => Object.fromEntries(TOPICS.map(t=>[t.id,index.filter(item=>item.memberships.some(m=>m.startsWith(t.id+'/'))).length]));
export function recommendations(index,route,limit=4) {
  const item=index.find(x=>x.route===route);if(!item)return [];
  return index.filter(x=>x!==item).map(x=>({item:x,score:(item.related.includes(x.route)?100:0)+x.memberships.filter(m=>item.memberships.includes(m)).length*5+(x.format!==item.format?1:0)}))
    .filter(x=>x.score>1).sort((a,b)=>b.score-a.score || a.item.route.localeCompare(b.item.route)).slice(0,limit).map(x=>x.item);
}
