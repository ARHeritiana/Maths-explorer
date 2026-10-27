import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {guides} from '../dist/js/study-guides.js';
import {selectChapters,resourceTypes} from '../dist/js/library.js';
import {labs} from '../dist/js/content.js';
const c=JSON.parse(fs.readFileSync(new URL('../dist/resources/catalog.json',import.meta.url)));
const base={curriculum:'all',course:'all',type:'all',language:'all',search:'',solutions:false};
test('resource catalog resolves every downloadable file and provenance record',()=>{
  for(const key of ['chapters','resources','sources','courses'])assert.equal(new Set(c[key].map(x=>x.id??x.name)).size,c[key].length);
  for(const r of c.resources){
    assert.ok(c.chapters.some(ch=>ch.id===r.chapter));assert.ok(resourceTypes[r.type]);
    for(const {path:url} of Object.values(r.editions)){
      assert.match(url,/^\.\/resources\/[a-z0-9/-]+\.(pdf|html)$/);
      const file=new URL('../dist/'+url.slice(2),import.meta.url);assert.ok(fs.statSync(file).size>100);
      if(r.format==='PDF')assert.equal(fs.readFileSync(file).subarray(0,4).toString(),'%PDF');
    }
    if(r.source){assert.ok(c.sources.some(s=>s.name===r.source));assert.ok(r.sourcePages[0]>=1&&r.sourcePages[1]>=r.sourcePages[0]);}
    if(r.type==='solutions')assert.equal(r.audience,'teacher');
    assert.ok(Object.keys(r.editions).length);
    for(const [language,edition] of Object.entries(r.editions)){assert.ok(['fr','en'].includes(language));assert.ok(edition.bytes>0);assert.match(edition.sha256,/^[a-f0-9]{64}$/);if(r.format==='PDF')assert.ok(edition.pages>0);}
  }
  for(const ch of c.chapters){
    assert.ok(ch.title.length===2&&ch.title.every(Boolean));
    for(const lab of ch.labs)assert.ok(labs.some(l=>l.id===lab.split('/')[0]),lab);
    if(ch.guide)assert.ok(c.chapters.some(g=>g.id===ch.guide));
  }
  for(const s of c.sources)assert.match(s.sha256,/^[a-f0-9]{64}$/);
});
test('every imported course chapter has a complete student and teacher edition',()=>{
  assert.equal(c.chapters.filter(ch=>!['shared','explorations'].includes(ch.course)&&ch.number>0).length,58);
  for(const ch of c.chapters.filter(ch=>!['shared','explorations'].includes(ch.course)&&ch.number>0)){
    const rs=c.resources.filter(r=>r.chapter===ch.id);
    assert.ok(rs.some(r=>r.type==='booklet'&&r.audience==='student'));
    assert.ok(rs.some(r=>r.type==='solutions'&&r.audience==='teacher'));
    assert.ok(guides[ch.topic]);
  }
});
test('language and pathway filters do not relabel French originals as translated or aligned',()=>{
  for(const curriculum of ['mg','ib'])assert.ok(selectChapters(c,{...base,curriculum}).every(ch=>['shared','explorations'].includes(ch.course)));
  assert.ok(selectChapters(c,{...base,curriculum:'fr'}).every(ch=>!['shared','explorations'].includes(ch.course)));
  assert.equal(selectChapters(c,{...base,course:'seconde',language:'en',type:'notes'}).length,15);
  assert.equal(selectChapters(c,{...base,type:'solutions'}).length,0);
  assert.ok(selectChapters(c,{...base,type:'solutions',solutions:true}).length>0);
  assert.equal(selectChapters(c,{...base,search:'zzzz-no-match'}).length,0);
  assert.ok(selectChapters(c,{...base,search:'derivation'}).length>0);
});
test('bilingual starting sheets are complete and retain source associations',()=>{
  for(const [topic,g] of Object.entries(guides)){
    for(const key of ['title','notes','exercises','problems','solutions'])assert.ok(g[key].length===2&&g[key].every(s=>typeof s==='string'&&s.length>5));
    assert.ok(c.chapters.some(ch=>!['shared','explorations'].includes(ch.course)&&ch.topic===topic));
    for(const type of ['notes','exercises','problems','solutions'])assert.ok(c.resources.some(r=>r.chapter==='shared-'+topic&&r.type===type&&r.language==='bilingual'));
  }
});

test('every companion chapter and supplement edition has its promised published PDF',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('../content/data/manifest.json',import.meta.url),'utf8'));
  for(const collection of ['chapters','supplements']){
    for(const entry of manifest.companion[collection]){
      assert.ok(entry.files.length>0,`${entry.id}: no companion documents`);
      for(const [fileIndex,file] of entry.files.entries()){
        assert.ok(Object.keys(file.editions||{}).length>0,`${entry.id}/${file.kind}: no declared editions`);
        for(const [language,edition] of Object.entries(file.editions)){
          assert.ok(['fr','en'].includes(language),`${entry.id}: unsupported edition ${language}`);
          assert.match(edition.path,/^resources\/[a-z0-9/-]+\.pdf$/,`${entry.id}: unsafe PDF path`);
          const key=`${entry.id}/${file.kind}[${fileIndex}]/${language}`;
          const path=new URL('../dist/'+edition.path,import.meta.url);
          assert.ok(fs.statSync(path).size>100,`${key}: missing or empty ${edition.path}`);
          const fd=fs.openSync(path,'r');
          try{
            const header=Buffer.alloc(4);
            assert.equal(fs.readSync(fd,header,0,4,0),4,`${key}: truncated PDF`);
            assert.equal(header.toString(),'%PDF',`${key}: not a PDF`);
          } finally {fs.closeSync(fd);}
        }
      }
    }
  }
});
