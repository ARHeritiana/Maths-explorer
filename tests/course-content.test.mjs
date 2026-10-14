import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {sequenceModel} from '../site/js/sequence-model.js';
test('revised courses have separate diagnostic and assessment tasks, graduated hints and complete corrections',()=>{
 for(const id of ['seconde-01','premiere-02']){
  const d=JSON.parse(fs.readFileSync(new URL('../content/slides/'+id+'.json',import.meta.url)));
  const model=sequenceModel(d);
  assert.ok(model.diagnostics.length&&model.checks.length);
  for(const s of [...model.diagnostics,...model.tasks,...model.checks])assert.ok(s.a?.every(x=>typeof x==='string'&&x.length));
  assert.ok(model.tasks.some(x=>x.hints?.length>=2));
  assert.ok(!model.tasks.some(x=>x.stage==='diagnostic'||x.stage==='check'));
 }
});
test('revised course numerical statements and Python examples pass independent checks',()=>{
 for(const script of ['verify-arithmetic.py','verify-quadratic.py']){
  const result=spawnSync('python3',['-I','tests/'+script],{cwd:new URL('..',import.meta.url),encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
 }
});
