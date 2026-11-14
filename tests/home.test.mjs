import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {homePage,bindHome} from '../site/js/welcome.js';
import {discoveryIndex} from '../site/js/discovery.js';
import {labs,challenges} from '../site/js/content.js';
import {liveCourses,isLiveHash,FULL_EDITION} from '../site/js/live-curriculum.js';
import {resourceCatalog} from '../dist/js/resources-data.js';
const index=discoveryIndex({labs,challenges,chapters:resourceCatalog.chapters});
const setup=(language=0,{last='',saved='',storage=true}={})=>{
 const t=x=>x[language],pair=(fr,en)=>t([fr,en]);
 const dom=new JSDOM(homePage({t,pair,index,last,link:(p,id)=>'#'+p+(id?'/'+id:'')}),{url:'https://example.test/'});
 if(saved)dom.window.localStorage.setItem('mx-home-course',saved);
 if(!storage)Object.defineProperty(dom.window,'localStorage',{get(){throw new Error('Unavailable');}});
 const root=dom.window.document.querySelector('main'),stop=bindHome(root,index,t);
 const query=value=>{const input=root.querySelector('#home-query');input.value=value;input.dispatchEvent(new dom.window.Event('input'));return [...root.querySelectorAll('.home-result')];};
 const choose=value=>{const select=root.querySelector('#home-class');select.value=value;select.dispatchEvent(new dom.window.Event('change'));return [...root.querySelectorAll('.home-result')];};
 return {dom,root,query,choose,close(){stop();dom.window.close();}};
};
for(const language of [0,1])test(`home directs students to actual chapters, language ${language}`,()=>{
 const h=setup(language),{root}=h;
 assert.equal(root.querySelectorAll('.home-result').length,0,'no unfiltered catalogue on arrival');
 assert.equal(root.querySelector('#home-choice-hint').hidden,false);
 assert.deepEqual([...root.querySelectorAll('#home-class option')].slice(1).map(x=>x.textContent),liveCourses.map(c=>c.title[0]),'curriculum labels remain French');
 assert.equal(root.querySelectorAll('.tool-card,.idea-card,.figure-tab,[data-pause]').length,0);
 assert.equal(root.querySelectorAll('#home-figure-stage').length,1);
 assert.equal(root.querySelector('.teacher-entry').open,false);
 for(const course of liveCourses){
  const found=h.choose(course.id),expected=resourceCatalog.chapters.filter(c=>c.course===course.id);
  assert.equal(found.length,expected.length,course.id);
  assert.deepEqual(new Set(found.map(a=>a.hash)),new Set(expected.map(c=>'#chapter/'+c.id)));
  assert.ok(found.every(a=>a.querySelector('.chapter-name').textContent===expected.find(c=>'#chapter/'+c.id===a.hash).title[0]));
 }
 h.choose('');
 for(const term of ['dérivée','derivee','hasard','trinôme','parabole'])assert.ok(h.query(term).length,term);
 assert.equal(h.query('T11').length,0,'hidden curriculum stays hidden');
 assert.equal(root.querySelector('#home-empty').hidden,false);
 h.query('<script>alert(1)</script>');assert.equal(root.querySelectorAll('script').length,0);
 root.querySelector('#home-reset-search').click();
 assert.equal(root.ownerDocument.activeElement.id,'home-query');
 assert.equal(root.querySelector('#home-empty').hidden,true);
 for(const a of root.querySelectorAll('a[href^="#"]'))assert.ok(isLiveHash(a.hash),a.hash);
 h.close();
});
test('home remembers a class, resumes an actual chapter and survives blocked storage',()=>{
 const h=setup(0,{last:'premiere-02'});
 assert.equal(h.root.querySelector('#home-class').value,'premiere');
 assert.equal(h.root.querySelector('.home-resume a').hash,'#chapter/premiere-02');
 h.choose('seconde');assert.equal(h.root.querySelector('.home-resume').hidden,true);
 assert.equal(h.dom.window.localStorage.getItem('mx-home-course'),'seconde');h.close();
 for(const storage of [true,false]){
  // a class that is not live: another curriculum in the limited edition, an unknown one in the full edition
  const next=setup(0,FULL_EDITION?{last:'zz-01',saved:'zz',storage}:{last:'t10-01',saved:'t11s',storage});
  assert.equal(next.root.querySelector('#home-class').value,'');
  assert.equal(next.root.querySelector('.home-resume'),null);
  assert.ok(next.choose('terminale').length);next.close();
 }
 const remembered=setup(0,{last:'premiere-02',saved:'stmg'});
 assert.equal(remembered.root.querySelector('#home-class').value,'stmg');remembered.close();
});
