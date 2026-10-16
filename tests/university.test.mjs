import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { universityContent } from '../site/js/university.js';
import { pathways, pathwayStages } from '../site/js/content.js';
const index=JSON.parse(fs.readFileSync(new URL('../dist/resources/university/index.json',import.meta.url)));
test('university pathway lists every collection and all sequence pages have complete local resources',()=>{
  const p=pathways.find(p=>p.id==='university');assert.ok(p);assert.equal(pathways.at(-1).id,p.id);assert.equal(pathwayStages(p).length,index.sections.length);
  assert.deepEqual(p.programmes.map(x=>x.id),index.sections.map(x=>x.id));
  assert.ok(!JSON.stringify(p).includes("Ouvrir les six séquences"));
  const units=index.sections.flatMap(s=>s.sequences);assert.equal(new Set(units.map(s=>s.id)).size,units.length);
  for(const lang of ['fr','en'])for(const id of ['',...units.map(s=>s.id)]){
    const html=universityContent(index,id,lang);assert.ok(!/undefined|NaN/.test(html));
    for(const [,href]of html.matchAll(/href="\.\/([^"#]+)(?:#[^"]*)?"/g))assert.ok(fs.existsSync(new URL('../dist/'+href.split('?')[0],import.meta.url)),href);
    assert.match(html,/FR/);assert.ok(html.includes('sources-latex.zip'));
  }
  assert.match(universityContent(index,'missing','en'),/Sequence not found/);
});
