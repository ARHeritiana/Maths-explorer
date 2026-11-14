// The Fourier triangle: the gallery picture, the wave experiment and the outline experiment link to each other.
export function fourierLinks(current='lab',lang='fr'){
  const en=lang==='en';
  const links=[['gallery','#gallery/fourier',en?'See the circles draw Madagascar':'Voir les cercles dessiner Madagascar'],['lab','#lab/fourier-series',en?'Experiment with waves':'Expérimenter avec les ondes'],['drawing','#lab/fourier-drawing',en?'Trace an outline':'Reconstruire un contour']];
  return `<nav class="fourier-triangle" aria-label="${en?'Fourier: picture and experiments':'Fourier : image et expériences'}">${links.filter(([id])=>id!==current).map(([,href,title])=>`<a class="secondary" href="${href}">${title} →</a>`).join('')}</nav>`;
}
