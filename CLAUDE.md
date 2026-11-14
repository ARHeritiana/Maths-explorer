# Claude Code entry point

**Git rule (owner, 14 November 2026, binding in every session; replaces the earlier "main only" rule): every change
goes through a branch and a pull request.** Start a branch from an up-to-date `main` (a session branch is fine), commit
there, push it and open a pull request, ready for review, whose text gives the changes, the verification and a rollback
note. Merge only when CI ("Website checks": `check` and `browser`) is green on the branch's last commit and there is no
conflict; use a squash merge, so `main` gets one commit per pull request. A merge to `main` deploys the site at once.
Never push or force-push to `main` directly. The agent may merge its own green pull request unless the owner asked to
review it first. After the merge, delete the branch; when the session cannot, list it for the owner. Obsolete branches
are removed once their content is in `main` or judged superseded. Matematika follows the same rule (there too, a merge
to `main` is live at once).

**Independence rule (owner's plan, step 3, 14 November 2026; replaces the edition rule and the sync recipe of 8 and 14
November): Maths-explorer and Matematika are two independent products, each with its own source, build and `dist/`.**
- Maths-explorer (this repository) is the French lycée curriculum site: the French courses with their shared resources
  (annales, automatismes, worksheets, exercise bank, slides, Réviser) and the general collections (laboratory, gallery
  and curiosities, foundations, challenges, history, reading, errors, the quadratic workshop). It holds no Malagasy,
  international, university or Olympiad content and has one build, with no edition switch (`FULL_EDITION` is gone; the
  site name is in `content/data/edition.json`). Never add that content here: it belongs to Matematika.
- Matematika (its own repository, named in the private handoff) is the complete site. The owner's hard rule still holds:
  Matematika never lacks anything this site has. So a French or general change made here is also made in Matematika,
  in its own branch and pull request, in the same round (apply the source diff there where it fits, `make site` there,
  its checks). Nothing is synced automatically; never copy this repository's `dist/` into Matematika, and never copy
  Matematika's other curricula back here.
- The Mikajy Atlas link (its URL names a banned account) is Matematika's only; it never appears in this repository.

**Language rule (owner, 11 November 2026):** each lesson is written in its target language(s). French curriculum: French. Malagasy curriculum: French. International curricula: English. University: the input language of the resource, or bilingual. Foundations (`#basics`), Olympiad, problems, galleries and all extra-curricular activities: bilingual (French and English). Existing English editions of curriculum lessons are kept as they are.
Details: `PROJECT_BRIEF.md` section 3. There is no pending bilingual goal for curriculum lessons and no reminder to give.

**Long agent work (owner, 25 October 2026):** review and audit work runs from the committed queue
`course-quality/queue/` of the private repository (`QUEUE.json`, `README.md`, `REVIEW-BRIEF.md`): one result file per
finished unit, at most two agents at once, outputs committed after each batch, and a scheduled resume at the reset time
when a usage limit stops agents. Any session continues from the queue, never from memory.

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
