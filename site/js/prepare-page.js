// #prepare: the teacher has time to choose and assemble. First version: an intro and the existing pages; later tasks fill it in.
const LINKS = [
 ['#resources', 'Cours', 'Lessons'], ['#bank', 'Exercices', 'Exercises'], ['#bank/annales', 'Annales', 'Past papers'],
 ['#sheets', 'Fiches', 'Worksheets'], ['#pack', 'Dossier sur mesure', 'Custom pack'], ['#sources', 'Sources LaTeX', 'LaTeX sources'],
 ['#errors', 'Erreurs fréquentes', 'Common errors'],
];
export function mountPreparePage(main, {t, state, isGone} = {}) {
 if (isGone?.()) return () => {};
 const pair = (fr, en) => t ? t([fr, en]) : fr;
 main.innerHTML = `<h1>${pair('Préparer', 'Prepare')}</h1><p>${pair('Choisir et assembler les ressources de la prochaine séance.', 'Choose and assemble the resources for the next session.')}</p><ul class="td-items">${LINKS.map(([h, fr, en]) => `<li><a class="td-item-link" href="${h}">${pair(fr, en)}</a></li>`).join('')}</ul>`;
 return () => {};
}
