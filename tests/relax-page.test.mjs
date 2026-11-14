import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountRelaxPage} from '../dist/js/relax-page.js';
import {describe} from '../dist/js/reading.js';
import {isLiveHash} from '../dist/js/live-curriculum.js';

const ALL=()=>true;
const setup=async({lang=0,live=ALL,rng=()=>0.5}={})=>{
 const dom=new JSDOM('<main id="main"></main>',{url:'https://example.test/#relax'});
 const main=dom.window.document.querySelector('#main');
 const stop=await mountRelaxPage(main,{t:p=>p[lang],live,rng,today:new Date(2026,10,11)});
 return {main,stop,$:s=>main.querySelector(s),$$:s=>[...main.querySelectorAll(s)]};
};

test('four cards of the day, structure',async()=>{
 const h=await setup();
 assert.deepEqual(h.$$('h1,h2').map(x=>x.textContent),['Détente','Aujourd’hui','Surprends-moi','Pour aller plus loin']);
 assert.equal(h.$$('#rx-today .rx-card').length,4);
 assert.deepEqual(h.$$('#rx-today .rx-card').map(c=>c.dataset.rxKind),['biography','story','curiosity','experiment']);
 assert.deepEqual(h.$$('#rx-today .rx-go').map(a=>a.firstChild.textContent),['Lire','Lire','Manipuler','Manipuler']);
 for(const c of h.$$('#rx-today .rx-card')){assert.equal(c.querySelectorAll('a').length,1);assert.ok(c.querySelector('.rx-title').textContent.trim()&&c.querySelector('.rx-teaser').textContent.trim());}
});

test('Surprends-moi draws a card and announces it',async()=>{
 const h=await setup({rng:()=>0});
 assert.equal(h.$('#rx-surprise').children.length,0);
 h.$('#rx-draw').click();
 assert.equal(h.$$('#rx-surprise .rx-card').length,1);
 const title=h.$('#rx-surprise .rx-title').textContent;
 assert.ok(h.$('#rx-live').textContent.startsWith('Page proposée :')&&h.$('#rx-live').textContent.includes(title));
 assert.equal(h.$('#rx-live').getAttribute('aria-live'),'polite');
 h.$('#rx-draw').click();assert.equal(h.$$('#rx-surprise .rx-card').length,1,'one card, replaced');
 h.stop();
});

test('English labels',async()=>{
 const h=await setup({lang:1});
 assert.deepEqual(h.$$('h1,h2').map(x=>x.textContent),['Relax','Today','Surprise me','Going further']);
 assert.deepEqual(h.$$('#rx-today .rx-go').map(a=>a.firstChild.textContent),['Read','Read','Explore','Explore']);
 assert.ok(/Biography/.test(h.$('.rx-kind').textContent));
 h.$('#rx-draw').click();assert.ok(h.$('#rx-live').textContent.startsWith('Suggested page:'));
});

test('live data: every link is live and resolves to a page',async()=>{
 const h=await setup({live:isLiveHash});
 assert.equal(h.$$('#rx-today .rx-card').length,4);
 const hrefs=h.$$('a').map(a=>a.getAttribute('href'));
 assert.ok(hrefs.length>=4+6);
 for(const href of hrefs){assert.ok(isLiveHash(href),href);if(/^#(biographies|stories|gallery|lab)\//.test(href))assert.ok(describe(href),'no dead link '+href);}
});

test('empty data: the page still renders',async()=>{
 const dom=new JSDOM('<main id="main"></main>');const main=dom.window.document.querySelector('#main');
 await mountRelaxPage(main,{t:p=>p[0],pools:{},live:ALL});
 assert.equal(main.querySelectorAll('.rx-card').length,0);assert.ok(main.querySelector('#rx-draw'));
 main.querySelector('#rx-draw').click();assert.equal(main.querySelector('#rx-live').textContent,'Rien à proposer.');
});
