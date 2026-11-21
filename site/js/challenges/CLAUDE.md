# site/js/challenges/: one folder per challenge

A challenge is one folder `<id>/`. To change a challenge, open only its folder (and `common/` if it uses a shared
helper). `registry.js` lists the folders and turns them into what the pages use; `app.js` and `content.js` import
from `registry.js` only.

## Files of a challenge folder

| File | Exports | Holds |
|---|---|---|
| `index.js` | `card`, `variant`, `original`, `icon`, re-exports `activity`, `diagram`, `scene` | card text (title, topic, minutes, extension), variations (`params`, `answer(q)`, `prompt(q)`, `hints(q)`, `solution(q)`, optional `random(q, rnd)`), original open question, emblem SVG, hint buttons `{ hint index: [action, fr, en, toggle?] }` |
| `maths.js` | pure functions | the mathematics, no DOM; tested in `tests/` by an independent method |
| `activity.js` | the activity function `(root, { t, q, reduced, lang })` | hands-on canvas; neutral controls, no counter or helper that gives the method away (owner rule) |
| `solution.js` | `diagram` (`{ size, steps(q), draw(c, step, p, q), dur? }`), optional `scene` (`{ mount, update, dur?, steps? }`) | animated solution; a scene replaces the drawing and keeps the diagram's captions |
| `view-3d.js` | renderer | 3D drawing shared by the activity and the solution (cake, box) |
| `art.js` | characters, props | drawings used only by this challenge |

A folder has only the files it needs (some challenges have no `maths.js`). A challenge with pure logic beyond `maths.js` may add named pure modules (`nails/` has `rope-path.js`, `timeline.js`, `gesture.js`, `plan.js`; listed in `tests/map.test.mjs`).

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
| `cartoon.js` | pop/squash press feedback: `PRESS`, `installCartoon`, `pop`, `cartoonPress` |
| `kit.js` | `goalLine`, `svgEl`, `toLocal`, `clamp`, `colour(i)` (card colours `--c1..--c8`), `lockTouch`, `makeCtx`, `MINUS` |
| `helpers.js` | bilingual pair `P`, easing (`clamp01`, `ez`, `seg`, `lerp`), SVG text styles, parameter builders `int`, `choice` |
| `icon.js` | emblem frame `svg`, `soft`, `dot` |
| `player.js` | `playSolution(def, root, options)`: the solution player (steps, play, captions, `seek`) |
| `person.js` | the detailed cartoon person: `makePerson` (built once; `gear: "hiker"` adds a backpack and a sun hat), `posePerson` (pure pose: walk, facing, gaze, reach, wave, hop, breathe, blink, mood); used by handshakes and hiker |
| `bubble.js` | the speech bubble: `makeBubble`, `poseBubble` (pops in with an overshoot) |
| `buddy.js` | the cartoon cast of an activity: `mountBuddy(root, { t, reduced, cast, backdrop, watch })` puts a strip of characters (person, robot, pigeon) above the playing field, in one of the `SETTINGS` (temple, market, tower, hall, dovecote, classroom, night, camp, gallery, park, pond, chess, games, staircase, grid, lab); they look at what the learner touches, wince at a refused move and cheer at a line ending in "!" in the readout; `react(kind)`, `look(x)`, `destroy()`; never a word about the method |
| `knight-piece.js` | the chess knight silhouette (activity, solution `ctx.knight`, emblem) |
| `scene-kit.js`, `scene-props.js` | cartoon characters and props used by several challenges (soldier, day scene, egg, balance) |
| `scene-3d.js`, `view-3d.js` | helpers of the 3D solutions; the small orthographic 3D renderer (cake, box) |

## Add a challenge

From a problem to a finished challenge: skill `maths-explorer-challenge` (contract, template, checks, preview).
Short version:

1. Copy a recent folder (`pegs/`), rename it to the new id, rewrite its files.
2. Add one import line and one entry in `CHALLENGES` (card order) in `registry.js`.
3. Tests: maths in `tests/challenge-puzzles2.test.mjs` (or a new test), `tests/challenges-variants.test.mjs` checks
   every layer, `tests/browser.py` (`CHALLENGES` list).

