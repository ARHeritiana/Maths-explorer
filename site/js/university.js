const E = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P = (fr, en, L) => L ? en : fr;
export function universityPage(lang = 'fr') {
  const L = lang === 'en';
  return `<main id="main" class="page university-page" tabindex="-1"><nav class="breadcrumb" aria-label="${P('Fil d’Ariane','Breadcrumb',L)}"><a href="#pathways">${P('Parcours','Pathways',L)}</a><span>/</span>${P('Université','University',L)}</nav><div id="university-content" aria-busy="true"><h1>${P('Université','University',L)}</h1><p role="status">${P('Chargement des ressources…','Loading resources…',L)}</p></div></main>`;
}
export function universityContent(index, id = '', lang = 'fr') {
  const L = lang === 'en' ? 1 : 0, section = index.sections.find(s => s.sequences.some(q => q.id === id)) || index.sections[0], seq = section.sequences.find(s => s.id === id);
  const file = (key, label, page = '') => {
    const f = index.files[key], type = f.path.endsWith('.pdf') ? 'PDF' : f.path.endsWith('.zip') ? 'ZIP' : 'HTML';
    const size = (f.bytes / 1024).toLocaleString(lang, {maximumFractionDigits:0});
    return `<a class="university-file" href="./${E(f.path)}${page ? '#page=' + page : ''}"><strong>${E(label)}</strong><span>${type} · FR · ${f.pages ? f.pages + ' p. · ' : ''}${size} ${L ? 'KB' : 'Ko'}</span></a>`;
  };
  if (id && !seq) return `<h1>${P('Séquence introuvable','Sequence not found',L)}</h1><a href="#university">${P('Revenir aux fondements','Back to foundations',L)}</a>`;
  const documents = section => section.documents || [
    {key:'student',label:['Notes de cours étudiant','Student course notes']},
    {key:'teacher',label:['Guide enseignant et solutions des ateliers','Teacher guide and workshop solutions']},
    {key:'tex',label:['Sources LaTeX des deux éditions','LaTeX sources for both editions']},
    {key:'slidesSource',label:['Sources des six diaporamas','Sources of the six slide decks']}
  ];
  const commonFor = section => `<section class="university-documents"><h2>${P('Documents de la collection','Collection documents',L)}</h2><div class="university-files">${documents(section).map(d=>file(d.key,d.label[L])).join('')}</div><p class="muted">${P('Documents en français. Les cahiers et guides PDF sont des supports de lecture et de travail. Les diaporamas HTML nécessitent une connexion pour afficher les formules.','Documents in French. PDF workbooks and guides are reading and practice materials. HTML decks require a connection to display formulas.',L)}</p></section>`;
  const common = commonFor(section);
  if (!seq) return `<h1>${E(index.title[L])}</h1><p class="page-intro">${P('Choisis une collection, puis une séquence. Retrouve les documents complets sous chaque collection.','Choose a collection, then a sequence. Complete documents are grouped below each collection.',L)}</p><nav aria-label="${P('Collections universitaires','University collections',L)}"><ul>${index.sections.map(s=>`<li><a href="#university/${E(s.sequences[0].id)}">${E(s.title[L])}</a></li>`).join('')}</ul></nav>${index.sections.map(section=>`<section><h2>${E(section.title[L])}</h2><p>${E(section.intro[L])}</p><ol class="university-sequences">${section.sequences.map(s=>`<li><a class="university-sequence" href="#university/${E(s.id)}"><span class="sequence-number">${s.number}</span><div><h3>${E(s.title[L])}</h3><p>${E(s.summary[L])}</p><span>${P('Ouvrir la séquence','Open sequence',L)} →</span></div></a></li>`).join('')}</ol>${commonFor(section)}</section>`).join('')}`;
  const at = section.sequences.indexOf(seq);
  return `<a class="text-button" href="#university">← ${E(section.title[L])}</a><p class="muted">${P('Séquence','Sequence',L)} ${seq.number} / ${section.sequences.length} · FR</p><h1>${E(seq.title[L])}</h1><p class="page-intro">${E(seq.summary[L])}</p><p><strong>${P('Prérequis :','Prerequisites:',L)}</strong> ${E(seq.prerequisites[L])}</p><section><h2>${P('Explorer puis formaliser','Explore, then formalise',L)}</h2><p>${P('Manipule la figure du diaporama, avance par étapes, puis retrouve la trace écrite dans les notes de cours.','Manipulate the slide figure, move through the steps, then return to the written notes.',L)}</p><div class="university-files">${file(seq.id,P('Ouvrir le diaporama interactif','Open the interactive slides',L))}${section.id === 'module-maths' ? file('module-statements',P('Travailler dans le cahier','Practise in the workbook',L))+file('module-workbook',P('Consulter le cahier corrigé','Read the worked solutions',L)) : file('student',P('Lire les notes de cette séquence','Read this sequence’s notes',L),seq.studentPage)+file('teacher',P('Préparer cette séquence','Prepare this sequence',L),seq.teacherPage)}</div></section>${common}<nav class="sequence-forward" aria-label="${P('Navigation des séquences','Sequence navigation',L)}">${at ? `<a href="#university/${section.sequences[at-1].id}">← ${E(section.sequences[at-1].title[L])}</a>` : '<span></span>'}${at < section.sequences.length-1 ? `<a href="#university/${section.sequences[at+1].id}">${E(section.sequences[at+1].title[L])} →</a>` : ''}</nav>`;
}
export async function bindUniversity(id = '', lang = 'fr') {
  const root = document.querySelector('#university-content');
  try {
    const response = await fetch('./resources/university/index.json');
    if (!response.ok) throw new Error(response.status);
    const index = await response.json(); if (!root?.isConnected) return;
    root.innerHTML = universityContent(index, id, lang); root.setAttribute('aria-busy','false');
  } catch {
    if (!root?.isConnected) return;
    root.innerHTML = `<h1>${lang === 'en' ? 'University' : 'Université'}</h1><p role="alert">${lang === 'en' ? 'Resources could not be loaded. Please reload the page.' : 'Impossible de charger les ressources. Recharge la page pour réessayer.'}</p>`;
    root.setAttribute('aria-busy','false');
  }
}
