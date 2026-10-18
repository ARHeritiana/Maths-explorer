// Hands-on activity of the eggs challenge: the learner tries, fails and notices; it never states the answer or the method.

/* ------------------------------------------------------------------ eggs */
export function activity(root, { t, q }) {
  const FLOORS = q.floors, EGGS = Number(q.eggs);
  let crit, left, drops, log, lo, hi, done;
  const fresh = () => {
    crit = Math.floor(Math.random() * (FLOORS + 1));   // highest floor from which an egg survives, 0 to FLOORS
    left = EGGS; drops = 0; log = []; lo = 0; hi = FLOORS + 1; done = false;
  };
  root.innerHTML = `
    <p class="act-help">${t(`Touche un étage pour y lâcher un œuf. Un œuf intact peut resservir, un œuf brisé non. Tu as ${EGGS} œufs. Cherche l’étage critique : le plus haut étage d’où un œuf ne se brise pas (0 s’il se brise dès l’étage 1).`, `Tap a floor to drop an egg from it. An intact egg can be reused, a broken one cannot. You have ${EGGS} eggs. Find the critical floor: the highest floor from which an egg does not break (0 if it breaks from floor 1).`)}</p>
    <div class="egg-status" id="eg-status" aria-hidden="true"></div>
    <div class="egg-grid" id="eg-grid" role="group" aria-label="${t(`Immeuble de ${FLOORS} étages`, `Building with ${FLOORS} floors`)}"></div>
    <div class="act-controls">
      <label class="act-field act-number" for="eg-guess"><span class="act-label">${t("Étage critique annoncé", "Announced critical floor")}</span><input id="eg-guess" type="number" min="0" max="${FLOORS}" inputmode="numeric"></label>
      <button class="btn btn-secondary" id="eg-say" type="button">${t("Annoncer", "Announce")}</button>
      <button class="btn-quiet" id="eg-new" type="button">${t("Nouvelle partie", "New game")}</button>
    </div>
    <p class="act-readout" id="eg-read" role="status" aria-live="polite"></p>`;
  const grid = root.querySelector("#eg-grid"), status = root.querySelector("#eg-status"), read = root.querySelector("#eg-read");
  function draw(msg = "") {
    status.innerHTML = Array.from({ length: EGGS }, (_, i) => i).map((i) => `<span class="egg ${i < left ? "ok" : "broken"}" title="${i < left ? t("intact", "intact") : t("brisé", "broken")}"></span>`).join("");
    grid.replaceChildren();
    for (let f = FLOORS; f >= 1; f--) {
      const info = log.find((l) => l.f === f);
      const b = document.createElement("button");
      b.type = "button";
      b.className = `floor${info ? (info.broke ? " broke" : " safe") : f > lo && f < hi ? " maybe" : ""}`;
      b.textContent = f;
      b.dataset.f = f;
      b.disabled = done || left === 0 || !!info;
      b.setAttribute("aria-label", `${t("Étage", "Floor")} ${f}${info ? `, ${info.broke ? t("l’œuf s’est brisé", "the egg broke") : t("l’œuf est intact", "the egg survived")}` : ""}`);
      grid.append(b);
    }
    // 10 floors per row, floor 100 at the top left to 91, and so on down to 1 at the bottom right
    const certain = hi - lo - 1;
    read.innerHTML = `${t("Lancers", "Drops")} : <strong>${drops}</strong> · ${t("œufs intacts", "intact eggs")} : <strong>${left}</strong>. ${
      lo === 0 && hi === FLOORS + 1 ? "" : `${t("L’étage critique est entre", "The critical floor is between")} ${lo} ${t("et", "and")} ${hi - 1}${certain === 0 ? ` ${t("(un seul candidat)", "(one candidate only)")}` : ""}.`} ${msg}`.trim();
    root.querySelector("#eg-say").disabled = done;
    root.querySelector("#eg-guess").disabled = done;   // the verdict belongs to the announced value: no editing it afterwards
  }
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b || done || left === 0) return;
    const f = Number(b.dataset.f), broke = f > crit;
    drops += 1;
    log.push({ f, broke });
    if (broke) { left -= 1; hi = Math.min(hi, f); } else lo = Math.max(lo, f);
    let msg = broke ? t(`Étage ${f} : l’œuf se brise.`, `Floor ${f}: the egg breaks.`) : t(`Étage ${f} : l’œuf ne se brise pas.`, `Floor ${f}: the egg survives.`);
    if (left === 0) msg += ` ${t("Plus d’œuf : annonce ton étage ou recommence.", "No eggs left: announce your floor or start again.")}`;
    draw(msg);
  });
  root.querySelector("#eg-say").addEventListener("click", () => {
    const v = Number(root.querySelector("#eg-guess").value);
    if (!Number.isInteger(v) || v < 0 || v > FLOORS || root.querySelector("#eg-guess").value === "") { draw(t(`Entre un entier de 0 à ${FLOORS}.`, `Enter an integer from 0 to ${FLOORS}.`)); return; }
    done = true;
    const open = hi - lo - 1;   // floors still undecided after the drops
    const why = open > 0 ? ` ${t(`Il restait ${open + 1} candidats (${lo} à ${hi - 1}) : ton plan n’avait pas assez de lancers ou d’œufs pour trancher, c’était un pari.`, `${open + 1} candidates were left (${lo} to ${hi - 1}): your plan did not have enough drops or eggs to decide, so it was a guess.`)}` : "";
    draw(v === crit ? t(`Tu as annoncé ${v} : exact, l’étage critique est ${crit}. Tu as utilisé ${drops} lancers.`, `You announced ${v}: correct, the critical floor is ${crit}. You used ${drops} drops.`) + why : t(`Tu as annoncé ${v} : faux, l’étage critique était ${crit}.`, `You announced ${v}: wrong, the critical floor was ${crit}.`) + why);
  });
  root.querySelector("#eg-new").addEventListener("click", () => { fresh(); root.querySelector("#eg-guess").value = ""; draw(); });
  fresh();
  draw();
  return () => {};
}
