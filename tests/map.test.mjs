// MAP.md and the folder indexes (CLAUDE.md) tell agents which files a task needs. They must name every source file and
// name only files that exist, so the map cannot drift from the code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const files = (dir, keep = () => true) => readdirSync(join(ROOT, dir)).filter((f) => statSync(join(ROOT, dir, f)).isFile() && keep(f)).map((f) => `${dir}/${f}`);
const notIndex = (f) => f !== "CLAUDE.md" && f !== "AGENTS.md";

// Each area: its source files and the index that must name them (MAP.md counts for every area).
const AREAS = {
  "site/CLAUDE.md": [...files("site", (f) => f.endsWith(".html")), ...files("site/js"), ...files("site/styles"), ...files("site/slides"), ...files("site/resources")],
  "site/js/challenges/CLAUDE.md": [...files("site/js/challenges", notIndex), ...files("site/js/challenges/common")],
  "build/mxbuild/CLAUDE.md": files("build/mxbuild", (f) => f.endsWith(".py")),
  "scripts/CLAUDE.md": files("scripts", notIndex),
  "tests/CLAUDE.md": files("tests", notIndex),
};
const INDEXES = ["MAP.md", ...Object.keys(AREAS), "content/CLAUDE.md", "docs/CLAUDE.md",
  ...files(".claude/skills/maths-explorer-tasks"), ...files(".claude/skills/maths-explorer-tasks/references")];

test("every source file is named in MAP.md or in its folder index", () => {
  const map = read("MAP.md");
  const missing = [];
  for (const [index, list] of Object.entries(AREAS)) {
    const text = map + read(index);
    for (const f of list) {
      const base = f.split("/").pop();
      if (!text.includes(base)) missing.push(`${f} (add it to ${index})`);
    }
  }
  assert.deepEqual(missing, []);
});

test("every path named in the map, the indexes and the task recipes exists", () => {
  const missing = [];
  for (const index of INDEXES) {
    const dir = dirname(index);
    for (const [, token] of read(index).matchAll(/`([^`\s]+)`/g)) {
      const path = token.replace(/[),.:;]+$/, "");
      // Only literal repository paths: skip placeholders, globs, symbols and commands.
      if (!/^[\w./-]+$/.test(path) || !path.includes("/") || path.startsWith("http") || path.includes("..")) continue;
      if (!/\.[a-z]{1,5}$|\/$/.test(path)) continue;
      const bases = [ROOT, join(ROOT, dir), join(ROOT, "site"), join(ROOT, "content")];
      if (!bases.some((b) => existsSync(join(b, path)))) missing.push(`${index}: ${path}`);
    }
  }
  assert.deepEqual(missing, [], "paths named in an index that do not exist (update the index)");
});

test("the folder indexes are never published", () => {
  assert.ok(!existsSync(join(ROOT, "dist", "CLAUDE.md")), relative(ROOT, join(ROOT, "dist", "CLAUDE.md")));
});

// One folder per challenge: the folder holds only the files of the convention, and registry.js lists every folder.
const ROLE_FILES = new Set(["index.js", "maths.js", "activity.js", "solution.js", "view-3d.js", "art.js"]);
test("every challenge folder follows the convention and is listed in registry.js", () => {
  const dir = join(ROOT, "site/js/challenges"), registry = read("site/js/challenges/registry.js");
  const folders = readdirSync(dir).filter((f) => f !== "common" && statSync(join(dir, f)).isDirectory());
  assert.ok(folders.length > 0);
  for (const id of folders) {
    const own = readdirSync(join(dir, id));
    assert.ok(own.includes("index.js"), `${id}/index.js`);
    assert.deepEqual(own.filter((f) => !ROLE_FILES.has(f)), [], `${id}/ holds files outside the convention (site/js/challenges/CLAUDE.md)`);
    assert.match(read(`site/js/challenges/${id}/index.js`), new RegExp(`id: "${id}"`), `${id}/index.js card id matches its folder`);
    assert.ok(registry.includes(`from "./${id}/index.js"`), `registry.js imports ${id}`);
  }
});
