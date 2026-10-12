---
name: "slides-interactive-math"
description: Build interactive and animated slides for teaching mathematics as one self-contained HTML page (16:9, LaTeX-quality formulas via MathJax SVG, step-by-step reveal, live sliders, graphs, tableaux de signes/variations, optional narration and sound), published as an artifact. Use this skill whenever the user wants an animated or interactive maths explainer, demo, "slide", presentation or teaching aid for any topic (trinôme, dérivée, suites, trigonométrie, probabilités, géométrie…), mentions lycée, Première, Terminale, IB, classroom projection or "present and interact at the same time", asks for a Hyperframes-style shot plan or video storyboard for maths content, or asks to improve an earlier maths animation, even if they never say "HTML" or "skill".
---

# Interactive and animated maths slides

Produce one self-contained HTML page that a teacher can **project and manipulate live**: formulas typeset like LaTeX, a graph that reacts to sliders, and a step-by-step reveal. The method combines the Hyperframes shot-based workflow (design the visual language first, decompose into short independent scenes, iterate one variable at a time; see `references/hyperframes-workflow.md`) with the engine patterns proven on the "trinôme du second degré" project (`assets/example_trinome.html`).

## 1. Choose the format

| Format | Use when | Engine |
|---|---|---|
| **A. Presenter + Explore** (default) | The teacher speaks and wants to change parameters live | Steps (◀ ▶, "Tout") + sliders + live graph. Start from `assets/example_trinome.html` or `assets/template.html`. |
| **B. Scripted explainer** | A self-running animation, or shots for a video | Scenes of 4–10 s, each a pure function `render(scene, t)`. See `references/engine-patterns.md` §Scripted scenes. |
| **C. Both** | Rarely; only on request | Scripted scenes for the intro, then format A for exploration. |

If the user needs an editable deck or offline use, say what this page cannot do and offer: PowerPoint (use the `pptx` skill, static), PDF handout, or screen-recorded video. Do not pretend this page exports to those formats.

## 2. Workflow

1. **Clarify in one line.** Topic, level (Seconde, Première spé, Terminale, IB…), language of the slides, and assumptions you are making. Ask a question only when the topic itself is missing. Slides default to French for French-curriculum contexts; chat replies follow the language the user writes in.
2. **Visual language.** Use the user's references if given. Otherwise use the defaults in §4. Name concrete properties (palette, fonts, margins), never "cinematic" or "premium".
3. **Fix the mathematics first.** Choose one running example, compute every number by script (discriminants, roots, extrema, presets), and confirm each case of the case matrix (e.g. 3 signs of Δ × 2 signs of a). Do this before writing any animation.
4. **Beats to scenes.** One idea per step or scene. Typical arc: definition → running example → general result → cases → consequence (variations, sign table) → "À retenir". Animate only where motion explains something (a curve being drawn, a parameter sweeping through a threshold); a static step is fine.
5. **Build from an asset.** Copy the closest file in `assets/` and adapt it. Do not rewrite the engine from memory; the pitfalls in §7 were all found the hard way.
6. **Verify** (§8), then publish.
7. **Iterate like an editor.** When the user reports a defect, change one thing, keep everything else identical, republish to the same artifact URL (pass `url`).
8. **Report briefly**: what was built, what was checked, what was not (you usually cannot view the render; say so and ask for a screenshot naming the step or scene).

## 3. Hard platform constraints (published artifact pages)

- One `.html` file under 16 MB. External scripts only from `cdn.jsdelivr.net/npm/`, `cdnjs.cloudflare.com`, `cdn.tailwindcss.com`, `code.jquery.com`; stylesheets only from `fonts.googleapis.com`. Pin exact versions at least two weeks old. No other network access.
- **Formulas: MathJax `tex-svg.js` from jsdelivr (pinned `3.2.2`).** KaTeX is unsuitable because its CSS and font files cannot load. Use exactly:
  `window.MathJax={startup:{typeset:false},svg:{fontCache:'none'},options:{enableAssistiveMml:false}}`, then `MathJax.tex2svg(tex,{display:false})`, then remove any `mjx-assistive-mml` nodes and add the CSS rule `mjx-assistive-mml{display:none!important}`. Without this every formula appears twice (typeset plus raw MathML with slash fractions).
- Prose font: Google Fonts "STIX Two Text" with serif fallbacks (the closest available to Computer Modern). Wait for `MathJax.startup.promise` and `document.fonts.load(...)` before the first render.
- Do not use `window.storage`, `fetch` to the Anthropic API, or unguarded `localStorage` in a published page. Do not use `<form>`.
- Fullscreen is blocked inside the app's embedded viewer. If a ⛶ button is requested, call `requestFullscreen` in a try/catch and show a short message on failure ("open the link in the browser"). Never rely on it.

## 4. Layout and typography rules

