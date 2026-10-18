// Hands-on activity of the doors challenge: the learner tries, fails and notices; it never states the answer or the method.
import { onHintAction, clamp } from "../common/kit.js";

/* ------------------------------------------------------------------ doors */
export function activity(root, { t, q }) {
  const ND = q.n;
  let k = 0;
  let picked = null;
  let timer = null;
  root.innerHTML = `
    <p class="act-help">${t("Fais avancer les passages et regarde les portes changer d’état. Touche une porte pour voir quand elle a été changée.", "Step through the passes and watch the doors change. Tap a door to see when it was changed.")}</p>
    <div class="doors" id="dr-grid" role="group" aria-label="${ND} ${t("portes", "doors")}"></div>
    <div class="act-controls">
      <label class="act-field" for="dr-k"><span class="act-label">${t("Après le passage", "After pass")} <output id="dr-out"></output></span><input id="dr-k" type="range" min="0" max="${ND}" step="1" value="0"></label>
      <div class="act-buttons">
        <button class="btn btn-secondary" id="dr-prev" type="button">${t("Passage précédent", "Previous pass")}</button>
        <button class="btn btn-primary" id="dr-next" type="button">${t("Passage suivant", "Next pass")}</button>
        <button class="btn btn-secondary" id="dr-play" type="button" aria-pressed="false">${t("Lire", "Play")}</button>
        <button class="btn-quiet" id="dr-reset" type="button">${t("Recommencer", "Start over")}</button>
      </div>
    </div>
    <p class="act-readout" id="dr-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#dr-grid");
  const count = (n) => {
    let c = 0;
    for (let d = 1; d <= Math.min(k, n); d++) if (n % d === 0) c++;
    return c;
  };
  grid.innerHTML = Array.from({ length: ND }, (_, i) => `<button type="button" class="door" data-n="${i + 1}"><span>${i + 1}</span><small class="door-div" aria-hidden="true"></small></button>`).join("");
  const stop = () => {
    clearInterval(timer);
    timer = null;
    const play = root.querySelector("#dr-play");
    play.setAttribute("aria-pressed", "false");
    play.textContent = t("Lire", "Play");
  };
  let showDiv = false;   // hint 1: the number of divisors written on each door
  const divisors = (n) => { let c = 0; for (let d = 1; d <= n; d++) if (n % d === 0) c++; return c; };
  function render() {
    let open = 0;
    grid.querySelectorAll(".door").forEach((b) => {
      const n = Number(b.dataset.n);
      const isOpen = count(n) % 2 === 1;
      if (isOpen) open++;
      b.classList.toggle("open", isOpen);
      b.classList.toggle("flipped", k > 0 && n % k === 0);
      b.classList.toggle("picked", picked === n);
      b.querySelector(".door-div").textContent = showDiv ? divisors(n) : "";
      b.setAttribute("aria-label", `${t("Porte", "Door")} ${n}, ${isOpen ? t("ouverte", "open") : t("fermée", "closed")}`);
    });
    root.querySelector("#dr-k").value = k;
    root.querySelector("#dr-out").textContent = k;
    let text = k === 0 ? t("Toutes les portes sont fermées.", "All doors are closed.") : `${t("Après le passage", "After pass")} ${k} : ${open} ${t(open > 1 ? "portes ouvertes" : "porte ouverte", open > 1 ? "doors open" : "door open")}.`;
    if (picked) {
      const ds = Array.from({ length: Math.min(k, picked) }, (_, i) => i + 1).filter((d) => picked % d === 0);
      text += ` ${t("Porte", "Door")} ${picked} : ${ds.length ? `${t("changée aux passages", "changed at passes")} ${ds.join(", ")} (${ds.length} ${t(ds.length > 1 ? "fois" : "fois", "times")})` : t("jamais changée pour l’instant", "not changed yet")}.`;
    }
    root.querySelector("#dr-read").textContent = text;
    root.querySelector("#dr-prev").disabled = k === 0;
    root.querySelector("#dr-next").disabled = k === ND;
  }
  const go = (v) => {
    k = clamp(v, 0, ND);
    render();
  };
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".door");
    if (!b) return;
    picked = picked === Number(b.dataset.n) ? null : Number(b.dataset.n);
    render();
  });
  root.querySelector("#dr-k").addEventListener("input", (e) => go(Number(e.target.value)));
  root.querySelector("#dr-prev").addEventListener("click", () => go(k - 1));
  root.querySelector("#dr-next").addEventListener("click", () => go(k + 1));
  root.querySelector("#dr-reset").addEventListener("click", () => {
    stop();
    picked = null;
    go(0);
  });
  root.querySelector("#dr-play").addEventListener("click", (e) => {
    if (timer) return stop();
    if (k >= ND) k = 0;
    e.currentTarget.setAttribute("aria-pressed", "true");
    e.currentTarget.textContent = t("Pause", "Pause");
    timer = setInterval(() => {
      if (k >= ND) return stop();
      go(k + 1);
    }, 220);
  });
  render();
  const off = onHintAction("doors", { divisors: () => { showDiv = true; render(); } });
  return () => { stop(); off(); };
}
