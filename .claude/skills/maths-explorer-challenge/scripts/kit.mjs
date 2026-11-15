#!/usr/bin/env node
// Assemble the agent kit: the folder handed to any AI agent, which is also a claude.ai skill (upload it zipped).
//   SKILL.md          AGENT_BRIEF.md with a skill header and the kit's own paths (the brief stays the single source)
//   AGENT_BRIEF.md    the brief itself, for agents that do not read skills
//   challenge.html    the template page (assets/standalone/challenge.html)
//   examples/         the owner's prototypes (assets/examples/)
// Usage: node .claude/skills/maths-explorer-challenge/scripts/kit.mjs <out dir>   then zip the folder's contents.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url)), skill = path.resolve(here, "..");
const out = path.resolve(process.argv[2] || "maths-challenge-builder");
mkdirSync(path.join(out, "examples"), { recursive: true });
const brief = readFileSync(path.join(skill, "AGENT_BRIEF.md"), "utf8");
const local = brief.replaceAll("`assets/standalone/challenge.html`", "`challenge.html` (in this skill's folder)").replaceAll("`assets/examples/`", "`examples/` (in this skill's folder)");
const header = `---
name: maths-challenge-builder
description: Build a challenge for the Maths Explorer and Matematika websites (their Défis page) from a maths problem, puzzle or prototype - one playable page, made from the template challenge.html in this skill, whose blocks are the site files - a checked numerical version, the original open question, a hands-on activity with detailed cartoon characters, a worked solution in pictures animated where motion helps, and an independent test. Use it whenever a problem is to become a Maths Explorer challenge, a challenge for the Défis, or a challenge page for the owner's sites.
---

`;
writeFileSync(path.join(out, "SKILL.md"), header + local);
writeFileSync(path.join(out, "AGENT_BRIEF.md"), local);
copyFileSync(path.join(skill, "assets/standalone/challenge.html"), path.join(out, "challenge.html"));
for (const f of readdirSync(path.join(skill, "assets/examples"))) copyFileSync(path.join(skill, "assets/examples", f), path.join(out, "examples", f));
console.log(`kit in ${out}: SKILL.md, AGENT_BRIEF.md, challenge.html, examples/`);
