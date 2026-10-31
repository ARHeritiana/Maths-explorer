// "Erreurs" (#errors[/<id>]): the error correction collection. The page builds the markup, bindErrors makes it live.
// The mathematics (counterexamples, checks of a repair, the faulty step) is in errors-model.js and is computed, not stored.
// Each activity: the claim a learner might write, a test bench with sliders, a diagnosis, then a repair to choose.
import { ERRORS, DERIVATIONS, ROUTE, FAMILIES, find, counterexample, checkRepair, coincidences, evaluateDerivation, show } from './errors-model.js';
import { describe } from './reading.js';

const P = (fr, en) => [fr, en];
const esc = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const KEY = 'maths-explorer-errors-v1';   // device-local list of finished activities; never leaves the browser
const done = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); } };
const markDone = (id) => { try { const s = done(); s.add(id); localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* storage may be blocked */ } };

export function errorsPage(id, t) {
  const e = id && find(id);
  return e ? detailPage(e, t) : indexPage(t);
}

function indexPage(t) {
  const finished = done();
  const card = (e) => `<li><a class="error-card" href="#errors/${e.id}"><span class="error-card-claim">${esc(e.claim || t(e.title))}</span><span class="error-card-title">${esc(t(e.title))}${finished.has(e.id) ? ` <span class="error-done">✓<span class="sr-only"> ${t(P('terminé sur cet appareil', 'finished on this device'))}</span></span>` : ''}</span><span class="muted">${esc(t(FAMILIES[e.family]))} · ${esc(t(e.level))}</span></a></li>`;
  const route = ROUTE.map(find).filter(Boolean);
  return `<main id="main" tabindex="-1" class="page errors-page"><h1>${t(P('Corriger les erreurs classiques', 'Correct common errors'))}</h1>
<p class="page-intro">${t(P('Chaque activité part d’une affirmation fausse qu’un élève pourrait écrire. Teste-la, trouve un contre-exemple, comprends pourquoi elle échoue, puis choisis la bonne version. La collection est en construction : de nouvelles erreurs s’y ajouteront.', 'Each activity starts from a false statement a student might write. Test it, find a counterexample, understand why it fails, then choose the correct version. The collection is under construction: more errors will be added.'))}</p>
<section aria-labelledby="errors-route"><h2 id="errors-route">${t(P('Parcours conseillé', 'Suggested route'))}</h2><p class="muted">${t(P('Un ordre possible, du plus fréquent au plus subtil. Tu peux ouvrir n’importe quelle activité.', 'One possible order, from most frequent to subtlest. You may open any activity.'))}</p><ol class="error-route">${route.map((e) => `<li><a href="#errors/${e.id}">${esc(t(e.title))}</a></li>`).join('')}</ol></section>
<section aria-labelledby="errors-all"><h2 id="errors-all">${t(P('Toutes les activités', 'All activities'))}</h2>${Object.keys(FAMILIES).map((f) => { const list = [...ERRORS, ...DERIVATIONS].filter((e) => e.family === f); return list.length ? `<h3>${esc(t(FAMILIES[f]))}</h3><ul class="error-grid">${list.map(card).join('')}</ul>` : ''; }).join('')}</section></main>`;
}

const back = (t) => `<a class="back-library" href="#errors">${t(P('Toutes les erreurs', 'All errors'))}</a>`;
function related(e, t) {
  const items = (e.links || []).map((h) => [h, describe(h)]).filter(([, d]) => d);
  return items.length ? `<section class="error-related" aria-labelledby="err-rel"><h2 id="err-rel">${t(P('Dans le cours', 'In the course'))}</h2><ul>${items.map(([h, d]) => `<li><a href="${h}">${esc(t(d.kind))} · ${esc(t(d.title))}</a></li>`).join('')}</ul></section>` : '';
}

function detailPage(e, t) {
  return e.steps ? derivationPage(e, t) : claimPage(e, t);
}

// Fixed, id-dependent rotation so the correct repair is not always first.
const order = (n, id) => { const k = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % n; return Array.from({ length: n }, (_, i) => (i + k) % n); };

