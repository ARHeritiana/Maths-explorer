#!/usr/bin/env node
// Contract check of one challenge folder, before or after it is registered. Two passes:
//  1. Node: shape of card / variant / original / icon / diagram, every parameter combination, owner text rules.
//  2. Chromium (skipped with --no-browser): the bundled preview (preview.mjs) in both languages, every combination
//     (capped), the activity mounted, every solution step drawn at p = 0, 0.5, 1, the answer form, no console error,
//     no horizontal overflow at 390 px; screenshots at 390 and 1280 px when --shots <dir> is given.
// Usage: node .claude/skills/maths-explorer-challenge/scripts/check.mjs <id> [--site dir] [--no-browser] [--shots dir]
// Exit code 1 if any ERROR. WARN lines are for the author to judge.
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../../../..");
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const id = args.find((a, i) => !a.startsWith("--") && !(i > 0 && ["--site", "--shots"].includes(args[i - 1])));
if (!id) { console.error("usage: check.mjs <id> [--site dir] [--no-browser] [--shots dir]"); process.exit(2); }
const site = path.resolve(opt("--site", path.join(repo, "site"))), folder = path.join(site, "js/challenges", id);
// Messages are deduplicated with their parameter tag removed, so one fault seen in every combination prints once.
const errors = [], warns = [], seen = new Set();
const add = (list) => (m) => { const key = m.replace(/\{[^}]*\}/g, "{q}").replace(/\b(fr|en) /g, "").replace(/\d+px/g, ""); if (!seen.has(key)) { seen.add(key); list.push(m); } };
const E = add(errors), W = add(warns);

/* ---------------------------------------------------------------- 1. Node */
const C = await import(pathToFileURL(path.join(folder, "index.js")).href);
const isPair = (x) => Array.isArray(x) && x.length === 2 && x.every((s) => typeof s === "string" && s.trim().length > 0);
const { card, variant: v, original, icon, diagram, scene, activity } = C;

if (!card) E("index.js exports no `card`");
else {
  if (card.id !== id) E(`card.id is "${card.id}", folder is "${id}"`);
  if (!["play", "olympiad"].includes(card.type)) E(`card.type must be "play" or "olympiad", got ${card.type}`);
  for (const k of ["title", "topic", "extension"]) if (!isPair(card[k])) E(`card.${k} must be a non-empty [fr, en] pair`);
  if (![1, 2, 3].includes(card.difficulty)) E("card.difficulty must be 1, 2 or 3");
  if (!Number.isInteger(card.minutes) || card.minutes < 1) E("card.minutes must be a positive integer");
  if ("hints" in card || "hintActions" in C || "hintActions" in card) E("hints / hintActions are forbidden (owner rule, 13 November 2026)");
}
if (typeof activity !== "function") E("index.js must re-export `activity` (activity.js)");
if (!diagram) E("index.js must re-export `diagram` (solution.js)");
if (typeof original !== "function") E("index.js must export `original(q)` returning a [fr, en] pair");
if (typeof icon !== "string" || !icon.startsWith('<svg class="ci"')) E("`icon` must be built with svg() from common/icon.js");

let combos = [];
if (!v) E("index.js exports no `variant`");
else {
  if ("hints" in v) E("variant.hints is forbidden (owner rule)");
  for (const k of ["answer", "prompt", "solution"]) if (typeof v[k] !== "function") E(`variant.${k} must be a function of q`);
  if (!Array.isArray(v.params) || !v.params.length) E("variant.params must list at least one parameter (int() or choice())");
  const ids = new Set();
  for (const p of v.params || []) {
    if (ids.has(p.id)) E(`duplicate parameter id ${p.id}`); ids.add(p.id);
    if (!isPair(p.label)) E(`param ${p.id}: label must be a [fr, en] pair`);
    if (p.kind === "int") { if (!(p.min <= p.value && p.value <= p.max) || (p.value - p.min) % p.step) E(`param ${p.id}: default ${p.value} outside min/max/step`); }
    else if (p.kind === "choice") {
      if (!p.options?.length || !p.options.every((o) => o.length === 3)) E(`param ${p.id}: options must be [value, fr, en]`);
      else if (!p.options.some((o) => String(o[0]) === String(p.value))) E(`param ${p.id}: default ${p.value} is not an option`);
      if (p.options && new Set(p.options.map((o) => typeof o[0])).size > 1) E(`param ${p.id}: option values must all be numbers or all strings`);
    } else E(`param ${p.id}: kind must be "int" or "choice"`);
  }
  // the same pools as tests/challenges-variants.test.mjs
  const pools = (v.params || []).map((p) => (p.kind === "int" ? [...new Set([p.min, p.max, p.value, p.min + p.step * Math.round((p.max - p.min) / 2 / p.step)])] : (p.options || []).map((o) => o[0])));
  combos = pools.reduce((acc, pool) => acc.flatMap((a) => pool.map((x) => [...a, x])), [[]]).map((c) => Object.fromEntries(v.params.map((p, i) => [p.id, c[i]])));
  if (combos.length > 400) W(`${combos.length} parameter combinations: the variants test walks them all; keep it small`);
}

