# Hyperframes-derived workflow for maths slides and shots

Source: the user's "Hyperframes Animated Content" guide. Hyperframes is a shot-generation and motion-graphics tool; the interface is not known to this skill, so only prompts and the planning method are recorded here. Use this file to (a) plan any animated maths content, (b) write standalone prompts when the user wants video shots for Hyperframes, (c) keep the HTML slides consistent with the same discipline.

## Contents
1. Core principle
2. Pipeline
3. Shot plan fields
4. Reference images vs production assets
5. Prompting protocol and template
6. Iteration protocol
7. What belongs in post-production
8. Quality-control checklist
9. Failure modes

## 1. Core principle
Design the visual language first, decompose the content into short shots (4–10 s), generate each independently, finish in an editor. Better decomposition beats a more elaborate prompt. Animation is a means of explanation, not ornament: not every sentence needs motion, and a static shot is valid. Treat visual quality and reliability as the goals; audience performance is not guaranteed.

## 2. Pipeline
reference → visual language → verified content → script beats → shot plan → independent renders → controlled iteration → post-production.

1. Clarify the purpose of the shot or video.
2. Gather concrete references (existing editorial graphics, textbook figures, UI captures). If the style changes substantially, use a new reference set.
3. Extract observable properties: palette, typography and hierarchy, composition and spacing, shape language, texture, background, contrast, motion character, density, treatment of charts, labels, icons.
4. Establish the content: for maths, compute every value; for data, use authoritative sources, keep links, verify units, never invent missing values, separate estimates from measurements.
5. Split the script into beats. For each beat: what must the viewer hear, what must they see, is visual reinforcement useful, what deserves emphasis, is there a specific object, number, curve or table to show.
6. Ask for animation ideas first; select only the useful ones.
7. Write one standalone prompt per selected shot; generate shots independently (in parallel when many).
8. Check safe zones and consistency; iterate one variable at a time; export approved shots; assemble in an editor.

## 3. Shot plan fields
Shot ID · Script beat · Duration · Visual purpose · Assets · Composition · Motion (exact) · Typography · Colour · Output (ratio, resolution) · Post-production notes.

For HTML slides the "shot" is a step or scene; the same fields apply, and `Output` is the 16:9 stage.

## 4. Reference images vs production assets
- References answer "what should it look like": style, layout, typography, colour, motion language.
- Production assets answer "what must appear": logos, screenshots, figures, transparent PNGs, the exact function and numbers.
Keep them separate in prompts.

## 5. Prompting protocol
State explicitly: reference style, exact duration, aspect ratio (16:9 for projection, 9:16 for vertical social), exact motion, typography (font, weight, size, hierarchy), colour (derived from the reference), assets, safe zone.

Motion vocabulary: push in/out, pan, static, fade, reveal, scale, slide, count up/down, bars/curve growing from zero, sequential reveal, highlight, morph, parallax.

Weak: "Make the graph cinematic and dynamic."
Strong: "Draw the parabola from left to right over 3 s. Keep the camera static. Fade the vertex label in when the curve reaches the vertex."

Compact template:
```
REFERENCE   Analyse the supplied image(s); reproduce their visual language: [style, palette, typography, composition].
CONTENT     Create a visual showing [exact mathematical content and values].
FORMAT      Duration: [X] s · Aspect ratio: 16:9 · Output: video
COMPOSITION [hierarchy, placement, margins, background, assets]
MOTION      [what moves, in what order, how]
TYPOGRAPHY  Font: [font] · [weight/size/hierarchy]
COLOUR      [reference-derived palette; colour meaning]
SAFE ZONE   Keep all essential information inside the safe area.
CONSTRAINT  Preserve the reference style; no unrelated decoration.
```

## 6. Iteration protocol
Iterate like an editor. If a result is approximately right, change one thing: "Preserve the composition, colours, typography, timing and assets. Only move the title 40 px down." If five things are wrong, fix them one at a time. Never answer "make it better" with a full regeneration.

## 7. Post-production (not for the generator)
Precise timing, final cuts, music, beat-synchronised editing, sound design, captions, final assembly. For a maths video made from the HTML page, record the page and do these in an editor.

## 8. Quality-control checklist
- Content: numbers, labels, assets correct; visual reinforces the narration.
- Composition: inside safe margins; clear hierarchy; not crowded; matches the reference.
- Typography: correct font; legible; consistent sizes and weights; aligned labels.
- Motion: motivated, smooth, neither too fast nor too slow, restrained transitions.
- Consistency: same palette, same positions for repeated elements across shots.
- Post: timing, music, captions, sound effects handled later.

## 9. Failure modes
Vague prompting · no references (generic AI look) · generating everything at once · changing many variables · over-animating · ignoring safe zones · making the generator do the editor's job.
