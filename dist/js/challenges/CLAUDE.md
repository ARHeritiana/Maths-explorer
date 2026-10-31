# site/js/challenges/: one folder per challenge

A challenge is one folder `<id>/`. To change a challenge, open only its folder (and `common/` if it uses a shared
helper). `registry.js` lists the folders and turns them into what the pages use; `app.js` and `content.js` import
from `registry.js` only.

## Files of a challenge folder

| File | Exports | Holds |
|---|---|---|
| `index.js` | `card`, `variant`, `original`, `icon`, `hintActions`, re-exports `activity`, `diagram`, `scene` | card text (title, topic, minutes, extension), variations (`params`, `answer(q)`, `prompt(q)`, `hints(q)`, `solution(q)`, optional `random(q, rnd)`), original open question, emblem SVG, hint buttons `{ hint index: [action, fr, en, toggle?] }` |
| `maths.js` | pure functions | the mathematics, no DOM; tested in `tests/` by an independent method |
| `activity.js` | the activity function `(root, { t, q, reduced, lang })` | hands-on canvas; listens to hint buttons with `onHintAction(id, {...})` from `common/kit.js` |
| `solution.js` | `diagram` (`{ size, steps(q), draw(c, step, p, q), dur? }`), optional `scene` (`{ mount, update, dur?, steps? }`) | animated solution; a scene replaces the drawing and keeps the diagram's captions |
| `view-3d.js` | renderer | 3D drawing shared by the activity and the solution (cake, box) |
| `art.js` | characters, props | drawings used only by this challenge |

A folder has only the files it needs (some challenges have no `maths.js`).

Backlog additions: `knights/` has a legal-move board and cancellable cooperative tour search; `rooms/` has an editable
five-room door multigraph and Eulerian traversal; `factorials/` has exact BigInt valuations and arbitrary-base zeros.
Each folder contains `index.js`, `maths.js`, `activity.js` and `solution.js`.

## Shared (`common/`)

Parameter choices appear in compact selects inside folded settings (`app.js`). A choice may also carry `fields`
(bounded integer inputs), `validate(values)` and a bilingual `error`, allowing custom tuples alongside optional
examples; `registry.js` normalises both paths. Fly and jugs use this. Direct object manipulation is primary;
scene-level tap/drag actions have keyboard equivalents, and camera gestures cancel active object drags.

| File | Holds |
|---|---|
| `kit.js` | `svgEl`, `toLocal`, `clamp`, `colour(i)` (card colours `--c1..--c8`), `lockTouch`, `onHintAction`, `makeCtx`, `MINUS` |
| `helpers.js` | bilingual pair `P`, easing (`clamp01`, `ez`, `seg`, `lerp`), SVG text styles, parameter builders `int`, `choice` |
| `icon.js` | emblem frame `svg`, `soft`, `dot` |
| `player.js` | `playSolution(def, root, options)`: the solution player (steps, play, captions, `seek`) |
| `scene-kit.js`, `scene-props.js` | cartoon characters and props used by several challenges (soldier, day scene, egg, balance) |
| `scene-3d.js`, `view-3d.js` | helpers of the 3D solutions; the small orthographic 3D renderer (cake, box) |

## Add a challenge

1. Copy a recent folder (`pegs/`), rename it to the new id, rewrite its files.
2. Add one import line and one entry in `CHALLENGES` (card order) in `registry.js`.
3. Tests: maths in `tests/challenge-puzzles2.test.mjs` (or a new test), `tests/challenges-variants.test.mjs` checks
   every layer, `tests/browser.py` (`CHALLENGES` list).