- **Stage 1280×720 (16:9)**, absolutely positioned, scaled with `transform: scale(min(innerWidth/1280, innerHeight/720))`. Page background equals stage background so letterbox bars disappear. Everything, including buttons and sliders, lives inside the stage so it scales together; keep touch targets ≥ 40 px in stage units. Design for landscape.
- **Grid**: left text column x 40–560, graph x 600–1240 (about 640×460), sliders under the graph, step buttons bottom-left. Keep content out of the outer 24 px.
- **Palette** (defaults): background `#0f1b2d`, ink `#f4f1ea`, muted `#8fa6c4`, focal object amber `#e8a33d`, positive/true green `#5fd0a0`, negative/false red `#ff7a7a`, grid `#24364f`. Colour carries meaning consistently across steps.
- **Never hand-position text lines.** Put the text column in a flex column with a gap; each step block is a `div` with a heading and lines. Fractions are 1.5–2× taller than text, so fixed `top` values overlap. Reveal by animating `opacity`/`transform` while keeping the space reserved (do not toggle `display` per line).
- **Width discipline**: a line must fit the 520 px column at 25 px. Split long derivations into several lines (`\Delta=b^2-4ac`, then the substitution, then the value). Hide horizontal overflow; the teacher must never scroll sideways.
- **Tables with rules (tableau de signes, de variations, de valeurs) are HTML `<table>` elements** with explicit borders, each cell typeset separately with MathJax. MathJax `array` rules failed to render in the user's viewer.
- Fractions are always `\dfrac`, never `a/b`. Titles must not run into the graph area (≈ 36 px bold, ≤ 28 characters).
- French typesetting rules are in `references/engine-patterns.md` §French maths typography (decimal comma `{,}`, intervals `]-\infty\,;1]`, `\mathbb{R}`, accents in prose not in `\text`).

## 5. Interactivity patterns

- **Single source of truth**: one parameter object `P`; the panel text is a pure function of `P` (`upd()`); the canvas draws from a smoothed copy `D` that tweens toward `P` each frame so presets morph instead of jumping.
- **Throttle**: slider `input` events set a flag and call `upd()` once per animation frame. Cache typeset lines by their TeX string and rebuild only when the string changes.
- **Case matrices**: when the topic has independent discrete cases (e.g. sign of Δ × sign of a), provide **separate selector groups**, not one button per combination. A click changes one dimension and keeps the other from the current state; button highlights are computed from the current parameters, so they stay correct after manual slider moves. Pick preset values that make the six cases comparable (same axis of symmetry, small integers).
- **Parameterisation modes** (e.g. `a,b,c` / `a,α,β` / `a,x₁,x₂`): a dropdown remaps sliders; keep conversion functions in both directions, apply `min/max/step` before setting `value`, and guard infeasible modes (real roots only) with a message and a fallback.
- **Step reveal**: blocks `1..n` shown cumulatively, "Tout" shows everything, graph layers (axis, vertex, roots, shading) appear with their step. Auto-scroll the column to the newest block.
- Sliders never allow a degenerate value (e.g. `a=0`); snap to the nearest valid value.

## 6. Mathematics checklist

- Every displayed number comes from computation, never from typing. Round for display only, with a decimal comma in French.
- Test the case matrix numerically in Node or Python before publishing (discriminants, roots, vertices, signs, parameter conversions in both directions).
- Exact comparisons such as `Δ===0` are safe only when parameters are dyadic (steps 0.25 or 0.5). Otherwise compare with a tolerance.
- State domains and cases explicitly (si Δ ≥ 0, a ≠ 0). Sign and variation statements must be full sentences when the user asks ("f est décroissante sur … et croissante sur …").
- Use curriculum vocabulary of the level (forme canonique, discriminant, tableau de signes, racine double).

## 7. Failures already seen (check before delivering)

| Symptom | Cause | Fix |
|---|---|---|
| Every formula doubled, slashes in fractions | MathJax assistive MathML visible | §3 config, remove nodes, hide CSS |
| Lines overlap, cramped fractions | Fixed `top` per line | Flex column flow layout |
| Text hidden, horizontal scroll | Line wider than column | Split lines; `overflow-x:hidden` |
| Title overlaps graph | Title too wide | ≤ 36 px, shorter wording |
| Table has no rules | MathJax `array` borders not rendered | HTML table with CSS borders |
| Fullscreen does nothing | Embedded viewer blocks it | try/catch + message; fit-to-viewport |
| Controls missing after an edit | Removed with another feature | Re-check the control list after every edit |
| Only one example reachable | Single preset list | Independent selector groups |
| French narration unintelligible | Default voice, symbols read aloud | `references/engine-patterns.md` §Narration |

## 8. Verification (always)

1. `python scripts/lint_slide.py path/to/page.html` checks allowed hosts, pinned versions, MathJax config, forbidden APIs, 16:9 stage, and JavaScript syntax (needs Node). Fix every FAIL.
2. Run the numeric checks from §6.
3. State plainly that the rendering was not viewed unless you actually viewed it. Ask for a screenshot and the step number if something looks wrong.

## 9. Optional narration and sound

Off by default and only on request; the user may remove them later (they did, in the interactive version). When requested: user-gesture-activated buttons, French voice ranking and sentence-level utterances, narration written in words, subtitles as fallback, WebAudio cues (tick on step, chime when a case changes). Details and code: `references/engine-patterns.md` §Narration and sound.

## 10. Delivery

Write the file to `/mnt/user-data/outputs/`, publish with the Artifact tool, and for later edits publish again with `url` set to the existing artifact so the link stays the same. In the reply: assumed intent (one line), link, what changed, what was verified, what was not.

## Files

- `references/hyperframes-workflow.md`: distilled shot-based workflow, prompting protocol and QC checklist adapted to maths slides and to Hyperframes video shots.
- `references/engine-patterns.md`: code patterns (stage, MathJax helper, flow layout, tween loop, tables, modes, scripted scenes, narration, French typography).
- `assets/example_trinome.html`: complete reference implementation (second-degree trinomial, 5 steps, three slider modes, 3×2 case selectors, sign table).
- `assets/template.html`: minimal skeleton to adapt for a new topic.
- `scripts/lint_slide.py`: automatic checks.
