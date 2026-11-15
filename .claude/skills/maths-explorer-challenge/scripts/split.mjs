#!/usr/bin/env node
// Put a challenge delivered by any agent into the repository. Two delivery formats (AGENT_BRIEF.md):
//  - a page made from assets/standalone/challenge.html: each <script type="text/plain" data-path="js/..."> block is a file;
//  - a text or Markdown bundle: each fenced code block is a file, its path given in the fence line
//    (```js js/challenges/<id>/index.js) or on the line just above it (a heading, a bold line or `code`).
// Paths js/... go under site/ (site/js/... is accepted too); tests/<name>.test.mjs goes to the repository's tests/.
// Files of the challenge's own folder and its test are written (new or changed). Shared files (common/, math.js) are
// only compared and reported, never overwritten, unless --shared is given.
// Usage: node .claude/skills/maths-explorer-challenge/scripts/split.mjs <page.html | bundle.md> [--site <site dir>] [--shared] [--dry]
// Run it once per repository (Maths-explorer, then Matematika with --site <its site/>).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const input = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1] === "--site"));
if (!input) { console.error("usage: split.mjs <page.html | bundle.md> [--site dir] [--shared] [--dry]"); process.exit(2); }
const site = path.resolve(opt("--site", path.join(here, "../../../../site"))), repo = path.dirname(site);
const dry = args.includes("--dry"), shared = args.includes("--shared");
const text = readFileSync(input, "utf8");

const PATH = /((?:site\/)?js\/[\w./-]+\.js|tests\/[\w.-]+\.test\.mjs)/;
const clean = (p) => p.replace(/^site\//, "");
let files = [...text.matchAll(/<script type="text\/plain" data-path="((?:js|tests)\/[^"]+)">\n?([\s\S]*?)<\/script>/g)].map((m) => [clean(m[1]), m[2].replace(/<\\\/script/gi, "</script")]);
if (!files.length) {   // a bundle: fenced blocks
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^(```+|~~~+)(.*)$/);
    if (!fence) continue;
    let end = i + 1; while (end < lines.length && !lines[end].startsWith(fence[1])) end++;
    let p = fence[2].match(PATH)?.[1];
    if (!p) { let k = i - 1; while (k >= 0 && !lines[k].trim()) k--; p = k >= 0 ? lines[k].match(PATH)?.[1] : null; }
    if (p) files.push([clean(p), lines.slice(i + 1, end).join("\n") + "\n"]);
    i = end;
  }
}
if (!files.length) { console.error("no files found: expected data-path blocks, or fenced code blocks labelled with their path"); process.exit(1); }
const id = files.map(([p]) => p.match(/^js\/challenges\/([^/]+)\/index\.js$/)?.[1]).find((x) => x && x !== "common");
if (!id) { console.error("no js/challenges/<id>/index.js among the files"); process.exit(1); }
for (const [rel, src] of files) {
  if (rel.includes("..") || !PATH.test(rel)) { console.error(`refused path ${rel}`); process.exit(1); }
  const file = rel.startsWith("tests/") ? path.join(repo, rel) : path.join(site, rel);
  const mine = rel.startsWith(`js/challenges/${id}/`) || rel === `tests/${id}.test.mjs`, before = existsSync(file) ? readFileSync(file, "utf8") : null;
  const state = before === null ? "new" : before === src ? "same" : "changed";
  if (state === "same") continue;
  if (!mine && !shared) { console.log(`${state.padEnd(7)} ${rel}  (shared file: not written; review it, then rerun with --shared to write it)`); continue; }
  console.log(`${state.padEnd(7)} ${rel}${dry ? "  (dry run)" : ""}`);
  if (!dry) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, src); }
}
if (!files.some(([p]) => p === `tests/${id}.test.mjs`)) console.log(`no tests/${id}.test.mjs delivered: write the independent test (references/integration.md)`);
console.log(`challenge "${id}": next, check.mjs ${id}, the registration edits of references/integration.md, then the same in the other repository`);
