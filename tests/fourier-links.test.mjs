import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {fourierLinks} from '../site/js/fourier-links.js';
test('each Fourier entry links to the other ideas through measured catalogue records',()=>{
 for(const lang of ['fr','en'])for(const current of ['gallery','lab','drawing','lessons']){const h=fourierLinks(current,lang);assert.ok(!/undefined|NaN/.test(h));for(const [id,target] of [['gallery','#gallery/fourier'],['lab','#lab/fourier-series'],['drawing','#lab/fourier-drawing'],['lessons','#university/fourier-periodicite']])if(id!==current)assert.ok(h.includes(target),current+' -> '+target);}
 const index=JSON.parse(fs.readFileSync(new URL('../dist/resources/university/index.json',import.meta.url))),s=index.sections.find(s=>s.id==='fourier');assert.equal(s.sequences.length,6);
 for(const seq of s.sequences){const html=fs.readFileSync(new URL('../dist/'+index.files[seq.id].path,import.meta.url),'utf8');assert.ok(html.includes('#gallery/fourier')&&html.includes('#lab/'+seq.labRef));assert.ok(!/\\\[.*?\\\(/s.test(html.split('class="formula"')[1]?.split('</div>')[0]||''),'no nested inline maths in display formulas');assert.ok(html.includes('vendor/mathjax-tex-svg.js'));}
});
