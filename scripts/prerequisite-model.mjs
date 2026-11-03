// Pure internal prerequisite model: explicit course progression, concept DAG and ordered question contracts.
import {createHash} from 'node:crypto';
export function resourceFingerprint(resource) {
  return createHash('sha256').update(JSON.stringify({id:resource.id,intro:resource.intro||'',parts:(resource.parts||[]).map(p=>({q:p.q||'',hint:p.hint||'',a:p.a||'',s:p.s||''}))})).digest('hex');
}
const list=value=>Array.isArray(value)?value:[];
export function createModel(spec, manifest) {
  const errors=[], concepts=spec.concepts||{}, profiles=spec.profiles||{};
  const chapters=new Map(manifest.catalog.chapters.map(c=>[c.id,c]));
  const error=(code,message)=>errors.push({code,severity:'error',message});
  if(!Object.keys(concepts).length||Array.isArray(concepts))error('INVALID_CATALOG','A nonempty concept object is required.');
  if(!Object.keys(profiles).length||Array.isArray(profiles))error('INVALID_PROFILES','A nonempty profile object is required.');
  if(spec.schemaVersion!==1)error('SCHEMA_VERSION','Expected prerequisite schemaVersion 1.');
  const hasConcept=id=>Object.hasOwn(concepts,id)&&!!concepts[id];
  const hasProfile=id=>Object.hasOwn(profiles,id)&&!!profiles[id];
  const known=(id,where)=>{if(!hasConcept(id))error('UNKNOWN_CONCEPT',`${where}: ${id}`);};
  const detectors=[];
  for(const [id,c] of Object.entries(concepts)) {
    if(!c||typeof c!=='object'){error('INVALID_CONCEPT',id);continue;}
    if(!c.label||!Array.isArray(c.requires)||!Array.isArray(c.patterns))error('INVALID_CONCEPT',id);
    for(const dep of list(c.requires))known(dep,id);
    for(const pattern of list(c.patterns))try{if(typeof pattern!=='string')throw Error('Pattern must be a string');detectors.push({id,regex:new RegExp(pattern,'iu')});}catch{error('INVALID_PATTERN',`${id}: ${pattern}`);}
  }
  const acyclic=(keys,edges,code)=>{
    const done=new Set(),active=new Set();
    const visit=(id,path)=>{
      if(active.has(id)){error(code,[...path,id].join(' -> '));return;}
      if(done.has(id))return;
      active.add(id);for(const next of edges(id))if(keys.includes(next))visit(next,[...path,id]);
      active.delete(id);done.add(id);
    };keys.forEach(id=>visit(id,[]));
  };
  acyclic(Object.keys(concepts),id=>list(concepts[id]?.requires),'CONCEPT_CYCLE');
  acyclic(Object.keys(profiles),id=>list(profiles[id]?.inherits),'PROFILE_CYCLE');
  for(const [course,p] of Object.entries(profiles)) {
    if(!p||typeof p!=='object'){error('INVALID_PROFILE',course);continue;}
    if(!Array.isArray(p.inherits)||!Array.isArray(p.assumes)||!p.teaches||typeof p.teaches!=='object')error('INVALID_PROFILE',course);
    if(!manifest.catalog.courses.some(c=>c.id===course))error('UNKNOWN_COURSE',course);
    for(const parent of list(p.inherits))if(!hasProfile(parent))error('UNKNOWN_PARENT_PROFILE',`${course}: ${parent}`);
    for(const id of list(p.assumes))known(id,course);
    for(const [id,at] of Object.entries(p.teaches||{})) {
      known(id,course);if(!at||typeof at!=='object'){error('INVALID_PLACEMENT',`${course}/${id}`);continue;}const c=chapters.get(at.chapter);
      if(!c||c.course!==course||!(c.number>0))error('INVALID_PLACEMENT',`${course}/${id}: ${at.chapter}`);
      if(at.unit!==undefined&&(!Number.isInteger(at.unit)||at.unit<1||typeof at.sequence!=='string'||!at.sequence))error('INVALID_UNIT',`${course}/${id}`);
    }
  }
  const expanded=(ids)=>{
    const result=new Map();
    const visit=(id,path)=>{if(result.has(id))return;result.set(id,[...path,id]);for(const dep of list(concepts[id]?.requires))visit(dep,[...path,id]);};
    ids.forEach(id=>visit(id,[]));return result;
  };
  const entry=(course,seen=new Set())=>{
    if(seen.has(course))return new Set();seen.add(course);
    const p=profiles[course];if(!p)return new Set();const ids=new Set(list(p.assumes));
    for(const parent of list(p.inherits)) {
      for(const id of entry(parent,seen))ids.add(id);
      for(const id of Object.keys(profiles[parent]?.teaches||{}))ids.add(id);
    }
    return ids;
  };
  // Course inheritance is explicit. Parallel courses and numeric chapter prefixes never imply prerequisites.
  const availability=(id,context,local=new Set())=>{
    if(!hasConcept(id))return {state:'unknown'};
    if(local.has(id))return {state:'local'};
    const p=hasProfile(context.course)?profiles[context.course]:null;if(!p)return {state:'unknown-course'};
    const chapter=chapters.get(context.chapter);
    if(!chapter||chapter.course!==context.course)return {state:'unknown-position'};
    if(list(context.completedChapters).some(ch=>chapters.has(ch)&&Object.entries(profiles[chapters.get(ch).course]?.teaches||{}).some(([key,at])=>key===id&&at.chapter===ch)))return {state:'completed'};
    if(entry(context.course).has(id))return {state:'entry'};
    const at=p.teaches?.[id];if(!at)return {state:'out-of-scope'};
    const introduction=chapters.get(at.chapter);
    if(!introduction||introduction.course!==context.course)return {state:'unknown-position'};
    if(introduction.number<chapter.number)return {state:'earlier',...at};
    if(introduction.number>chapter.number)return {state:'future',...at};
    if(context.phase==='lesson') {
      if(at.unit===undefined||context.unit===undefined||at.sequence!==context.sequence)return {state:'unresolved-order',...at};
      return {state:at.unit<=context.unit?'current':'future-unit',...at};
    }
    return {state:'current',...at};
  };
  const detect=text=>detectors.filter(d=>d.regex.test(String(text||'').normalize('NFC'))).map(d=>d.id).filter((id,i,all)=>all.indexOf(id)===i);
  return {spec,concepts,profiles,chapters,errors,expanded,availability,detect,hasConcept,hasProfile};
}
const unavailable={future:'FUTURE_CONCEPT','future-unit':'FUTURE_CONCEPT','out-of-scope':'OUT_OF_SCOPE',unknown:'UNKNOWN_CONCEPT','unknown-course':'UNKNOWN_COURSE','unknown-position':'UNKNOWN_POSITION','unresolved-order':'UNRESOLVED_ORDER'};
export function auditResource(model,resource,context,contract) {
  const findings=[],local=new Set();
  let currentQuestion=null;
  const add=(code,details={})=>findings.push({code,severity:code.startsWith('UNKNOWN')||code==='INVALID_CONTRACT'?'error':'warning',resource:resource.id,course:context.course,chapter:context.chapter,question:currentQuestion,...details});
  if(!model.hasProfile(context.course))add('UNKNOWN_COURSE');
  const chapter=model.chapters.get(context.chapter);
  if(!chapter)add('UNKNOWN_POSITION');else if(chapter.course!==context.course)add('CONTEXT_MISMATCH');
  for(const ch of list(context.completedChapters))if(!model.chapters.has(ch))add('UNKNOWN_POSITION',{field:'completedChapters',message:ch});
  if(contract!==undefined&&(!contract||typeof contract!=='object'||Array.isArray(contract)))add('INVALID_CONTRACT',{message:'Expected a contract object.'});
  const currentContract=!contract?.sourceHash||contract.sourceHash===(context.sourceHash||resourceFingerprint(resource));
  if(!currentContract)add('STALE_CONTRACT',{severity:'review',message:'Statement, hint, solution or question order changed since annotation.'});
  if(contract?.parts!==undefined&&!Array.isArray(contract.parts))add('INVALID_CONTRACT',{field:'parts'});
  if(contract?.parts && contract.parts.length!==(resource.parts||[]).length)add('INVALID_CONTRACT',{message:'Question contract count differs from the statement.'});
  const validIds=(value,field)=>{
    if(value===undefined)return [];
    if(!Array.isArray(value)||value.some(id=>typeof id!=='string')){add('INVALID_CONTRACT',{field,message:'Expected a list of concept ids.'});return [];}
    for(const id of value)if(!model.hasConcept(id))add('UNKNOWN_CONCEPT',{concept:id,field});
    return value.filter(id=>model.hasConcept(id));
  };
  const exceptions=(value,field)=>{
    if(value===undefined)return new Map();
    if(!Array.isArray(value)){add('INVALID_CONTRACT',{field});return new Map();}
    const map=new Map();for(const row of value){
      if(!row||!model.hasConcept(row.concept)||typeof row.reason!=='string'||!row.reason.trim()){add('INVALID_CONTRACT',{field,message:'An exception needs a known concept and a nonempty reason.'});continue;}
      map.set(row.concept,row.reason);
    }return map;
  };
  const parts=resource.parts||[];
  const complete=!!contract&&Array.isArray(contract.requires)&&parts.every((_,i)=>Array.isArray(contract.parts?.[i]?.requires));
  if(!complete)add('UNANNOTATED_REQUIREMENTS',{severity:'review',message:'Text scan only for undeclared dependencies; not a semantic clearance.'});
  const inspect=(body,rule={},question=null)=>{
    currentQuestion=question;
    const errorsBefore=findings.filter(f=>f.severity==='error').length;
    const partContext=context;
    const requires=validIds(rule.requires,'requires'),provides=validIds(rule.provides,'provides'),establishes=validIds(rule.establishes,'establishes');
    const mentions=exceptions(rule.mentions,'mentions'),extensions=exceptions(rule.extensions,'extensions');
    let blocked=false;
    for(const id of [...provides,...establishes]) {
      const at=model.availability(id,partContext,local);
      if(at.state==='out-of-scope'&&!extensions.has(id)){blocked=true;add('OUT_OF_SCOPE',{concept:id,question,confidence:'declared',field:provides.includes(id)?'provides':'establishes'});}
      if(at.state==='out-of-scope'&&extensions.has(id))add('ACKNOWLEDGED_EXTENSION',{severity:'info',concept:id,question,reason:extensions.get(id),confidence:'declared'});
    }
    provides.forEach(id=>{
      const at=model.availability(id,partContext,local);
      if(at.state!=='out-of-scope'||extensions.has(id))local.add(id);
      add('LOCAL_DEFINITION',{severity:'info',concept:id,question,availableAt:at.chapter||null});
    });
    const required=model.expanded(requires);
    for(const [id,chain] of required) {
      const at=model.availability(id,partContext,local),code=unavailable[at.state];
      if(!code)continue;
      if(extensions.has(id)){add('ACKNOWLEDGED_EXTENSION',{severity:'info',concept:id,question,reason:extensions.get(id),confidence:'declared'});continue;}
      blocked=true;add(code,{concept:id,question,confidence:'declared',requiredBy:chain[0],chain,availableAt:at.chapter||null,availableUnit:at.unit||null,field:'requires'});
    }
    const declared=new Set([...required.keys(),...provides,...establishes]);
    for(const [field,text] of Object.entries(body))for(const id of model.detect(text)) {
      // A mention exception cannot legalise a declared dependency. Hints and solutions are scanned too.
      if(declared.has(id))continue;
      if(mentions.has(id)){add('ACKNOWLEDGED_MENTION',{severity:'info',concept:id,question,field,reason:mentions.get(id)});continue;}
      const at=model.availability(id,partContext,local),code=unavailable[at.state];
      if(code&&code!=='UNRESOLVED_ORDER')add(code,{severity:'review',concept:id,question,field,confidence:'lexical',availableAt:at.chapter||null,evidence:String(text).slice(0,180)});
      else if(contract&&!local.has(id))add('UNDECLARED_CONCEPT',{severity:'review',concept:id,question,field,confidence:'lexical',evidence:String(text).slice(0,180)});
    }
    // A broken question must not grant knowledge that hides problems in the next question.
    if(!blocked&&findings.filter(f=>f.severity==='error').length===errorsBefore)establishes.forEach(id=>local.add(id));
  };
  if(contract?.establishes?.length)add('INVALID_CONTRACT',{message:'Use establishes on the question that proves the result, not on the whole resource.'});
  inspect({intro:resource.intro||''},{...contract,establishes:[]});
  parts.forEach((part,i)=>{
    const own=contract?.parts?.[i]||{};
    const combined={...own,requires:[...(Array.isArray(contract?.requires)?contract.requires:[]),...(Array.isArray(own.requires)?own.requires:[])],mentions:[...list(contract?.mentions),...list(own.mentions)],extensions:[...list(contract?.extensions),...list(own.extensions)]};
    for(const field of ['requires','mentions','extensions'])if(own[field]!==undefined&&!Array.isArray(own[field]))combined[field]=own[field];
    inspect({question:part.q||'',hint:part.hint||'',solution:[part.a,part.s].filter(Boolean).join(' ')},combined,i+1);
  });
  const seen=new Set();
  const unique=findings.filter(f=>{const key=JSON.stringify([f.code,f.concept,f.question,f.field,f.confidence]);if(seen.has(key))return false;seen.add(key);return true;});
  return {id:resource.id,context,coverage:{declared:complete,current:currentContract,localOrder:context.phase==='lesson'?'requires unit annotations':'chapter lesson assumed completed'},status:unique.some(f=>['error','warning','review'].includes(f.severity))?'needs-review':unique.some(f=>f.code==='ACKNOWLEDGED_EXTENSION')?'declared-extension':'annotated-clear',findings:unique};
}
