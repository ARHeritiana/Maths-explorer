// Pure plan of the worked solution of the nails challenge (no DOM; tests/nails-plan.test.mjs): the list of steps, each a
// small experiment on the rope (which rope, which nails are already out, which are pulled now) with its caption. The ideas used
// are physical only: a nail pulled out frees every turn around it, and a turn around a nail followed (with nothing caught in
// between) by a turn the other way round the same nail comes undone by itself. The drawing is `timeline.js` and `art.js`.
import { SHORTEST, NAMES, turnText } from "./maths.js";
import { timeline } from "./timeline.js";

const list = (xs, and) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${and} ${xs.at(-1)}`);

// what happens in a timeline, in words (the caption of a pulling step)
export function caption(tl, fresh) {
  const names = tl.events.filter((e) => e.type === "pull").map((e) => NAMES[e.nail]);
  const slips = tl.events.filter((e) => e.type === "slip").map((e) => NAMES[e.nail]);
  const undo = tl.events.some((e) => e.type === "undo"), falls = tl.events.some((e) => e.type === "fall");
  const one = names.length === 1;
  const fr = [fresh ? "On remet tout en place. " : "", one ? `On arrache le clou ${names[0]}.` : `On arrache les clous ${list(names, "et")}, l’un après l’autre.`,
    slips.length ? ` Les tours autour de ${slips.length > 1 ? "ces clous" : "lui"} glissent et se détachent.` : "",
    undo ? " Les tours qui vont autour d’un même clou dans un sens puis dans l’autre se défont tout seuls." : "",
    falls ? " Plus rien ne retient la ficelle : le tableau tombe !" : " La ficelle reste accrochée : le tableau tient."].join("");
  const en = [fresh ? "Everything goes back in place. " : "", one ? `Pull out nail ${names[0]}.` : `Pull out nails ${list(names, "and")}, one after the other.`,
    slips.length ? ` The turns around ${slips.length > 1 ? "them" : "it"} slip off.` : "",
    undo ? " Turns that go round the same nail one way and then the other way come undone by themselves." : "",
    falls ? " Nothing holds the rope any more: the picture falls!" : " The rope is still caught: the picture holds."].join("");
  return [fr, en];
}

const step = (word, n, o, cap) => ({ word, n, from: 0, add: [], prev: 0, draw: false, hot: null, ...o, caption: cap });

export function plan(variant) {
  const [n, k] = variant.split(",").map(Number), w = SHORTEST[variant], L = w.length, steps = [], N = NAMES.slice(0, n);
  const hangs = `Tant qu’on n’arrache aucun clou, le tableau tient.`, hangsEn = `As long as no nail is pulled out, the picture holds.`;
  steps.push(step(w, n, { draw: true }, [`${n} clous ${N.join(", ")}. Voici un montage de ${L} tours qui convient (↻ : un tour dans le sens des aiguilles d’une montre, ↺ : dans l’autre sens) : ${turnText(w)}. ${hangs}`, `${n} nails ${N.join(", ")}. Here is a winding of ${L} turns that works (↻: one turn clockwise, ↺: the other way): ${turnText(w)}. ${hangsEn}`]));
  if (variant === "3,1") steps.push(step(w, n, { hot: new Set([0, 1, 2, 3]) }, ["Comment il est construit : les 4 premiers tours (en rouge) forment un enchevêtrement qui tombe dès qu’on arrache A ou B. On le traite comme un gros clou : un tour de C, puis le même enchevêtrement dans l’autre sens, puis un tour de C dans l’autre sens.", "How it is built: the first 4 turns (in red) are a tangle that falls as soon as A or B is pulled out. We use it like a fat nail: one turn of C, then the same tangle the other way round, then one turn of C the other way."]));
  let mask = 0, prev = 0;
  const go = (add, fresh) => {
    const from = fresh ? 0 : mask, tl = timeline(w, n, { from, add, prev: fresh ? prev : prev }), cap = caption(tl, fresh && prev !== 0);
    steps.push(step(w, n, { from, add, prev }, cap)); mask = tl.to; prev = tl.to;
  };
  for (let i = 0; i < k; i++) go([i], false);          // pull the nails one after the other, from the start
  if (k === 1) for (let i = 1; i < n; i++) go([i], true);   // any single nail does the same
  else if (k < n) go(Array.from({ length: k }, (_, i) => n - k + i), true);   // another choice of k nails
  // why fewer turns cannot work
  if (k === n) {
    const few = w.filter((c) => Math.abs(c) < n), add = Array.from({ length: n - 1 }, (_, i) => i);
    steps.push(step(few, n, { draw: true, add }, [`Pourquoi pas moins de ${L} tours ? Si un clou (ici ${N[n - 1]}) n’avait aucun tour, on arracherait les ${n - 1} autres : la ficelle ne tient plus à rien et le tableau tombe, alors que les ${n} clous ne sont pas tous arrachés. C’est trop tôt : chaque clou a besoin d’au moins un tour.`, `Why not fewer than ${L} turns? If a nail (here ${N[n - 1]}) had no turn, pulling out the other ${n - 1} would leave the rope caught on nothing and the picture would fall, although not all ${n} nails are out. Too early: every nail needs at least one turn.`]));
  } else if (k === n - 1) {
    const single = Array.from({ length: n }, (_, i) => i + 1), add = Array.from({ length: n - 1 }, (_, i) => i + 1);
    steps.push(step(single, n, { draw: true, add }, [`Pourquoi pas moins de ${L} tours ? Si chaque clou n’avait qu’un tour, en arrachant tous les clous sauf ${N[0]} le tour autour de ${N[0]} retiendrait encore le tableau : il tiendrait alors qu’il doit tomber. Un clou resté seul doit lâcher la ficelle : il lui faut un tour dans chaque sens, donc au moins 2 tours par clou, soit ${L}.`, `Why not fewer than ${L} turns? If every nail had one turn only, pulling out all nails except ${N[0]} would leave the turn around ${N[0]} still holding the picture, although it must fall. A nail left alone must let the rope go: it needs a turn each way, so at least 2 turns per nail, that is ${L}.`]));
  }
  steps.push(step(w, n, { answer: L }, [`Réponse : ${L} tours.${variant === "3,1" ? " On a essayé par ordinateur tous les montages plus courts : aucun ne convient." : ""}`, `Answer: ${L} turns.${variant === "3,1" ? " A computer tried every shorter winding: none works." : ""}`]));
  return steps;
}
// the pose-ready timeline of a step
export const stepTimeline = (st) => timeline(st.word, st.n, { from: st.from, add: st.add, prev: st.prev });
