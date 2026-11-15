## New challenge: <title fr> / <title en> (`<id>`)

### Problem
<the statement as received; source and provenance here, never on the page>

### Checked version
- Parameters: <list, ranges, defaults>; default answer: <n>.
- Answer by `maths.js`: <method>. Independent check in `tests/<id>.test.mjs`: <other method>, over <range>.
- Impossible cases: <none | which, and why 0>.

### Design note
- Activity: <what the learner does; why trying it makes the idea visible; what it deliberately does not show>.
- Animated solution: <the steps in one line each>.
- Original question: <one line>.

### Changes
- `site/js/challenges/<id>/` (new): index, maths, activity, solution<, art>.
- `tests/<id>.test.mjs` (new).
- Registration: `registry.js`, `topic-registry.js`, `tests/browser.py`, `tests/CLAUDE.md`<, `site/js/challenges/CLAUDE.md`>.

### Verification
- `check.mjs <id>`: <n> combinations, 0 errors<, warnings judged: ...>.
- `npm run check && npm test`: <result>. `npm run test:dom`: <result>. Browser suite: <result | not run, why>.
- Screenshots 390 px and 1280 px looked at; preview: <artifact link if published>.

### Rollback
Revert this squash commit; or remove the registry line to hide the challenge while keeping the folder.

### Matematika
<PR link | not reachable from this session: to do>
