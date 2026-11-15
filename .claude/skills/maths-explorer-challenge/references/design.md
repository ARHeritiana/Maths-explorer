# Design: the interaction teaches, the characters carry it

The owner's model (15 November 2026): the animations often use **cartoon-like characters**, and the interaction
**shows how the problem works**. When the learner tries the *right* experiment, the scene itself hints at the solution.
Nothing on the page gives that hint away. The learner earns it by what they choose to do.

Three prototypes made in this style are kept in `assets/examples/` (standalone pages, not site code). Open one to see
the look and the feel; do not copy its code (section 5).

| Example | Characters and props | How the interaction shows the problem | Where the insight hides |
|---|---|---|---|
| `ants.html` (bumping ants on a stick) | ants with walking legs, waving antennae, eyes, a smile that turns to an "o" while falling; a "Demi-tour !" bubble at each bump; they tumble off the ends | the rules are simulated exactly: meet, both turn back, fall at an end; the learner chooses how many ants, and where | an ant that starts at an end, facing inward, gives the longest fall time; the ghost view (bumping = passing through) is the key idea |
| `hiker.html` (the hiker on two days) | a hiker with hat, face, swinging arms and legs who turns to face where he walks, and breathes while resting | a time slider and both days; options let the learner add rests and backtracking, trying to break the claim | superimposing the two days (two hikers on one day) makes them meet; the position against time graph comes last |
| `coffee-milk.html` (coffee in milk, milk in coffee) | two cups and a spoon that dips, lifts, travels and pours; grains that jostle; colour of the liquid by proportion | the learner performs the transfers, one spoon at a time, in a grain model and a liquid model | measuring both cups after any number of transfers shows the same amount every time |

## 1. The activity: a faithful little world

- **Simulate the rules, not the answer.** Every rule of the statement is a behaviour of the scene (bump and turn back,
  fall at the end, spoon volume, symmetric jump). Nothing else is in the scene. `maths.js` holds the model; the activity
  only draws it and takes the learner's choices.
- **Let the learner make the choices the question ranges over**: where the ants start and which way they face, the
  hiker's timetable, the size of the spoon, the order of the moves. The question is about all possible choices, so
  the learner's hands should explore them.
- **Neutral tools are allowed**: a stopwatch when the question asks for a time, a measuring tap on a cup, a move count
  when the question counts moves, Undo and Restart. A tool measures what the learner did; it never computes the
  idea for them.
- **The right experiment reveals the idea, by itself.** The ant placed at the end facing inward *is* the worst case and
  the stopwatch shows it. Measuring both cups shows equal amounts. Trying to schedule a descent that misses the climb
  keeps failing. Design so that this experiment is *possible and natural*, but nothing on screen names it, points to it
  or performs it.
- **"Try to break it"** suits existence and impossibility problems: give the learner the freedom to look for a
  counterexample (rests, backtracking, any schedule) and let them fail honestly.
- **Not in the activity** (they move to the animated solution or go): a hint toggle ("Mode astuce", ghosts), a "worst
  case" or "optimal" button, a statistics button that approximates the answer, a live line saying "a = b ✓", a graph
  whose shape is the proof, any text that explains.

## 2. The animated solution: the same world, then the idea

