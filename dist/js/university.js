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
  const common = `<section class="university-documents"><h2>${P('Documents de la collection','Collection documents',L)}</h2><div class="university-files">${file('student',P('Notes de cours étudiant','Student course notes',L))}${file('teacher',P('Guide enseignant et solutions des ateliers','Teacher guide and workshop solutions',L))}${file('tex',P('Sources LaTeX des deux éditions','LaTeX sources for both editions',L))}${file('slidesSource',P('Sources des six diaporamas','Sources of the six slide decks',L))}</div><p class="muted">${P('Chaque séquence comprend trois ateliers autonomes, avec leurs solutions dans le guide enseignant. Les notes de cours PDF sont des supports de lecture, pas des diaporamas de cours.','Each sequence includes three self-contained workshops, with solutions in the teacher guide. The course-note PDFs are reading materials, not lecture slide decks.',L)}</p></section>`;
  if (!seq) return `<h1>${E(index.title[L])}</h1><p class="page-intro">${P('Un espace pour les études supérieures, qui pourra accueillir plusieurs sections.','An area for higher education, with room for several future sections.',L)}</p><section><h2>${E(section.title[L])}</h2><p>${E(section.intro[L])}</p><p class="muted">${P('Public : transition vers le supérieur et premiers apprentissages en cycle préparatoire. Documents en français.','Audience: transition to higher education and introductory preparatory study. Documents are in French.',L)}</p><ol class="university-sequences">${section.sequences.map(s=>`<li><a class="university-sequence" href="#university/${E(s.id)}"><span class="sequence-number">${s.number}</span><div><h3>${E(s.title[L])}</h3><p>${E(s.summary[L])}</p><span>${P('Cours, guide enseignant et exploration HTML','Course notes, teacher guide and HTML exploration',L)} →</span></div></a></li>`).join('')}</ol></section>${common}`;
  const at = section.sequences.indexOf(seq);
  return `<a class="text-button" href="#university">← ${E(section.title[L])}</a><p class="muted">${P('Séquence','Sequence',L)} ${seq.number} / ${section.sequences.length} · FR</p><h1>${E(seq.title[L])}</h1><p class="page-intro">${E(seq.summary[L])}</p><p><strong>${P('Prérequis :','Prerequisites:',L)}</strong> ${E(seq.prerequisites[L])}</p><section><h2>${P('Explorer puis formaliser','Explore, then formalise',L)}</h2><p>${P('Manipule la figure du diaporama, avance par étapes, puis retrouve la trace écrite dans les notes de cours.','Manipulate the slide figure, move through the steps, then return to the written notes.',L)}</p><div class="university-files">${file(seq.id,P('Ouvrir le diaporama interactif','Open the interactive slides',L))}${file('student',P('Lire les notes de cette séquence','Read this sequence’s notes',L),seq.studentPage)}${file('teacher',P('Préparer cette séquence','Prepare this sequence',L),seq.teacherPage)}</div></section>${common}<nav class="sequence-forward" aria-label="${P('Navigation des séquences','Sequence navigation',L)}">${at ? `<a href="#university/${section.sequences[at-1].id}">← ${E(section.sequences[at-1].title[L])}</a>` : '<span></span>'}${at < section.sequences.length-1 ? `<a href="#university/${section.sequences[at+1].id}">${E(section.sequences[at+1].title[L])} →</a>` : ''}</nav>`;
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
