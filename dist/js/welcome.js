// The home guides students from a class to a chapter; the gallery retains its shared drawings.
import {liveCourses} from './live-curriculum.js';
import {rememberCourse} from './navigation-state.js';
import {discoveryChapters} from './catalogue-data.js';
import {icon} from './icons.js';
import {FigureEngine,readouts} from './figure-engine.js';
import {makeParabola} from './figure-scenes.js';
const E=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const homeChapters=index=>{
 const routes=new Set(index.map(x=>x.route));
 return discoveryChapters.filter(c=>liveCourses.some(course=>course.id===c.course)&&routes.has('#chapter/'+c.id));
};
export function homePage({pair,t,link,index=[],last=''}) {
 const resume=homeChapters(index).find(c=>c.id===last);
 return `<main id="main" class="page entrance home-simple" tabindex="-1"><div class="opening"><p class="greeting"><span lang="mg">Tonga soa</span><span>${pair("Bienvenue","Welcome")}</span></p><h1><span>${pair("Comprendre les maths","Understand maths")}</span><br><span class="home-highlight">${pair("en les explorant.","through exploration.")}</span></h1><p class="opening-text">${pair("Choisis ta classe, puis ton chapitre. Le cours, les exercices et les figures sont réunis au même endroit.","Choose your class, then your chapter. Lessons, exercises and figures are brought together in one place.")}</p></div>
<div class="home-layout"><section class="study-entry" aria-labelledby="start-heading"><h2 id="start-heading">${pair("Sur quoi travailles-tu ?","What are you working on?")}</h2><div class="finder"><div class="class-field"><label for="home-class">${pair("Ta classe","Your class")}</label><select id="home-class" data-resume-course="${E(resume?.course||'')}"><option value="">${pair("Choisir ma classe","Choose my class")}</option>${liveCourses.map(c=>`<option value="${E(c.id)}">${E(c.title[0])}</option>`).join('')}</select></div><div class="query-field"><label for="home-query">${pair("Ou cherche une notion","Or search for a topic")}</label><div class="search-wrap">${icon("magnifying-glass",20)}<input id="home-query" type="search" placeholder="${pair("Dérivée, vecteurs, probabilités…","Derivative, vectors, probability…")}" autocomplete="off" aria-controls="home-chapters" aria-describedby="home-result-status"></div></div></div>
${resume?`<p class="home-resume" id="home-resume">${pair("Reprendre :","Continue:")} <a href="${link('chapter',resume.id)}">${E(resume.title[0])}</a></p>`:''}<div class="list-heading"><h3 id="home-list-title">${pair("Les chapitres","Chapters")}</h3><p id="home-result-status" role="status" aria-live="polite"></p></div><p class="choice-hint" id="home-choice-hint">${pair("Commence par choisir ta classe pour afficher les chapitres.","Choose your class to see its chapters.")}</p><ul id="home-chapters" class="chapter-list" aria-label="${pair("Chapitres","Chapters")}"></ul><p class="home-annales"><a class="text-link" href="${link("bank/annales")}"><span>${pair("Préparer un examen : annales du bac, E3C et EAM, avec corrigés","Preparing an exam: Bac, E3C and EAM past papers with solutions")}</span> →</a></p><div id="home-empty" hidden><p>${pair("Aucun chapitre ne correspond à cette recherche.","No chapters match this search.")}</p><button class="text-button" id="home-reset-search">${pair("Effacer la recherche","Clear the search")}</button></div></section>
<aside class="quiet-figure" aria-labelledby="figure-heading"><p class="small-label">${pair("En attendant, une idée à manipuler","Meanwhile, an idea to explore")}</p><figure class="home-plate"><figcaption class="plate-top"><b id="figure-heading">${pair("Et si tu déplaçais le sommet ?","What if you moved the vertex?")}</b></figcaption><div class="figure-stage" id="home-figure-stage"><span class="figure-hint">${pair("Glisse un point pour transformer la parabole.","Drag a point to transform the parabola.")}</span></div><div class="figure-numbers" id="home-figure-numbers"></div></figure><p class="figure-description">${pair("Observe ce qui change, puis essaie de l’expliquer.","Observe what changes, then try to explain it.")}</p><a class="text-link quiet-link" href="${link("lab/quadratic")}"><span>${pair("Poursuivre dans le laboratoire","Continue in the laboratory")}</span> →</a><p class="figure-status sr-only" role="status" aria-live="polite"></p></aside></div>
<section class="secondary-entry" aria-labelledby="beyond-heading"><div><h2 id="beyond-heading">${pair("Envie de découvrir autre chose ?","Want to discover something else?")}</h2><p>${pair("Des idées à manipuler, des problèmes à chercher et des histoires à lire.","Ideas to explore, problems to solve and stories to read.")}</p></div><nav aria-label="${pair("Découvertes","Discoveries")}"><a href="${link("topics")}"><span>${pair("Explorer les domaines","Explore topics")}</span> →</a><a href="${link("challenges")}"><span>${pair("Chercher un défi","Try a challenge")}</span> →</a><a href="${link("stories")}"><span>${pair("Lire une histoire","Read a story")}</span> →</a></nav></section>
<section class="secondary-entry" aria-labelledby="mikajy-heading"><div><h2 id="mikajy-heading">${pair("Mikajy, calculatrice manuscrite pour Android","Mikajy, handwriting calculator for Android")}</h2><p>${pair("Écris tes calculs du doigt. La reconnaissance et les calculs fonctionnent sans connexion.","Write calculations with your finger. Recognition and calculations work offline.")}</p></div><nav aria-label="Mikajy"><a href="https://github.com/ARHeritiana/Mikajy/releases/download/v5.0/Mikajy-5.0.apk" target="_blank" rel="noopener noreferrer">${pair("Télécharger l’APK v5.0","Download APK v5.0")} →</a><a href="https://github.com/ARHeritiana/Mikajy/releases/tag/v5.0" target="_blank" rel="noopener noreferrer">${pair("Détails de la version","Release details")} →</a></nav></section>
<details class="teacher-entry"><summary>${pair("Pour préparer une séance","Preparing a lesson")}</summary><p>${pair("Les outils de classe, regroupés ici.","Classroom tools, together in one place.")}</p><nav><a href="${link("automatismes")}">${pair("Automatismes","Starters")}</a><a href="${link("sheets")}">${pair("Fiches et évaluations","Worksheets and tests")}</a><a href="${link("slides")}">${pair("Diaporamas","Slides")}</a></nav></details></main>`;
}

