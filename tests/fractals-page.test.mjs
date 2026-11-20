// The fractal collection page (`#fractals`, issue #36): every entry points at an existing gallery exhibit, each group is
// used, every dimension is labelled exact, estimate or not established, with a reason in both languages; exact values
// agree with the self-similar model; the route is live; no dashes in the copy.
import test from 'node:test';
import assert from 'node:assert/strict';
import {GROUPS,FRACTALS,DIM_KIND} from '../site/js/fractals-data.js';
import {fractalsPage} from '../site/js/fractals-page.js';
import {labs} from '../site/js/content.js';
import {similarityDim} from '../site/js/gallery/gallery-selfsimilar-model.js';
import {isLiveHash} from '../site/js/live-curriculum.js';

test('entries point at existing exhibits, every group used, every dimension labelled with a reason', () => {
  const ids=new Set(labs.filter(l=>l.custom).map(l=>l.id));
  for(const f of FRACTALS){assert.ok(ids.has(f.hash.split('/')[1]),f.hash);assert.ok(DIM_KIND[f.dim.kind]);assert.equal(f.dim.why.length,2);assert.ok(f.dim.why.every(s=>s.length>5&&!/[–—]/.test(s)));}
  for(const g of GROUPS)assert.ok(FRACTALS.some(f=>f.group===g.id),g.id);
  assert.ok(isLiveHash('#fractals'));
});

test('exact values agree with the model', () => {
  const val=name=>FRACTALS.find(f=>f.name[1]===name).dim.v;
  for(const [name,id] of [['Cantor set','cantor'],['Koch snowflake','koch'],['Sierpiński carpet','carpet'],['Menger sponge','menger'],['Cantor dust','dust']]){
    const shown=+val(name).split('≈')[1].trim().replace(',','.');assert.ok(Math.abs(shown-similarityDim(id))<6e-4,name);}
});

test('the page renders in both languages with one card per entry', () => {
  for(const lang of ['fr','en']){const t=p=>p[lang==='fr'?0:1],html=fractalsPage(t,lang);
    assert.equal((html.match(/class="intuition-card fractal-card"/g)||[]).length,FRACTALS.length);
    if(lang==='en')assert.ok(!/\d,\d/.test(html.replace(/[\d,]+ \d/g,'')));}
});
