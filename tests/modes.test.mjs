import test from 'node:test';
import assert from 'node:assert/strict';
import {MODES,modeOfRoute,showModeBar} from '../site/js/modes.js';
test('three modes with bilingual labels and home hashes',()=>{
 assert.deepEqual(MODES.map(m=>[m.id,m.hash]),[['preparer','#prepare'],['classe','#teacher'],['detente','#relax']]);
 for(const m of MODES){assert.equal(m.label.length,2);assert.ok(m.label.every(x=>x&&!/[–—]/.test(x)));}
});
test('modeOfRoute: own pages',()=>{
 assert.equal(modeOfRoute('teacher','detente'),'classe');
 for(const p of ['prepare','sheets','pack','sources'])assert.equal(modeOfRoute(p,'classe'),'preparer',p);
 for(const p of ['relax','biographies','stories','history','gallery','olympiad','challenges','topics','lab'])assert.equal(modeOfRoute(p,'classe'),'detente',p);
});
test('modeOfRoute: other pages keep the remembered mode, or none',()=>{
 for(const p of ['automatismes','bank','slides','resources','chapter','library','search','errors','basics','home','missing']){
  assert.equal(modeOfRoute(p,'classe'),'classe',p);assert.equal(modeOfRoute(p),'',p);assert.equal(modeOfRoute(p,''),'',p);assert.equal(modeOfRoute(p,'bogus'),'',p);
 }
});
test('showModeBar: teacher entrance, edition default when nothing is stored, or the mode pages',()=>{
 // limited edition (full:false): unstored means teacher
 assert.equal(showModeBar({entry:'',page:'home',full:false}),true);
 assert.equal(showModeBar({entry:'student',page:'resources',full:false}),false);
 assert.equal(showModeBar({entry:'teacher',page:'resources',full:false}),true);
 // full edition: unstored means student, bar hidden
 assert.equal(showModeBar({entry:'',page:'home',full:true}),false);
 assert.equal(showModeBar({entry:'student',page:'resources',full:true}),false);
 assert.equal(showModeBar({entry:'teacher',page:'resources',full:true}),true);
 for(const full of [true,false])for(const page of ['teacher','prepare','relax'])assert.equal(showModeBar({entry:'student',page,full}),true,page);
});
