import test from 'node:test';
import assert from 'node:assert/strict';
import {editionFor, editionLabel, packEditions} from '../site/js/resource-editions.js';
import {selectChapters} from '../dist/js/library.js';
import {chapterSequencePage} from '../dist/js/chapter-sequence.js';
const file=(id,languages)=>({id,chapter:id,course:'premiere',title:[id,id],format:'PDF',type:'notes',
  editions:Object.fromEntries(languages.map((lang,i)=>[lang,{path:`resources/${id}-${lang}.pdf`,pages:i+1,bytes:100+i,sha256:'a'.repeat(64)}]))});
const records=[file('french',['fr']),file('english',['en']),file('both',['fr','en'])];
const catalog={courses:[{id:'premiere',title:['Cours','Course']}],chapters:records.map(r=>({id:r.id,course:r.course,title:r.title,labs:[]})),resources:records};
const filter={curriculum:'all',course:'all',type:'all',language:'all',search:'',solutions:false};
test('language filters include independent and paired editions',()=>{
  assert.deepEqual(selectChapters(catalog,{...filter,language:'fr'}).map(c=>c.id),['french','both']);
  assert.deepEqual(selectChapters(catalog,{...filter,language:'en'}).map(c=>c.id),['english','both']);
  assert.equal(editionLabel(records[1]),'EN');assert.equal(editionFor(records[0],'en'),null);
});
test('packs report unavailable items and count only the selected language',()=>{
  const en=packEditions(records,'en');assert.deepEqual(en.unavailable.map(r=>r.id),['french']);
  assert.equal(en.pages,3);assert.equal(en.bytes,201);
  assert.deepEqual(en.available.map(x=>x.edition.path),['resources/english-en.pdf','resources/both-en.pdf']);
  const fr=packEditions(records,'fr');assert.deepEqual(fr.unavailable.map(r=>r.id),['english']);assert.equal(fr.pages,2);
});
test('chapter downloads show an unavailable edition without substituting another language',()=>{
  for(const language of ['fr','en'])for(const record of records){
    const c={id:record.id,course:'premiere',number:1,title:record.title,files:[{kind:'chapter',...record}]};
    const html=chapterSequencePage(c,'documents',pair=>pair[language==='en'?1:0],[c]);
    const edition=editionFor(record,language);
    if(edition)assert.ok(html.includes(edition.path));
    else {assert.match(html,/indisponible|unavailable/);assert.ok(!html.includes(Object.values(record.editions)[0].path));}
    assert.ok(!/undefined|NaN/.test(html));
  }
});