// owner text rules: no em/en dash in visible text; high-school wording (banned list of tests/challenge-jargon.test.mjs)
const jargonFile = path.join(repo, "tests/challenge-jargon.test.mjs");
const BANNED = existsSync(jargonFile) ? [...readFileSync(jargonFile, "utf8").match(/export const BANNED = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const banned = BANNED.map((w) => [w, /^group/.test(w) ? new RegExp(`(^|[^a-z])${strip(w)}`) : new RegExp(strip(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))]);
const jargon = (s) => banned.filter(([, re]) => re.test(strip(s))).map(([w]) => w);
const textCheck = (where, s, { strict }) => {
  if (/[\u2014\u2013]/.test(s)) E(`${where}: em or en dash in visible text`);
  if (/undefined|NaN|Infinity|null|\[object/.test(s)) E(`${where}: "${s.slice(0, 80)}..." contains undefined/NaN/null`);
  const j = jargon(s); if (j.length) (strict ? E : W)(`${where}: jargon ${j.join(", ")}${strict ? " (fails tests/challenge-jargon.test.mjs)" : ""}`);
  if (/https?:|arxiv|\[VERIFY\]/i.test(s)) E(`${where}: URL or citation in visible text`);
};
if (card) for (const k of ["title", "topic", "extension"]) card[k]?.forEach((s, i) => { if (/[\u2014\u2013]/.test(s)) E(`card.${k}[${i}]: em or en dash`); });
let zero = false;
for (const q of combos) {
  const tag = JSON.stringify(q);
  try {
    const a = v.answer(q); if (!Number.isInteger(a) || a < 0) E(`answer ${tag} = ${a}: must be an integer >= 0 (0 = impossible)`); if (a === 0) zero = true;
    const pr = v.prompt(q), so = v.solution(q), or = original?.(q);
    if (!isPair(pr) || pr.some((s) => s.length < 20)) E(`prompt ${tag}: [fr, en] of at least 20 characters`);
    if (!isPair(so) || so.some((s) => s.length < 20)) E(`solution ${tag}: [fr, en] of at least 20 characters`);
    if (!isPair(or)) E(`original ${tag}: must return a [fr, en] pair`);
    pr?.forEach((s, i) => { textCheck(`prompt${tag}[${i}]`, s, { strict: false }); if (/impossible/i.test(s)) W(`prompt${tag}[${i}] mentions "impossible": the neutral button must not be announced`); });
    so?.forEach((s, i) => textCheck(`solution${tag}[${i}]`, s, { strict: true }));
    or?.forEach((s, i) => textCheck(`original${tag}[${i}]`, s, { strict: false }));
    const st = diagram?.steps?.(q);
    if (!Array.isArray(st) || st.length < 2 || !st.every(isPair)) E(`diagram.steps ${tag}: at least 2 [fr, en] captions`);
    else st.forEach((s, k) => s.forEach((x, i) => textCheck(`step ${k}${tag}[${i}]`, x, { strict: false })));
    if (scene?.steps) { const ss = scene.steps(q); if (ss.length !== st.length) W("scene.steps and diagram.steps differ in length"); }
  } catch (e) { E(`${tag}: ${e.stack?.split("\n").slice(0, 3).join(" | ")}`); }
}
if (zero && !v.impossible) W("some answer is 0: if 0 means \"impossible\", set variant.impossible = true (a genuine 0, as in Königsberg, needs nothing)");
if (v?.impossible && !zero) W("variant.impossible is set but no tested combination is impossible");
if (diagram) {
  if (!Array.isArray(diagram.size) || diagram.size.length !== 2) E("diagram.size must be [width, height]");
  const sc = scene || (diagram.mount ? diagram : null);   // a scene may also live inside the diagram itself (bridge)
  if (!sc && typeof diagram.draw !== "function") E("diagram needs draw(c, step, p, q), or a `scene` { mount, update }");
  if (sc && (typeof sc.mount !== "function" || typeof sc.update !== "function")) E("scene needs mount(c, q) and update(S, step, p, q)");
}
// files of the folder must import only from the folder, common/, or site/js (no network, no bare specifiers)
for (const f of ["index.js", "maths.js", "activity.js", "solution.js", "art.js", "view-3d.js"]) {
  const file = path.join(folder, f); if (!existsSync(file)) { if (["index.js", "activity.js", "solution.js"].includes(f)) E(`missing ${f}`); continue; }
  const src = readFileSync(file, "utf8");
  const IMPORT = /^\s*(?:import|export)\b[^;"'`]*?\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/gm;
  for (const m of src.matchAll(IMPORT)) { const spec = m[1] || m[2] || m[3]; if (!spec.startsWith(".")) E(`${f}: import "${spec}" is not relative (no bare or remote modules)`); }
  if (/\b(fetch|XMLHttpRequest|localStorage)\b/.test(src)) W(`${f}: uses fetch / XMLHttpRequest / localStorage`);
  if (f === "maths.js" && /\bdocument\b|\bwindow\b/.test(src)) E("maths.js must be pure (no document / window)");
  // controls that hand over the idea belong in the animated solution (references/design.md section 1)
  if (f === "activity.js") {
    // only the text a learner can see: string literals, without comments and module paths
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
    const visible = [...code.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g)].map((m) => m[2]).filter((x) => !/\.js$/.test(x)).join(" ");
    const give = visible.match(/astuce|indice|\bhints?\b|pire cas|worst case|optimal|meilleur coup|best move|\bsolution\b|simulations/gi); if (give) W(`activity.js mentions ${[...new Set(give.map((x) => x.toLowerCase()))].join(", ")}: no control may give the idea away`);
  }
  if (!src.startsWith("//")) W(`${f}: should open with a one-line comment saying what the file holds`);
}
if (!existsSync(path.join(folder, "maths.js"))) W("no maths.js: fine only if the answer needs no computation");

/* ---------------------------------------------------------------- 2. Chromium */
if (!args.includes("--no-browser") && !errors.length) {
  let chromium;
  try { chromium = createRequire(import.meta.url)("playwright").chromium; } catch { W("playwright not found: browser pass skipped"); }
  if (chromium) {
    const page_ = path.join(os.tmpdir(), `challenge-check-${id}.html`);
    execFileSync(process.execPath, [path.join(here, "preview.mjs"), id, "--site", site, "--out", page_], { stdio: "ignore" });
    const shots = opt("--shots"); if (shots) mkdirSync(shots, { recursive: true });
    const browser = await chromium.launch();
    for (const width of [390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      page.on("console", (m) => { if (m.type() === "error") E(`console (${width}px): ${m.text()}`); });
      page.on("pageerror", (e) => E(`page error (${width}px): ${e.message}`));
      await page.goto(pathToFileURL(page_).href);
      await page.waitForFunction(() => window.__previewReady || window.__previewErrors.length, null, { timeout: 15000 }).catch(() => {});
      if (!(await page.evaluate(() => !!window.__previewReady))) { E(`preview did not start (${width}px): ${await page.evaluate(() => window.__previewErrors.join(" | "))}`); await page.close(); continue; }
      const sample = combos.length <= 12 ? combos : combos.filter((_, i) => i % Math.ceil(combos.length / 12) === 0);
      for (const lang of ["fr", "en"]) for (const q of sample) {
        const tag = `${lang} ${JSON.stringify(q)} ${width}px`;
        const r = await page.evaluate(async ([lang, q]) => {
          window.__setLang(lang); window.__setParams(q);
          await new Promise((ok) => setTimeout(ok, 60));
          const act = document.querySelector("#activity");
          const out = { act: act ? act.querySelectorAll("*").length : -1, goal: !!act?.querySelector(".goal"), frames: [], overflow: document.documentElement.scrollWidth > innerWidth + 1 };
          const s = window.__solution;
          if (s) for (let k = 0; k < s.steps; k++) for (const p of [0, 0.5, 1]) { s.seek(k, p); out.frames.push(document.querySelectorAll("#solution-anim svg *").length); }
          document.querySelector("#challenge-answer").value = String(window.__challenge.variant.answer(q));
          document.querySelector("#challenge-form button.primary").click();
          out.ok = document.querySelector("#challenge-feedback").classList.contains("success");
          return out;
        }, [lang, q]);
        if (r.act === 0) E(`${tag}: the activity drew nothing`);
        if (r.act > 0 && !r.goal) W(`${tag}: no goalLine() at the top of the activity`);
        // frames are [p=0, p=0.5, p=1] per step; a step may fade in from nothing, but its end frame must show something
        r.frames.forEach((n, i) => { if (n === 0 && i % 3 === 2) E(`${tag}: solution step ${(i - 2) / 3} is empty at p = 1`); });
        if (!r.ok) E(`${tag}: the expected answer is not accepted by the form`);
        if (r.overflow) E(`${tag}: horizontal overflow`);
      }
      if (shots) {
        await page.evaluate(([q]) => { window.__setLang("fr"); window.__setParams(q); }, [Object.fromEntries(v.params.map((p) => [p.id, p.value]))]);
        await page.screenshot({ path: path.join(shots, `${id}-${width}-page.png`), fullPage: true });
        await page.evaluate(() => { document.querySelector(".solution").open = true; window.__solution?.seek(window.__solution.steps - 1, 1); });
        await page.locator("#solution-anim").screenshot({ path: path.join(shots, `${id}-${width}-solution-last.png`) }).catch(() => {});
      }
      await page.close();
    }
    await browser.close();
  }
}

for (const m of warns) console.log("WARN  " + m);
for (const m of errors) console.log("ERROR " + m);
console.log(`${id}: ${combos.length} combinations, ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
