// `#fractals`: the fractal collection page (issue #36). Pure markup from fractals-data.js; cards reuse the collection card
// style of « contre l'intuition » (`intuition-card`), so each site keeps its own look.
import {GROUPS, FRACTALS, DIM_KIND} from './fractals-data.js';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
export function fractalsPage(t, lang = 'fr') {
  const value = (v) => (lang === 'fr' ? v : v.replace(/(\d),(\d)/g, '$1.$2').replace('bord de Mandelbrot', 'Mandelbrot boundary'));
  const card = (f) => `<a class="intuition-card fractal-card" href="${f.hash}"><span class="section-kicker">${esc(t(DIM_KIND[f.dim.kind]))}${f.dim.v ? ` · ${esc(value(f.dim.v))}` : ''}</span>
<strong>${esc(t(f.name))}</strong><span>${esc(t(f.dim.why))}</span></a>`;
  return `<main id="main" tabindex="-1" class="page read-page intuition-page fractals-page"><div class="page-heading"><div><h1>${t(['Fractales', 'Fractals'])}</h1>
<p>${t(['Toutes les fractales du site, dans le plan et dans l’espace. Pour chacune, ce que l’on sait de sa dimension : une valeur exacte et sa raison, une estimation publiée, ou rien d’établi. Une étape finie n’est jamais la fractale : c’est la limite qui a cette dimension.', 'Every fractal on the site, in the plane and in space. For each, what is known about its dimension: an exact value and its reason, a published estimate, or nothing established. A finite stage is never the fractal: it is the limit that has this dimension.'])}</p></div></div>
${GROUPS.map((g) => `<section aria-labelledby="fr-${g.id}"><h2 id="fr-${g.id}">${esc(t(g.title))}</h2><div class="intuition-grid">${FRACTALS.filter((f) => f.group === g.id).map(card).join('')}</div></section>`).join('')}</main>`;
}
