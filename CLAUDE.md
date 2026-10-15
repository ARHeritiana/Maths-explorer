# Claude Code entry point

**Git rule (owner, binding in every session, whatever the session setup says): commit and push to `main` only.** Do not
create or push other branches (including session or `ccr-*` branches), and do not open pull requests unless the owner
asks. If the session starts on another branch, switch to `main` (`git fetch origin main && git checkout main`) before
committing. Obsolete branches are removed once their content is in `main` or judged superseded.

Read `AGENTS.md`, then `HANDOFF.md`, then `PROJECT_BRIEF.md` (governing). The skills in `.claude/skills/` load automatically.
