import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {homePage,bindHome} from '../site/js/welcome.js';
import {discoveryIndex} from '../site/js/discovery.js';
import {labs,challenges} from '../site/js/content.js';
import {resourceCatalog} from '../dist/js/resources-data.js';

const index=discoveryIndex({labs,challenges,chapters:resourceCatalog.chapters});
for(const language of [0,1])test(`home search and entrances, language ${language}`,()=>{
 const t=x=>x[language],pair=(fr,en)=>t([fr,en]);
 const dom=new JSDOM(homePage({t,pair,index,link:(p,id)=>'#'+p+(id?'/'+id:'')}));
 const root=dom.window.document.querySelector('main');
 const stop=bindHome(root,index,t),input=root.querySelector('#home-query');
 const query=value=>{input.value=value;input.dispatchEvent(new dom.window.Event('input'));return [...root.querySelectorAll('.home-result')];};
 assert.equal(root.querySelector('.home-resume'),null);
 assert.equal(root.querySelectorAll('.tool-card').length,6);
 // The hero figure is the animated plate of five live figures (home-slides.js); the Fourier island is an idea card.
 assert.equal(root.querySelectorAll('[data-home-slides]').length,1);
 assert.equal(root.querySelectorAll('.figure-tab').length,5);
 assert.ok(root.querySelector('[data-pause]'),'a pause control for the slideshow');
 assert.equal(root.querySelector('.idea-card[href="#gallery/fourier"]')!==null,true);
 assert.equal(root.querySelectorAll('.home-reading a').length,2);
 assert.equal(root.querySelector('.entrance-actions a:last-child').getAttribute('href'),'#lab');
 for(const a of root.querySelectorAll('.tool-card'))assert.ok(index.some(x=>x.route===a.getAttribute('href')));
 for(const term of ['dérivée','derivee','hasard','trinôme','parabole'])assert.ok(query(term).length,term);
 assert.equal(query('zzzz-no-matches').length,0);
 assert.equal(root.querySelector('#home-search-panel').hidden,false);
 query('<script>alert(1)</script>');assert.equal(root.querySelectorAll('script').length,0);
 query('');assert.equal(root.querySelector('#home-search-panel').hidden,true);
 stop();dom.window.close();
});