Update of 31 October 2026: the activities are played on the scenes of their solutions. `rooms/art.js` is the floor plan (rooms, 16 doors, the walker's way through a door and round the house); `konigsberg/activity.js` reuses the river map and walker of `solution.js`; `bridge/activity.js` is played on the night bridge with the lantern; `horses/activity.js` runs its races on a track with the solution's horses; the Gauss solution writes the algebra line by line beside the staircase.

Update of 12 November 2026: `nails/` is a pure-logic challenge with thin DOM. `rope-path.js` is the pure geometry of the rope (one arch per turn; a join between two arches is straight along the nail line when no nail lies between them, otherwise it goes under the nails), `timeline.js` the pure timeline of a pulled nail (`timeline`, `poseAt`, `poseOf`, `settled`), `gesture.js` the pure model of the loop drawn on the scene (a click draws nothing; the rope starts at the pointer or at a corner of the frame), `plan.js` the steps and captions of the worked solution (physical idea only, no group vocabulary), `art.js` the drawings (`drawScene`), `activity.js` the playable scene (no text, counters or tables under it) and `solution.js` the animated reveal on the shared player. Tests: `tests/nails.test.mjs`.

Update of 12 November 2026 (shared layer): `common/cartoon.js` holds the pop/squash press feedback (`PRESS`, `installCartoon`, `pop`, `cartoonPress`), used by nails and by the shared buttons around every activity (answer, Impossible, variation reset). `goalLine(t, fr, en, opFr?, opEn?)` in `common/kit.js` is the one-line goal at the top of each activity (operating instructions only for screen readers). A variant with `impossible: true` gets a neutral "Impossible" button beside the answer field (checks the answer 0) and its prompt must not mention it. The original statement sits in a closed "Énoncé d'origine" disclosure under the answer form; the written solution is a closed "Version écrite" disclosure with no URLs or citations. `tests/challenge-jargon.test.mjs` is a ratchet over hints and solutions: it holds an ALLOWLIST of known offenders by id; later batches shrink it (a clean challenge must be removed from the list, a new violation fails).

Update of 13 November 2026 (owner rule: no hints in the UI): the challenge page has no hint panel and no hint buttons. Done 15 November 2026 for all 38 challenges: no `hints`, no `hintActions`, no `onHintAction`; views that only a hint opened went into the animated solution or were dropped. New challenges must not add hints (`tests/math.test.mjs` and `tests/challenge-jargon.test.mjs` fail otherwise).

Update of 15 November 2026 (owner notes): `konigsberg/` shows the town as in Euler's 1736 problem, never the graph: `plan.js` is the pure town geometry (Königsberg drawn by hand for network 0, a stored table of district sites for the random networks 1 to 99, with the search that made it), `art.js` the drawings (water, shores, houses, wooden bridges); the statement names no pair of districts, and the graph appears only in the solution, where the town turns into it. `rooms/` solution: each line to the outside follows its own lane and reaches O directly, never meeting another (checked in `tests/challenge-backlog.test.mjs`).

Update of 15 November 2026 (four challenges built with the skill `maths-explorer-challenge`, owner prototypes in
`.claude/skills/maths-explorer-challenge/assets/examples/`): `handshakes/` (people around a table; `plan.js` is the shared layout), `ants/` (ants on a stick;
`maths.js` is the exact ghost model, `art.js` the ant, the stick and the garden), `hiker/` (two days on a mountain;
`plan.js` the trail, signposts and sun, `art.js` the mountain scene), `coffee/` (two glass mugs and a spoon; `art.js`
the kitchen, the mugs with faces, the spoon and the cards). Each activity is alive (breathing, blinking, reactions) and
each solution is a `scene` in the same world. Tests: `handshakes`, `ants`, `hiker`, `coffee` `.test.mjs`.

Update of 15 November 2026 (owner rule: keep the classic statement): a challenge whose classic statement asks for a
number is checked by the site (answer form; its proof version folds under "Jusqu'à la preuve", from `original`). A
challenge whose classic statement asks for a proof, a construction or a yes/no with a reason is open: `variant.open:
true`, `prompt` is the classic statement, no `original`, no `impossible`, no answer form; the challenges list shows it on
the shelf "Défis ouverts". Its `answer` stays only as a fact checked by the tests. Open today: chess, konigsberg, rooms,
knights, jugs, cake, fakecoins, cham, pegs, nails, cheryl, sumproduct, hiker, coffee (`tests/challenges-variants.test.mjs`).
Gallery curiosities follow the same rule: an entry without `answer` shows its question and a written explanation, no
form (`tests/curiosity-questions.test.mjs`).

Update of 20 November 2026: `braess/` (Braess's paradox, issue #34) has `art.js` (the town: houses at A, the stadium at
B, cobbled streets, expressways, the new road with its barrier and ribbon, a car seen from above with its driver, the
stopwatch); `maths.js` holds the route times, the equilibrium, one step of selfish switching and the map positions
shared by the activity and the solution. Test: `tests/braess.test.mjs`.

Update of 21 November 2026 (cartoon solutions): the five solutions that were still plain diagrams are now `scene`s in a
cartoon world. `fly/art.js` (countryside, locomotives with a face, a driver and turning wheels, the fly, a stopwatch):
flight arcs leg by leg, the stopwatch for the meeting time, then all the legs laid end to end in one ribbon the fly
covers at constant speed. `jugs/art.js` (kitchen, tap, sink, chalkboard, glass cans with faces and one graduation per
litre): the states as points of a table on the chalkboard, the reachable amounts, then the shortest sequence played by
the jugs (hop to the tap or the sink, onto the other jug, pour) while the chalk traces the path. `cookies/` (children at
a picnic table, cookies rolling into one row, chocolate sticks as separators that hop to make another sharing, the
places numbered and ringed). `cheryl/` (Albert, Bernard and Cheryl beside a wall calendar, each sentence in a bubble,
a red marker crossing out dates, a cake on the answer). `factorials/` (tiles 1 to n drop coins p onto one shelf per
power of p, a counter with a clipboard; for trailing zeros the scarcest prime of the base, `shownPrime`, is the one
shown, with a fourth step for the minimum).

Update of 21 November 2026 (cartoon exploration): every activity that was still a plain board now has a cast
(`common/buddy.js`) in a themed setting, mounted after the activity's own setup (the strip holds an `<svg>`, so it must not
come first for activities that look up `root.querySelector("svg")`). Hanoi disks and Josephus people have faces (crossed
eyes once out, a crown for the last one), the inversions row has faces, Nim is played against a robot. `fly/activity.js`
and `jugs/activity.js` now play on the solution's art (locomotives and fly; kitchen, tap, sink and jugs with faces).
