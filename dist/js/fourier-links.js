// The Fourier triangle derives its lesson target and count from the university catalogue.
import {university} from './catalogue-data.js';
export function fourierLinks(current='lab',lang='fr'){
  const section=university.sections.find(s=>s.id==='fourier');if(!section?.sequences.length)return '';
  const en=lang==='en';
  const links=[['gallery','#gallery/fourier',en?'See the circles draw Madagascar':'Voir les cercles dessiner Madagascar'],['lab','#lab/fourier-series',en?'Experiment with waves':'Expérimenter avec les ondes'],['drawing','#lab/fourier-drawing',en?'Trace an outline':'Reconstruire un contour'],['lessons','#university/'+section.sequences[0].id,en?`Study the ${section.sequences.length} lessons`:`Étudier les ${section.sequences.length} leçons`]];
  return `<nav class="fourier-triangle" aria-label="${en?'Fourier: beauty, experiment, formal mathematics':'Fourier : beauté, expérimentation, mathématiques formelles'}">${links.filter(([id])=>id!==current).map(([,href,title])=>`<a class="secondary" href="${href}">${title} →</a>`).join('')}</nav>`;
}
