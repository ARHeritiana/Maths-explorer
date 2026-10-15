import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {guides} from '../site/js/study-guides.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const documentTheme=fs.readFileSync(path.join(root,'site/resources/document-theme.css'),'utf8');
// content/data/manifest.json is the source of truth; run `make catalog` afterwards to regenerate the catalogue.
const manifestPath=path.join(root,'content/data/manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
const catalog=manifest.catalog;
// Shared entries are rebuilt where they were, so the order of courses, chapters and resources stays stable.
const at=(list,pred)=>{const i=list.findIndex(pred);return i<0?list.length:i;};
const slot={courses:at(catalog.courses,x=>x.id==='shared'),chapters:at(catalog.chapters,x=>x.course==='shared'),resources:at(catalog.resources,x=>x.course==='shared')};
catalog.courses=catalog.courses.filter(x=>x.id!=='shared');
catalog.chapters=catalog.chapters.filter(x=>x.course!=='shared');
catalog.resources=catalog.resources.filter(x=>x.course!=='shared');
const fresh={courses:[{id:'shared',title:['Notions communes · FR / EN','Shared concepts · FR / EN'],curriculum:'shared'}],chapters:[],resources:[]};
const types={notes:['Notes essentielles','Essential notes'],exercises:['Exercice','Exercise'],problems:['Problème','Problem'],solutions:['Corrigé détaillé','Worked solution']};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let i=0;
for(const [topic,g] of Object.entries(guides)) {
  const sourceChapters=catalog.chapters.filter(c=>c.topic===topic);
  if(!sourceChapters.length)throw new Error('Guide without a source topic: '+topic);
  const chapter={id:'shared-'+topic,course:'shared',number:++i,title:g.title,topic,labs:[...new Set(sourceChapters.flatMap(c=>c.labs))],relatedChapters:sourceChapters.map(c=>c.id)};
  fresh.chapters.push(chapter);
  const sources=[...new Set(sourceChapters.map(c=>c.course+'-student'))];
  for(const [type,title] of Object.entries(types)) {
    const urls=[];
    for(const [j,lang] of ['fr','en'].entries()) {
      const dir=path.join(root,'dist/resources/shared');fs.mkdirSync(dir,{recursive:true});
      const filename=topic+'-'+type+'-'+lang+'.html';
      const body=type==='solutions' ? `<section><h2>${j?'Exercise':'Exercice'}</h2><p>${g.exercises[j]}</p></section><section><h2>${j?'Problem':'Problème'}</h2><p>${g.problems[j]}</p></section><section><h2>${esc(title[j])}</h2><p>${g.solutions[j]}</p></section>` : `<p>${g[type][j]}</p>`;
      const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(g.title[j])} · ${esc(title[j])}</title><style>${documentTheme}</style><header><p>Maths Explorer · ${j?'Starting sheet':'Fiche de départ'} · ${lang.toUpperCase()}</p><h1>${esc(g.title[j])}</h1><p>${esc(title[j])}</p></header><main>${body}</main><footer><p>${j?'Source chapters':'Chapitres sources'} : ${sourceChapters.map(c=>esc(c.title[j])).join(' · ')}.</p><div class="actions"><button id="print">${j?'Print / save as PDF':'Imprimer / enregistrer en PDF'}</button> <a href="../../index.html#library/${chapter.id}">${j?'Open the resource library':'Ouvrir la bibliothèque'}</a> · <a href="${topic+'-'+type+'-'+(j?'fr':'en')+'.html'}">${j?'Français':'English'}</a></div></footer><script>document.querySelector('#print').addEventListener('click',()=>window.print());</script></html>`;
      const file=path.join(dir,filename);fs.writeFileSync(file,html);urls.push('./resources/shared/'+filename);
    }
    fresh.resources.push({id:chapter.id+'-'+type,chapter:chapter.id,course:'shared',type,title,language:'bilingual',audience:type==='solutions'?'teacher':'student',format:'HTML',url:urls,sources,review:'adapted',contentKey:topic});
  }
}
for(const k of ['courses','chapters','resources'])catalog[k].splice(slot[k],0,...fresh[k]);
// The guide is deliberately a foundation sheet, not a translation or a complete chapter.
for(const c of catalog.chapters.filter(c=>c.course!=='shared'&&c.course!=='explorations'))c.guide='shared-'+c.topic;
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({guides:Object.keys(guides).length,chapters:catalog.chapters.length,resources:catalog.resources.length,htmlFiles:Object.keys(guides).length*8}));