// Store only the chosen class on this device. Invalid or unavailable storage never blocks navigation.
const HOME_CLASS='mx-home-course';
const normalize=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/œ/g,'oe');
export function bindHome(root,index,t) {
 const chapters=homeChapters(index),select=root.querySelector('#home-class'),input=root.querySelector('#home-query');
 const results=root.querySelector('#home-chapters'),heading=root.querySelector('#home-list-title'),status=root.querySelector('#home-result-status');
 const hint=root.querySelector('#home-choice-hint'),empty=root.querySelector('#home-empty'),reset=root.querySelector('#home-reset-search');
 const storage=()=>root.ownerDocument.defaultView.localStorage;
 let remembered='';try{remembered=storage().getItem(HOME_CLASS)||'';}catch{}
 let course=liveCourses.some(c=>c.id===remembered)?remembered:select.dataset.resumeCourse||'';
 if(!liveCourses.some(c=>c.id===course))course='';
 select.value=course;
 const update=()=>{
  const raw=normalize(input.value.trim()),aliases={hasard:'probabil',chance:'probabil',parabole:'second degre',trinome:'second degre',quadratics:'second degre',derivee:'deriv',integrale:'integral'};
  const words=(aliases[raw]||raw).split(/\s+/).filter(Boolean),active=Boolean(course||raw);
  const found=chapters.filter(c=>(!course||c.course===course)&&words.every(w=>normalize(c.title.join(' ')+' '+c.topic).includes(w)))
   .sort((a,b)=>liveCourses.findIndex(c=>c.id===a.course)-liveCourses.findIndex(c=>c.id===b.course)||a.number-b.number);
  const selected=liveCourses.find(c=>c.id===course);
  heading.textContent=selected?selected.title[0]:t(['Les chapitres','Chapters']);
  status.textContent=active?`${found.length} ${t(found.length===1?['chapitre','chapter']:['chapitres','chapters'])}`:'';
  hint.hidden=active;empty.hidden=!active||found.length>0;
  results.innerHTML=active?found.map(c=>`<li><a class="home-result" href="#chapter/${E(c.id)}"><span class="chapter-number">${String(c.number).padStart(2,'0')}</span><span class="chapter-name">${E(c.title[0])}${!course?`<small>${E(liveCourses.find(x=>x.id===c.course).title[0])}</small>`:''}</span><span class="arrow" aria-hidden="true">→</span></a></li>`).join(''):'';
  const resume=root.querySelector('#home-resume');if(resume)resume.hidden=Boolean(course&&course!==select.dataset.resumeCourse);
 };
 const choose=()=>{course=select.value;rememberCourse(course,root.ownerDocument.defaultView);input.value='';update();};
 const clear=()=>{input.value='';update();input.focus();};
 select.addEventListener('change',choose);input.addEventListener('input',update);reset.addEventListener('click',clear);update();
 return ()=>{select.removeEventListener('change',choose);input.removeEventListener('input',update);reset.removeEventListener('click',clear);};
}
// One fixed, directly manipulable scene. No slideshow or competing figure selectors.
export function mountHomeFigure(root,{lang='fr',reduced=false}={}) {
 const stage=root.querySelector('#home-figure-stage');if(!stage)return {destroy(){},retheme(){}};
 const update=readouts(root.querySelector('#home-figure-numbers'));
 return FigureEngine(stage,makeParabola(lang==='en'?1:0),{
  reduced,
  label:lang==='en'?'Interactive parabola. H selects a point, arrows move it, plus and minus zoom, zero recentres.':'Parabole interactive. H sélectionne un point, les flèches le déplacent, plus et moins zooment, zéro recentre.',
  say:m=>root.querySelector('.figure-status').textContent=m,onScene:update,onFrame:update,
 });
}

const card = (l, href, t, pair, link) => { const name = E(t(l.short || l.title)); return `<a class="wonder" href="${link(href,l.id)}"><canvas data-art="${l.id}" role="img" aria-label="${name}"></canvas><span class="wonder-body"><strong>${name}</strong><span>${E(t(l.intro))}</span></span></a>`; };
export function galleryPage({ pair, t, link, labs }) {
  const items = labs.filter((l) => l.custom);
  return `<main id="main" class="page gallery-page" tabindex="-1">
  <div class="page-heading"><div><h1>${pair("Curiosités", "Curiosities")}</h1><p>${pair("Des idées de mathématiques qui se regardent d’abord. Touche, glisse, change un réglage : chaque pièce se manipule.", "Mathematical ideas that you look at first. Touch, drag, change a setting: every piece can be handled.")}</p></div></div>
  <div class="wonder-grid">${items.map((l) => card(l, "gallery", t, pair, link)).join("")}</div>
  <p class="editorial-note">${pair("Pour des expériences guidées autour de formules, de courbes et de données, voir le laboratoire.", "For guided experiments with formulas, curves and data, see the laboratory.")} <a href="${link("lab")}">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></p>
</main>`;
}
