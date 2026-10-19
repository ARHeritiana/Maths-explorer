// Hands-on activity of the cookies challenge: give cookies to each person with + and −, note each complete sharing, and see
// how many different ones you find. Hint actions write the sharing as a row of ● and | and number its places; the activity
// never states the count.
import { colour, onHintAction, svgEl } from "../common/kit.js";
import { code, NAMES } from "./maths.js";

export function activity(root, { t, q }) {
  const n = q.n, k = q.k, min = q.rule === "one" ? 1 : 0, W = 100, colW = W / k, H = 57, R = Math.min(3.2, colW / 5.2);
  let parts, found, level = 0, notice = "";
  const reset = () => { parts = Array(k).fill(0); found = new Set(); notice = ""; };
  root.innerHTML = `
    <p class="act-help">${t(`Donne des biscuits à chacun avec + et −. Quand les ${n} biscuits sont distribués, note le partage. Combien de partages différents arrives-tu à trouver ?`, `Give cookies to each person with + and −. When all ${n} cookies are handed out, note the sharing. How many different sharings can you find?`)}</p>
    <svg class="act-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Personnes, assiettes et biscuits", "People, plates and cookies")}"></svg>
    <p class="act-readout ck-code" id="ck-code" aria-live="polite"></p>
    <div class="act-controls"><button class="secondary" id="ck-note" type="button">${t("Noter ce partage", "Note this sharing")}</button><button class="btn-quiet" id="ck-reset" type="button">${t("Recommencer", "Restart")}</button></div>
    <p class="act-readout" id="ck-read" role="status" aria-live="polite"></p>`;
  const svg = root.querySelector("svg"), read = root.querySelector("#ck-read"), codeEl = root.querySelector("#ck-code"), note = root.querySelector("#ck-note");
  const left = () => n - parts.reduce((a, b) => a + b, 0);
  function button(g, x, y, label, i, d) {
    const b = svgEl("g", { class: "toy-handle", tabindex: 0, role: "button", "data-i": i, "data-d": d, "aria-label": `${d > 0 ? t("Donner un biscuit à", "Give a cookie to") : t("Reprendre un biscuit à", "Take a cookie back from")} ${NAMES[i]}` }, g);
    const off = (d > 0 && !left()) || (d < 0 && parts[i] <= 0);
    svgEl("circle", { class: "hit", cx: x, cy: y, r: Math.min(4.6, colW * 0.21) }, b);
    svgEl("circle", { cx: x, cy: y, r: 3.4, fill: off ? "var(--sunken)" : "var(--surface)", stroke: off ? "var(--line-strong)" : "var(--ink)", "stroke-width": 0.5 }, b);
    svgEl("text", { x, y: y + 1.5, "text-anchor": "middle", "font-size": 4.4, "font-weight": 700, fill: off ? "var(--muted)" : "var(--ink)", "pointer-events": "none" }, b).textContent = label;
  }
  function draw() {
    svg.replaceChildren();
    parts.forEach((p, i) => {
      const cx = colW * (i + 0.5), base = 38, g = svgEl("g", {}, svg);
      svgEl("ellipse", { cx, cy: base + 1.6, rx: colW * 0.38, ry: 2, fill: "var(--sunken)", stroke: "var(--line-strong)", "stroke-width": 0.4 }, g);
      // cookies stacked in two columns when the pile is tall
      for (let j = 0; j < p; j++) {
        const col = p > 8 ? (j % 2 ? 1 : -1) * R * 0.95 : 0, row = p > 8 ? Math.floor(j / 2) : j;
        svgEl("circle", { cx: cx + col, cy: base - R - row * R * 1.15, r: R, fill: `color-mix(in srgb, ${colour(1)} 55%, var(--surface))`, stroke: "var(--ink)", "stroke-width": 0.35 }, g);
      }
      svgEl("text", { x: cx, y: 46.5, "text-anchor": "middle", "font-size": 4.4, "font-weight": 700, fill: "var(--ink)" }, g).textContent = `${NAMES[i]}${t(" : ", ": ")}${p}`;
      button(g, cx - colW * 0.22, 52, "−", i, -1);
      button(g, cx + colW * 0.22, 52, "+", i, 1);
    });
    const row = code(parts);
    codeEl.hidden = level < 1;
    if (level >= 1) codeEl.innerHTML = level >= 2 ? `<span class="ck-row">${[...row].map((c, i) => `<span><small>${i + 1}</small>${c}</span>`).join("")}</span>` : `<span class="ck-row">${row || "·"}</span>`;
    const full = !left(), ok = full && parts.every((p) => p >= min);
    note.disabled = !ok;
    read.innerHTML = `${t("Biscuits encore à donner : ", "Cookies still to give: ")}<strong>${left()}</strong> · ${t("partages différents notés : ", "different sharings noted: ")}<strong>${found.size}</strong>${notice ? ` · ${notice}` : ""}${full && !ok ? ` · ${t("chacun doit en recevoir au moins un", "everyone must get at least one")}` : ""}`;
  }
  function act(i, d) {
    if (d > 0 && left() > 0) parts[i]++;
    else if (d < 0 && parts[i] > 0) parts[i]--;
    else return;
    notice = ""; draw();
    svg.querySelector(`.toy-handle[data-i="${i}"][data-d="${d}"]`)?.focus();
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest(".toy-handle"); if (g) act(Number(g.dataset.i), Number(g.dataset.d)); });
  svg.addEventListener("keydown", (e) => { const g = e.target.closest?.(".toy-handle"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); act(Number(g.dataset.i), Number(g.dataset.d)); } });
  note.addEventListener("click", () => {
    const key = parts.join(",");
    notice = found.has(key) ? t("déjà noté", "already noted") : t(`noté : (${parts.join(" ; ")})`, `noted: (${parts.join(", ")})`);
    found.add(key); draw();
  });
  root.querySelector("#ck-reset").addEventListener("click", () => { reset(); draw(); });
  reset(); draw();
  const off = onHintAction("cookies", { code: () => { level = Math.max(level, 1); draw(); }, places: () => { level = 2; draw(); } });
  return () => off();
}
