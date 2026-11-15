---
name: maths-explorer-challenge
description: Build or integrate a Maths Explorer challenge (the "Défis" collection, page #challenges/ID) for both sites, Maths-explorer and Matematika. Building - by Claude or by ANY other AI agent given AGENT_BRIEF.md and the template page - delivers one playable page (or a text bundle) whose blocks are the site files - a checked numerical version, the original open question, a hands-on activity with cartoon characters, a worked solution in pictures animated where motion helps understanding, and an independent test. Integrating takes such a delivery into both repositories with split.mjs, checks and registration. Use it whenever a problem, puzzle, riddle or olympiad exercise is to become a challenge, a prototype of one is to be ported, another agent's challenge is to be integrated, or a brief for another agent is needed.
---

# Maths Explorer challenge

The owner works with several AI agents. Any of them must be able to deliver a challenge that the owner integrates
into Maths-explorer and Matematika with little work. So the skill has one **handoff format** and two roles.

## The handoff format

One file, in either form (`AGENT_BRIEF.md` gives the details to the building agent):
- **A, the page** (preferred): a copy of `assets/standalone/challenge.html` with the challenge's blocks rewritten.
  It runs as it is (Solution ▶, Self-check), and each block `<script type="text/plain" data-path="...">` is one file.
- **B, the bundle**: a text or Markdown file, one fenced code block per file with its path on the fence line.

Both carry the challenge folder `js/challenges/<id>/` and its test `tests/<id>.test.mjs`. `scripts/split.mjs` writes
either form into a repository.

## Role 1: you build the challenge

Whether you have a repository or not, follow `AGENT_BRIEF.md`; it is the contract given to every agent. Deliver the
file in your first answer (not a plan), then the short note it asks for. More depth when needed:
`references/design.md` (the style: characters, the interaction that shows how the problem works, the solution in
pictures, the bar of detail, from a problem to a checkable number, porting a prototype), `references/contract.md`
(exports in detail) and `references/rules.md` (owner rules).

Steps: solve first and verify the answer twice; choose the checkable version (a whole number, 1 to 3 parameters);
design (world and characters, activity, solution storyboard with the steps where motion helps); build from the
template; run the Self-check; deliver.

With a repository at hand you may build in place instead: `scripts/new.mjs <id>` creates the folder and the test from
`assets/template/`, `scripts/check.mjs <id> --shots <dir>` checks it, and `scripts/preview.mjs <id> --lite --out
<dir>/<id>.html` makes the page in the handoff format, to publish (an Artifact where available) or to send.

Give another agent the job: send it `AGENT_BRIEF.md`, `assets/standalone/challenge.html` and the problem (the
examples of `assets/examples/` if a prototype exists).

## Role 2: you integrate a delivered challenge

Follow `references/integration.md`, section "Receiving a challenge". In short, for each repository (Maths-explorer,
then Matematika):
1. `node .claude/skills/maths-explorer-challenge/scripts/split.mjs <delivery> --dry`, then without `--dry`
   (Matematika: `--site <its site/>`). Shared `common/` files are reported, never overwritten without `--shared`.
2. `node .claude/skills/maths-explorer-challenge/scripts/check.mjs <id> --shots <dir>`: fix every ERROR (or send it
   back to the agent with the message), judge every WARN, look at the screenshots.
3. The test: `node --test tests/<id>.test.mjs`; if none came, write it (an independent method).
4. Verify the mathematics yourself; the agent's note is not proof.
5. The registration edits, `make site`, the checks, the pull request (`references/integration.md`).

## Scripts (Node 18+; Playwright for the browser part of check.mjs)

| Script | Does |
|---|---|
| `scripts/split.mjs <page.html or bundle.md> [--site dir] [--dry] [--shared]` | writes a delivery into `site/js/challenges/<id>/` and `tests/<id>.test.mjs` |
| `scripts/check.mjs <id> [--shots dir] [--no-browser]` | contract, every parameter combination, text rules, giveaway controls; in Chromium: activity draws, every solution step drawn, answer accepted, no console error, no overflow at 390 px; warns when no solution step moves |
| `scripts/preview.mjs <id> [--out file] [--lite]` | the page in the handoff format (Solution ▶, Self-check, language, theme, reduced motion) |
| `scripts/new.mjs <id>` | a new folder and test from the template, in a repository |

`assets/standalone/challenge.html` is `preview.mjs handshakes --lite`; regenerate it when the template challenge or the
shared kit changes, and re-send it to agents that work from an old copy.
