import {assetHref} from "../dist/js/data-loader.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resourceCatalog,matchingChapters,matchingSupplements,chapterPage,libraryPage} from '../dist/js/resource-library.js';
import {guides} from '../dist/js/learning-content.js';
import {scenes,sceneValues,diagram,bindVisual} from '../dist/js/visual-lessons.js';
import {labs} from '../dist/js/content.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const fmt=(n,d=4)=>n.toFixed(d),t=p=>p[0];
test('all chapter extracts match the provenance manifest and have valid page pointers',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../content/data/RESOURCE_PROVENANCE.json',import.meta.url)));
 assert.equal(resourceCatalog.chapters.length,58);assert.equal(manifest.length,[...resourceCatalog.chapters,...resourceCatalog.supplements].reduce((n,c)=>n+c.files.length,0));
 assert.equal(new Set(resourceCatalog.chapters.map(c=>c.id)).size,58);
 for(const c of [...resourceCatalog.chapters,...resourceCatalog.supplements]){if(c.topic)assert.ok(guides[c.topic]);for(const f of c.files){
 const p=manifest.find(p=>p.path===f.path);assert.ok(p);assert.deepEqual(p.pages,[f.start,f.end]);assert.equal(f.pages,f.end-f.start+1);
 for(const page of Object.values(f.sections||{}))assert.ok(Number.isInteger(page)&&page>=1&&page<=f.pages);
 const data=await readFile(new URL('../dist/'+f.path,import.meta.url));assert.equal(data.subarray(0,4).toString(),'%PDF');assert.equal(data.length,f.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),p.sha256);
 if(f.editions.en){assert.ok(f.englishPath);const english=await readFile(new URL('../dist/'+f.englishPath,import.meta.url));assert.equal(english.subarray(0,4).toString(),'%PDF');assert.equal(english.length,f.englishBytes);assert.equal(createHash('sha256').update(english).digest('hex'),p.englishSha256);}else{assert.equal(f.englishPath,undefined);assert.equal(p.editions.en,undefined);}
 assert.ok(resourceCatalog.sources.some(s=>s.name===f.source));
 }}
});
test('all chapter sections render in both languages and resolve their experiment links',()=>{
 for(const c of resourceCatalog.chapters){const g=guides[c.topic];assert.ok(scenes[g.scene]);if(g.lab)assert.ok(labs.some(l=>l.id===g.lab));
 for(const lang of [0,1])for(const tab of ['understand','experiment','practice','documents']){const html=chapterPage(c.id,tab,p=>{assert.equal(p.length,2);assert.ok(p.every(x=>typeof x==='string'&&x));return p[lang]},labs);assert.ok(!/NaN|[="'>]undefined["<]|\.\/undefined/.test(html),c.id+' '+tab);assert.ok(html.includes(`chapter/${c.id}/documents`));if(tab==='documents')for(const f of c.files)assert.ok(html.includes('./'+assetHref(lang?f.englishPath:f.path)+'#page='));}
 }
 assert.equal(matchingChapters('all','arithmetique').length,1);assert.equal(matchingChapters('stmg','logarithme').length,1);assert.equal(matchingChapters('all','never_a_chapter').length,0);assert.equal(matchingSupplements('terminale','algorithms').length,1);assert.ok(libraryPage(t).includes('58'));
});
test('every visual model stays finite across its declared parameter domain and produces an accessible diagram',()=>{
 function finite(o){for(const x of Object.values(o))if(Array.isArray(x))x.forEach(v=>assert.ok(Number.isFinite(v)));else if(typeof x==='number')assert.ok(Number.isFinite(x));}
 for(const [id,s] of Object.entries(scenes)){for(const v of [s.range[0],s.range[3],s.range[1]]){finite(sceneValues(id,v));for(let step=1;step<=3;step++){const d=diagram(id,v,step,t,fmt);assert.ok(!/NaN|Infinity|undefined/.test(d.svg),id);assert.ok(d.svg.includes('role="img"'));assert.ok(d.rows.length);}}}
});
test('animated mathematical constructions agree with independent calculations',()=>{
 for(let p=0;p<=1.00001;p+=.05){const q=sceneValues('binomial',p);close(q.probabilities.reduce((a,b)=>a+b,0),1);close(q.probabilities.reduce((a,b,k)=>a+k*b,0),3*p);const c=sceneValues('conditional',p);close(c.b,.4*p+.15);}
 for(let n=2;n<=30;n++){const q=sceneValues('integral',n);close(q.sum,8*(n-1)*n*(2*n-1)/(6*n**3));assert.ok(q.sum<q.exact);}
 for(const a of [.25,.5,1,2]){const q=sceneValues('quadratic',a);close(a*(q.left-2)**2-1,0);close(a*(q.right-2)**2-1,0);}
 for(const h of [.02,.5,2])close(sceneValues('derivative',h).slope,((2+h)**2-4)/h);
 for(const theta of [-180,-90,0,60,180]){const q=sceneValues('circle',theta);close(q.cos*q.cos+q.sin*q.sin,1);}
 for(const y of [0,5,10]){const q=sceneValues('regression',y),points=[[1,2],[2,3],[3,y]];close(points.reduce((a,[x,y])=>a+y-(q.slope*x+q.intercept),0),0);close(points.reduce((a,[x,y])=>a+x*(y-(q.slope*x+q.intercept)),0),0);}
 for(const x of [.2,1,2,5])close(sceneValues('log',x).back,x);
 close(sceneValues('sequence',9).gap,1/128);close(sceneValues('projection',-2).distance,3);close(sceneValues('space',2).z,5);
 close(sceneValues('growth',20).end,96);close(sceneValues('concentration',1000).bound,.025);
});
test('story playback pauses, respects reduced motion and cancels callbacks when leaving a chapter',()=>{
 const saved={document:global.document,matchMedia:global.matchMedia,setInterval:global.setInterval,clearInterval:global.clearInterval};
 const nodes=new Map();const listeners=new Map();const node=sel=>{if(!nodes.has(sel))nodes.set(sel,{value:'1',tagName:sel.includes('timeline')?'INPUT':'BUTTON',dataset:{story:sel.match(/story="(.*?)"/)?.[1]},events:{},addEventListener(e,f){this.events[e]=f},setAttribute(){}});return nodes.get(sel)};
 const preference={matches:false,addEventListener(e,f){this.onChange=f},removeEventListener(){this.onChange=null}};let callback=null,cleared=0;
 global.document={hidden:false,addEventListener(e,f){listeners.set(e,f)},removeEventListener(e){listeners.delete(e)}};global.matchMedia=()=>preference;global.setInterval=f=>(callback=f,1);global.clearInterval=()=>{callback=null;cleared++};
 const root={classList:{toggle(){},remove(){}},querySelector:node,querySelectorAll(){return ['back','play','next','timeline','reset'].map(k=>node(`[data-story="${k}"]`))}};
 try{const cleanup=bindVisual(root,'quadratic',t,fmt);const play=node('[data-story="play"]');play.events.click();assert.ok(callback);callback();assert.equal(node('[data-story="timeline"]').value,2);play.events.click();assert.equal(callback,null);play.events.click();global.document.hidden=true;listeners.get('visibilitychange')();assert.equal(callback,null);global.document.hidden=false;preference.matches=true;play.events.click();assert.equal(callback,null);assert.equal(node('[data-story="timeline"]').value,3);preference.matches=false;play.events.click();assert.ok(callback);cleanup();assert.equal(callback,null);assert.ok(cleared>=3);assert.equal(listeners.size,0);assert.equal(preference.onChange,null);}finally{Object.assign(global,saved);}
});
