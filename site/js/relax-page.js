// #relax: stay sharp, read, wonder. First version: an intro and the existing pages; later tasks fill it in.
const LINKS = [
 ['#biographies', 'Biographies', 'Biographies'], ['#stories', 'Histoires', 'Stories'], ['#gallery', 'Curiosités', 'Curiosities'],
 ['#olympiad', 'Olympiades', 'Olympiads'], ['#lab', 'Laboratoire', 'Laboratory'], ['#challenges', 'Défis', 'Challenges'],
 ['#history', 'Chronologies', 'Timelines'],
];
export function mountRelaxPage(main, {t, state, isGone} = {}) {
 if (isGone?.()) return () => {};
 const pair = (fr, en) => t ? t([fr, en]) : fr;
 main.innerHTML = `<h1>${pair('Détente', 'Relax')}</h1><p>${pair('Rester vif, lire, s’émerveiller, sans lien avec la classe.', 'Stay sharp, read, wonder, independent of the class.')}</p><ul class="td-items">${LINKS.map(([h, fr, en]) => `<li><a class="td-item-link" href="${h}">${pair(fr, en)}</a></li>`).join('')}</ul>`;
 return () => {};
}
