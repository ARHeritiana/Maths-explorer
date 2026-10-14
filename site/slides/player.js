// Classroom slide player, modelled on the interactive maths slide skill (Presenter + Explore):
// fixed 1280x720 stage, flow column of step blocks on the left, live figure with controls on the right,
// ◀ ▶ steps and "Tout" at the bottom left. The same file is bundled by scripts/export-slides.py into a
// self-contained HTML export of each deck (window.__MX_EXPORT__ then carries the deck and its figures).
import { mount } from "./widgets.js";

const $ = (s, r = document) => r.querySelector(s);
const EXPORT = typeof window !== "undefined" && window.__MX_EXPORT__ ? window.__MX_EXPORT__ : null;
const params = new URLSearchParams(location.search);
const deckId = EXPORT ? EXPORT.deck.id : params.get("deck") || "premiere-01";
const stored = () => { try { return localStorage.getItem("me-slides-lang") === "en" ? 1 : 0; } catch { return 0; } };
let lang = params.get("lang") === "en" ? 1 : params.get("lang") === "fr" ? 0 : stored();
let deck, index = 0, revealed = false, live = null, step = 1, generation = 0, toastTimer = 0;

const KIND = {
  title: ["Titre", "Title"], goals: ["Objectifs", "Goals"], concept: ["À retenir", "Key idea"], method: ["Méthode", "Method"],
  example: ["Exemple", "Example"], error: ["Attention", "Watch out"], try: ["À vous", "Your turn"], proof: ["Démonstration", "Proof"],
  activity: ["Activité", "Activity"], code: ["Python", "Python"], widget: ["Explorer", "Explore"],
};
const UI = {
  stepPrev: ["Étape précédente", "Previous step"], stepNext: ["Étape suivante", "Next step"], all: ["Tout", "All"],
  step: ["Étape", "Step"], prev: ["Diapositive précédente", "Previous slide"], next: ["Diapositive suivante", "Next slide"],
  answer: ["Voir la réponse", "Show the answer"], hide: ["Masquer la réponse", "Hide the answer"], answerLab: ["Réponse", "Answer"],
  lang: ["English", "Français"], list: ["Plan", "Outline"], full: ["Plein écran", "Full screen"],
  download: ["Télécharger HTML", "Download HTML"], downloadTip: ["Télécharger ce diaporama en un seul fichier HTML", "Download this deck as a single HTML file"],
  home: ["Toutes les séries", "All decks"], loadErr: ["Série introuvable.", "Deck not found."],
  hint: ["Flèches : étapes et diapositives · R réponse · G plan · L langue · F plein écran", "Arrows: steps and slides · R answer · G outline · L language · F full screen"],
  slides: ["diapositives", "slides"], liveLab: ["Valeurs en direct", "Live values"],
  explore: ["Explorer le chapitre", "Explore the chapter"],
  free: ["La figure est réglable librement ; ses valeurs peuvent différer de celles de l’exemple.", "The figure is freely adjustable; its values may differ from the worked example."],
  blocked: ["Plein écran bloqué par l’application. Ouvrez le lien dans le navigateur, puis touchez ⛶.", "Full screen is blocked here. Open the page in the browser, then tap ⛶."],
  noMath: ["Les formules n’ont pas pu se charger : une connexion internet est nécessaire.", "Formulas could not load: an internet connection is required."],
};
const t = k => UI[k][lang];
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const COURSE = { stmg: "Terminale STMG", premiere: "Première", seconde: "Seconde", terminale: "Terminale" };
const SIZE_NARROW = 1500;

function fit() {
  const wrap = $("#wrap"), stage = $("#stage");
  if (matchMedia("(max-width:760px) and (orientation:portrait)").matches) { wrap.style.width = ""; wrap.style.height = ""; stage.style.transform = ""; return; }
  const k = Math.min(innerWidth / 1280, innerHeight / 720);
  wrap.style.width = 1280 * k + "px"; wrap.style.height = 720 * k + "px"; stage.style.transform = `scale(${k})`;
}

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 5000);
}

function shell() {
  $("#stage").innerHTML = `<div id="col"><div id="flow" tabindex="-1"></div><div id="live" hidden><div class="hd" id="live-lab"></div><div id="readout"></div></div></div>
<div id="rt"></div>
<div id="r1"><button class="b" id="step-prev">◀</button><span id="step-count"></span><button class="b" id="step-next">▶</button><button class="b" id="all-steps">Tout</button><span class="gap"></span><button class="b" id="pv">‹</button><span class="count" id="count"></span><button class="b" id="nx">›</button></div>
<div id="r2"><button class="b" id="rev" hidden></button><button class="b" id="lng"></button><button class="b" id="lst" aria-pressed="false"></button>${EXPORT ? "" : `<a class="b" id="dl" download></a>`}<button class="b" id="fs" title="Plein écran">⛶</button></div>
<div id="prog"><i></i></div><nav id="drawer" hidden></nav><div id="toast" hidden></div>`;
}