function claimPage(e, t) {
  const sliders = e.vars.map((v) => { const [lo, hi] = e.range[v]; return `<label class="error-var">${v} = <output id="err-${v}-out">${lo}</output><input type="range" id="err-${v}" min="${lo}" max="${hi}" step="1" value="${lo}" aria-label="${v}"></label>`; }).join('');
  const options = order(e.repairs.length, e.id).map((i) => `<label class="error-option"><input type="radio" name="repair" value="${i}"> <span>${esc(e.repairs[i].text)}</span></label>`).join('');
  return `<main id="main" tabindex="-1" class="page errors-page" data-error="${e.id}">${back(t)}<h1>${esc(t(e.title))}</h1><p class="muted">${esc(t(FAMILIES[e.family]))} · ${esc(t(e.level))}</p>
<section aria-labelledby="err-claim"><h2 id="err-claim">${t(P('Un élève écrit', 'A student writes'))}</h2><p class="error-claim">${esc(e.claim)}</p><p>${t(P('Cette égalité est-elle vraie quelles que soient les valeurs ? Teste-la.', 'Is this equality true whatever the values? Test it.'))}</p></section>
<section aria-labelledby="err-test"><h2 id="err-test">${t(P('1. Tester', '1. Test it'))}</h2><div class="error-bench"><div class="error-vars">${sliders}<button type="button" class="btn btn-secondary" id="err-random">${t(P('Valeurs au hasard', 'Random values'))}</button></div>${e.diagram ? `<div class="error-diagram" id="err-diagram"></div>` : ''}<table class="error-readout"><tbody><tr><th scope="row">${t(P('Côté gauche', 'Left side'))}</th><td id="err-left"></td></tr><tr><th scope="row">${t(P('Côté droit', 'Right side'))}</th><td id="err-right"></td></tr></tbody></table><p id="err-verdict" role="status" aria-live="polite" class="error-verdict"></p></div>
<p class="muted" id="err-found-count"></p></section>
<section aria-labelledby="err-diag"><h2 id="err-diag">${t(P('2. Comprendre', '2. Understand'))}</h2><details id="err-why"><summary>${t(P('Voir le diagnostic', 'Show the diagnosis'))}</summary><p>${esc(t(e.why))}</p>${coincidences(e).length ? `<p class="sequence-note">${t(P('Un exemple ne prouve rien : cette égalité est vraie pour certaines valeurs, par exemple ', 'One example proves nothing: this equality does hold for some values, for example '))}${coincidences(e).slice(0, 1).map(([x, y]) => e.vars.length > 1 ? `x = ${x}, y = ${y}` : `x = ${x}`).join('')}${t(P(', mais elle échoue presque partout.', ', but it fails almost everywhere.'))}</p>` : ''}</details></section>
<section aria-labelledby="err-fix"><h2 id="err-fix">${t(P('3. Réparer', '3. Repair it'))}</h2><fieldset class="error-options"><legend>${t(P('Quelle est la bonne version ?', 'Which version is correct?'))}</legend>${options}</fieldset><button type="button" class="btn btn-primary" id="err-check">${t(P('Vérifier', 'Check'))}</button><p id="err-feedback" role="status" aria-live="polite"></p></section>${related(e, t)}</main>`;
}

function derivationPage(d, t) {
  return `<main id="main" tabindex="-1" class="page errors-page" data-error="${d.id}">${back(t)}<h1>${esc(t(d.title))}</h1><p class="muted">${esc(t(FAMILIES[d.family]))} · ${esc(t(d.level))}</p>
<section aria-labelledby="err-claim"><h2 id="err-claim">${t(P('Le raisonnement', 'The reasoning'))}</h2><p>${esc(t(d.intro))}</p>
<ol class="error-steps">${d.steps.map((s, i) => `<li><button type="button" class="error-step" data-step="${i}"><span class="error-step-eq">${esc(s.eq)}</span><span class="muted">${esc(t(s.say))}</span><span class="error-step-values" aria-live="polite"></span></button></li>`).join('')}</ol>
<p class="error-vars"><label class="error-var">a = b = <output id="err-t-out">3</output><input type="range" id="err-t" min="1" max="9" step="1" value="3" aria-label="a = b"></label></p>
<p>${t(P('Choisis la première ligne fausse. Le curseur remplace a et b par un même nombre.', 'Pick the first false line. The slider replaces a and b by the same number.'))}</p><p id="err-feedback" role="status" aria-live="polite"></p></section>
<section aria-labelledby="err-diag"><h2 id="err-diag">${t(P('Comprendre', 'Understand'))}</h2><details id="err-why"><summary>${t(P('Voir le diagnostic', 'Show the diagnosis'))}</summary><p>${esc(t(d.why))}</p></details></section>${related(d, t)}</main>`;
}

