// Adversarial scope/order fixtures and real-source integration of the internal prerequisite audit.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createModel,auditResource,resourceFingerprint} from '../scripts/prerequisite-model.mjs';
import {runAudit,markdown} from '../scripts/check-prerequisites.mjs';
function fixture() {
  const concept=(requires=[],patterns=[])=>({label:'Concept',requires,patterns});
  const spec={schemaVersion:1,concepts:{basic:concept(),method:concept(['basic'],['advanced-method']),dependent:concept(['method']),outside:concept(['basic'],['outside-topic']),log:concept(['basic'],['\\\\ln\\b'])},profiles:{
    a:{inherits:[],assumes:['basic'],teaches:{method:{chapter:'a-10'},dependent:{chapter:'a-10'},log:{chapter:'a-10'}}},
    b:{inherits:['a'],assumes:[],teaches:{}},
    parallel:{inherits:[],assumes:['basic'],teaches:{outside:{chapter:'parallel-01'}}}
  }};
  const manifest={catalog:{courses:['a','b','parallel'].map(id=>({id})),chapters:[{id:'a-01',course:'a',number:1},{id:'a-02',course:'a',number:2},{id:'a-10',course:'a',number:10},{id:'b-01',course:'b',number:1},{id:'parallel-01',course:'parallel',number:1}]}};
  return {spec,manifest};
}
const resource=(parts,intro='')=>({id:'fixture',intro,parts:parts.map(q=>typeof q==='string'?{q}:q)});
const context={course:'a',chapter:'a-02',phase:'practice'};
const codes=result=>result.findings.map(f=>f.code);
const model=()=>{const f=fixture();return createModel(f.spec,f.manifest);};
test('course order uses the manifest numbers; prerequisites are transitive and require the future method',()=>{
  const m=model();
  assert.equal(m.availability('method',context).state,'future');
  const r=auditResource(m,resource(['Use the result.']),context,{requires:[],parts:[{requires:['dependent']}]});
  assert.ok(r.findings.some(f=>f.concept==='method'&&f.requiredBy==='dependent'&&f.availableAt==='a-10'));
  assert.deepEqual(m.expanded(['dependent']).get('basic'),['dependent','method','basic']);
  assert.equal(m.availability('method',{...context,chapter:'a-10'}).state,'current');
});
test('only explicit inheritance or completed chapters grant knowledge, never a parallel course',()=>{
  const m=model();
  assert.equal(m.availability('method',{course:'b',chapter:'b-01'}).state,'entry');
  assert.equal(m.availability('outside',context).state,'out-of-scope');
  assert.equal(m.availability('outside',{...context,completedChapters:['parallel-01']}).state,'completed');
  assert.equal(m.availability('basic',{course:'missing',chapter:'a-01'}).state,'unknown-course');
});
test('lesson-unit introductions catch within-chapter forward references; absent unit positions stay unresolved',()=>{
  const f=fixture();f.spec.profiles.a.teaches.method.unit=4;f.spec.profiles.a.teaches.method.sequence='lesson-a';const m=createModel(f.spec,f.manifest);
  const early={...context,chapter:'a-10',phase:'lesson',sequence:'lesson-a',unit:2};
  assert.equal(m.availability('method',early).state,'future-unit');
  assert.equal(m.availability('method',{...early,unit:4}).state,'current');
  assert.equal(m.availability('log',early).state,'unresolved-order');
  assert.equal(m.availability('method',{...early,unit:99,sequence:'another-edition'}).state,'unresolved-order');
  const r=auditResource(m,resource(['Use it.']),early,{requires:[],parts:[{requires:['method']}]});
  assert.ok(codes(r).includes('FUTURE_CONCEPT'));
});
test('a result established by an earlier question is available later, but cannot justify its own question',()=>{
  const m=model();
  const r=auditResource(m,resource(['Derive a method from basic data.','Apply that method.']),context,{requires:[],parts:[{requires:['basic'],establishes:['method']},{requires:['method']}]});
  assert.equal(r.status,'annotated-clear');
  const self=auditResource(m,resource(['Use the method to establish it.','Use the dependent result.']),context,{requires:[],parts:[{requires:['method'],establishes:['dependent']},{requires:['dependent']}]});
  assert.ok(self.findings.some(f=>f.question===1&&f.code==='FUTURE_CONCEPT'));
  assert.ok(self.findings.some(f=>f.question===2&&f.concept==='dependent'&&f.code==='FUTURE_CONCEPT'));
});
test('a supplied definition is local to this problem and does not leak into another resource',()=>{
  const m=model(),body=resource(['Use the definition.']);
  assert.equal(auditResource(m,body,context,{requires:[],provides:['method'],parts:[{requires:['method']}]}).status,'annotated-clear');
  assert.ok(codes(auditResource(m,body,context,{requires:[],parts:[{requires:['method']}]})).includes('FUTURE_CONCEPT'));
});
test('given material is still out of course unless the extension has an explicit reason',()=>{
  const m=model(),body=resource(['Use this definition.']);
  const bad=auditResource(m,body,context,{requires:[],provides:['outside'],parts:[{requires:['outside']}]});
  assert.ok(codes(bad).includes('OUT_OF_SCOPE'));
  const allowed=auditResource(m,body,context,{requires:[],provides:['outside'],extensions:[{concept:'outside',reason:'Optional extension with its full definition supplied.'}],parts:[{requires:['outside']}]});
  assert.equal(allowed.status,'declared-extension');
  assert.ok(codes(allowed).includes('ACKNOWLEDGED_EXTENSION'));
});
test('hints and answers are scanned independently, including mathematical notation',()=>{
  const r=auditResource(model(),resource([{q:'Compute a number.',hint:'Use \\ln(x).',a:'Apply advanced-method.'}]),context,{requires:[],parts:[{requires:[]}]});
  assert.ok(r.findings.some(f=>f.field==='hint'&&f.concept==='log'&&f.confidence==='lexical'));
  assert.ok(r.findings.some(f=>f.field==='solution'&&f.concept==='method'&&f.severity==='review'));
  assert.equal(r.status,'needs-review');
});
test('acknowledged mentions cannot conceal an actual declared dependency; exceptions need reasons',()=>{
  const r=auditResource(model(),resource(['advanced-method']),context,{requires:[],parts:[{requires:['method'],mentions:[{concept:'method',reason:'Mention only.'}]}]});
  assert.ok(r.findings.some(f=>f.confidence==='declared'&&f.code==='FUTURE_CONCEPT'));
  const bad=auditResource(model(),resource(['outside-topic']),context,{requires:[],extensions:[{concept:'outside',reason:''}],parts:[{requires:[]}]});
  assert.ok(codes(bad).includes('INVALID_CONTRACT'));
});
test('missing annotations, unknown concepts, bad contexts and malformed contracts never receive clearance',()=>{
  const m=model();
  for(const contract of [undefined,{requires:[],parts:[]},{requires:[],parts:[{requires:['typo']}]},{requires:[],parts:[{requires:['toString']}]} ,{requires:[],parts:[{requires:'method'}]},{requires:[],parts:[{requires:[],mentions:{}}]}]) {
    const r=auditResource(m,resource(['Compute.']),context,contract);assert.equal(r.status,'needs-review');
  }
  assert.ok(codes(auditResource(m,resource([]),{course:'a',chapter:'b-01'},{requires:[],parts:[]})).includes('CONTEXT_MISMATCH'));
  assert.ok(codes(auditResource(m,resource([]),{course:'a',chapter:'missing'},{requires:[],parts:[]})).includes('UNKNOWN_POSITION'));
});
test('configuration catches concept/profile cycles, wrong placements and invalid patterns',()=>{
  const f=fixture();f.spec.concepts.basic.requires=['dependent'];
  f.spec.profiles.a.inherits=['b'];f.spec.profiles.a.teaches.method.chapter='b-01';f.spec.concepts.log.patterns=['['];
  const errors=createModel(f.spec,f.manifest).errors.map(e=>e.code);
  for(const code of ['CONCEPT_CYCLE','PROFILE_CYCLE','INVALID_PLACEMENT','INVALID_PATTERN'])assert.ok(errors.includes(code),code);
});
test('real report scans the bank, generated levels/seeds, decks and TeX; lexical-only content is not cleared',()=>{
  const r=runAudit({seedCount:1});
  assert.deepEqual(r.configurationErrors,[]);
  assert.equal(r.coverage.declaredRecords,24);
  assert.ok(r.coverage.templates>50&&r.coverage.decks>0&&r.coverage.texChapters>0);
  assert.ok(r.coverage.unannotatedPlacements>0);
  assert.ok(r.findings.some(f=>f.resource==='exam-bac-01'&&f.question===3&&f.concept==='functions.logarithm'&&f.availableAt==='terminale-08'&&f.confidence==='declared'));
  assert.ok(r.findings.some(f=>f.resource==='exam-bac-05'&&f.question===4&&f.chapter==='terminale-10'&&f.concept==='analysis.integral_mean'));
  assert.ok(r.placements.some(p=>p.source.kind==='generator'&&p.source.level===3));
  assert.match(markdown(r),/not a semantic clearance|not cleared/);
  assert.equal(existsSync(new URL('../dist/build/out/prerequisites/report.json',import.meta.url)),false);
});
test('default command is advisory; strict mode is an explicit authoring choice',()=>{
  const cwd=new URL('../',import.meta.url);
  const normal=spawnSync(process.execPath,['scripts/check-prerequisites.mjs','--course','premiere','--seed-count','1'],{cwd,encoding:'utf8'});
  assert.equal(normal.status,0,normal.stderr);assert.match(normal.stdout,/advisory/);
  const strict=spawnSync(process.execPath,['scripts/check-prerequisites.mjs','--course','premiere','--seed-count','1','--strict'],{cwd,encoding:'utf8'});
  assert.equal(strict.status,1,strict.stderr);
  const spec=JSON.parse(readFileSync(new URL('../content/data/prerequisites.json',import.meta.url),'utf8'));
  assert.ok(spec.contracts['exam-eam-01']);
});

test('reordered questions or changed hints/solutions invalidate the recorded prerequisite contract',()=>{
  const body=resource([{q:'First question.',a:'A result.'},{q:'Second question.',hint:'A hint.'}]);
  const rule={sourceHash:resourceFingerprint(body),requires:[],parts:[{requires:['basic']},{requires:['basic']}]};
  assert.equal(auditResource(model(),body,context,rule).status,'annotated-clear');
  const changed=structuredClone(body);changed.parts.reverse();
  assert.ok(codes(auditResource(model(),changed,context,rule)).includes('STALE_CONTRACT'));
  changed.parts=structuredClone(body.parts);changed.parts[0].a='Different method.';
  assert.ok(codes(auditResource(model(),changed,context,rule)).includes('STALE_CONTRACT'));
});
