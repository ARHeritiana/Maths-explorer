import test from 'node:test';import assert from 'node:assert/strict';
import {fourierLinks} from '../site/js/fourier-links.js';
// The Fourier triangle: each of the three entries (gallery picture, wave experiment, outline experiment) links to the
// other two, in both languages; no link leaves the site's live pages.
test('each Fourier entry links to the two others',()=>{
 const targets={gallery:'#gallery/fourier',lab:'#lab/fourier-series',drawing:'#lab/fourier-drawing'};
 for(const lang of ['fr','en'])for(const current of Object.keys(targets)){
  const h=fourierLinks(current,lang);assert.ok(!/undefined|NaN/.test(h));
  for(const [id,target] of Object.entries(targets))assert.equal(h.includes('href="'+target+'"'),id!==current,`${lang} ${current} ${target}`);
  assert.ok(!h.includes('#university'));
 }
});
