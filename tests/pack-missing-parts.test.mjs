// An actual pack form must identify absent chapter/part combinations before enabling downloads.
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {packPage,bindPack} from '../dist/js/pack-builder.js';
const t=p=>p[1];
test('pack warns about missing notes and enables download only after their chapter is deselected',async()=>{
  const edition={path:'resources/example.pdf',pages:2,bytes:100,sha256:'a'.repeat(64)};
  const resource=(chapter,part)=>({id:chapter+'-'+part,chapter,course:'premiere',title:[part,part],editions:{fr:edition},format:'PDF'});
  const fixture={courses:[{id:'premiere',title:['Cours','Course']}],chapters:[],resources:[resource('premiere-01','chapter'),resource('premiere-01','notes'),resource('premiere-02','chapter')]};
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>new Response(JSON.stringify(fixture),{status:200,headers:{'Content-Type':'application/json'}});
  const dom=new JSDOM(packPage(t,'premiere-01'),{url:'https://example.test/'});
  globalThis.document=dom.window.document;
  try{
    await bindPack(t);const root=document.querySelector('#pack-app');
    const change=(name,value,checked)=>{const input=root.querySelector(`[name="${name}"][value="${value}"]`);assert.ok(input);input.checked=checked;input.dispatchEvent(new dom.window.Event('change'));};
    change('chapter','premiere-02',true);change('part','chapter',false);change('part','notes',true);
    assert.match(root.querySelector('[role="alert"]').textContent,/Parts unavailable.*Notes and examples/);
    assert.equal(root.querySelector('[data-act="merge"]').disabled,true);
    assert.equal(root.querySelector('[data-act="zip"]').disabled,true);
    change('chapter','premiere-02',false);
    assert.equal(root.querySelector('[role="alert"]'),null);
    assert.equal(root.querySelector('[data-act="merge"]').disabled,false);
    assert.equal(root.querySelector('[data-act="zip"]').disabled,false);
  }finally{globalThis.fetch=originalFetch;dom.window.close();}
});
