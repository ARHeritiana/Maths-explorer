// Hands-on activity of the jugs challenge: fill, empty and pour two jugs until one holds the target amount. Hint actions list
// the states reached and draw the table of states (x, y) with the path followed; the activity never states the method.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { parseJugs, apply } from "./maths.js";

export function activity(root, { t, q, reduced }) {
  const [a, b, target] = parseJugs(q.jugs), cap = Math.max(a, b);
  let st, hist, level = 0;
  const reset = () => { st = [0, 0]; hist = [[0, 0]]; };
  const BTN = [["fillA", t(`Remplir ${a} L`, `Fill ${a} L`)], ["fillB", t(`Remplir ${b} L`, `Fill ${b} L`)], ["emptyA", t(`Vider ${a} L`, `Empty ${a} L`)], ["emptyB", t(`Vider ${b} L`, `Empty ${b} L`)], ["pourAB", t(`${a} L → ${b} L`, `${a} L → ${b} L`)], ["pourBA", t(`${b} L → ${a} L`, `${b} L → ${a} L`)]];
  root.innerHTML = `
    <p class="act-help">${t(`Remplis, vide et transvase les deux bidons. Obtiens exactement ${target} L dans l’un d’eux, en aussi peu d’opérations que possible.`, `Fill, empty and pour the two jugs. Get exactly ${target} L in one of them, in as few operations as possible.`)}</p>
    <svg class="act-svg jg-svg" viewBox="0 0 100 62" role="img" aria-label="${t("Deux bidons", "Two jugs")}"></svg>
    <div class="act-controls jg-moves">${BTN.map(([m, l]) => `<button class="secondary" type="button" data-move="${m}">${l}</button>`).join("")}</div>
    <div class="act-controls"><button class="btn-quiet" id="jg-undo" type="button">${t("Annuler", "Undo")}</button><button class="btn-quiet" id="jg-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="jg-read" role="status" aria-live="polite"></p>
    <svg class="act-svg jg-table" viewBox="0 0 100 60" hidden role="img" aria-label="${t("Table des états", "Table of states")}"></svg>`;
  const svg = root.querySelector(".jg-svg"), table = root.querySelector(".jg-table"), read = root.querySelector("#jg-read");
  function jug(x, w, litres, size, label, i) {
    const top = 8, h = 44 * (size / cap), y0 = top + 44 - h, lv = h * (litres / size);
    svgEl("rect", { x, y: y0 + h - lv, width: w, height: lv, fill: `color-mix(in srgb, ${colour(i)} 45%, var(--surface))`, style: reduced ? "" : "transition: y .35s, height .35s" }, svg);
    svgEl("path", { d: `M${x} ${y0}V${y0 + h}H${x + w}V${y0}`, fill: "none", stroke: "var(--ink)", "stroke-width": 0.8 }, svg);
    for (let k = 1; k < size; k++) svgEl("line", { x1: x, x2: x + 2, y1: y0 + h - (h * k) / size, y2: y0 + h - (h * k) / size, stroke: "var(--line-strong)", "stroke-width": 0.3 }, svg);
    svgEl("text", { x: x + w / 2, y: 58, "text-anchor": "middle", "font-size": 4.2, "font-weight": 700, fill: "var(--ink)" }, svg).textContent = `${litres} / ${label}`;
  }
  function drawTable() {
    table.hidden = level < 2;
    if (level < 2) return;
    table.replaceChildren();
    const sx = 84 / a, sy = 48 / b, X = (x) => 10 + x * sx, Y = (y) => 54 - y * sy;
    for (let x = 0; x <= a; x++) for (let y = 0; y <= b; y++) svgEl("circle", { cx: X(x), cy: Y(y), r: 0.7, fill: x === target || y === target ? "var(--pos)" : "var(--line-strong)" }, table);
    svgEl("path", { d: `M${X(0)} ${Y(0)}H${X(a)}V${Y(b)}H${X(0)}Z`, fill: "none", stroke: "var(--line-strong)", "stroke-width": 0.4 }, table);
    svgEl("polyline", { points: hist.map(([x, y]) => `${X(x)},${Y(y)}`).join(" "), fill: "none", stroke: colour(0), "stroke-width": 0.8 }, table);
    svgEl("circle", { cx: X(st[0]), cy: Y(st[1]), r: 1.6, fill: colour(0) }, table);
    svgEl("text", { x: 55, y: 59.5, "text-anchor": "middle", "font-size": 3.4, fill: "var(--muted)" }, table).textContent = t(`x = litres dans ${a} L, y = litres dans ${b} L ; vert : ${target} L dans un bidon`, `x = litres in ${a} L, y = litres in ${b} L; green: ${target} L in a jug`);
  }
  function draw() {
    svg.replaceChildren();
    jug(18, 22, st[0], a, `${a} L`, 0);
    jug(60, 22, st[1], b, `${b} L`, 2);
    const done = st[0] === target || st[1] === target, n = hist.length - 1;
    root.querySelector("#jg-undo").disabled = n === 0;
    read.innerHTML = `${t("Opérations : ", "Operations: ")}<strong>${n}</strong>${done ? ` · <strong>${t(`${target} L obtenus !`, `${target} L reached!`)}</strong>` : ""}${level >= 1 ? ` · ${t("états : ", "states: ")}${hist.map((s) => `(${s.join(t(" ; ", ", "))})`).join(" → ")}` : ""}`;
    drawTable();
  }
  root.querySelector(".jg-moves").addEventListener("click", (e) => {
    const m = e.target.closest("[data-move]")?.dataset.move;
    if (!m) return;
    const n = apply(m, st, a, b);
    if (n[0] === st[0] && n[1] === st[1]) return;   // a move that changes nothing is not counted
    st = n; hist.push(n); draw();
  });
  root.querySelector("#jg-undo").addEventListener("click", () => { if (hist.length > 1) { hist.pop(); st = hist.at(-1); draw(); } });
  root.querySelector("#jg-reset").addEventListener("click", () => { reset(); draw(); });
  reset(); draw();
  const off = onHintAction("jugs", { states: () => { level = Math.max(level, 1); draw(); }, table: () => { level = 2; draw(); } });
  return () => off();
}
