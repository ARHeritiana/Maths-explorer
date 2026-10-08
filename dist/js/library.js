import {enrichment} from './enrichment-data.js';
import {guides} from './study-guides.js';
import {resourceCatalog as companionCatalog} from './resources-data.js';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const resourceTypes={all:['Tous les types','All types'],notes:['Notes de cours','Lesson notes'],exercises:['Exercices','Exercises'],problems:['Problèmes','Problems'],activities:['Activités','Activities'],practice:['Applications guidées','Guided practice'],fluency:['Automatismes','Fluency'],assessment:['Évaluations','Assessments'],solutions:['Corrigés / professeur','Solutions / teacher'],booklet:['Chapitres complets','Complete chapters']};
let catalogPromise;
let filters={curriculum:'all',course:'all',type:'all',language:'all',search:'',solutions:false};
const readCatalog=()=>catalogPromise??=fetch(new URL('../resources/catalog.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Catalog unavailable');return r.json();}).catch(e=>{catalogPromise=undefined;throw e;});
const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export function selectChapters(catalog,filter=filters) {
  const q=normalize(filter.search);
  return catalog.chapters.filter(c=>{
    if(filter.lab&&!c.labs.includes(filter.lab))return false;
    if(['mg','ib'].includes(filter.curriculum)&&!['shared','explorations'].includes(c.course))return false;
    if(filter.curriculum==='fr'&&['shared','explorations'].includes(c.course))return false;
    if(filter.course!=='all'&&c.course!==filter.course)return false;
    const rs=catalog.resources.filter(r=>r.chapter===c.id||r.chapter===c.guide);
    if(filter.type!=='all'&&!rs.some(r=>r.type===filter.type&&(filter.solutions||r.audience!=='teacher')))return false;
    if(filter.language==='en'&&!rs.some(r=>r.language==='bilingual')) {
      if(!c.guide||!catalog.chapters.some(g=>g.id===c.guide))return false;
    }
    if(filter.language==='fr'&&!rs.some(r=>r.language==='fr'||r.language==='bilingual'))return false;
    return !q||normalize([...c.title,catalog.courses.find(x=>x.id===c.course).title.join(' '),...rs.flatMap(r=>r.title)].join(' ')).includes(q);
  });
}
export async function mountLibrary(main,{lang,id}) {
  const t=x=>x[lang==='fr'?0:1],p=(fr,en)=>t([fr,en]);
  main.innerHTML=`<p role="status">${p('Chargement des ressources…','Loading resources…')}</p>`;
  try {
    const c=await readCatalog();
    if(!main.isConnected)return;
    if(id?.startsWith('@')){
      filters={...filters,curriculum:'all',course:'all',type:'all',search:'',lab:id.slice(1)};
      id=undefined;
    }else if(!id){filters.lab=undefined;}
    if(id){
      const chapter=c.chapters.find(x=>x.id===id);
      if(!chapter){main.innerHTML=`<h1>${p('Chapitre introuvable','Chapter not found')}</h1><a href="#library">${p('Tous les chapitres','All chapters')}</a>`;return;}
      renderChapter(main,c,chapter,t,p,lang);return;
    }
    const original=c.chapters.filter(x=>!['shared','explorations'].includes(x.course)&&x.number>0).length;
    const pdf=c.resources.filter(x=>x.format==='PDF').length;
    main.innerHTML=`<div class="section-kicker">${p('LA BIBLIOTHÈQUE','THE RESOURCE LIBRARY')}</div><div class="library-heading"><div><h1>${p('Un chapitre. Une prochaine étape.','A chapter. A next step.')}</h1><p>${p('Cours, exercices, problèmes et corrigés, à lire ou à télécharger.','Notes, exercises, problems and solutions to read or download.')}</p></div><div class="library-count"><strong>${original}</strong><span>${p('chapitres sources','source chapters')}</span><small>${pdf} PDF · ${Object.keys(guides).length} ${p('fiches FR / EN','FR / EN study sheets')}</small></div></div>
    <form class="resource-filters" id="resource-filters"><label>${p('Rechercher','Search')}<input id="resource-search" type="search" value="${esc(filters.search)}" placeholder="${p('Un chapitre ou une notion…','A chapter or concept…')}"></label><label>${p('Parcours','Pathway')}<select id="resource-curriculum">${[['all','Tous les parcours','All pathways'],['fr','Cours français','French courses'],['mg','Notions communes · Madagascar','Shared concepts · Madagascar'],['ib','Notions communes · IB','Shared concepts · IB']].map(([v,fr,en])=>`<option value="${v}" ${filters.curriculum===v?'selected':''}>${p(fr,en)}</option>`).join('')}</select></label><label>${p('Cours','Course')}<select id="resource-course"></select></label><label>${p('Type de ressource','Resource type')}<select id="resource-type">${Object.entries(resourceTypes).map(([v,label])=>`<option value="${v}" ${filters.type===v?'selected':''}>${t(label)}</option>`).join('')}</select></label><label>${p('Langue des fichiers','File language')}<select id="resource-language">${[['all','Toutes','All'],['fr','Français','French'],['en','Anglais / bilingue','English / bilingual']].map(([v,fr,en])=>`<option value="${v}" ${filters.language===v?'selected':''}>${p(fr,en)}</option>`).join('')}</select></label><label class="teacher-toggle"><input id="resource-solutions" type="checkbox" ${filters.solutions?'checked':''}>${p('Inclure les corrigés et fichiers professeur','Include solutions and teacher files')}</label><button class="secondary" type="reset">${p('Effacer les filtres','Clear filters')}</button></form>
    <p id="pathway-resource-note" class="resource-scope"></p><p class="resource-note">${p('Tous les documents sont disponibles en français et en anglais. Choisis la langue du site avant de lire ou télécharger un fichier.','All documents are available in French and English. Choose the site language before reading or downloading a file.')}</p><p id="resource-results-count" role="status" aria-live="polite"></p><div id="chapter-grid" class="chapter-grid"></div>`;
    const form=main.querySelector('form');
    const refresh=()=>{
      const allowed=c.courses.filter(x=>['mg','ib'].includes(filters.curriculum)?['shared','explorations'].includes(x.id):filters.curriculum==='fr'?!['shared','explorations'].includes(x.id):true);
      if(filters.course!=='all'&&!allowed.some(x=>x.id===filters.course))filters.course='all';
      main.querySelector('#resource-course').innerHTML=`<option value="all">${p('Tous les cours','All courses')}</option>`+allowed.map(x=>`<option value="${x.id}" ${filters.course===x.id?'selected':''}>${esc(t(x.title))}</option>`).join('');
      main.querySelector('#pathway-resource-note').textContent=['mg','ib'].includes(filters.curriculum)?p('Notions à transférer à votre cours : ces fiches ne constituent pas un programme malgache ou IB complet. Vérifiez votre niveau, votre série et votre option avec votre enseignant.','Concepts to transfer to your course: these sheets are not a complete Malagasy or IB syllabus. Check your level, stream and option with your teacher.'):'';
      const matches=selectChapters(c,filters);
      main.querySelector('#resource-results-count').textContent=p(`${matches.length} chapitres affichés${filters.lab?' · liés à cette expérience':''}`,`${matches.length} chapters shown${filters.lab?' · linked to this experiment':''}`);
      main.querySelector('#chapter-grid').innerHTML=matches.length?matches.map(ch=>{
        const rs=c.resources.filter(r=>(r.chapter===ch.id||r.chapter===ch.guide)&&(filters.solutions||r.audience!=='teacher')&&(filters.language!=='en'||r.language==='bilingual'));
        const types=[...new Set(rs.map(r=>r.type))];
        return `<article class="chapter-card"><div class="chapter-meta"><span>${esc(t(c.courses.find(x=>x.id===ch.course).title))}</span><span>${ch.number?String(ch.number).padStart(2,'0'):p('Banques','Banks')}</span></div><h2><a href="#library/${ch.id}">${esc(t(ch.title))}</a></h2><div class="resource-tags">${types.map(type=>`<span>${t(resourceTypes[type])}</span>`).join('')}</div><div class="chapter-card-bottom"><span>${rs.length} ${p('fichiers','files')}${ch.guide?' · FR / EN':''}</span><a href="#library/${ch.id}" class="secondary">${p('Ouvrir le chapitre','Open chapter')}</a></div></article>`;
      }).join(''):`<div class="library-empty"><h2>${p('Aucun chapitre trouvé','No matching chapter')}</h2><p>${p('Essayez une autre notion ou effacez les filtres.','Try another concept or clear the filters.')}</p></div>`;
    };
    form.addEventListener('submit',e=>e.preventDefault());
    form.addEventListener('input',e=>{
      const keys={'resource-search':'search','resource-curriculum':'curriculum','resource-course':'course','resource-type':'type','resource-language':'language','resource-solutions':'solutions'};
      const key=keys[e.target.id];if(!key)return;
      filters[key]=key==='solutions'?e.target.checked:e.target.value;
      if(key==='type'&&filters.type==='solutions'){filters.solutions=true;main.querySelector('#resource-solutions').checked=true;}
      if(key==='solutions'&&!filters.solutions&&filters.type==='solutions'){filters.type='all';main.querySelector('#resource-type').value='all';}
      refresh();
    });
    form.addEventListener('reset',e=>{e.preventDefault();filters={curriculum:'all',course:'all',type:'all',language:'all',search:'',solutions:false};mountLibrary(main,{lang});});
    refresh();
  }catch(e){if(main.isConnected){main.innerHTML=`<h1>${p('Ressources indisponibles','Resources unavailable')}</h1><p>${p('Le catalogue n’a pas pu être chargé.','The catalogue could not be loaded.')}</p><button class="primary" id="retry-resources">${p('Réessayer','Try again')}</button>`;main.querySelector('button').addEventListener('click',()=>mountLibrary(main,{lang,id}));}}
}
function renderChapter(main,c,ch,t,p,lang) {
  const course=c.courses.find(x=>x.id===ch.course);
  const topic=ch.course==='explorations'?null:guides[ch.topic];
  const workshop=enrichment.find(x=>'explore-'+x.id===ch.id);
  const fileLanguage=filters.language==='fr'?0:filters.language==='en'?1:lang==='fr'?0:1;
  const fileURL=r=>Array.isArray(r.url)?r.url[fileLanguage]:r.url;
  const card=r=>`<article class="resource-card"><div class="chapter-meta"><span>${t(resourceTypes[r.type])}</span><span>${r.format} · ${r.language==='fr'?'FR':'FR / EN'}</span></div><h3>${esc(t(r.title))}</h3><p>${r.format==='PDF'?`${fileLanguage===1?(r.englishPages||r.pages):r.pages} ${p('pages','pages')} · ${((fileLanguage===1?r.englishBytes||r.bytes:r.bytes)/1024).toFixed(0)} ${p('Ko','KB')}`:p('Fiche courte · imprimable','Short sheet · printable')}</p><div class="resource-actions"><a class="primary" href="${esc(fileURL(r))}" target="_blank" rel="noopener noreferrer">${p('Lire','Read')}<span class="sr-only">${p(' (nouvel onglet)',' (new tab)')}</span></a><a class="secondary" href="${esc(fileURL(r))}" download>${p('Télécharger','Download')}</a>${r.htmlUrl?`<a class="secondary" href="${esc(r.htmlUrl[fileLanguage])}">${p('Lecture web','Web edition')}</a>`:''}</div>${r.source?`<details class="file-source"><summary>${p('Source et pages','Source and pages')}</summary><p>${esc(c.sources.find(s=>s.name===r.source).title)} · ${p('pages PDF originales','original PDF pages')} ${r.sourcePages.join('–')}. ${p('Versions française et anglaise disponibles.','French and English editions available.')}</p></details>`:''}</article>`;
  const original=c.resources.filter(r=>r.chapter===ch.id&&r.audience!=='teacher');
  const teacher=c.resources.filter(r=>r.chapter===ch.id&&r.audience==='teacher');
  const guided=ch.course==='shared'?original:c.resources.filter(r=>r.chapter===ch.guide&&r.audience!=='teacher');
  const links=ch.labs.map(id=>`<a class="secondary" href="#lab/${id}">${p('Expérimenter','Experiment')} · ${esc(({trig:['Trigonométrie','Trigonometry'],probability:['Probabilités','Probability'],vectors:['Vecteurs','Vectors'],statistics:['Statistiques','Statistics'],quadratic:['Second degré','Quadratics'],sequences:['Suites','Sequences'],derivative:['Dérivée','Derivative'],integral:['Intégrales','Integration']})[id]?.[lang==='fr'?0:1]??id)}</a>`).join('');
  main.innerHTML=`${companionCatalog.chapters.some(x=>x.id===ch.id)?`<div class="companion-links"><a class="primary" href="#chapter/${ch.id}/understand">${p('Comprendre en images','Understand visually')}</a><a class="secondary" href="#chapter/${ch.id}/experiment">${p('Expérimenter','Experiment')}</a><a class="secondary" href="#chapter/${ch.id}/practice">${p('S’entraîner','Practise')}</a></div>`:''}<a class="library-back" href="#library">${p('Tous les chapitres','All chapters')}</a><div class="section-kicker">${esc(t(course.title))}${ch.number?' · '+String(ch.number).padStart(2,'0'):''}</div><h1>${esc(t(ch.title))}</h1>${links?`<div class="chapter-labs">${links}</div>`:''}
  ${workshop?`<section class="study-sheet enrichment-preview"><span class="eyebrow">${esc(t(workshop.level))}</span><h2>${p('L’idée à explorer','The idea to explore')}</h2>${workshop.lesson.map(x=>`<p>${esc(t(x))}</p>`).join('')}<details><summary>${p('Voir un exemple expliqué','See a worked example')}</summary><p>${esc(t(workshop.worked))}</p></details><p>${esc(t(workshop.activity))}</p></section>`:''}
  ${topic?`<section class="study-sheet"><div class="sheet-heading"><h2>${p('Pour commencer · FR / EN','Start here · FR / EN')}</h2><span>${p('Fiche courte','Short sheet')}</span></div><p class="resource-note">${p('Une adaptation des notions du chapitre. Elle complète les documents originaux.','An adaptation of the chapter’s concepts to complement the original documents.')}</p><div class="sheet-section"><h3>${p('À retenir','Key ideas')}</h3><p>${t(topic.notes)}</p></div><div class="sheet-section"><h3>${p('Exercice','Exercise')}</h3><p>${t(topic.exercises)}</p></div><div class="sheet-section"><h3>${p('Problème','Problem')}</h3><p>${t(topic.problems)}</p></div><details class="sheet-solution"><summary>${p('Afficher le corrigé détaillé','Reveal the worked solution')}</summary><p>${t(topic.solutions)}</p></details><div class="sheet-downloads">${guided.map(r=>`<a href="${esc(fileURL(r))}" download>${t(resourceTypes[r.type])} · HTML</a>`).join('')}<a href="${esc(fileURL(c.resources.find(r=>r.chapter===(ch.course==='shared'?ch.id:ch.guide)&&r.type==='solutions')))}" download>${p('Corrigé','Solution')} · HTML</a></div></section>`:''}
  ${ch.course!=='shared'?`<section class="chapter-files"><h2>${p('Documents du chapitre · FR / EN','Chapter documents · FR / EN')}</h2><p class="resource-note">${p('Les notes peuvent contenir des exemples et applications. Les séances regroupent activités et exercices.','Notes may include examples and applications. Session files combine activities and exercises.')}</p><div class="resource-grid">${original.map(card).join('')}</div></section>`:`<section class="chapter-files"><h2>${p('Fichiers séparés · FR / EN','Separate files · FR / EN')}</h2><div class="resource-grid">${original.map(card).join('')}</div><p class="resource-note">${p('Ces notions peuvent être transférées à différents cours. Ce classement ne certifie pas un alignement avec une série malgache ou une option IB.','These concepts can be transferred to different courses. This organisation does not certify alignment with a Malagasy stream or IB option.')}</p>${(ch.relatedChapters??[]).map(id=>`<a class="related-chapter" href="#library/${id}">${esc(t(c.chapters.find(x=>x.id===id).title))} · ${esc(t(c.courses.find(x=>x.id===c.chapters.find(x=>x.id===id).course).title))}</a>`).join('')}</section>`}
  ${teacher.length?`<details class="teacher-files"><summary>${p('Afficher les fichiers professeur et corrigés','Show teacher files and solutions')} (${teacher.length})</summary><p class="resource-note">${p('Ces fichiers peuvent contenir à la fois le cours, les réponses et des indications pédagogiques.','These files may contain notes, answers and teaching guidance together.')}</p><div class="resource-grid">${teacher.map(card).join('')}</div></details>`:''}`;
}
