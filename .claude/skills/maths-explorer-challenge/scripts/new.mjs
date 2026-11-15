#!/usr/bin/env node
// Create site/js/challenges/<id>/ and tests/<id>.test.mjs from the template (a working handshakes example to rewrite).
// Usage: node .claude/skills/maths-explorer-challenge/scripts/new.mjs <id>   (refuses to overwrite)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), repo = path.resolve(here, "../../../.."), tpl = path.join(here, "../assets/template");
const id = process.argv[2];
if (!/^[a-z][a-z0-9-]*$/.test(id || "")) { console.error("usage: new.mjs <id>  (lower case, digits, hyphens)"); process.exit(2); }
const dir = path.join(repo, "site/js/challenges", id), testFile = path.join(repo, "tests", `${id}.test.mjs`);
if (existsSync(dir) || existsSync(testFile)) { console.error(`${dir} or ${testFile} already exists`); process.exit(1); }
mkdirSync(dir, { recursive: true });
const fill = (f) => readFileSync(path.join(tpl, f), "utf8").replaceAll("__ID__", id);
for (const f of ["index.js", "maths.js", "activity.js", "solution.js", "plan.js"]) writeFileSync(path.join(dir, f), fill(f));
writeFileSync(testFile, fill("test.mjs"));
console.log(`created ${path.relative(repo, dir)}/ and ${path.relative(repo, testFile)}`);
