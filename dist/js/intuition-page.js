// `#intuition`: landing page of the collection « Les mathématiques contre l'intuition ». Pure markup from intuition-data.js.
import {ENTRIES, SOON, KINDS} from './intuition-data.js';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
export function intuitionPage(t) {
  const card = (e) => `<a class="intuition-card" href="${e.hash}"><span class="section-kicker">${esc(t(KINDS[e.kind]))}</span>
<strong>${esc(t(e.title))}</strong><span><em>${esc(t(['On croit :', 'One would think:']))}</em> ${esc(t(e.claim))}</span><span><em>${esc(t(['En vrai :', 'In fact:']))}</em> ${esc(t(e.fact))}</span></a>`;
  return `<main id="main" tabindex="-1" class="page read-page intuition-page"><div class="page-heading"><div><h1>${t(['Les mathématiques contre l’intuition', 'Mathematics against intuition'])}</h1>
<p>${t(['Des situations où l’intuition se trompe. Pour chacune : devine d’abord, manipule, mesure, puis comprends pourquoi.', 'Situations where intuition fails. For each one: guess first, manipulate, measure, then understand why.'])}</p></div></div>
<div class="intuition-grid">${ENTRIES.map(card).join('')}</div>
<section aria-labelledby="intuition-soon"><h2 id="intuition-soon">${t(['À venir', 'Coming'])}</h2><ul>${SOON.map((s) => `<li>${esc(t(s))}</li>`).join('')}</ul></section></main>`;
}
