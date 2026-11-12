import test from 'node:test';
import assert from 'node:assert/strict';
import {phaseForType,blockFromItem,blockFromPhase,describeTotals,printList,liveLinks,isPhase,dropIndex,movedText} from '../site/js/prepare-model.js';
import {totals,addBlock,emptySeance} from '../site/js/seance-model.js';

test('phase default from item type',()=>{
 const want={exercise:'exercices',exercises:'exercices',deck:'cours',slides:'cours',lab:'activite',errors:'outils',misconception:'outils',starters:'automatismes',automatismes:'automatismes',annales:'exercices',chapter:'cours'};
 for(const [k,v] of Object.entries(want))assert.equal(phaseForType(k),v,k);
 assert.equal(phaseForType('unknown'),'outils');assert.ok(isPhase('cours'));assert.ok(!isPhase('x'));
});
test('blockFromItem picks an address, a language and a valid phase',()=>{
 const it={id:'a',type:'lab',title:['Titre','Title'],actions:{manipulate:{href:'#lab/x'}}};
 assert.deepEqual(blockFromItem(it,'activite',1),{phase:'activite',resourceId:'a',title:'Title',href:'#lab/x',print:false});
 assert.equal(blockFromItem(it,'zzz').phase,'activite','bad phase falls back to the type default');
 assert.equal(blockFromItem({...it,actions:{}},'cours'),null);assert.equal(blockFromItem(null,'cours'),null);
 const s=addBlock(emptySeance(),blockFromItem(it,'activite'));assert.equal(s.blocks.length,1);
});
test('blockFromPhase needs a href',()=>{
 assert.equal(blockFromPhase({id:'cours',label:['Cours','Lesson'],detail:null,href:null}),null);
 const b=blockFromPhase({id:'cours',label:['Cours','Lesson'],detail:['Chap','Chap'],href:'#chapter/x'},1);
 assert.equal(b.title,'Lesson : Chap');assert.equal(b.phase,'cours');
});
test('describeTotals: minutes text, print count, warning above 3',()=>{
 const mk=(n,min,pr)=>{let s=emptySeance();for(let i=0;i<n;i++)s=addBlock(s,{phase:'cours',title:'b'+i,href:'#a',minutes:min,print:i<pr});return s;};
 let d=describeTotals(totals(mk(2,20,0)),2);assert.ok(d.minutesText[0].includes('15 min libres'));assert.equal(d.over,false);assert.equal(d.warn,null);
 d=describeTotals(totals(mk(4,20,4)),4);assert.ok(d.minutesText[0].includes('25 min de trop'));assert.ok(d.minutesText[1].includes('too many'));assert.ok(d.over);
 assert.ok(d.warn[0].includes('Beaucoup de papier'));assert.equal(describeTotals(totals(mk(4,1,3)),4).warn,null);
 for(const x of [d.minutesText,d.printText,d.warn].flat())assert.ok(!/[–—]/.test(x));
 assert.deepEqual(printList(mk(3,1,2)),['b0','b1']);
});
test('liveLinks keeps only live routes',()=>{
 assert.deepEqual(liveLinks([['#a','x','y'],['#b','x','y'],['https://z','x','y']],h=>h==='#a').map(l=>l[0]),['#a','https://z']);
});
test('dropIndex: target index from the pointer position, dragged block excluded',()=>{
 const mids=[20,60,100,140];
 assert.equal(dropIndex(mids,2,0),0);assert.equal(dropIndex(mids,2,10),0);assert.equal(dropIndex(mids,2,30),1);
 assert.equal(dropIndex(mids,2,100),2);assert.equal(dropIndex(mids,2,500),3);
 assert.equal(dropIndex(mids,0,30),0);assert.equal(dropIndex(mids,0,70),1);assert.equal(dropIndex(mids,0,500),3);
 assert.equal(dropIndex([50],0,999),0);assert.equal(dropIndex([],0,5),0);
});
test('movedText is a [fr,en] pair without dashes',()=>{
 const m=movedText('Cours',2,5);assert.equal(m.length,2);assert.equal(m[0],'Cours : position 2 sur 5');assert.equal(m[1],'Cours: position 2 of 5');
 assert.ok(!/[–—]/.test(m.join('')));
});
