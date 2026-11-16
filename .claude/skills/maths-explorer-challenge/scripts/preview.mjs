#!/usr/bin/env node
// Bundle one challenge folder into ONE self-contained HTML page that reproduces the challenge page of the site
// (statement, settings, activity, answer form, original statement, animated and written solution, extension).
// Every source file is kept VERBATIM and readable in its own <script type="text/plain" data-path="..."> block; a small
// loader turns the blocks into modules (blob URLs and an import map), so nothing is fetched at run time. The page can be
// opened from disk, published as an Artifact, loaded by check.mjs, edited block by block, and split back into the
// repository with split.mjs (the blocks are the files).
//
// Usage: node .claude/skills/maths-explorer-challenge/scripts/preview.mjs <id> [--site <site dir>] [--out <file>] [--lite]
//   <id>     the folder name under <site>/js/challenges/
//   --site   the hand-written web source (default: site/ of the repository this skill lives in)
//   --out    output file (default: <id>-preview.html in the current directory)
//   --lite   no web fonts and only the style rules a challenge page uses (a light page, easy to copy and edit)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const id = args.find((a, i) => !a.startsWith("--") && !(i > 0 && ["--site", "--out"].includes(args[i - 1])));
if (!id || !/^[a-z0-9-]+$/.test(id)) { console.error("usage: preview.mjs <id> [--site dir] [--out file]"); process.exit(2); }
const site = path.resolve(opt("--site", path.join(here, "../../../../site")));
const out = path.resolve(opt("--out", `${id}-preview.html`)), lite = args.includes("--lite");
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
// the challenge's independent test travels with it (a text block, never run in the page)
const testFile = path.join(site, "..", "tests", `${id}.test.mjs`);
const extra = existsSync(testFile) ? [[`tests/${id}.test.mjs`, readFileSync(testFile, "utf8")]] : [];

