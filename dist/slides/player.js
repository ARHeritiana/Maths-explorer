// Classroom slide player. Decks are JSON built by scripts/build-slides.py (or authored in content/slides).
import { mount } from "./widgets.js";

const $ = (s, r = document) => r.querySelector(s);
const params = new URLSearchParams(location.search);
const deckId = params.get("deck") || "premiere-01";
let lang = params.get("lang") === "en" ? 1 : params.get("lang") === "fr" ? 0 : (() => { try { return localStorage.getItem("me-slides-lang") === "en" ? 1 : 0; } catch { return 0; } })();
let deck, index = 0, drawer = false, revealed = false, live = null;

const KIND = {
  title: ["Titre", "Title"], goals: ["Objectifs", "Goals"], concept: ["À retenir", "Key idea"], method: ["Méthode", "Method"],
  example: ["Exemple", "Example"], error: ["Attention", "Watch out"], try: ["À vous", "Your turn"], proof: ["Démonstration", "Proof"],
  activity: ["Activité", "Activity"], code: ["Python", "Python"], widget: ["Explorer", "Explore"],
};
const UI = {
  next: ["Suivant", "Next"], prev: ["Précédent", "Previous"], answer: ["Voir la réponse", "Show the answer"], hide: ["Masquer la réponse", "Hide the answer"],
  lang: ["English", "Français"], list: ["Plan", "Outline"], full: ["Plein écran", "Full screen"], answerLab: ["Réponse", "Answer"], home: ["Toutes les séries", "All decks"],
  hint: ["Flèches pour naviguer · R réponse · G plan · L langue · F plein écran", "Arrows to navigate · R answer · G outline · L language · F full screen"],
  slides: ["diapositives", "slides"], loadErr: ["Série introuvable.", "Deck not found."],
};
const t = k => UI[k][lang];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function fit() {
  const s = Math.min(innerWidth / 1280, innerHeight / 720);
  $("#stage").style.transform = `scale(${s})`;
}
addEventListener("resize", fit); fit();

async function load() {
  try {
    const r = await fetch(`./data/${encodeURIComponent(deckId)}.json`);
    if (!r.ok) throw new Error(r.status);
    deck = await r.json();
  } catch {
    $("#stage").innerHTML = `<div class="body"><h2>${t("loadErr")}</h2><p><a class="btn" href="../index.html#slides">${t("home")}</a></p></div>`;
    return;
  }
  const h = parseInt(location.hash.slice(1), 10);
  index = Number.isFinite(h) ? Math.min(Math.max(h, 0), deck.slides.length - 1) : 0;
  render();
}