async function load() {
  if (EXPORT) deck = EXPORT.deck;
  else {
    try {
      const r = await fetch(`./data/${encodeURIComponent(deckId)}.json`);
      if (!r.ok) throw new Error(r.status);
      deck = await r.json();
    } catch {
      $("#stage").innerHTML = `<div id="col" class="wide"><h2 class="tt">${t("loadErr")}</h2><p><a class="b" href="../index.html#slides">${t("home")}</a></p></div>`;
      return;
    }
  }
  shell(); bind();
  const h = parseInt(location.hash.slice(1), 10);
  index = Number.isFinite(h) ? Math.min(Math.max(h, 0), deck.slides.length - 1) : 0;
  buildDrawer(); render();
}

function sizeClass(html) {
  const n = html.replace(/<[^>]+>/g, "").length + (html.match(/\\[(\[]/g) || []).length * 25 + (html.match(/<li>/g) || []).length * 70 + (html.match(/\\\\/g) || []).length * 45;
  return n > SIZE_NARROW ? "s4" : n > 1100 ? "s3" : n > 750 ? "s2" : n > 420 ? "s1" : "";
}
const tex = s => lang ? s.replace(/\\pgcd/g, "\\gcd").replace(/\\ppcm/g, "\\operatorname{lcm}") : s;

// Cumulative reveal: one block per sentence, list item, paragraph or table, shown step by step.
function revealMarkup(html) {
  const template = document.createElement("template"); template.innerHTML = html;
  const parts = []; let pending = "";
  const flush = () => { if (pending.trim()) parts.push(pending); pending = ""; };
  for (const node of template.content.childNodes) {
    if (node.nodeType === 1 && ["UL", "OL"].includes(node.tagName)) {
      flush(); [...node.children].forEach((li, i) => parts.push(`<${node.tagName.toLowerCase()} ${node.tagName === "OL" ? `start="${i + 1}"` : ""}>${li.outerHTML}</${node.tagName.toLowerCase()}>`));
    } else if (node.nodeType === 3) {
      const text = node.textContent; let start = 0, math = false;
      for (let i = 0; i < text.length; i++) {
        if (text.slice(i, i + 2) === "\\(" || text.slice(i, i + 2) === "\\[") math = true;
        if (text.slice(i, i + 2) === "\\)" || text.slice(i, i + 2) === "\\]") math = false;
        if (!math && text[i] === "." && /^\s+[A-ZÀ-Ý]/.test(text.slice(i + 1))) { pending += text.slice(start, i + 1); flush(); start = i + 1; }
      }
      pending += text.slice(start);
    } else if (node.nodeType === 1) {
      if (node.tagName === "BR") flush(); else if (["P", "DIV", "TABLE", "PRE"].includes(node.tagName)) { flush(); parts.push(node.outerHTML); } else pending += node.outerHTML;
    }
  }
  flush(); return (parts.length ? parts : [html]).map((part, i) => `<div class="reveal-block" data-reveal="${i + 1}">${part}</div>`).join("");
}

const blocks = () => [...document.querySelectorAll("#flow [data-reveal]")];
function paintSteps() {
  const all = blocks();
  all.forEach((b, i) => { b.hidden = i >= step; });
  const n = Math.max(all.length, 1);
  $("#step-count").textContent = all.length ? `${t("step")} ${Math.min(step, n)} / ${n}` : "";
  $("#step-prev").disabled = step <= 1 && index === 0; $("#step-next").disabled = step >= n && index === deck.slides.length - 1;
  $("#all-steps").classList.toggle("on", all.length > 0 && step >= all.length && all.length > 1);
  $("#all-steps").hidden = all.length < 2;
}
function advance(direction) {
  const n = blocks().length;
  if (direction > 0 && step < n) { step++; paintSteps(); const b = blocks()[step - 1]; b?.scrollIntoView({ block: "nearest", behavior: "instant" }); }
  else if (direction < 0 && step > 1) { step--; paintSteps(); }
  else go(index + direction, direction < 0);
}

function companion(spec, showDelta) {
  if (live) { live.destroy?.(); live = null; }
  $("#live").hidden = false; $("#live-lab").textContent = t("liveLab");
  live = mount({ ...spec, showDelta }, { host: $("#wcanvas"), controls: $("#wctl"), readout: $("#readout"), hint: $("#whint"), lang });
}

function figSrc(deckKey, name) { const file = `${deckKey}-${name}${lang ? "-en" : ""}.svg`; return EXPORT ? EXPORT.figs[file] || "" : `./fig/${encodeURIComponent(file)}`; }

async function render() {
  const renderId = ++generation;
  if (live) { live.destroy?.(); live = null; }
  const s = deck.slides[index], k = s.k, label = KIND[k]?.[lang] || k;
  document.documentElement.lang = lang ? "en" : "fr";
  document.title = `${deck.title[lang]} · Maths Explorer`;
  const title = esc(s.t[lang]), rawBody = tex(s.b[lang] || "");
  const widgets = deck.slides.filter(x => x.k === "widget"), shared = widgets[0];
  const ans = s.a ? tex(s.a[lang]) : "";
  const figs = (s.f || []).map(p => `<figure class="fig"><img src="${figSrc(deckId, p[lang])}" alt="${esc(s.t[lang])}"></figure>`).join("");
  const mode = k === "title" || k === "code" ? "none" : k === "widget" ? "widget" : figs ? "fig" : shared && k !== "goals" ? "explore" : "none";
  const col = $("#col"), flow = $("#flow"), rt = $("#rt");
  col.className = mode === "none" ? "wide" : ""; col.dataset.kind = k;
  $("#live").hidden = true; $("#readout").innerHTML = "";

  if (k === "title") {
    flow.innerHTML = `<div class="title-slide"><span class="chip">${esc(COURSE[deck.course] || "")}</span><h1>${title}</h1><div class="meta">${deck.slides.length} ${t("slides")}</div><div class="hint">${t("hint")}</div></div>`;
  } else if (k === "code") {
    flow.innerHTML = `<div class="hd">${esc(label)}</div><h2 class="tt">${title}</h2><pre>${s.b[lang]}</pre>`;
  } else {
    const cls = sizeClass(rawBody + ans);
    flow.innerHTML = `<div class="hd ${k === "error" ? "red" : ""}"><span>${esc(label)}</span><span class="deckname">${esc(deck.title[lang])}</span></div><h2 class="tt">${title}</h2>${s.h?.[lang] ? `<div class="sub">${esc(s.h[lang])}</div>` : ""}<div class="steps text ${cls}">${revealMarkup(rawBody)}</div>${ans ? `<div class="answer text ${cls}" id="ans" ${revealed ? "" : "hidden"}><div class="hd green">${t("answerLab")}</div>${ans}</div>` : ""}`;
  }

  if (mode === "fig") rt.innerHTML = `<div class="figcol">${figs}</div>`;
  else if (mode === "widget" || mode === "explore") {
    rt.innerHTML = `<div class="hint-line" id="whint"></div><div class="canvas-wrap" id="wcanvas"></div>${mode === "explore" ? `<label class="explore-label">${t("explore")}<select id="explore-choice">${widgets.map((w, i) => `<option value="${i}">${esc(w.t[lang])}</option>`).join("")}</select></label><p class="note">${t("free")}</p>` : ""}<div class="wctl" id="wctl"></div>`;
  } else rt.innerHTML = "";
  rt.hidden = mode === "none";

  chrome();
  const defined = deck.slides.findIndex(x => x.k === "concept" && /Discriminant/.test(x.t[0]));
  if (mode === "widget") companion(s.w, true);
  else if (mode === "explore") {
    companion(shared.w, defined < 0 || index >= defined);
    $("#explore-choice").onchange = e => companion(widgets[+e.target.value].w, true);
  }
  paintSteps(); flow.scrollTop = 0;
  try { history.replaceState(null, "", EXPORT ? `#${index}` : `?deck=${encodeURIComponent(deckId)}&lang=${lang ? "en" : "fr"}#${index}`); } catch {}
  try {
    if (typeof MathJax === "undefined") throw new Error("MathJax");
    await MathJax.startup.promise; await document.fonts.load('400 25px "STIX Two Text"');
    if (renderId === generation) { await MathJax.typesetPromise([$("#stage")]); $("#stage").querySelectorAll("mjx-assistive-mml").forEach(x => x.remove()); }
  } catch (e) { console.warn(e); if (renderId === generation && typeof MathJax === "undefined") toast(t("noMath")); }
}

function chrome() {
  const s = deck.slides[index], n = deck.slides.length;
  $("#count").textContent = `${index + 1} / ${n}`;
  $("#pv").disabled = index === 0; $("#nx").disabled = index === n - 1;
  $("#pv").setAttribute("aria-label", t("prev")); $("#nx").setAttribute("aria-label", t("next"));
  $("#step-prev").setAttribute("aria-label", t("stepPrev")); $("#step-next").setAttribute("aria-label", t("stepNext"));
  $("#all-steps").textContent = t("all");
  const rev = $("#rev"); rev.hidden = !s.a; rev.textContent = revealed ? t("hide") : t("answer"); rev.setAttribute("aria-pressed", revealed);
  $("#lng").textContent = t("lang"); $("#lst").textContent = t("list"); $("#fs").setAttribute("aria-label", t("full"));
  const dl = $("#dl"); if (dl) { dl.href = `./export/${encodeURIComponent(deckId)}.html`; dl.setAttribute("download", `${deckId}.html`); dl.textContent = "⬇ HTML"; dl.title = t("downloadTip"); dl.setAttribute("aria-label", t("downloadTip")); }
  $("#prog i").style.width = `${((index + 1) / n) * 100}%`;
  document.querySelectorAll("#drawer button").forEach((b, i) => b.toggleAttribute("aria-current", i === index));
}

function buildDrawer() {
  const d = $("#drawer");
  d.innerHTML = deck.slides.map((x, i) => `<button data-i="${i}">${i + 1}. ${esc((KIND[x.k]?.[lang] || x.k) + " · " + x.t[lang])}</button>`).join("");
  d.querySelectorAll("button").forEach(b => { b.onclick = () => { setDrawer(false); go(+b.dataset.i); }; });
}
function setDrawer(on) { $("#drawer").hidden = !on; $("#lst").setAttribute("aria-pressed", on); }

function go(i, toEnd = false) {
  index = Math.min(Math.max(i, 0), deck.slides.length - 1); revealed = false; step = 1;
  render().then(() => { if (toEnd) { step = Math.max(blocks().length, 1); paintSteps(); } });
}
function toggleAnswer() {
  if (!deck.slides[index].a) return;
  revealed = !revealed; $("#ans").hidden = !revealed;
  const b = $("#rev"); b.setAttribute("aria-pressed", revealed); b.textContent = revealed ? t("hide") : t("answer");
  if (revealed) $("#ans").scrollIntoView({ block: "nearest", behavior: "instant" });
}
function setLang(v) { lang = v; try { localStorage.setItem("me-slides-lang", lang ? "en" : "fr"); } catch {} buildDrawer(); render(); }

function bind() {
  $("#nx").onclick = () => go(index + 1); $("#pv").onclick = () => go(index - 1);
  $("#step-next").onclick = () => advance(1); $("#step-prev").onclick = () => advance(-1);
  $("#all-steps").onclick = () => { step = blocks().length; paintSteps(); };
  $("#lng").onclick = () => setLang(lang ? 0 : 1);
  $("#lst").onclick = () => setDrawer($("#drawer").hidden);
  $("#rev").onclick = toggleAnswer;
  $("#fs").onclick = () => {
    const de = document.documentElement;
    if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const rq = de.requestFullscreen || de.webkitRequestFullscreen;
    if (!rq) { toast(t("blocked")); return; }
    let r; try { r = rq.call(de); } catch (e) { toast(t("blocked")); return; }
    Promise.resolve(r).then(() => { try { screen.orientation.lock("landscape").catch(() => {}); } catch (e) {} }).catch(() => toast(t("blocked")));
  };
}
addEventListener("keydown", e => {
  if (!deck || e.target.closest?.("input,select,textarea,canvas,button,a")) return;
  const k = e.key;
  if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); advance(1); }
  else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); advance(-1); }
  else if (k === "Home") go(0); else if (k === "End") go(deck.slides.length - 1);
  else if (k === "r" || k === "R" || k === "ArrowDown") { e.preventDefault(); toggleAnswer(); }
  else if (k === "l" || k === "L") setLang(lang ? 0 : 1);
  else if (k === "g" || k === "G") setDrawer($("#drawer").hidden);
  else if (k === "f" || k === "F") $("#fs").click();
  else if (k === "Escape" && !$("#drawer").hidden) setDrawer(false);
});
addEventListener("hashchange", () => { const h = parseInt(location.hash.slice(1), 10); if (deck && Number.isFinite(h) && h !== index) go(h); });
document.addEventListener("fullscreenchange", () => setTimeout(fit, 100));
addEventListener("resize", fit); fit();
load();
