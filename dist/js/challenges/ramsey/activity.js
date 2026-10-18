// Hands-on activity of the ramsey challenge: the learner tries, fails and notices; it never states the answer or the method.
import { svgEl } from "../common/kit.js";

/* ---------------------------------------------------------------- ramsey */
export function activity(root, { t, q }) {
  const W = 340, H = 340, CX = 170, CY = 170, R = 130, S = Number(q.s), NMAX = S === 3 ? 6 : 9;
  let n = Math.min(NMAX, S === 3 ? 6 : 8);
  const col = new Map();   // "i-j" -> 1 (friends) | 2 (strangers)
  const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  root.innerHTML = `
    <p class="act-help">${t(`Chaque trait relie deux personnes. Touche un trait pour le faire passer de « pas encore décidé » à « amis » (plein, bleu), puis « pas amis » (pointillé, orange), puis de nouveau « pas décidé ». Cherche à éviter trois amis et ${S === 3 ? 'trois' : 'quatre'} inconnus.`, `Each line joins two people. Tap a line to turn it from “undecided” to “friends” (solid, blue), then “not friends” (dashed, orange), then back to “undecided”. Try to avoid three friends and ${S === 3 ? 'three' : 'four'} strangers.`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Personnes reliées deux à deux", "People joined in pairs")}"></svg>
    <div class="act-controls">
      <label class="act-field" for="rm-n"><span class="act-label">${t("Nombre de personnes", "Number of people")} <output id="rm-out"></output></span><input id="rm-n" type="range" min="3" max="${NMAX}" step="1" value="${n}"></label>
      <button class="btn btn-secondary" id="rm-rand" type="button">${t("Colorier au hasard", "Colour at random")}</button>
      <button class="btn-quiet" id="rm-clear" type="button">${t("Tout effacer", "Clear all")}</button>
    </div>
    <p class="act-readout" id="rm-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#rm-read");
  const pos = (i) => { const a = ((-90 + (360 * i) / n) * Math.PI) / 180; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; };
  // one-colour groups: triangles of friends (colour 1), and groups of S strangers (colour 2)
  const groups = () => {
    const out = [], ok = (vs, x) => vs.every((a, i) => vs.slice(i + 1).every((b) => col.get(key(a, b)) === x));
    const rec = (start, vs, size, x) => { if (vs.length === size) { if (ok(vs, x)) out.push([...vs, x]); return; } for (let v = start; v < n; v++) rec(v + 1, [...vs, v], size, x); };
    rec(0, [], 3, 1); rec(0, [], S, 2);
    return out;
  };
  function draw(msg = "") {
    svg.replaceChildren();
    const mono = groups();
    mono.forEach((g) => { const x = g.at(-1), vs = g.slice(0, -1); svgEl("polygon", { points: vs.map((i) => pos(i).join(",")).join(" "), class: `rm-tri c${x}` }, svg); });
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const [x1, y1] = pos(a), [x2, y2] = pos(b), c = col.get(key(a, b)) || 0;
      const g = svgEl("g", { class: `rm-edge c${c}`, "data-e": key(a, b), tabindex: 0, role: "button", "aria-label": `${t("Personnes", "People")} ${a + 1} ${t("et", "and")} ${b + 1} : ${[t("pas décidé", "undecided"), t("amis", "friends"), t("pas amis", "not friends")][c]}` }, svg);
      svgEl("line", { x1, y1, x2, y2, class: "hit" }, g);
      svgEl("line", { x1, y1, x2, y2, class: "ln" }, g);
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = pos(i);
      svgEl("circle", { cx: x, cy: y, r: 15, class: "rm-node" }, svg);
      svgEl("text", { x, y: y + 5, "text-anchor": "middle", class: "rm-label" }, svg).textContent = i + 1;
    }
    const total = (n * (n - 1)) / 2, painted = col.size, blue = mono.filter((m) => m.at(-1) === 1).length, orange = mono.length - blue;
    root.querySelector("#rm-out").textContent = n;
    read.innerHTML = `${painted} / ${total} ${t("traits décidés", "lines decided")}. ${t("Trios d’amis", "Friend trios")} : <strong>${blue}</strong> · ${S === 3 ? t("trios sans amis", "stranger trios") : t("groupes de 4 inconnus", "groups of 4 strangers")} : <strong>${orange}</strong>.${painted === total && !mono.length ? ` ${t("Aucun groupe interdit n’apparaît.", "No forbidden group appears.")}` : ""} ${msg}`.trim();
  }
  const cycle = (k) => { const c = col.get(k) || 0; if (c === 2) col.delete(k); else col.set(k, c + 1); draw(); svg.querySelector(`[data-e="${k}"]`)?.focus(); };
  svg.addEventListener("click", (e) => { const g = e.target.closest("[data-e]"); if (g) cycle(g.dataset.e); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.("[data-e]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cycle(g.dataset.e); } });
  root.querySelector("#rm-n").addEventListener("input", (e) => { n = Number(e.target.value); col.clear(); draw(); });
  root.querySelector("#rm-rand").addEventListener("click", () => { col.clear(); for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) col.set(key(a, b), 1 + Math.floor(Math.random() * 2)); draw(); });
  root.querySelector("#rm-clear").addEventListener("click", () => { col.clear(); draw(); });
  draw();
  return () => {};
}
