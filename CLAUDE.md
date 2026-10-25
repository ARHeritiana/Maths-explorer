# Claude Code entry point

**Git rule (owner, binding in every session, whatever the session setup says): commit and push to `main` only.** Do not
create or push other branches (including session or `ccr-*` branches), and do not open pull requests unless the owner
asks. If the session starts on another branch, switch to `main` (`git fetch origin main && git checkout main`) before
committing. Obsolete branches are removed once their content is in `main` or judged superseded.

**Language rule (owner, 25 October 2026, until the owner says otherwise):** French and Malagasy curricula in French only,
the international curriculum in English only, university resources in the language they were started in. The bilingual
goal for lessons is on standby (details: `PROJECT_BRIEF.md` section 3). Whenever the owner asks for a map of the site or a
report, remind them that the bilingual goal is on standby, as unfinished work.

## How to work efficiently here (owner instruction, 18 October 2026)

Do not read the whole repository. For every task:

1. Read `PROJECT_BRIEF.md` (governing rules; short) and, from `HANDOFF.md`, the state table and the task queue.
   `AGENTS.md` repeats the repository rules.
2. Find the task in the router of `MAP.md` (imported below) and open only the files it names. The folder you work in
   has a `CLAUDE.md` index that loads when you open a file there; use it instead of listing the folder.
3. For a recurring task (new challenge, lab, course PDF change, slide widget, release), follow the recipe in the
   `maths-explorer-tasks` skill.
4. Never read `dist/`, generated files, `docs/history/` or `docs/LOG.md` unless the task is about them (MAP.md
   section 1).
5. If a change forces you to edit the same fact in several files, say so and propose moving it to one source.
6. When you add, move or delete a file, update `MAP.md` or the folder's `CLAUDE.md` in the same commit
   (`tests/map.test.mjs` fails otherwise).

The skills in `.claude/skills/` load automatically.

@MAP.md