- Start in the activity's world, with the same characters, so the learner recognises it.
- Steps (4 to 8): the situation, the decisive observation shown on the characters (ghost ants walking straight
  through each other; the two hikers walking on the same day; the spoon's return trip carrying exactly the coffee's
  replacement), the general argument, then the answer with its number. Symbols, formulas and graphs come last, after
  the picture has done the work. Name the high-school idea plainly ("they always meet", "the gap goes from −1 to +1
  so it is 0 at some moment"), never a theorem's name as the reason.
- Each frame is a pure function of (step, p). Derive every pose from p (see section 3), never from accumulated state.
- **Animated means moving in every step** (owner, 15 November 2026: a solution that only showed pictures had to be
  sent back). As p goes from 0 to 1 inside a step, the scene changes: a character walks, reaches, turns, hops, an
  object travels, a line or a bar grows, a number counts up while it is explained, a bubble pops. Plan the motion of
  each step together with its caption (storyboard: "step 2: A walks to each person in turn; a line grows to each
  one"). Even the first step moves (the characters wave hello, the ants set off). Not animated: one still picture per
  step, a picture that only fades in, text with a figure, a single moving step among still ones.
- Give each step time to be watched: `dur(step, q)` of 3 to 7 seconds, longer for a step with several moves. The
  player starts by itself when the learner opens the solution and runs to the last step; Previous, Next and Play
  stay available.
- Checked by `check.mjs` and by the page's Self-check: the drawing at p = 0.05 and at p = 0.95 must differ in every
  step.

## 3. Cartoon characters (SVG)

Use the site's SVG approach; a canvas only when hundreds of moving objects need it (one challenge, `sumproduct`, does).

- **Build once, pose every frame**: `mount` creates nested `<g>` groups with their pivots (hip, shoulder, neck); `update`
  sets only `transform` attributes. The hiker prototype is the pattern (`mk` builds, `pose` moves), and so is the
  shared `common/person.js` (`makePerson`, `posePerson`; `gear: "hiker"` adds a backpack and a sun hat) and
  `common/bubble.js` (`makeBubble`, `poseBubble`), used by the template.
- **Walk cycle from distance, not time**: `phase = distance / stride × 2π`, so feet never slide; leg and arm swing
  `sin(phase) × amplitude`; the amplitude eases to 0 when the character stops, and a slow breathing bob takes over.
  In a solution, compute the distance from p, so the frame stays pure.
- **Facing**: flip with `scale(-1, 1)` from the sign of the velocity; keep the last facing when standing still.
- **Expressions and events**: a smile normally, an "o" mouth when surprised or falling; a squash on impact
  (`easeOutBack`); a short speech bubble on an event ("Demi-tour !", "Oups !") that fades in about 0.7 s; a tumble
  (rotation plus gravity) when leaving the scene.
- **Colours**: outlines and text in `var(--ink)`; bodies from `colour(i)` mixed with `var(--surface)` so both themes work;
  skin, wood, coffee and other fixed material colours may stay literal (they are the object's colour, not the theme's).
- **Reduced motion**: no walk cycle, no bubbles; characters appear in their final pose for each step.
- **Reuse**: `common/person.js` and `common/bubble.js` (the detailed person and the speech bubble), `common/scene-kit.js` (`makeSoldier`, hats), `common/scene-props.js` (`dayScene`, `makeEgg`,
  `makeBalance`), `snail/art.js` (`makeSnail`), `bridge/art.js` (`nightBridge`, `makeLantern`). A new character goes in
  the challenge's `art.js`; when a second challenge needs it, move it to `common/` and name it in
  `site/js/challenges/CLAUDE.md`.

## 3b. The bar: how elaborate is elaborate enough

A plain dot, a stick figure or a circle with a face is **not enough**. The template (`common/person.js`, and the
template's `plan.js`, `activity.js`, `solution.js`) is the minimum standard; match it or go beyond it.

| Layer | Minimum |
|---|---|
| anatomy | head with hair, ear, two eyes (white and pupil), brows, nose, cheek and an expressive mouth; neck; torso with shading on the back side, collar and belt; two arms and two legs, each in two segments (elbow, knee) with hands and shoes; a ground shadow |
| variety | each character differs: skin, hair, clothing colour from `colour(i)`, an accessory (cap, glasses, bow); props get their material colour (wood, coffee, metal) |
| life (idle) | breathing, blinking at irregular moments, eyes that follow what matters (the chosen piece, the partner, the event) |
| motion | walk cycle driven by distance with knee bend and counter-swinging arms; facing that flips with direction; anticipation and overshoot (`easeOutBack`), a hop or squash on an event |
| emotion | at least four expressions (smile, grin, "o" of surprise, flat), chosen by what happens (surprise at a bump, joy at a success) |
| events | a speech bubble that pops in and out on the key event ("Enchanté !", "Demi-tour !", "Oups !") |
| setting | a scene, not a void: ground or rug, the main object (table, stick, mountain, cups) drawn with outline, shading and a highlight; layers so that characters pass in front of and behind it |
| response | every learner action gets a visible reaction from the characters (wave when chosen, turn and look, reach out, hop) |

Check it by eye at 390 px and 1280 px (`check.mjs --shots`) and in a few frames of the solution (`window.__solution.seek`
in the preview). If a frame could be mistaken for a diagram, it is not done yet.

## 4. From a problem to a checkable number

The site checks one integer. Proof and existence problems need a numerical version whose answer the activity can
reach; the proof itself stays in `original(q)`.

| Prototype question | Checkable version (example parameters) | Answer |
|---|---|---|
| ants: longest time before all fall | stick of L cm, speed 1 cm/s, n ants; how many seconds at most? (n changes nothing, which is part of the surprise) | L (100 for L = 100) |
| hiker: a point passed at the same time on both days | at least how many such points are there, whatever the two walks? or, for a given pair of timetables, at what minute after 08:00? | 1 (or the computed minute) |
| coffee and milk: which cup is purer | cups of V mL, a spoon of v mL, one round trip: how many mL of milk end up in the coffee? (choose V, v with V·v/(V + v) an integer) | 40 for V = 200, v = 50 |

## 5. Porting a standalone prototype

When the input is a prototype page like those in `assets/examples/`:

1. Keep the **world** (rules, characters, the feel of the motion) and the **choices** it gives the learner.
2. Move the model into `maths.js` as pure functions; prefer exact events over small time steps (the ant prototype steps
   by 0.001 min; the site computes each meeting and fall exactly).
3. Rebuild the drawing in SVG with the site's tokens and classes (`references/contract.md` section 3); bilingual
   `[fr, en]` text; no emoji in titles, no em or en dashes, no numbered "Question 11" labels.
4. Sort every control and readout with section 1: neutral tools stay; hint toggles, worst-case buttons, statistics
   that approximate the answer and explanatory text go to the animated solution or are dropped.
5. Turn the prototype's explanation into the solution storyboard (section 2) and the written solution.
6. Note in the PR what was kept, moved and dropped, so the owner can compare with the prototype.
