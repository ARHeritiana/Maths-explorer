// Hands-on activity of the sum and product puzzle: choose a pair (x, y) and see what Sam and Paula see (every split of the
// sum, every split of the product); the map of all pairs is drawn below. Hint actions list Sam's possible sums and filter the
// map sentence by sentence; the activity never states the pair.
import { onHintAction } from "../common/kit.js";
import { spSteps, goodSums, splitsOfSum, splitsOfProduct } from "./maths.js";

export function activity(root, { t, q }) {
  const N = q.N, st = spSteps(N), all = st[0];
  const byProd = new Map(); for (const [x, y] of all) byProd.set(x * y, (byProd.get(x * y) || 0) + 1);
  let x = 4, y = 7, level = 0, stage = 0;
  root.innerHTML = `
    <p class="act-help">${t(`Choisis un couple 1 < x < y avec x + y ≤ ${N}. Tu vois ce que Sam (la somme) et Paula (le produit) peuvent imaginer. Sur la carte, chaque point est un couple ; le tien est entouré.`, `Choose a pair 1 < x < y with x + y ≤ ${N}. You see what Sam (the sum) and Paula (the product) can imagine. On the map every dot is a pair; yours is circled.`)}</p>
    <div class="act-controls"><label class="act-field">x <input id="sp-x" type="number" min="2" max="${N}" value="${x}"></label><label class="act-field">y <input id="sp-y" type="number" min="3" max="${N}" value="${y}"></label><button class="secondary" id="sp-next" type="button" hidden></button></div>
    <p class="act-readout" id="sp-read" role="status" aria-live="polite"></p>
    <canvas class="sp-map" width="640" height="360" role="img" aria-label="${t("Carte des couples (x, y)", "Map of the pairs (x, y)")}"></canvas>`;
  const read = root.querySelector("#sp-read"), cv = root.querySelector("canvas"), g = cv.getContext("2d"), next = root.querySelector("#sp-next");
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";
  const xmax = Math.floor((N - 1) / 2), ymax = N - 2, PX = (v) => 30 + ((v - 2) / (xmax - 2 || 1)) * 590, PY = (v) => 340 - ((v - 3) / (ymax - 3 || 1)) * 320;
  const alive = () => new Set(st[stage].map(String));
  function draw() {
    const valid = Number.isInteger(x) && Number.isInteger(y) && 1 < x && x < y && x + y <= N;
    const sum = x + y, prod = x * y;
    const pairs = (list) => list.map(([a, b]) => `(${a}${t(" ; ", ", ")}${b})`).join(" ");
    const sumSplits = valid ? splitsOfSum(sum, N) : [], prodSplits = valid ? splitsOfProduct(prod, N) : [];
    read.innerHTML = valid
      ? `${t("Sam voit", "Sam sees")} <strong>S = ${sum}</strong>${t(" : ", ": ")}${pairs(sumSplits.map(([a, b]) => [a, b]))}<br>${t("produits de ces couples : ", "products of these pairs: ")}${sumSplits.map(([a, b]) => `${a * b}${byProd.get(a * b) > 1 ? "" : "!"}`).join(", ")} <small>(${t("! = un produit qui ne s’écrit que d’une façon", "! = a product with a single split")})</small><br>${t("Paula voit", "Paula sees")} <strong>P = ${prod}</strong>${t(" : ", ": ")}${pairs(prodSplits)}${level >= 1 ? `<br>${t("Sommes possibles pour Sam après « je savais » : ", "Sums Sam can have after “I knew”: ")}${goodSums(N).join(", ") || t("aucune", "none")}` : ""}${level >= 2 ? `<br>${t("Couples restants : ", "Pairs left: ")}<strong>${st[stage].length}</strong>${st[stage].length <= 12 ? " " + pairs(st[stage]) : ""}` : ""}`
      : t(`Choisis 1 < x < y avec x + y ≤ ${N}.`, `Choose 1 < x < y with x + y ≤ ${N}.`);
    next.hidden = level < 2 || stage >= 4;
    next.textContent = t(["Appliquer : Paula ne sait pas", "Appliquer : Sam savait", "Appliquer : Paula sait", "Appliquer : Sam sait"][stage] || "", ["Apply: Paula doesn’t know", "Apply: Sam knew", "Apply: Paula knows", "Apply: Sam knows"][stage] || "");
    const keep = alive(), C = { on: css("--accent"), off: css("--line-strong"), ink: css("--ink"), bg: css("--sunken") };
    g.fillStyle = C.bg; g.fillRect(0, 0, 640, 360);
    for (const p of all) { const on = keep.has(String(p)); g.fillStyle = on ? C.on : C.off; g.globalAlpha = on ? 0.9 : 0.35; g.fillRect(PX(p[0]) - 1.5, PY(p[1]) - 1.5, on && stage >= 3 ? 5 : 3, on && stage >= 3 ? 5 : 3); }
    g.globalAlpha = 1;
    if (valid) { g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.arc(PX(x), PY(y), 7, 0, 2 * Math.PI); g.stroke(); }
    g.fillStyle = C.ink; g.font = "13px system-ui"; g.fillText("x →", 600, 355); g.fillText("y ↑", 6, 14);
  }
  const input = (id, set) => root.querySelector(id).addEventListener("input", (e) => { set(Math.round(Number(e.target.value))); draw(); });
  input("#sp-x", (v) => { x = v; }); input("#sp-y", (v) => { y = v; });
  next.addEventListener("click", () => { stage = Math.min(4, stage + 1); draw(); });
  draw();
  const off = onHintAction("sumproduct", { sums: () => { level = Math.max(level, 1); draw(); }, filter: () => { level = 2; draw(); } });
  return () => off();
}
