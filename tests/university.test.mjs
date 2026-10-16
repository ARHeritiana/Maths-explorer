import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { universityContent } from '../site/js/university.js';
import { pathways, pathwayStages } from '../site/js/content.js';
const index=JSON.parse(fs.readFileSync(new URL('../dist/resources/university/index.json',import.meta.url)));
test('university is a separate, extensible pathway with six sequence pages and complete local resources',()=>{
  const p=pathways.find(p=>p.id==='university');assert.ok(p);assert.equal(pathways.at(-1).id,p.id);assert.equal(pathwayStages(p).length,1);
  const units=index.sections[0].sequences;assert.equal(units.length,6);assert.equal(new Set(units.map(s=>s.id)).size,6);
  for(const lang of ['fr','en'])for(const id of ['',...units.map(s=>s.id)]){
    const html=universityContent(index,id,lang);assert.ok(!/undefined|NaN/.test(html));
    for(const [,href]of html.matchAll(/href="\.\/([^"#]+)(?:#[^"]*)?"/g))assert.ok(fs.existsSync(new URL('../dist/'+href,import.meta.url)),href);
    assert.match(html,/FR/);assert.ok(html.includes('sources-latex.zip'));
  }
  assert.match(universityContent(index,'missing','en'),/Sequence not found/);
});
