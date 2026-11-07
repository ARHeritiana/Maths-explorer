// Shared helpers of the Première generators (templates-premiere-2/3/4.js, problems-premiere.js): four-choice questions whose
// wrong options each come from a typical error, "trouve l'erreur" items, small exact helpers. Pure functions, no DOM.
import { M, polyTex, sgn } from './engine.js';

export const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
export const nd = (f, x) => (f(x + 1e-6) - f(x - 1e-6)) / 2e-6;   // central difference, for the checks only
export const coef = (k) => (k === 1 ? '' : k === -1 ? '-' : `${k}`);   // k in front of a variable: no 1, no -1

// One option of a four-choice question: t = displayed text (maths already between \( \)), why = the error it comes from
// (or the reason it is right), anything else (f, v...) is read back by the independent check `truth`.
export const opt = (t, why, extra = {}) => ({ t, why, ...extra });

// Four-choice question. `right` and the candidate `wrongs` are opt(...); the first three distinct wrong texts are kept, all
// shuffled. `truth(option)` re-derives, independently of the displayed answer, whether an option is correct: exactly one of
// the four must pass and it must be the lettered one.
export function mcq(r, stem, right, wrongs, truth) {
  const seen = new Set([right.t]);
  const ws = wrongs.filter((w) => { if (seen.has(w.t)) return false; seen.add(w.t); return true; }).slice(0, 3);
  if (ws.length < 3) throw new Error(`mcq: only ${ws.length} distinct wrong options for ${stem}`);
  const order = r.shuffle([right, ...ws]), L = 'ABCD';
  const at = order.indexOf(right);
  const others = order.map((o, i) => (o === right ? null : `(${L[i]}) ${o.why.replace(/\.$/, '')}`)).filter(Boolean).join(' ; ');
  return {
    q: `QCM, une seule réponse exacte. ${stem} ${order.map((o, i) => `(${L[i]}) ${o.t}`).join(' ; ')}.`,
    a: `Réponse (${L[at]}) : ${right.t}. ${right.why} Erreurs des autres choix : ${others}.`,
    ok: () => order.length === 4 && new Set(order.map((o) => o.t)).size === 4 && order.filter(truth).length === 1 && truth(order[at]),
  };
}

// Vrai ou faux avec justification: claim = {s: statement, v: true if the statement holds, j: justification, c: independent check}.
export function tf(claim) {
  return {
    q: `Vrai ou faux ? Justifier. « ${claim.s} »`,
    a: `${claim.v ? 'Vrai' : 'Faux'}. ${claim.j}`,
    s: claim.v ? '' : 'Un contre-exemple suffit à réfuter une affirmation générale.',
    ok: claim.c,
  };
}

// "Trouve l'erreur": lines are maths strings (already between \( \)); `bad` is the 0-based index of the wrong one.
export function spot(intro, lines, bad, why, fix, result, check) {
  return {
    q: `${intro} Voici sa rédaction : ${lines.map((l, i) => `(L${i + 1}) ${l}`).join(' ; ')}. Une seule ligne contient l’erreur, les suivantes reprennent ses résultats sans en ajouter. Laquelle ? Corriger et donner le résultat juste.`,
    a: `La ligne (L${bad + 1}) est fausse : ${why} Correction : ${fix}. Résultat juste : ${result}.`,
    ok: check,
  };
}

// number written with a decimal comma when it is a decimal such as 2.5, for amounts given in the statement
export const dc = (x) => String(x).replace('.', '{,}');
// monic or not: (x - a) written without "x-0"
export const xm = (a, v = 'x') => (a === 0 ? v : `(${v}${sgn(-a)})`);
export const lineTex = (a, b, v = 'x') => polyTex([a, b], v);
export const eur = (x) => `${x}\\ \\text{€}`;
export const mm = M;

// exact rational as BigInt pair, for thresholds of geometric growth
export const bigPow = (b, n) => BigInt(b) ** BigInt(n);
