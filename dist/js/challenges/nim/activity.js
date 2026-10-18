// Hands-on activity of the nim challenge: the learner tries, fails and notices; it never states the answer or the method.
import { clamp } from "../common/kit.js";

/* -------------------------------------------------------------------- nim */
export function activity(root, { t, reduced, q }) {
  const N0 = q.n, MAXT = q.m;
  let stones = N0, turn = "you", over = false, userFirst = true, perfect = true;
  let wins = 0, games = 0, log = [], timer = null;
  root.innerHTML = `
    <p class="act-help">${t(`Joue contre l’ordinateur. À ton tour, retire de 1 à ${MAXT} pierres. Celui qui prend la dernière pierre gagne.`, `Play the computer. On your turn take 1 to ${MAXT} stones. Whoever takes the last stone wins.`)}</p>
    <div class="nim-pile" id="nim-pile" aria-hidden="true">${Array.from({ length: N0 }, () => '<span class="stone"></span>').join("")}</div>
    <p class="act-readout nim-status" id="nim-status" role="status" aria-live="polite"></p>
    <div class="act-buttons">${Array.from({ length: MAXT }, (_, i) => i + 1).map((k) => `<button class="btn btn-primary" type="button" data-take="${k}">${t("Prendre", "Take")} ${k}</button>`).join("")}</div>
    <div class="act-controls">
      <fieldset class="act-choice"><legend>${t("Qui commence ?", "Who starts?")}</legend>
        <label><input type="radio" name="nim-first" value="you" checked> ${t("Moi", "Me")}</label>
        <label><input type="radio" name="nim-first" value="cpu"> ${t("L’ordinateur", "The computer")}</label></fieldset>
      <fieldset class="act-choice"><legend>${t("Adversaire", "Opponent")}</legend>
        <label><input type="radio" name="nim-level" value="perfect" checked> ${t("Sans erreur", "Never errs")}</label>
        <label><input type="radio" name="nim-level" value="random"> ${t("Au hasard", "Random")}</label></fieldset>
      <button class="btn btn-secondary" id="nim-new" type="button">${t("Nouvelle partie", "New game")}</button>
    </div>
    <p class="act-score" id="nim-score"></p>
    <ol class="nim-log" id="nim-log" aria-label="${t("Coups joués", "Moves played")}"></ol>`;
  const pile = root.querySelector("#nim-pile");
  const status = root.querySelector("#nim-status");
  function render() {
    [...pile.children].forEach((s, i) => s.classList.toggle("gone", i >= stones));
    root.querySelectorAll("[data-take]").forEach((b) => (b.disabled = over || turn !== "you" || Number(b.dataset.take) > stones));
    root.querySelector("#nim-log").innerHTML = log.map((m) => `<li>${m.who === "you" ? t("Toi", "You") : t("Ordinateur", "Computer")} : ${m.k} → ${m.left}</li>`).join("");
    root.querySelector("#nim-score").textContent = games ? `${t("Parties gagnées", "Games won")} : ${wins} / ${games}` : "";
    if (over) status.textContent = turnWinner === "you" ? t("Tu as pris la dernière pierre : tu gagnes.", "You took the last stone: you win.") : t("L’ordinateur a pris la dernière pierre : il gagne.", "The computer took the last stone: it wins.");
    else status.textContent = turn === "you" ? `${t("À toi de jouer", "Your turn")} : ${stones} ${t("pierres", "stones")}.` : `${t("L’ordinateur réfléchit…", "The computer is thinking…")} ${stones} ${t("pierres", "stones")}.`;
  }
  let turnWinner = null;
  function take(who, k) {
    stones -= k;
    log.push({ who, k, left: stones });
    if (stones === 0) {
      over = true;
      turnWinner = who;
      games++;
      if (who === "you") wins++;
    } else turn = who === "you" ? "cpu" : "you";
    render();
    if (!over && turn === "cpu") timer = setTimeout(cpu, reduced() ? 0 : 700);
  }
  function cpu() {
    const max = Math.min(MAXT, stones);
    const k = perfect ? stones % (MAXT + 1) || 1 + Math.floor(Math.random() * max) : 1 + Math.floor(Math.random() * max);
    take("cpu", clamp(k, 1, max));
  }
  function start() {
    clearTimeout(timer);
    stones = N0;
    over = false;
    log = [];
    turnWinner = null;
    turn = userFirst ? "you" : "cpu";
    render();
    if (turn === "cpu") timer = setTimeout(cpu, reduced() ? 0 : 700);
  }
  root.querySelectorAll("[data-take]").forEach((b) => b.addEventListener("click", () => turn === "you" && !over && take("you", Number(b.dataset.take))));
  root.querySelector("#nim-new").addEventListener("click", start);
  root.querySelectorAll('[name="nim-first"]').forEach((r) => r.addEventListener("change", () => { userFirst = r.value === "you"; start(); }));
  root.querySelectorAll('[name="nim-level"]').forEach((r) => r.addEventListener("change", () => { perfect = r.value === "perfect"; start(); }));
  render();
  return () => clearTimeout(timer);
}
