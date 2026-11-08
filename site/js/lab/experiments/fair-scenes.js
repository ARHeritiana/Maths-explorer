// Scenes (pure data: polygons, lines, texts, points) of the two fair-division figures. They only read the state and the model
// (models/fair-division.js), so a test can check that what is drawn is what the model says: the pieces of the cake, the density of the
// chosen person, the matrix of every person's value of every piece, the envy arrows between the players.
const P = (fr, en) => [fr, en];
export const PERSON = ["c1", "c2", "c5"];   // data colours of A, B and C (never the accent, which is the studied object, nor green/red, which mean right/wrong)
const L = "ABC", EPS = 1e-10;
const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// breaks a sentence into lines of at most n characters (the figure has no automatic wrapping)
export function wrap(text, n = 46) {
  const out = []; let line = "";
  for (const w of String(text).split(" ")) { if (line && (line + " " + w).length > n) { out.push(line); line = w; } else line = line ? line + " " + w : w; }
  if (line) out.push(line);
  return out;
}
export const pct = (v) => `${Math.round(v * 100)} %`;
// who envies whom: [[i, j, own value, value of j's bundle], ...]
export function envyPairs(m) {
  const out = [];
  m.matrix.forEach((row, i) => row.forEach((v, j) => { if (i !== j && v - m.own[i] > EPS) out.push([i, j, m.own[i], v]); }));
  return out;
}
export function cakeScene(s, m, t) {
  const edges = [0, s.cut1 * 12, s.cut2 * 12, 12], p = s.person, row = s.values[p], polys = [], lines = [], texts = [];
  // the cake: one coloured piece per person, between the two cuts
  for (let i = 0; i < 3; i++) {
    polys.push({ pts: box(edges[i], 9, edges[i + 1], 10.2), fill: PERSON[i], alpha: 0.5, color: PERSON[i], width: 2 });
    if (edges[i + 1] - edges[i] > 0.7) texts.push({ at: [(edges[i] + edges[i + 1]) / 2, 9.6], dy: 6, anchor: "center", text: L[i], color: "ink", size: 18 });
  }
  for (const x of [edges[1], edges[2]]) lines.push({ a: [x, 9], b: [x, 0], color: "accent", dash: [4, 4], width: 1.5 });
  // the taste of the chosen person: height = interest of the zone; the area over their own piece is their value of it
  for (let b = 0; b < 3; b++) {
    polys.push({ pts: box(b * 4, 0, (b + 1) * 4, row[b]), fill: PERSON[p], alpha: 0.12, color: PERSON[p], width: 0 });
    const a = Math.max(edges[p], b * 4), z = Math.min(edges[p + 1], (b + 1) * 4);
    if (z > a && row[b] > 0) polys.push({ pts: box(a, 0, z, row[b]), fill: PERSON[p], alpha: 0.5, color: PERSON[p], width: 0 });
  }
  for (let q = 0; q < 3; q++) {
    const h = s.values[q], pts = [];
    h.forEach((v, b) => pts.push([b * 4, v], [(b + 1) * 4, v]));
    polys.push({ pts, color: PERSON[q], width: q === p ? 3 : 1.5, dash: q === p ? [] : [4, 4], close: false });
  }
  lines.push({ a: [0, 0], b: [12, 0], color: "muted", width: 1 });
  texts.push({ at: [0, 7.1], text: `${t(P("Goûts de", "Tastes of"))} ${L[p]} ${t(P(": l’aire colorée sous la courbe est la valeur de son lot", ": the shaded area under the curve is the value of its piece"))}`, color: PERSON[p], size: 12 });
  // matrix: row i = how person i values each piece (the piece j goes to person j); own piece framed, envied pieces in red
  const X0 = 3, PITCH = 3, W = 2.9, top = (i) => -1.9 - 1.4 * i;
  texts.push({ at: [0, -1.25], text: t(P("Valeur du lot de…", "Value of the piece of…")), color: "muted", size: 12 });
  for (let j = 0; j < 3; j++) texts.push({ at: [X0 + PITCH * j + W / 2, -1.25], anchor: "center", text: L[j], color: PERSON[j], size: 14 });
  for (let i = 0; i < 3; i++) {
    texts.push({ at: [0, top(i) - 0.85], dy: 5, text: `${L[i]} ${t(P("estime", "values"))}`, color: PERSON[i], size: 14 });
    for (let j = 0; j < 3; j++) {
      const own = i === j, envy = !own && m.matrix[i][j] - m.own[i] > EPS;
      polys.push({ pts: box(X0 + PITCH * j, top(i) - 1.3, X0 + PITCH * j + W, top(i)), fill: envy ? "neg" : own ? PERSON[i] : "muted", alpha: envy ? 0.3 : own ? 0.35 : 0.08, color: envy ? "neg" : own ? PERSON[i] : "line", width: own || envy ? 2.2 : 1 });
      texts.push({ at: [X0 + PITCH * j + W / 2, top(i) - 0.65], dy: 5, anchor: "center", text: pct(m.matrix[i][j]), color: envy ? "neg" : "ink", size: 14 });
    }
  }
  // the verdict, said in words under the matrix
  const pairs = envyPairs(m), at = -6.4;
  let verdict, color;
  if (m.envyFree) { verdict = t(P("Sans envie : sur chaque ligne, la case encadrée (son propre lot) est la plus grande.", "Envy-free: on every row the framed cell (their own piece) is the largest.")); color = "pos"; }
  else if (m.allProportional) { verdict = t(P("Proportionnel (chaque lot vaut au moins 33 % pour son bénéficiaire) mais pas sans envie : ", "Proportional (each piece is worth at least 33 % to its receiver) but not envy-free: ")) + pairs.map(([i, j]) => `${L[i]} ${t(P("envie", "envies"))} ${L[j]}`).join(", ") + "."; color = "neg"; }
  else { verdict = t(P("Pas proportionnel : un lot vaut moins de 33 % pour la personne qui le reçoit.", "Not proportional: a piece is worth less than 33 % to the person who receives it.")); color = "neg"; }
  wrap(verdict, 42).forEach((line, k) => texts.push({ at: [0, at - 1.15 * k], text: line, color, size: 13 }));
  return { polys, lines, texts };
}
export function goodsScene(s, m, t) {
  const [i] = s.edit.split("-").map(Number), polys = [], lines = [], texts = [], points = [], yOf = (o) => (o === 0 ? 8 : 6);
  for (let o = 0; o < 2; o++) {
    polys.push({ pts: box(0, yOf(o) - 1, 12, yOf(o) + 1), fill: PERSON[o], alpha: 0.1, color: PERSON[o], width: 1.5 });
    texts.push({ at: [-0.8, yOf(o)], dy: 6, text: L[o], color: PERSON[o], size: 20 });
  }
  for (let g = 0; g < 3; g++) {
    const x = 2 + g * 4, y = yOf(s.owners[g]), o = s.owners[g];
    polys.push({ pts: box(x - 0.9, y - 0.5, x + 0.9, y + 0.5), fill: PERSON[o], alpha: 0.55, color: PERSON[o], width: 2 });
    texts.push({ at: [x, y], dy: 6, anchor: "center", text: String(g + 1), color: "ink", size: 17 });
    texts.push({ at: [x, y - 0.78], dy: 4, anchor: "center", text: `A ${s.values[0][g]} · B ${s.values[1][g]}`, color: "ink", size: 11 });
  }
  // the envy graph: an arrow from i to j when i values j's bundle more than their own
  const nodes = [[3, 11.8], [9, 11.8]], pairs = envyPairs(m);
  for (let o = 0; o < 2; o++) { points.push({ at: nodes[o], r: 17, hollow: true, color: PERSON[o] }); texts.push({ at: nodes[o], dy: 6, anchor: "center", text: L[o], color: "ink", size: 17 }); }
  for (const [a, b, own, other] of pairs) {
    const dy = a === 0 ? 0.35 : -0.35, x0 = nodes[a][0] + (a === 0 ? 0.9 : -0.9), x1 = nodes[b][0] + (a === 0 ? -0.9 : 0.9);
    lines.push({ a: [x0, 11.8 + dy], b: [x1, 11.8 + dy], color: "neg", width: 3, arrow: true });
    texts.push({ at: [6, 11.8 + (a === 0 ? 1.0 : -1.2)], anchor: "center", text: `${L[a]} ${t(P("envie", "envies"))} ${L[b]} : ${other} > ${own}`, color: "neg", size: 13 });
  }
  if (!pairs.length) texts.push({ at: [6, 11.8], dy: 5, anchor: "center", text: t(P("Aucune envie : personne ne préfère le lot de l’autre", "No envy: nobody prefers the other bundle")), color: "pos", size: 13 });
  // private values of the chosen person (bars), the handle edits them
  for (let g = 0; g < 3; g++) {
    const x = 2 + g * 4, j = s.edit.split("-").map(Number)[1];
    polys.push({ pts: box(x - 1, 0, x + 1, s.values[i][g] / 2), fill: PERSON[i], alpha: g === j ? 0.5 : 0.18, color: PERSON[i], width: 1.5 });
    texts.push({ at: [x, -0.6], anchor: "center", text: `${g + 1} : ${s.values[i][g]}`, color: "ink", size: 13 });
  }
  texts.push({ at: [0, 4], text: `${t(P("Valeurs privées de", "Private values of"))} ${L[i]}`, color: PERSON[i], size: 15 });
  wrap(t(P("Glisse un objet vers A ou B ; la poignée verte règle une valeur", "Drag a good to row A or B; the green handle sets a value")), 38).forEach((line, k) => texts.push({ at: [0, 3.3 - 1.1 * k], text: line, color: "muted", size: 12 }));
  return { polys, lines, texts, points };
}
