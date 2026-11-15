#!/usr/bin/env node
// Bundle one challenge folder into ONE self-contained HTML page that reproduces the challenge page of the site
// (statement, settings, activity, answer form, original statement, animated and written solution, extension),
// with the site's own CSS and fonts inlined and the ES modules served from blob URLs through an import map. Nothing is fetched at run time,
// so the page can be opened from disk, published as an Artifact for review, or loaded by check.mjs in Chromium.
//
// Usage: node .claude/skills/maths-explorer-challenge/scripts/preview.mjs <id> [--site <site dir>] [--out <file>]
//   <id>     the folder name under <site>/js/challenges/
//   --site   the hand-written web source (default: site/ of the repository this skill lives in)
//   --out    output file (default: <id>-preview.html in the current directory)
// The page is a review copy only: the site itself never loads it.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const id = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!id || !/^[a-z0-9-]+$/.test(id)) { console.error("usage: preview.mjs <id> [--site dir] [--out file]"); process.exit(2); }
const site = path.resolve(opt("--site", path.join(here, "../../../../site")));
const out = path.resolve(opt("--out", `${id}-preview.html`));
const folder = path.join(site, "js/challenges", id);
if (!existsSync(path.join(folder, "index.js"))) { console.error(`no ${folder}/index.js`); process.exit(2); }

/* ------------------------------------------------------------ modules */
// Collect every module reachable from the entry points by relative imports (static, re-exports, dynamic with a literal).
const SPEC = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']+)\2/g;
const modules = new Map();   // site-relative path -> source
function collect(rel) {
  if (modules.has(rel)) return;
  const file = path.join(site, rel);
  if (!existsSync(file)) throw new Error(`missing module ${rel}`);
  const src = readFileSync(file, "utf8");
  modules.set(rel, src);
  for (const m of src.matchAll(SPEC)) collect(path.posix.normalize(path.posix.join(path.posix.dirname(rel), m[3])));
}
const ENTRIES = [`js/challenges/${id}/index.js`, "js/challenges/common/player.js", "js/challenges/common/cartoon.js", "js/math.js"];
ENTRIES.forEach(collect);