export function bindErrors(root, t, id) {
  const e = id && find(id);
  if (!e) return () => {};
  return e.steps ? bindDerivation(root, e, t) : bindClaim(root, e, t);
}

function diagram(kind, x, y, t) {
  // areas drawn to scale for positive x, y (the sliders keep them in 1..9)
  const u = 14, W = 18 * u + 12, pad = 6;   // x + y is at most 18 units
  const r = (X, Y, w, h, cls, label) => `<rect x="${pad + X * u}" y="${pad + Y * u}" width="${w * u}" height="${h * u}" class="${cls}"/>${w * u > 22 && h * u > 14 ? `<text x="${pad + (X + w / 2) * u}" y="${pad + (Y + h / 2) * u + 4}" text-anchor="middle" class="error-diagram-text">${label}</text>` : ''}`;
  if (kind === 'square') {
    const s = x + y;
    return `<svg viewBox="0 0 ${W} ${s * u + pad * 2}" role="img" aria-label="${esc(t(P(`Carré de côté x + y = ${s} : un carré x², un carré y² et deux rectangles xy`, `Square of side x + y = ${s}: an x² square, a y² square and two xy rectangles`)))}">${r(0, 0, x, x, 'dg-a', 'x²')}${r(x, 0, y, x, 'dg-b', 'xy')}${r(0, x, x, y, 'dg-b', 'xy')}${r(x, x, y, y, 'dg-c', 'y²')}</svg>`;
  }
  return `<svg viewBox="0 0 ${W} ${3 * u + pad * 2}" role="img" aria-label="${esc(t(P(`Rectangle de hauteur 3 et de largeur x + y = ${x + y} : deux rectangles 3x et 3y`, `Rectangle of height 3 and width x + y = ${x + y}: two rectangles 3x and 3y`)))}">${r(0, 0, x, 3, 'dg-a', '3x')}${r(x, 0, y, 3, 'dg-c', '3y')}</svg>`;
}

