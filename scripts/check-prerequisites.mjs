// Advisory content audit using the real bank registry, chapter catalogue, authored decks and French chapter sources.
import {readFileSync,writeFileSync,readdirSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,relative,join} from 'node:path';
import {AUTHORED,TEMPLATES} from '../site/js/exercises/bank.js';
import {rng} from '../site/js/exercises/engine.js';
import {MADA} from '../site/js/exercises/bank-mada.js';
import {createModel,auditResource,resourceFingerprint} from './prerequisite-model.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const read=path=>readFileSync(resolve(ROOT,path),'utf8');
const generatorSignature=()=>createHash('sha256').update(readdirSync(resolve(ROOT,'site/js/exercises')).filter(f=>f.endsWith('.js')).sort().map(f=>f+'\n'+read('site/js/exercises/'+f)).join('\n')).digest('hex');
export function collectResources(manifest,{seedCount=4,course=null}={}) {
  const generatedHash=generatorSignature();
  const resources=[],coverage={bankRecords:AUTHORED.length+MADA.length,templates:TEMPLATES.length,seedCount,decks:0,texChapters:0,unsupportedCourses:[]};
  const included=cls=>!course||course===cls;
  for(const e of [...AUTHORED,...MADA].filter(e=>included(e.cls))) {
    for(let s=0;s<(e.make?seedCount:1);s++) {
      const body=e.make?e.make(rng(`prerequisite-${s}`)):e;
      for(const chapter of e.chapters)resources.push({resource:{id:e.id,intro:body.intro,parts:body.parts||[],title:e.title},context:{course:e.cls,chapter,phase:'practice',...(e.make?{sourceHash:generatedHash}:{})},source:{kind:e.make?'seeded-problem':'fixed-exercise',path:'site/js/exercises/',seed:e.make?s:null}});
    }
  }
  for(const t of TEMPLATES.filter(t=>included(t.cls)))for(const level of t.levels||[1,2,3])for(let s=0;s<seedCount;s++) {
    const item=t.make(rng(`prerequisite-${s}`),level);
    resources.push({resource:{id:t.id,intro:'',parts:[{q:item.q,a:item.a,s:item.s}],title:t.skill},context:{course:t.cls,chapter:t.chapter,phase:'practice',sourceHash:generatedHash},source:{kind:'generator',path:'site/js/exercises/',seed:s,level}});
  }
  const languages=manifest.catalog.courses;
  for(const filename of readdirSync(resolve(ROOT,'content/slides')).filter(f=>f.endsWith('.json')).sort()) {
    const path='content/slides/'+filename,deck=JSON.parse(read(path));
    if(!included(deck.course))continue;
    const c=manifest.catalog.chapters.find(c=>c.id===deck.id);
    if(!c)continue;
    // Curriculum editions are French; retained English twins are on standby and are not audited here.
    if(languages.find(c=>c.id===deck.course)?.curriculum!=='fr')continue;
    coverage.decks++;
    for(const [i,slide] of deck.slides.entries()) {
      if(['title','goals'].includes(slide.k))continue;
      resources.push({resource:{id:`slide:${deck.id}:${i+1}`,intro:'',parts:[{q:slide.b?.[0]||'',a:slide.a?.[0]||'',hint:(slide.hints||[]).map(h=>h[0]).join(' ')}],title:slide.t?.[0]||''},context:{course:c.course,chapter:c.id,phase:'lesson',sequence:`slide:${deck.id}`,unit:i+1},source:{kind:'slide',path,unit:i+1}});
    }
  }
  for(const [cls,book] of Object.entries(manifest.books)) {
    if(!included(cls)||languages.find(c=>c.id===cls)?.curriculum!=='fr')continue;
    for(const unit of book.units||[]) {
      const number=unit.match(/(?:^|\/)C(\d+)$/)?.[1];
      const chapter=manifest.catalog.chapters.find(c=>c.course===cls&&c.number===Number(number));
      const path=`content/tex/courses/${cls}/${unit}.fr.tex`;
      if(!chapter||!existsSync(resolve(ROOT,path)))continue;
      coverage.texChapters++;
      const lines=read(path).split('\n');
      lines.forEach((line,i)=>{
        const text=line.replace(/(?<!\\)%.*/,'').trim();
        if(!text)return;
        resources.push({resource:{id:`tex:${chapter.id}:${i+1}`,intro:text,parts:[],title:chapter.title[0]},context:{course:cls,chapter:chapter.id,phase:'lesson',sequence:`tex:${chapter.id}`,unit:i+1},source:{kind:'tex',path,line:i+1}});
      });
    }
  }
  return {resources,coverage};
}
export function runAudit({seedCount=4,course=null}={}) {
  const spec=JSON.parse(read('content/data/prerequisites.json')),manifest=JSON.parse(read('content/data/manifest.json'));
  const model=createModel(spec,manifest),{resources,coverage}=collectResources(manifest,{seedCount,course});
  const knownResources=course?collectResources(manifest,{seedCount:1}).resources:resources;
  const allIds=new Set([...[...AUTHORED,...MADA].map(e=>e.id),...TEMPLATES.map(t=>t.id),...knownResources.map(r=>r.resource.id)]);
  for(const id of Object.keys(spec.contracts||{}))if(!allIds.has(id))model.errors.push({code:'ORPHAN_CONTRACT',severity:'error',message:id});
  const placements=[],unsupported=new Set();
  for(const row of model.errors.length?[]:resources) {
    if(!model.profiles[row.context.course]){unsupported.add(row.context.course);continue;}
    const base=spec.contracts?.[row.resource.id];
    const rule=base?.levels?(base.levels[row.source.level]?{...base,...base.levels[row.source.level],requires:[...(base.requires||[]),...(base.levels[row.source.level].requires||[])]}:undefined):base;
    const result=auditResource(model,row.resource,row.context,rule);
    if(rule&&!rule.sourceHash){result.status='needs-review';result.coverage.current=false;result.findings.push({code:'UNVERSIONED_CONTRACT',severity:'review',resource:row.resource.id,course:row.context.course,chapter:row.context.chapter,question:null,message:'Store the reviewed source fingerprint with the contract.'});}

    // Keep source coverage while avoiding one identical missing-contract flag for every sampled seed.
    placements.push({...result,source:row.source});
  }
  coverage.unsupportedCourses=[...unsupported].sort();
  coverage.profiles=Object.keys(spec.profiles);
  coverage.unmappedCatalogCourses=manifest.catalog.courses.filter(c=>!spec.profiles[c.id]).map(c=>c.id);
  const findings=[...unsupported].map(course=>({code:'UNMAPPED_COURSE',severity:'review',resource:course,course,chapter:null,concept:null,conceptLabel:null,question:null,source:{kind:'catalogue',path:'content/data/manifest.json'},taughtIn:[]}));const seen=new Set();
  for(const placement of placements)for(const f of placement.findings) {
    const coverageId=f.code==='UNANNOTATED_REQUIREMENTS'&&['tex','slide'].includes(placement.source.kind)?placement.source.path:f.resource;
    const key=JSON.stringify([coverageId,f.chapter,f.question,f.field,f.concept,f.code]);
    if(seen.has(key))continue;seen.add(key);
    const teaches=Object.entries(spec.profiles).flatMap(([course,p])=>p.teaches?.[f.concept]?[{course,...p.teaches[f.concept]}]:[]);
    findings.push({...f,conceptLabel:spec.concepts[f.concept]?.label||null,source:placement.source,taughtIn:teaches});
  }
  const byCode={};findings.forEach(f=>byCode[f.code]=(byCode[f.code]||0)+1);
  const declared=placements.filter(p=>p.coverage.declared&&p.coverage.current),uniqueRecords=new Set(declared.map(p=>p.id));
  const digest=createHash('sha256').update(JSON.stringify({spec,resources})).digest('hex');
  return {schemaVersion:1,fingerprint:digest,basis:spec.basis,coverage:{...coverage,placements:placements.length,declaredPlacements:declared.length,declaredRecords:uniqueRecords.size,unannotatedPlacements:placements.length-declared.length},summary:{configurationErrors:model.errors.length,findings:findings.length,byCode,declaredIssues:findings.filter(f=>f.confidence==='declared'&&f.severity!=='info').length,lexicalReview:findings.filter(f=>f.confidence==='lexical').length},configurationErrors:model.errors,findings,placements:placements.map(({findings,...p})=>p)};
}
export function markdown(report) {
  const e=s=>String(s??'').replace(/\|/g,'\\|').replace(/\n/g,' ');
  const out=['# Prerequisite diagnostics','',report.basis,'',`Declared records: ${report.coverage.declaredRecords}. Scanned placements/samples: ${report.coverage.placements}. Unannotated placements: ${report.coverage.unannotatedPlacements}.`,`Sampled seeds per generator level: ${report.coverage.seedCount}. Sampling is not a proof for all generated values.`,`Configuration errors: ${report.summary.configurationErrors}. Declared issues: ${report.summary.declaredIssues}. Lexical candidates: ${report.summary.lexicalReview}.`,'','This report is internal, advisory and regenerated from current sources. Unannotated content is not cleared. It is never copied to dist/.',''];
  out.push('Configured profiles: '+report.coverage.profiles.join(', '),'Unmapped catalogue courses: '+report.coverage.unmappedCatalogCourses.join(', '),'');
  if(report.coverage.unsupportedCourses.length)out.push('Unmapped profiles: '+report.coverage.unsupportedCourses.join(', '),'');
  for(const error of report.configurationErrors)out.push(`- ${error.code}: ${error.message}`);
  out.push('| Code | Resource / question | Context | Concept | Field / source | Available at | Evidence |','|---|---|---|---|---|---|---|');
  for(const f of report.findings) {
    const where=[f.source.path,f.source.line?`line ${f.source.line}`:f.source.unit?`unit ${f.source.unit}`:''].filter(Boolean).join(' ');
    out.push(`| ${e(f.code)} | ${e(f.resource)}${f.question?` / Q${f.question}`:''} | ${e(f.chapter)} | ${e(f.conceptLabel||f.concept||'')} | ${e(f.field||'')} / ${e(where)} | ${e(f.availableAt||f.taughtIn.map(t=>t.chapter).join(', '))} | ${e(f.confidence||f.reason||'coverage')} |`);
  }
  return out.join('\n')+'\n';
}
function main() {
  const args=process.argv.slice(2),allowed=new Set(['--strict','--course','--seed-count','--details','--fingerprint']);
  let seedCount=4,course=null,fingerprint=null;
  for(let i=0;i<args.length;i++) {
    if(['--course','--seed-count','--fingerprint'].includes(args[i])&&(!args[i+1]||args[i+1].startsWith('--')))throw Error('Missing argument value: '+args[i]);
    if(!allowed.has(args[i]))throw Error('Unknown argument: '+args[i]);
    if(args[i]==='--fingerprint')fingerprint=args[++i];
    if(args[i]==='--course')course=args[++i];
    if(args[i]==='--seed-count')seedCount=Number(args[++i]);
  }
  if(!Number.isInteger(seedCount)||seedCount<1||seedCount>100)throw Error('--seed-count must be an integer from 1 to 100.');
  const spec=JSON.parse(read('content/data/prerequisites.json'));
  if(course&&!Object.hasOwn(spec.profiles,course))throw Error('No configured course profile: '+course);
  if(fingerprint) {
    const manifest=JSON.parse(read('content/data/manifest.json'));
    const found=collectResources(manifest,{seedCount:1,course}).resources.find(row=>row.resource.id===fingerprint);
    if(!found)throw Error('Unknown resource: '+fingerprint);
    console.log(JSON.stringify({id:fingerprint,kind:found.source.kind,sourceHash:found.context.sourceHash||resourceFingerprint(found.resource)}));return;
  }
  const report=runAudit({seedCount,course}),dir=resolve(ROOT,'build/out/prerequisites',...(course?[encodeURIComponent(course)]:[]));mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'report.json'),JSON.stringify(report,null,2)+'\n');writeFileSync(join(dir,'report.md'),markdown(report));
  console.log(`Prerequisites (advisory): ${report.coverage.declaredRecords} declared records; ${report.summary.declaredIssues} declared dependency issues; ${report.summary.lexicalReview} lexical candidates; ${report.coverage.unannotatedPlacements} unannotated placements/samples.`);
  console.log(`Internal reports: ${relative(ROOT,join(dir,'report.md'))} and report.json. No student-facing flags or automatic publication gate.`);
  if(args.includes('--details'))for(const f of report.findings.filter(f=>f.confidence==='declared').slice(0,20))console.log(`${f.code}: ${f.resource} Q${f.question||'intro'} at ${f.chapter}: ${f.concept} -> ${f.availableAt||'outside this course'}`);
  if(report.configurationErrors.length){console.error(JSON.stringify(report.configurationErrors));process.exitCode=1;}
  else if(args.includes('--strict')&&report.findings.some(f=>f.severity!=='info'))process.exitCode=1;
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href)try{main();}catch(error){console.error(error.message);process.exitCode=1;}