/* ------------------------------------------------------------ styles and fonts */
// explorer.css (tokens, both themes, @imports) and pages.css (challenge page classes); fonts become data: URLs.
function css(rel, seen = new Set()) {
  if (seen.has(rel)) return ""; seen.add(rel);
  let s = readFileSync(path.join(site, rel), "utf8");
  s = s.replace(/@import\s+url\(["']?([^"')]+)["']?\);?/g, (_, u) => css(path.posix.join(path.posix.dirname(rel), u), seen));
  return s.replace(/url\((["']?)(\.\.\/fonts\/[^"')]+)\1\)/g, (m, q, u) => {
    const f = path.join(site, path.posix.join(path.posix.dirname(rel), u));
    return existsSync(f) ? `url(data:font/woff2;base64,${readFileSync(f).toString("base64")})` : m;
  });
}
const STYLE = css("styles/explorer.css") + "\n" + css("styles/pages.css");

/* ------------------------------------------------------------ page */
const json = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
const html = `<!doctype html>
<html lang="fr" data-theme="jour">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Challenge preview</title>
<style>${STYLE}</style>
<style>
  /* preview frame only (not part of the site) */
  .pv-bar { position: sticky; top: 0; z-index: 5; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 8px 16px; background: var(--surface); border-bottom: 1px solid var(--line); font-size: .9rem; }
  .pv-bar strong { margin-right: auto; }
  .pv-errors { margin: 12px 16px; padding: 10px 14px; border: 2px solid var(--neg, #c00); border-radius: 8px; white-space: pre-wrap; font: .85rem/1.4 ui-monospace, monospace; }
  .pv-errors:empty { display: none; }
  .page { max-width: 1100px; margin: 0 auto; padding: 16px; }
  .pv-settings { display: flex; flex-wrap: wrap; gap: 10px 16px; margin: 10px 0; }
  .pv-settings label { display: flex; gap: 6px; align-items: center; font-size: .95rem; }
</style>
</head>
<body>
<div class="pv-bar" role="toolbar" aria-label="Preview">
  <strong id="pv-name"></strong>
  <button class="btn-quiet" type="button" id="pv-lang">EN</button>
  <button class="btn-quiet" type="button" id="pv-theme">Nuit</button>
  <button class="btn-quiet" type="button" id="pv-motion" aria-pressed="false">Reduced motion</button>
</div>
<pre class="pv-errors" id="pv-errors" role="alert"></pre>
<div id="pv-root"></div>
<script>
  // Errors are shown on the page and kept in window.__previewErrors for check.mjs.
  window.__previewErrors = [];
  const report = (m) => { window.__previewErrors.push(String(m)); document.getElementById("pv-errors").textContent += m + "\\n"; };
  addEventListener("error", (e) => report(e.message + (e.filename ? " @ " + e.filename.slice(-40) + ":" + e.lineno : "")));
  addEventListener("unhandledrejection", (e) => report("unhandled: " + (e.reason?.stack || e.reason)));
</script>
<script>
// Modules: each source becomes a blob URL, its relative specifiers are rewritten to bare "mx/<path>" names, and an
// import map (added before any module runs) maps those names to the blobs. Resolution by name allows import cycles.
(() => {
  const SOURCES = ${json(Object.fromEntries(modules))};
  const join = (base, rel) => { const parts = base.split("/").slice(0, -1); for (const s of rel.split("/")) { if (s === "..") parts.pop(); else if (s !== ".") parts.push(s); } return parts.join("/"); };
  const imports = {};
  for (const [rel, src] of Object.entries(SOURCES)) {
    const code = src.replace(/(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s+)(["'])(\\.{1,2}\\/[^"']+)\\2/g, (m, a, q, sp) => a + q + "mx/" + join(rel, sp) + q);
    imports["mx/" + rel] = URL.createObjectURL(new Blob([code + "\\n//# sourceURL=" + rel], { type: "text/javascript" }));
  }
  const map = document.createElement("script"); map.type = "importmap"; map.textContent = JSON.stringify({ imports });
  document.currentScript.after(map);
})();
</script>
<script type="module">
const ID = ${json(id)};
const C = await import("mx/js/challenges/" + ID + "/index.js");
const { playSolution } = await import("mx/js/challenges/common/player.js");
const { cartoonPress, installCartoon } = await import("mx/js/challenges/common/cartoon.js");
const { isAnswer } = await import("mx/js/math.js");
window.__challenge = C;

let lang = "fr", reduced = false, stopAct = () => {}, sol = null;
const $ = (s) => document.querySelector(s), T = (pair) => pair[lang === "fr" ? 0 : 1], t = (fr, en) => (lang === "fr" ? fr : en);
const v = C.variant, q = Object.fromEntries(v.params.map((p) => [p.id, p.value]));
const normalise = () => { for (const p of v.params) if (p.kind === "int") { const n = Math.round(Number(q[p.id])); q[p.id] = Number.isFinite(n) ? Math.min(p.max, Math.max(p.min, n)) : p.value; } else if (typeof p.options[0][0] === "number") q[p.id] = Number(q[p.id]); };

function settings() {
  return v.params.map((p) => p.kind === "int"
    ? '<label>' + T(p.label) + ' <input type="number" data-var="' + p.id + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + q[p.id] + '"></label>'
    : '<label>' + T(p.label) + ' <select data-var="' + p.id + '">' + p.options.map((o) => '<option value="' + o[0] + '"' + (String(o[0]) === String(q[p.id]) ? " selected" : "") + '>' + (lang === "fr" ? o[1] : o[2]) + '</option>').join("") + '</select></label>').join("");
}
// Same markup and classes as app.js challengeDetail, so pages.css styles it as on the site.
function render() {
  stopAct(); sol?.stop();
  document.documentElement.lang = lang;
  const c = C.card, original = C.original ? C.original(q) : null;
  $("#pv-name").textContent = "Preview · " + c.id + " · " + (c.type === "play" ? t("Récréatif", "Recreational") : t("Olympiade", "Olympiad")) + " · " + "●".repeat(c.difficulty) + "○".repeat(3 - c.difficulty);
  $("#pv-lang").textContent = lang === "fr" ? "EN" : "FR";
  $("#pv-root").innerHTML = '<main id="main" class="page challenge-detail" tabindex="-1"><div class="challenge-columns"><article>'
    + '<span class="section-kicker">' + T(c.topic) + ' · ' + c.minutes + ' min</span><h1>' + T(c.title) + '</h1>'
    + '<p class="problem" id="problem">' + T(v.prompt(q)) + '</p>'
    + '<details class="variation"><summary>' + t("Modifier les données", "Change the data") + '</summary><div class="pv-settings">' + settings() + '</div></details>'
    + (typeof C.activity === "function" ? '<section class="activity" aria-labelledby="activity-title"><h2 id="activity-title">' + t("À toi d’explorer", "Explore it yourself") + '</h2><div id="activity"></div></section>' : "")
    + '<form id="challenge-form"><label for="challenge-answer">' + t("Ta réponse numérique", "Your numerical answer") + '</label><div class="answer-row"><input type="text" id="challenge-answer" required autocomplete="off" placeholder="' + t("Nombre ou fraction", "Number or fraction") + '"><button class="primary" type="submit">' + t("Vérifier", "Check") + '</button>'
    + (v.impossible ? '<button class="secondary" type="button" id="challenge-impossible">Impossible</button>' : "") + '</div><p id="challenge-feedback" class="feedback" role="status"></p></form>'
    + (original ? '<details class="original-statement"><summary>' + t("Énoncé d’origine", "Original statement") + '</summary><p class="problem original-q" id="original">' + T(original) + '</p><p class="muted">' + t("À traiter seul ou avec un enseignant : le site ne peut pas la vérifier.", "To work out alone or with a teacher: the site cannot check it.") + '</p></details>' : "")
    + '</article></div><section class="solution-wide"><details class="solution"><summary>' + t("Voir la solution expliquée", "See the worked solution") + '</summary>'
    + (C.diagram ? '<div id="solution-anim" class="sol-host"></div>' : "")
    + '<details class="written"><summary>' + t("Version écrite", "Written version") + '</summary><p id="solution-text">' + T(v.solution(q)) + '</p></details>'
    + '<div class="extension"><strong>' + t("Pour aller plus loin", "Take it further") + '</strong><p>' + T(c.extension) + '</p></div></details></section></main>';
  installCartoon();
  const host = $("#activity");
  if (host) { const inner = document.createElement("div"); host.replaceChildren(inner); stopAct = C.activity(inner, { t, lang, reduced: () => reduced, q: { ...q } }) || (() => {}); }
  // A scene replaces the drawing of the diagram but keeps its captions (registry.js SOLUTIONS).
  const def = C.diagram && (C.scene ? { ...C.diagram, ...C.scene, steps: C.scene.steps ?? C.diagram.steps, draw: undefined } : C.diagram);
  sol = def ? playSolution(def, $("#solution-anim"), { lang, reduced: () => reduced, params: { ...q } }) : null;
  window.__solution = sol;
  $(".solution").addEventListener("toggle", (e) => (e.target.open ? sol?.start() : sol?.stop()));
  cartoonPress($("#main"), () => reduced, "#challenge-form button");
  const check = (raw) => {
    const ok = isAnswer(raw, v.answer(q));
    $("#challenge-feedback").textContent = ok ? t("C’est la bonne valeur. Maintenant, justifie-la : la solution t’aide à comparer ton raisonnement.", "That is the correct value. Now justify it: use the solution to compare your reasoning.") : t("Pas encore.", "Not yet.");
    $("#challenge-feedback").classList.toggle("success", ok);
  };
  $("#challenge-form").addEventListener("submit", (e) => { e.preventDefault(); check($("#challenge-answer").value); });
  $("#challenge-impossible")?.addEventListener("click", () => check("0"));
  document.querySelectorAll("[data-var]").forEach((el) => el.addEventListener("change", () => { q[el.dataset.var] = el.value; normalise(); render(); $(".variation").open = true; }));
}
window.__setParams = (next) => { Object.assign(q, next); normalise(); render(); };   // used by check.mjs
window.__setLang = (l) => { lang = l; render(); };
$("#pv-lang").addEventListener("click", () => { lang = lang === "fr" ? "en" : "fr"; render(); });
$("#pv-theme").addEventListener("click", (e) => { const night = document.documentElement.dataset.theme !== "nuit"; document.documentElement.dataset.theme = night ? "nuit" : "jour"; e.target.textContent = night ? "Jour" : "Nuit"; });
$("#pv-motion").addEventListener("click", (e) => { reduced = !reduced; e.target.setAttribute("aria-pressed", String(reduced)); render(); });
render();
window.__previewReady = true;
</script>
</body>
</html>
`;
writeFileSync(out, html);
console.log(`${out}  (${modules.size} modules, ${(html.length / 1024).toFixed(0)} KiB)`);