/* ------------------------------------------------------------ styles and fonts */
// explorer.css (tokens, both themes, @imports) and pages.css (challenge page classes); fonts become data: URLs.
function css(rel, seen = new Set()) {   // fonts become data: URLs unless --lite
  if (seen.has(rel)) return ""; seen.add(rel);
  let s = readFileSync(path.join(site, rel), "utf8");
  s = s.replace(/@import\s+url\(["']?([^"')]+)["']?\);?/g, (_, u) => css(path.posix.join(path.posix.dirname(rel), u), seen));
  if (lite) return s;
  return s.replace(/url\((["']?)(\.\.\/fonts\/[^"')]+)\1\)/g, (m, q, u) => {
    const f = path.join(site, path.posix.join(path.posix.dirname(rel), u));
    return existsSync(f) ? `url(data:font/woff2;base64,${readFileSync(f).toString("base64")})` : m;
  });
}
// --lite: drop @font-face and keep only the rules whose selectors a challenge page uses (nested @media blocks too)
const KEEP = /(:root|html|body|\*|main|\bh[1-3]\b|\bp\b|button|input|select|label|details|summary|svg|\.page|challenge|activity|act-|sol-|solution|written|extension|variation|var-|answer-row|feedback|original|open-note|problem|section-kicker|btn|toy-handle|\.hit|primary|secondary|muted|sr-only|cartoon|focus|data-theme)/;
function liteCss(src) {
  src = src.replace(/@font-face\s*{[^}]*}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  let out = "", i = 0;
  while (i < src.length) {
    const open = src.indexOf("{", i); if (open < 0) break;
    const head = src.slice(i, open).trim();
    let depth = 1, j = open + 1; while (j < src.length && depth) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
    const body = src.slice(open + 1, j - 1);
    if (head.startsWith("@media") || head.startsWith("@supports")) { const inner = liteCss(body); if (inner.trim()) out += `${head}{${inner}}\n`; }
    else if (head.startsWith("@keyframes") || KEEP.test(head)) out += `${head}{${body}}\n`;
    i = j;
  }
  return out;
}
const FULL = css("styles/explorer.css") + "\n" + css("styles/pages.css");
const STYLE = lite ? liteCss(FULL) : FULL;

/* ------------------------------------------------------------ page */
const json = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
const html = `<!doctype html>
<!-- Maths Explorer challenge page, handoff format (AGENT_BRIEF.md of the skill maths-explorer-challenge).
     Each text block below (a script of type text/plain whose data-path names a file) is one file of the site: edit the blocks of the
     challenge's folder js/challenges/<id>/ and its test tests/<id>.test.mjs; leave js/challenges/common/ and
     js/math.js as they are. The page runs as it is: open it, press Solution and Self-check. -->
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
  <button class="btn-quiet" type="button" id="pv-solution">Solution ▶</button>
  <button class="btn-quiet" type="button" id="pv-check">Self-check</button>
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
${[...modules, ...extra].map(([rel, src]) => `<script type="text/plain" data-path="${rel}">\n${src.replace(/<\/script/gi, "<\\/script")}</script>`).join("\n")}
<script>
// Loader: each text block becomes a module (blob URL); its relative imports are rewritten to bare "mx/<path>" names,
// and an import map, added before any module runs, maps those names to the blobs. Resolution by name allows cycles.
(() => {
  const join = (base, rel) => { const parts = base.split("/").slice(0, -1); for (const s of rel.split("/")) { if (s === "..") parts.pop(); else if (s !== ".") parts.push(s); } return parts.join("/"); };
  const imports = {};
  for (const block of document.querySelectorAll('script[type="text/plain"][data-path^="js/"]')) {
    const rel = block.dataset.path, src = block.textContent.replace(/^\\n/, "").replace(/<\\\\\\/script/gi, "<\\/script");
    const code = src.replace(/(\\bfrom\\s*|\\bimport\\s*\\(\\s*|\\bimport\\s+)(["'])(\\.{1,2}\\/[^"']+)\\2/g, (m, a, q, sp) => a + q + "mx/" + join(rel, sp) + q);
    imports["mx/" + rel] = URL.createObjectURL(new Blob([code + "\\n//# sourceURL=" + rel], { type: "text/javascript" }));
  }
  const map = document.createElement("script"); map.type = "importmap"; map.textContent = JSON.stringify({ imports });
  document.currentScript.after(map);
})();
</script>
<script type="module">
// the challenge is the folder whose index.js is in the blocks (so renaming the blocks renames the challenge)
const ID = [...document.querySelectorAll('script[type="text/plain"][data-path]')].map((b) => b.dataset.path.match(/^js\\/challenges\\/([^/]+)\\/index\\.js$/)?.[1]).find((x) => x && x !== "common");
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
  document.title = T(c.title);
  $("#pv-name").textContent = "Preview · " + c.id + " · " + (c.type === "play" ? t("Récréatif", "Recreational") : t("Olympiade", "Olympiad")) + " · " + "●".repeat(c.difficulty) + "○".repeat(3 - c.difficulty);
  $("#pv-lang").textContent = lang === "fr" ? "EN" : "FR";
  $("#pv-root").innerHTML = '<main id="main" class="page challenge-detail" tabindex="-1"><div class="challenge-columns"><article>'
    + '<span class="section-kicker">' + T(c.topic) + ' · ' + c.minutes + ' min</span><h1>' + T(c.title) + '</h1>'
    + '<p class="problem" id="problem">' + T(v.prompt(q)) + '</p>'
    + '<details class="variation"><summary>' + t("Modifier les données", "Change the data") + '</summary><div class="pv-settings">' + settings() + '</div></details>'
    + (typeof C.activity === "function" ? '<section class="activity" aria-labelledby="activity-title"><h2 id="activity-title">' + t("À toi d’explorer", "Explore it yourself") + '</h2><div id="activity"></div></section>' : "")
    + (v.open ? '<p class="open-note">' + t("Défi ouvert : le site ne vérifie pas ta réponse. Cherche, rédige, discutes-en avec d’autres, puis compare avec la solution.", "Open challenge: the site does not check your answer. Think, write it up, talk it over with others, then compare with the solution.") + '</p>' : '<form id="challenge-form"><label for="challenge-answer">' + t("Ta réponse numérique", "Your numerical answer") + '</label><div class="answer-row"><input type="text" id="challenge-answer" required autocomplete="off" placeholder="' + t("Nombre ou fraction", "Number or fraction") + '"><button class="primary" type="submit">' + t("Vérifier", "Check") + '</button>'
    + (v.impossible ? '<button class="secondary" type="button" id="challenge-impossible">Impossible</button>' : "") + '</div><p id="challenge-feedback" class="feedback" role="status"></p></form>')
    + (original ? '<details class="original-statement"><summary>' + t("Jusqu’à la preuve", "All the way to a proof") + '</summary><p class="problem original-q" id="original">' + T(original) + '</p><p class="muted">' + t("À traiter seul ou avec d’autres : le site ne vérifie pas cette partie.", "To work out alone or with others: the site does not check this part.") + '</p></details>' : "")
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
  $("#challenge-form")?.addEventListener("submit", (e) => { e.preventDefault(); check($("#challenge-answer").value); });
  $("#challenge-impossible")?.addEventListener("click", () => check("0"));
  document.querySelectorAll("[data-var]").forEach((el) => el.addEventListener("change", () => { q[el.dataset.var] = el.value; normalise(); render(); $(".variation").open = true; }));
}
window.__setParams = (next) => { Object.assign(q, next); normalise(); render(); };   // used by check.mjs
window.__setLang = (l) => { lang = l; render(); };
$("#pv-lang").addEventListener("click", () => { lang = lang === "fr" ? "en" : "fr"; render(); });
// Self-check (the browser half of check.mjs, for when no repository is at hand): every combination of the parameters
// (at most 12), both languages: the activity draws, every solution step shows something, the answer is a whole number;
// a solution where nothing moves is noted (motion is a teaching choice, not a rule).
async function selfCheck() {
  const pools = v.params.map((p) => (p.kind === "int" ? [...new Set([p.min, p.max, p.value])] : p.options.map((o) => o[0])));
  let combos = pools.reduce((acc, pool) => acc.flatMap((a) => pool.map((x) => [...a, x])), [[]]).map((c) => Object.fromEntries(v.params.map((p, i) => [p.id, c[i]])));
  if (combos.length > 12) combos = combos.filter((_, i) => i % Math.ceil(combos.length / 12) === 0);
  const problems = [], notes = [], keep = { ...q }, keepLang = lang;
  for (const L of ["fr", "en"]) for (const c of combos) {
    lang = L; Object.assign(q, c); normalise(); render(); await new Promise((ok) => setTimeout(ok, 30));
    const tag = L + " " + JSON.stringify(c);
    if (typeof C.activity === "function" && !document.querySelector("#activity *")) problems.push(tag + ": the activity draws nothing");
    if (!sol) problems.push(tag + ": no animated solution (index.js must export diagram, and scene for a cartoon)");
    else {
      let moving = 0;
      for (let k = 0; k < sol.steps; k++) {
        const snap = (p) => { sol.seek(k, p); return document.querySelector("#solution-anim svg").innerHTML; };
        if (!snap(1)) problems.push(tag + ": solution step " + (k + 1) + " is empty");
        if (snap(0.05) !== snap(0.95)) moving++;
      }
      if (!moving) notes.push(tag + ": no step of the solution moves (fine only if motion would not help understanding)");
    }
    const a = v.answer(q); if (!Number.isInteger(a) || a < 0 || !isAnswer(String(a), a)) problems.push(tag + ": answer " + a + " is not a whole number >= 0");
  }
  lang = keepLang; Object.assign(q, keep); render();
  const box = document.getElementById("pv-errors");
  box.textContent = [...(problems.length ? ["Self-check: " + problems.length + " problem(s)", ...new Set(problems)] : []), ...new Set(notes)].join("\\n");
  window.__selfCheck = problems;
  $("#pv-check").textContent = problems.length ? "Self-check: " + problems.length + " ✗" : "Self-check: OK ✓";
  return problems;
}
window.__runSelfCheck = selfCheck;
$("#pv-check").addEventListener("click", selfCheck);
$("#pv-solution").addEventListener("click", () => { const d = $(".solution"); d.open = true; d.scrollIntoView({ behavior: "smooth" }); sol?.start(); });
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
