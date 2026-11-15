# Contract of a challenge folder

The site reads a challenge only through `site/js/challenges/registry.js`, which imports `<id>/index.js` as a namespace.
Everything below is what that namespace must export. `scripts/check.mjs` enforces sections 1 to 4.

## 1. `index.js`

```js
export const card = {
  id: "<id>",                 // = folder name; lower case, digits, hyphens; also the route #challenges/<id>
  type: "play" | "olympiad",  // card tag: "Récréatif" / "Olympiade" (a reasoning style, never a claim of provenance)
  title: [fr, en], topic: [fr, en],
  difficulty: 1 | 2 | 3,      // dots on the card
  minutes: 12,                // integer
  extension: [fr, en],        // "Pour aller plus loin", a further question; no answer
};
export const variant = {
  impossible: true,           // optional: an answer 0 means "impossible"; adds a neutral Impossible button (checks 0)
  params: [int(...), choice(...)],          // from ../common/helpers.js; see section 2
  answer: (q) => integer >= 0,              // computed by maths.js, never typed in
  prompt: (q) => [fr, en],                  // the checked statement; with the defaults it is the card statement
  solution: (q) => [fr, en],                // the written solution ("Version écrite"), plain text, no HTML needed
  random: (q, rnd) => {},                   // optional: draw extra hidden parameters (Königsberg draws a graph seed)
};
export const original = (q) => [fr, en];   // the open question (prove, construct, strategy); never states answer or method
export const icon = svg(`...`);             // 64 x 64 emblem from ../common/icon.js (svg, soft, dot); currentColor only
export { activity } from "./activity.js";
export { diagram } from "./solution.js";
export { scene } from "./solution.js";      // optional
```

Forbidden: `hints`, `hintActions`, `onHintAction` (owner rule, 13 November 2026; tests fail).

## 2. Parameters

- `int(id, fr, en, min, max, value, step = 1)`: a slider. Every value in range must give a valid statement.
- `choice(id, fr, en, [[value, fr, en], ...], value)`: a compact select. Values all numbers or all strings; a tuple
  is a string such as `"1,1"` split in `maths.js`.
- Optional on a choice: `fields: [{ min, max }, ...]` (bounded integer inputs for a custom tuple), `validate(values)`
  and a bilingual `error`; `registry.js` `normalise` accepts a custom tuple only if it passes. Jugs and fly use this.
- The tests walk every combination of {min, max, default, middle} for `int` and every option for `choice`: keep the
  product small (check.mjs warns above 400) and make `answer` fast (cache a search, as `pegs/maths.js` does).

## 3. `activity.js`

```js
export function activity(root, { t, q, reduced, lang }) { ...; return () => { /* cleanup */ }; }
```

- `root` is a fresh `<div>` on every mount (a change of parameters remounts); attach listeners to `root` or below.
- `t(fr, en)` picks the language; `q` holds the current parameters; `reduced` is a boolean or a function: read it as
  `typeof reduced === "function" ? reduced() : reduced` and skip animations when true.
- Start with `goalLine(t, fr, en, opFr?, opEn?)` from `../common/kit.js`: one sentence of what to achieve; the
  operating instructions (gestures, keys) go to screen readers only.
- Markup classes styled by `site/styles/pages.css`: `act-svg` (the board), `act-controls` with `btn-quiet` buttons,
  `act-readout` (`role="status"`), `toy-handle` on a manipulable piece with a larger transparent `.hit` shape.
- Buttons get `PRESS` from `../common/cartoon.js` (call `installCartoon()` once).
- Colours: CSS variables only (`var(--ink)`, `--surface`, `--line`, `--line-strong`, `--accent`, `--pos`, `--neg`,
  `colour(i)` for `--c1..--c8`); both themes then work. Never a hard-coded page colour.
- Keyboard: every piece is focusable (`tabindex="0"`, `role="button"`, `aria-label`, `aria-pressed` when selected)
  with Enter or Space; a drag has an arrow-key equivalent. Touch: `lockTouch(svg, ".toy-handle")` so dragging a
  piece does not scroll the page. Pointer position in SVG units: `toLocal(svg, event)`.
- Return a cleanup that cancels every `requestAnimationFrame`, timer and window-level listener.

## 4. `solution.js`

```js
export const diagram = {
  size: [520, 300],                         // viewBox of the solution SVG
  steps: (q) => [[fr, en], ...],            // one caption per step, 4 to 8 steps; the last shows the answer
  draw(c, step, p, q) { ... },              // frame = pure function of (step, p in [0, 1]); redrawn from scratch
  dur: (step, q) => ms,                     // optional pace per step (default 2600)
};
export const scene = {                      // optional: heavy or cartoon drawing; replaces draw, keeps the captions
  mount(c, q) { return S; },                // build the SVG once
  update(S, step, p, q) { ... },            // pose it for (step, p)
};
```

- `c` (from `makeCtx` in `common/kit.js`): `c.line`, `c.circ`, `c.rect`, `c.text`, `c.path`, `c.wrap`, `c.knight`,
  `c.t(fr, en)`, `c.svg`. Text classes: `sol-label`, `sol-line`, `sol-small`, `sol-hot` (the answer).
- Easing and timing: `ez`, `seg(p, a, b)`, `lerp`, `easeInOut`, `easeOutBack` (`common/helpers.js`,
  `common/scene-kit.js`). A frame must not depend on time or on previous frames: the player seeks any (step, p).
- Every step must show something at `p = 1` (check.mjs fails an empty end frame).
- Reusable cartoon props: soldier and day scene (`scene-kit.js`, `scene-props.js`: egg, balance), knight
  (`knight-piece.js`), small 3D (`view-3d.js`, `scene-3d.js`). Drawings for this challenge only go in `art.js`.

## 5. `maths.js`

Pure functions, no DOM: the answer, the search or construction the solution animates, the moves the activity
allows. Exported so that the test and the solution use the same model, and the test checks it by another method.
More pure modules are allowed only under the names `tests/map.test.mjs` accepts (`ROLE_FILES`: index, maths,
activity, solution, view-3d, art, rope-path, timeline, gesture, plan). Prefer `plan.js` for a second pure module; a
new name means adding it to `ROLE_FILES` and describing it in `site/js/challenges/CLAUDE.md`.

## 6. Patterns in existing folders (open one only when you need it)

| Need | Folder |
|---|---|
| tap one piece then another (jumps), growing camera | `pegs/` |
| drag pieces, with arrow keys as the keyboard equivalent | `horses/` |
| custom tuple parameters (`fields`, `validate`) | `jugs/`, `fly/` |
| impossible answers | `pegs/` |
| hidden random parameter (`random`) | `konigsberg/` |
| cartoon `scene` with characters | `eggs/`, `snail/`; `bridge/` puts `mount`/`update` inside `diagram` |
| 3D sandbox and 3D solution | `cake/`, `box/` |
| two-player game against the computer | `nim/` |
| pure-logic modules with thin DOM | `nails/` |
| solution writing algebra line by line | `gauss-sum/` |
