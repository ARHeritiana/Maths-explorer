# Brief for any AI agent: build a Maths Explorer challenge

Give this file to the agent (any assistant: a Claude chat, ChatGPT, Gemini, ...) together with the template page
`assets/standalone/challenge.html` and the problem. Optional: the example prototypes in `assets/examples/`.
The owner integrates what comes back into two sites (Maths-explorer and Matematika) with one command, so **the format
below is what matters most**.

## What you are making

A **challenge** for the "Défis" page of a French lycée maths website (bilingual French and English): a problem the
learner explores with an interactive scene, answers (with a whole number the site checks, or, for an open challenge,
by a proof or a construction the site does not check), and then understands
through a worked solution with cartoon pictures, animated where motion helps. The template page is a complete
working challenge (handshakes): copy it and rewrite it for your problem.

## What to give back (in your FIRST answer: the file, not a plan)

**Preferred, format A: the edited template page** (`<id>.html`). It runs as it is (open it, press "Solution ▶" and
"Self-check"), and it is also the source: each block `<script type="text/plain" data-path="...">` is one file.
- Rename the challenge: in every `data-path` of the blocks `js/challenges/handshakes/...` and
  `tests/handshakes.test.mjs`, replace `handshakes` by your id (lower case, digits, hyphens), and set `card.id`.
- Rewrite those blocks; add a block for each new file of the folder (`art.js`, `plan.js`; other names are not
  accepted by the site's tests). A block imports another by its relative path, like a file (`./maths.js`,
  `../common/kit.js`).
- Leave the blocks `js/challenges/common/...` and `js/math.js` unchanged. If you need a new shared helper, add a new
  block `js/challenges/common/<name>.js` and say so.
- If your environment can publish or attach an HTML file (an artifact, a canvas, a download), do it.

**Format B, when you cannot edit or return a file: a text bundle.** One fenced code block per file, its path on the
fence line, nothing else in the block:

    ```js js/challenges/<id>/index.js
    ...the whole file...
    ```

with `index.js`, `maths.js`, `activity.js`, `solution.js` (and `art.js` or `plan.js` if used), and
`tests/<id>.test.mjs`. Whole files only, never excerpts or "unchanged" placeholders.

**Then, a short note** (in the reply): the checked question and its answer for the default values; how you verified
the answer (two independent methods); what the learner does in the activity and which experiment reveals the idea;
the solution steps in one line each, saying which steps are animated and why; anything not done or uncertain.

## The files (keep exactly these exports)

- `index.js`: `card` (`id`, `type` "play" or "olympiad", `title`, `topic`, `extension` as `[fr, en]` pairs,
  `difficulty` 1 to 3, `minutes`); `variant` (`params`: built with `int(id, fr, en, min, max, default, step)` or
  `choice(id, fr, en, [[value, fr, en], ...], default)`; `answer(q)`: a whole number `>= 0`; `prompt(q)` and
  `solution(q)`: `[fr, en]`; optional `impossible: true` when an answer 0 means "impossible"; `open: true` for an
  open challenge); `original(q)`: for a checked challenge, the proof version, `[fr, en]` (none for an open one); `icon`: a 64 x 64 line drawing made with `svg()` from `common/icon.js`; and
  `export { activity } from "./activity.js"`, `export { diagram, scene } from "./solution.js"`.
- `maths.js`: pure functions (no DOM): the answer and every computation the scene needs.
- `activity.js`: `export function activity(root, { t, q, lang, reduced })` draws the hands-on scene into `root`
  (SVG), returns a cleanup function; `t(fr, en)` picks the language; `reduced` (boolean or function) means no
  animation.
- `solution.js`: `diagram = { size: [w, h], steps: (q) => [[fr, en], ...], dur? }` (the captions, 4 to 8 steps) and
  `scene = { mount(c, q), update(S, step, p, q) }`: build the drawing once, then pose it for step `step` and progress
  `p` from 0 to 1. A frame depends only on (step, p), never on time or on the previous frame.
- `tests/<id>.test.mjs`: Node's `node:test`; recomputes the answer by a method independent of `maths.js` over the
  whole parameter range (brute force, simulation, exact fractions).

The shared kit is in the template's `common/` blocks: `kit.js` (`svgEl`, `colour(i)`, `goalLine`, `toLocal`,
`lockTouch`), `helpers.js` (`P`, `int`, `choice`, `ez`), `scene-kit.js` (`seg`, `lerp`, `easeInOut`,
`easeOutBack`), `person.js` (`makePerson`, `posePerson`: a detailed cartoon person), `bubble.js` (`makeBubble`,
`poseBubble`), `cartoon.js` (`PRESS`, `installCartoon`), `player.js` (the solution player; do not change it).

## How it should look and behave

- **A world with cartoon characters** at the template's level of detail or more: bodies with joints, faces with
  eyes that look and blink, expressions, shadows, a drawn setting (ground, table, stick, mountain, cups); each
  character a little different. Characters react to what the learner does (turn, wave, reach, hop, a speech bubble).
- **The activity simulates the problem's rules** and lets the learner make the choices the question is about
  (positions, directions, timetables, amounts). The right experiment, chosen by the learner, shows the idea; nothing
  on screen names it, points to it or performs it: no hint, no "worst case" or "optimal" button, no running total that
  gives the method. Neutral measurements of what the question asks (a stopwatch, a move count) are fine. One goal
  sentence on top (`goalLine`), nothing explanatory under it.
- **The solution explains with pictures, in the activity's world.** Animate when motion helps understanding: a
  process, a trajectory, a transformation, a quantity that builds up, a before and after. A step that states a fact or
  a formula may stay still. Decide step by step; say in the note which steps move and why.
- **Keep the classic statement** (owner rule). If the problem, as it is classically asked, asks for a number, the
  prompt is that question and `answer(q)` is a whole number `>= 0` for every combination of parameters (1 to 3
  parameters, well posed for every value); the proof version goes in `original(q)`. If it asks for a proof, a
  construction, a strategy or a yes or no with a reason, make it an **open challenge**: `variant.open: true`, the
  prompt is the classic statement, no `original`, no `impossible`; the site shows no answer form and the solution
  answers the classic question. `answer(q)` then stays only as a fact checked by the tests. Never reword a statement
  just to get a number to check.
- **Text**: every visible string in French and English (`[fr, en]`); French typography (space before `: ; ? !`,
  apostrophe ’); no em dash or en dash; high-school words (no "invariant", "modulo", "graph", "parity" in the written
  solution: say "never changes", "remainder", "even or odd"); no URLs or sources on the page.
- **Works everywhere**: 390 px wide phones with no horizontal scroll, light and dark themes (colours from CSS
  variables: `var(--ink)`, `var(--surface)`, `var(--object-ink)` (the studied object; `var(--object)` for a fill), `colour(i)`), keyboard (every piece focusable, Enter or
  Space, arrows for a drag), reduced motion (final poses, no loops).

## Before you answer

- [ ] The file (format A, else B) is in this answer, with whole files, and the challenge folder is renamed.
- [ ] Self-check passes on the page (or you say that you could not run it).
- [ ] The answer is verified twice, independently; the test file is included.
- [ ] The solution's steps are animated wherever motion helps; the note says which and why.
- [ ] The characters are at least as detailed as the template's; both languages; no dashes; no hint in the activity.