function sizeClass(html) {
  const n = html.replace(/<[^>]+>/g, "").length + (html.match(/\\[(\[]/g) || []).length * 25 + (html.match(/<li>/g) || []).length * 70 + (html.match(/\\\\/g) || []).length * 45;
  return n > 1500 ? "s4" : n > 1100 ? "s3" : n > 750 ? "s2" : n > 420 ? "s1" : "";
}
const tex = s => lang ? s.replace(/\\pgcd/g, "\\gcd").replace(/\\ppcm/g, "\\operatorname{lcm}") : s;

async function render() {
  if (live) { live.destroy?.(); live = null; }
  const s = deck.slides[index], k = s.k, label = KIND[k]?.[lang] || k;
  document.documentElement.lang = lang ? "en" : "fr";
  document.title = `${deck.title[lang]} · Maths Explorer`;
  const title = esc(s.t[lang]);
  const body = tex(s.b[lang] || "");
  const ans = s.a ? tex(s.a[lang]) : "";
  let main;
  if (k === "title") {
    main = `<div class="body"><div class="title-slide"><span class="chip">${esc(deck.course === "stmg" ? "Terminale STMG" : deck.course === "premiere" ? "Première" : deck.course === "seconde" ? "Seconde" : "Terminale")}</span><h1>${title}</h1><div class="meta">${deck.slides.length} ${t("slides")}</div><div class="hint">${t("hint")}</div></div></div>`;
  } else if (k === "widget") {
    main = `<div class="body split"><div><h2>${title}</h2><div class="text ${sizeClass(body)}" style="margin-top:14px">${body}</div><div class="readout" id="readout" style="margin-top:14px"></div></div><div><div class="hint-line" id="whint"></div><div class="canvas-wrap" id="wcanvas" style="height:440px"></div><div class="wctl" id="wctl"></div></div></div>`;
  } else if (k === "code") {
    main = `<div class="body"><div><h2>${title}</h2></div><pre>${s.b[lang]}</pre></div>`;
  } else {
    const figs = (s.f || []).map(p => `<figure class="fig"><img src="./fig/${encodeURIComponent(deckId)}-${p[lang]}${lang ? "-en" : ""}.svg" alt="${esc(s.t[lang])}"></figure>`).join("");
    const cls = sizeClass(body + ans) + (figs ? " narrow" : "");
    const left = `<div><h2>${title}</h2>${s.h?.[lang] ? `<div class="sub">${esc(s.h[lang])}</div>` : ""}</div><div class="text ${cls}">${body}</div>${ans ? `<div class="card answer text ${cls}" id="ans" ${revealed ? "" : "hidden"}><div class="lab">${t("answerLab")}</div>${ans}</div>` : ""}`;
    main = figs ? `<div class="body split"><div class="col">${left}</div><div class="figcol">${figs}</div></div>` : `<div class="body">${left}</div>`;
  }
  const bar = `<div class="bar"><span class="chip ${k === "error" ? "error" : ""}">${esc(label)}</span><span class="deck">${esc(deck.title[lang])}</span>
    ${s.a ? `<button id="rev" aria-pressed="${revealed}">${revealed ? t("hide") : t("answer")}</button>` : ""}
    <button id="lng" aria-label="${t("lang")}">${t("lang")}</button><button id="lst" aria-pressed="${drawer}">${t("list")}</button><button id="fs">${t("full")}</button></div>`;
  const foot = `<div class="foot"><button id="pv" aria-label="${t("prev")}">←</button><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="${deck.slides.length}" aria-valuenow="${index + 1}"><i style="width:${((index + 1) / deck.slides.length) * 100}%"></i></div><span class="count">${index + 1} / ${deck.slides.length}</span><button id="nx" aria-label="${t("next")}">→</button></div>`;
  const dr = drawer ? `<nav class="drawer" aria-label="${t("list")}">${deck.slides.map((x, i) => `<button data-i="${i}" ${i === index ? 'aria-current="true"' : ""}>${i + 1}. ${esc((KIND[x.k]?.[lang] || x.k) + " · " + x.t[lang])}</button>`).join("")}</nav>` : "";
  $("#stage").innerHTML = bar + main + foot + dr;
  bind();
  if (k === "widget") live = mount(s.w, { host: $("#wcanvas"), controls: $("#wctl"), readout: $("#readout"), hint: $("#whint"), lang });
  try { history.replaceState(null, "", `?deck=${encodeURIComponent(deckId)}&lang=${lang ? "en" : "fr"}#${index}`); } catch {}
  try { await MathJax.startup.promise; await MathJax.typesetPromise([$("#stage")]); } catch (e) { console.warn(e); }
}

function go(i) { index = Math.min(Math.max(i, 0), deck.slides.length - 1); revealed = false; render(); }
function toggleAnswer() { if (!deck.slides[index].a) return; revealed = !revealed; $("#ans").hidden = !revealed; const b = $("#rev"); b.setAttribute("aria-pressed", revealed); b.textContent = revealed ? t("hide") : t("answer"); }
function setLang(v) { lang = v; try { localStorage.setItem("me-slides-lang", lang ? "en" : "fr"); } catch {} render(); }
function bind() {
  $("#nx").onclick = () => go(index + 1); $("#pv").onclick = () => go(index - 1);
  $("#lng").onclick = () => setLang(lang ? 0 : 1);
  $("#lst").onclick = () => { drawer = !drawer; render(); };
  $("#fs").onclick = async () => { try { await document.documentElement.requestFullscreen(); } catch { alert(lang ? "Full screen is blocked here; open the page in a browser tab." : "Plein écran bloqué ici ; ouvrez la page dans un onglet."); } };
  $("#rev")?.addEventListener("click", toggleAnswer);
  document.querySelectorAll(".drawer button").forEach(b => b.onclick = () => { drawer = false; go(+b.dataset.i); });
}
addEventListener("keydown", e => {
  if (e.target.closest?.("input,select,textarea")) return;
  const k = e.key;
  if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); go(index + 1); }
  else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); go(index - 1); }
  else if (k === "Home") go(0); else if (k === "End") go(deck.slides.length - 1);
  else if (k === "r" || k === "R" || k === "ArrowDown") { e.preventDefault(); toggleAnswer(); }
  else if (k === "l" || k === "L") setLang(lang ? 0 : 1);
  else if (k === "g" || k === "G") { drawer = !drawer; render(); }
  else if (k === "f" || k === "F") $("#fs").click();
  else if (k === "Escape" && drawer) { drawer = false; render(); }
});
addEventListener("hashchange", () => { const h = parseInt(location.hash.slice(1), 10); if (deck && Number.isFinite(h) && h !== index) go(h); });
load();
