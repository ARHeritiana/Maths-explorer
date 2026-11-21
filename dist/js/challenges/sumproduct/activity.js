// Hands-on activity of the sum and product puzzle: choose a pair (x, y) and see what Sam and Paula see (every split of the
// sum, every split of the product); the map of all pairs is drawn below. The sentence-by-sentence filtering is in the
// solution; the activity never states the pair.
import { goalLine } from "../common/kit.js";
import { spSteps, splitsOfSum, splitsOfProduct } from "./maths.js";
import { mountBuddy } from "../common/buddy.js";

export function activity(root, { t, q }) {
  const N = q.N, all = spSteps(N)[0];
  let x = 4, y = 7;
  root.innerHTML = `
    ${goalLine(t, `Retrouve le couple de Sam et Paula.`, `Find Sam and Paula’s pair.`, `Choisis un couple 1 < x < y avec x + y ≤ ${N}.`, `Choose a pair 1 < x < y with x + y ≤ ${N}.`)}
    <div class="act-controls"><label class="act-field">x <input id="sp-x" type="number" min="2" max="${N}" value="${x}"></label><label class="act-field">y <input id="sp-y" type="number" min="3" max="${N}" value="${y}"></label></div>
    <p class="act-readout" id="sp-read" role="status" aria-live="polite"></p>
    <canvas class="sp-map" width="640" height="360" role="img" aria-label="${t("Carte des couples (x, y)", "Map of the pairs (x, y)")}"></canvas>`;
  const read = root.querySelector("#sp-read"), cv = root.querySelector("canvas"), g = cv.getContext("2d");
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";
  const xmax = Math.floor((N - 1) / 2), ymax = N - 2, PX = (v) => 30 + ((v - 2) / (xmax - 2 || 1)) * 590, PY = (v) => 340 - ((v - 3) / (ymax - 3 || 1)) * 320;
  function draw() {
    const valid = Number.isInteger(x) && Number.isInteger(y) && 1 < x && x < y && x + y <= N;
    const sum = x + y, prod = x * y;
    const pairs = (list) => list.map(([a, b]) => `(${a}${t(" ; ", ", ")}${b})`).join(" ");
    const sumSplits = valid ? splitsOfSum(sum, N) : [], prodSplits = valid ? splitsOfProduct(prod, N) : [];
    read.innerHTML = valid
      ? `${t("Sam voit", "Sam sees")} <strong>S = ${sum}</strong>${t(" : ", ": ")}${pairs(sumSplits.map(([a, b]) => [a, b]))}<br>${t("produits de ces couples : ", "products of these pairs: ")}${sumSplits.map(([a, b]) => a * b).join(", ")}<br>${t("Paula voit", "Paula sees")} <strong>P = ${prod}</strong>${t(" : ", ": ")}${pairs(prodSplits)}`
      : t(`Choisis 1 < x < y avec x + y ≤ ${N}.`, `Choose 1 < x < y with x + y ≤ ${N}.`);
    const C = { on: css("--object-ink"), off: css("--line-strong"), ink: css("--ink"), bg: css("--sunken") };
    g.fillStyle = C.bg; g.fillRect(0, 0, 640, 360);
    for (const p of all) { g.fillStyle = C.on; g.globalAlpha = 0.9; g.fillRect(PX(p[0]) - 1.5, PY(p[1]) - 1.5, 3, 3); }
    g.globalAlpha = 1;
    if (valid) { g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.arc(PX(x), PY(y), 7, 0, 2 * Math.PI); g.stroke(); }
    g.fillStyle = C.ink; g.font = "13px system-ui"; g.fillText("x →", 600, 355); g.fillText("y ↑", 6, 14);
  }
  const input = (id, set) => root.querySelector(id).addEventListener("input", (e) => { set(Math.round(Number(e.target.value))); draw(); });
  input("#sp-x", (v) => { x = v; }); input("#sp-y", (v) => { y = v; });
  draw();
  const buddy = mountBuddy(root, { t, reduced: false, cast: [{ kind: "person", look: 1, name: "Sam" }, { kind: "person", look: 3, name: "Paula" }], backdrop: "classroom" });
  const offActivity = () => {};
  return () => { if (typeof offActivity === "function") offActivity(); buddy.destroy(); };
}
