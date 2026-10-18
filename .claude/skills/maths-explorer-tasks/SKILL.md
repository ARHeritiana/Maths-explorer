---
name: maths-explorer-tasks
description: Step-by-step recipes for recurring changes to the Maths Explorer site, naming exactly which files to open and which to leave alone. Use for any task in this repository that adds or changes a challenge, a laboratory or gallery experiment, a course PDF or TeX unit, a slide deck or slide canvas, a page or route, a colour or style, or that prepares a push (make site, checks, commit), even when the request just says "add", "fix" or "change" something on the site.
---

# Maths Explorer task recipes

`MAP.md` (repository root) says where things live. This skill says how to do the recurring tasks with the fewest
files opened. Load only the recipe you need:

| Task | Recipe |
|---|---|
| add or change a challenge (statement, variant, activity, hint, solution, icon) | `references/challenge.md` |
| add or change a laboratory experiment or a gallery curiosity | `references/lab.md` |
| change a course PDF, add a chapter, change the PDF look | `references/course-tex.md` |
| change a slide deck, the player, or a slide canvas | `references/slides.md` |
| change a page, a route, the navigation, colours or styles | `references/page-style.md` |
| finish any task: build, test, log, commit, push | `references/release.md` |

Rules for every recipe:
- Edit `site/` and `content/`, never `dist/` or generated files (`MAP.md` section 1).
- Bilingual strings are `[French, English]` pairs. No em or en dashes in visible text. No owner, school or city names.
- Read a large file by searching for the symbol the recipe names (Grep with a pattern, then Read with offset and
  limit), not from the top.
- If the task needs a file the recipe does not name, add it to the recipe in the same commit.
