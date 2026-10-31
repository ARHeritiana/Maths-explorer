# Workstream G: where each reference belongs, and in which language (31 October 2026)

Decision record, derived from the structure of the site as it is in the code (not from the file names). Nothing here is
published or implemented: it fixes the target of each integration, which still needs the publication gate (two independent
audits by different agents, code verification of every computed result) and the porting work.

## What the structure says

- Language rule (`PROJECT_BRIEF.md` section 3, owner, 25 October 2026): French and Malagasy curricula in French only;
  international curriculum (IB, SAT) in English only; university in the language the resource was started in; Olympiad a
  category of its own, bilingual; the bilingual goal for curriculum lessons is on standby.
- In the code the rule is applied by route: `site/js/content-language.js` fixes a language only for chapters, library pages,
  the quadratic workshop and university sequences. Every other page is neutral: it follows the reader's language choice and
  every string is a pair `[French, English]`. So the laboratory, the gallery, the foundations lessons and the error
  collection are **bilingual by construction**, and a curriculum chapter that links a laboratory experiment shows it in the
  chapter's language.
- Sections: Apprendre (Bases, Cours, Diaporamas, Parcours), Explorer (Domaines, Laboratoire, Défis, Erreurs), Lire
  (Chronologies, Biographies, Histoires, Curiosités). Pathways in `content.js`: Madagascar, France, International,
  University. The laboratory has one engine, templates (`figure`, `chance`, `inference`, `family`...) and groups
  (`SECTION_INFO`): "Inférer et décider" (secretary, tank, Benford, baker, birthdays, Monty Hall), "Probabilités géométriques"
  (Buffon, Bertrand), "Une figure n’est pas une preuve" (tiles). Many experiments have a gallery twin (`custom: true`).
  The foundations lessons (`#basics`) are standalone HTML with a French and an English edition, "deliberately distinct from
  official curriculum chapters".

## Placement

| Reference | Section | Language | Why |
|---|---|---|---|
| `monte-carlo-lab.html` | **Explorer > Laboratoire**, group "Inférer et décider", template `inference`; four missions (π, lake area, integral, random walk). Links from the chapters on the law of large numbers and the integral (`manifest.json` `labs` of Terminale chapters 11 and 12 and `shared-concentration`) | **Bilingual EN/FR** (neutral content; the prototype already has both) | It is a method laboratory (simulate, estimate with an interval, compare with the exact value), the same family as the experiments of that group. |
| `equidecomposability-of-polygons.html` | **Lire > Curiosités** as the exhibit (hand-drawn polygons, eight-step dissection), with `links` to the `tiles` experiment and to Banach-Tarski (its three-dimensional, non-constructive counterpart), topic geometry / plane figures | **Bilingual EN/FR** (neutral; the prototype is English only, so a French edition is to be written) | The Wallace-Bolyai-Gerwien theorem is outside every programme: a curiosity about area and proof, the finite sibling of exhibits already in the gallery. |
| `set-theory-interactive-atlas.html` | **Apprendre > Bases** (foundations), as a lesson "Ensembles" next to place value and the four operations; discovery topic "Fondements / Ensembles" | **Bilingual**: French edition to write, the English prototype becomes the `.en.html` edition | Sets are the vocabulary under intervals, events, logic and functions, not a chapter of one programme. It is not university content (so not the language-of-origin rule), not a laboratory experiment (it is a reference with quizzes), and the university section is last in the brief's priority order. |
| `london-eye-interactive-exercise.html` | **Apprendre > Cours**: a laboratory experiment (wheel and height-time graph, missions for the model, thresholds and the rate of change) in the laboratory, referenced from the `labs` of the Première trigonometry chapter and the Terminale trigonometric functions chapter; the six-part exercise and its solutions as French text in those chapters' exercise and corrections material | The experiment is bilingual (laboratory rule); the **chapter text is French only** (French curriculum). The International pathway may link the same experiment, shown in English | It is a curriculum exercise (trigonometric model, derivative, maximum rate): it belongs where the exercise is set, with the figure shared as a laboratory reference, as for the existing experiments. |

## What each integration still needs

1. **All four:** second independent audit by a different agent; two-agent gate recorded in the private ledger; port to the site's
   tokens, router and tests; entries in `MAP.md` and the folder indexes; keyboard paths for the pointer-only features
   (seat drag, custom polygon already has typing, lake presets already added).
2. **Monte Carlo:** rewrite as laboratory experiment files (`site/js/lab/experiments/`, `models/`) following `docs/LAB_DESIGN.md`;
   seeded, frame-rate independent run speed; checks of estimators and interval coverage as unit tests (the audit's tables).
3. **Equidecomposition:** gallery object in `lab-objects.js` with its pure geometry in a tested model file (area preservation,
   degenerate polygons); French text.
4. **Set atlas:** two standalone HTML editions under `site/resources/basics/`, route `#basics/sets` in `app.js`; exhaustive
   identity checks as a test; French translation and its independent review; [VERIFY] which parts are in the 2026 programmes
   (Cartesian product in Première is an open check).
5. **London Eye:** laboratory experiment and mission text; French exercise and solutions in the course TeX; originality
   check: it is adapted from a published six-part Ferris-wheel problem, so statements must be rewritten from first principles
   (Workstream H) before publication; sources and the "idealised model" caveat kept.

The bilingual goal for curriculum lessons stays on standby: nothing above adds an English edition of a curriculum chapter.
