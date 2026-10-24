# Chapter sequence

A chapter has one stable catalogue id. `premiere-02` is the quadratic example of this sequence. Reuse the shared
slide player, laboratory and chapter sequence instead of building another player or duplicating a mathematical model.

1. **Prepare.** State prerequisites and learning goals. Give a short ungraded fluency diagnostic with a separate answer.
2. **Investigate.** Open a manipulable experiment before the rule. Ask for a prediction, trials, a conjecture and an explanation.
   Use the same numerical situation in the PDF and web activity. Keep the solution behind an explicit reveal.
3. **Formalise.** Distinguish definitions, results, proofs, worked examples and common errors. State hypotheses and domains.
4. **Practise.** Give increasing difficulty, progressive hints and complete solutions. Include a question where a condition
   changes the answer, such as an optimisation whose vertex lies outside the allowed interval.
5. **Review.** Add an independent question and success criteria. Observations support conjectures; an argument proves them.
6. **Choose a format.** Offer the student booklet, separate corrections, web sequence, interactive HTML deck and a genuine
   16:9 lecture PDF. Keep downloads beside their opening links. Show only editions that exist.

The editorial sources are `content/tex/courses/<course>/`, translation tables and an authored chapter deck when needed.
`sequence-model.js` builds the web progression from the deck. A `stage: 'diagnostic'` or `stage: 'check'` task stays in its
own phase; `difficulty` labels practice tasks; `hints` and `a` hold help and a complete answer. Laboratory references come
from the manifest and use `<experiment>/<mission>`. The quadratic model is shared by the lab and slide widget.

The curriculum reference belongs in private chapter metadata. Check the primary programme text, its effective school
year and the precise scope before citing it. Derivations may explain a general result while exercises respect the
level's required techniques. For the quadratic chapter, general canonical-form computation is not a required automatism.

Build with `make tex COURSE=<course>` and `make site`. Verify numerical claims independently, render affected PDF pages,
and exercise the web and slide at phone and desktop widths. Test direct manipulation, equivalent keyboard controls,
step reveal, answers, reset, fullscreen failure, navigation cleanup and reduced motion. The release requirements in the
project brief apply to every format.
