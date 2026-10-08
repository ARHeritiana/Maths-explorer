import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {guides} from '../dist/js/study-guides.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const documentTheme=fs.readFileSync(path.join(root,'dist/resources/document-theme.css'),'utf8');
const catalogPath=path.join(root,'dist/resources/catalog.json');
const catalog=JSON.parse(fs.readFileSync(catalogPath));
catalog.courses=catalog.courses.filter(x=>x.id!=='shared');
catalog.chapters=catalog.chapters.filter(x=>x.course!=='shared');
catalog.resources=catalog.resources.filter(x=>x.course!=='shared');
catalog.courses.push({id:'shared',title:['Notions communes · FR / EN','Shared concepts · FR / EN'],curriculum:'shared',language:'bilingual'});
const types={notes:['Notes essentielles','Essential notes'],exercises:['Exercice','Exercise'],problems:['Problème','Problem'],solutions:['Corrigé détaillé','Worked solution']};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let i=0;
for(const [topic,g] of Object.entries(guides)) {
  const sourceChapters=catalog.chapters.filter(c=>c.topic===topic);
  if(!sourceChapters.length)throw new Error('Guide without a source topic: '+topic);
  const chapter={id:'shared-'+topic,course:'shared',number:++i,title:g.title,topic,labs:[...new Set(sourceChapters.flatMap(c=>c.labs))],relatedChapters:sourceChapters.map(c=>c.id)};
  catalog.chapters.push(chapter);
  const sources=[...new Set(sourceChapters.map(c=>c.course+'-student'))];
  for(const [type,title] of Object.entries(types)) {
    const urls=[];
    for(const [j,lang] of ['fr','en'].entries()) {
      const dir=path.join(root,'dist/resources/shared');fs.mkdirSync(dir,{recursive:true});
      const filename=topic+'-'+type+'-'+lang+'.html';
      const body=type==='solutions' ? `<section><h2>${j?'Exercise':'Exercice'}</h2><p>${g.exercises[j]}</p></section><section><h2>${j?'Problem':'Problème'}</h2><p>${g.problems[j]}</p></section><section><h2>${esc(title[j])}</h2><p>${g.solutions[j]}</p></section>` : `<p>${g[type][j]}</p>`;
      const html=`<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(g.title[j])} · ${esc(title[j])}</title><style>${documentTheme}</style><header><p>Maths Explorer · ${j?'Starting sheet':'Fiche de départ'} · ${lang.toUpperCase()}</p><h1>${esc(g.title[j])}</h1><p>${esc(title[j])}</p></header><main>${body}</main><footer><p>${j?'Some content and translations are AI-generated; human checks have not always been carried out.':'Certains contenus et traductions sont générés par IA ; les vérifications humaines n’ont pas toujours été menées.'}</p><p>${j?'Source chapters':'Chapitres sources'} : ${sourceChapters.map(c=>esc(c.title[j])).join(' · ')}.</p><div class="actions"><button id="print">${j?'Print / save as PDF':'Imprimer / enregistrer en PDF'}</button> <a href="../../index.html#library/${chapter.id}">${j?'Open the resource library':'Ouvrir la bibliothèque'}</a> · <a href="${topic+'-'+type+'-'+(j?'fr':'en')+'.html'}">${j?'Français':'English'}</a></div></footer><script>document.querySelector('#print').addEventListener('click',()=>window.print());</script></html>`;
      const file=path.join(dir,filename);fs.writeFileSync(file,html);urls.push('./resources/shared/'+filename);
    }
    catalog.resources.push({id:chapter.id+'-'+type,chapter:chapter.id,course:'shared',type,title,language:'bilingual',audience:type==='solutions'?'teacher':'student',format:'HTML',url:urls,sources,review:'adapted',contentKey:topic});
  }
}
// The guide is deliberately a foundation sheet, not a translation or a complete chapter.
for(const c of catalog.chapters.filter(c=>c.course!=='shared'&&c.course!=='explorations'))c.guide='shared-'+c.topic;
fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2));
console.log(JSON.stringify({guides:Object.keys(guides).length,chapters:catalog.chapters.length,resources:catalog.resources.length,htmlFiles:Object.keys(guides).length*8}));