function bindClaim(root, e, t) {
  const lang = t(P('fr', 'en'));
  const val = (v) => +root.querySelector('#err-' + v).value;
  const found = new Set();
  const refresh = () => {
    const x = val('x'), y = e.vars.includes('y') ? val('y') : 0;
    e.vars.forEach((v) => { root.querySelector('#err-' + v + '-out').textContent = val(v); });
    const l = e.L(x, y), r = e.R(x, y), same = Math.abs(l - r) <= 1e-9 * Math.max(1, Math.abs(l), Math.abs(r));
    root.querySelector('#err-left').textContent = show(l, lang);
    root.querySelector('#err-right').textContent = show(r, lang);
    if (!same) found.add(x + ',' + y);
    root.querySelector('#err-verdict').textContent = same
      ? t(P('Égaux pour ces valeurs. Un exemple ne prouve rien : essaie d’autres valeurs.', 'Equal for these values. One example proves nothing: try other values.'))
      : t(P('Différents : ces valeurs sont un contre-exemple. L’égalité n’est pas vraie en général.', 'Different: these values are a counterexample. The equality is not true in general.'));
    root.querySelector('#err-found-count').textContent = found.size ? t(P(`Contre-exemples trouvés : ${found.size}`, `Counterexamples found: ${found.size}`)) : '';
    const dg = root.querySelector('#err-diagram'); if (dg) dg.innerHTML = diagram(e.diagram, x, y, t);
  };
  const onInput = () => refresh();
  e.vars.forEach((v) => root.querySelector('#err-' + v).addEventListener('input', onInput));
  root.querySelector('#err-random').addEventListener('click', () => {
    e.vars.forEach((v) => { const [lo, hi] = e.range[v]; root.querySelector('#err-' + v).value = lo + Math.floor(Math.random() * (hi - lo + 1)); });
    refresh();
  });
  root.querySelector('#err-check').addEventListener('click', () => {
    const chosen = root.querySelector('input[name="repair"]:checked'), out = root.querySelector('#err-feedback');
    if (!chosen) { out.textContent = t(P('Choisis une version avant de vérifier.', 'Choose a version before checking.')); return; }
    const res = checkRepair(e, e.repairs[+chosen.value]);
    if (res.ok) {
      out.textContent = t(P(`Correct : cette égalité est vérifiée pour les ${res.points} valeurs possibles du curseur. Ce contrôle numérique ne remplace pas la démonstration, qui est donnée dans le diagnostic.`, `Correct: this equality holds for all ${res.points} slider values. This numerical check is not a proof; the reason is in the diagnosis.`));
      root.querySelector('#err-why').open = true; markDone(e.id);
    } else {
      const c = res.counterexample, at = e.vars.length > 1 ? `x = ${c.x}, y = ${c.y}` : `x = ${c.x}`;
      out.textContent = t(P(`Pas encore : pour ${at}, le côté gauche vaut ${show(c.left, lang)} et le côté droit ${show(c.right, lang)}.`, `Not yet: for ${at}, the left side is ${show(c.left, lang)} and the right side ${show(c.right, lang)}.`));
    }
  });
  refresh();
  return () => {};
}

function bindDerivation(root, d, t) {
  const lang = t(P('fr', 'en'));
  const tv = () => +root.querySelector('#err-t').value;
  const out = root.querySelector('#err-feedback');
  let picked = null;
  const paint = () => {
    root.querySelector('#err-t-out').textContent = tv();
    const { rows, firstFalse } = evaluateDerivation(d, tv());
    root.querySelectorAll('.error-step').forEach((b) => {
      const i = +b.dataset.step, r = rows[i], span = b.querySelector('.error-step-values');
      // values appear only on the line the learner has picked, never before a pick
      span.textContent = i === picked ? `${show(r.left, lang)} ${r.holds ? '=' : '≠'} ${show(r.right, lang)}` : '';
      b.setAttribute('aria-pressed', i === picked ? 'true' : 'false');
    });
  };
  root.querySelector('#err-t').addEventListener('input', paint);
  root.querySelectorAll('.error-step').forEach((b) => b.addEventListener('click', () => {
    const i = +b.dataset.step, { rows, firstFalse } = evaluateDerivation(d, tv());
    picked = i; paint();
    if (i === firstFalse) {
      const dividedByZero = d.divisor.some((f, k) => f && k <= i && f(tv(), tv()) === 0);
      out.textContent = t(P(`Oui : la ligne ${i + 1} est la première fausse.${dividedByZero ? ' On y arrive en divisant par a − b, qui vaut 0.' : ''} Les lignes précédentes sont vérifiées pour a = b = ${tv()}.`, `Yes: line ${i + 1} is the first false one.${dividedByZero ? ' It comes from dividing by a − b, which equals 0.' : ''} The lines before it hold for a = b = ${tv()}.`));
      root.querySelector('#err-why').open = true; markDone(d.id);
    } else if (rows[i].holds) {
      out.textContent = t(P(`Non : la ligne ${i + 1} est vraie pour a = b = ${tv()} (les deux côtés valent ${show(rows[i].left, lang)}). Cherche une ligne dont les deux côtés diffèrent.`, `No: line ${i + 1} is true for a = b = ${tv()} (both sides equal ${show(rows[i].left, lang)}). Look for a line whose two sides differ.`));
    } else {
      out.textContent = t(P(`Cette ligne est fausse, mais une ligne plus haut l’est déjà : on cherche la première.`, `This line is false, but an earlier one already is: we want the first.`));
    }
  }));
  paint();
  return () => {};
}
